import { App, Notice, TFile } from 'obsidian';
import { MergeReferencesSettings } from '../main';
import {
  REGEX,
  MESSAGES,
  getMergeCompleteMessage,
  getMissingLinksMessage,
} from './constants';

/**
 * 合并上下文接口
 * 用于在递归合并过程中传递状态信息
 */
export interface MergeContext {
  app: App;
  settings: MergeReferencesSettings;
  processedPaths: Set<string>;
  visited: Set<string>;
  missing: string[];
  fileCache: Map<string, string>;
}

/**
 * 提取内容中的所有 Wiki 链接
 * @param content - 要处理的 Markdown 内容
 * @returns Wiki 链接名称数组，已过滤图片文件
 * @example
 * extractWikiLinks("[[Note1]] and [[Note2]]")
 * // returns ["Note1", "Note2"]
 */
export function extractWikiLinks(content: string): string[] {
    const links: string[] = [];
    let match: RegExpExecArray | null;

  while ((match = REGEX.WIKI_LINK.exec(content)) !== null) {
      const link = match[1].trim();

      // 跳过图片文件
    if (REGEX.IMAGE_EXT.test(link)) {
        continue;
      }

      links.push(link);
    }

    return links;
  }

  /**
 * 获取文件内容（带缓存）
 * @param file - 要读取的文件
 * @param context - 合并上下文
 * @returns 文件内容字符串
 */
async function getFileContent(
  file: TFile,
  context: MergeContext
): Promise<string> {
  if (context.fileCache.has(file.path)) {
    return context.fileCache.get(file.path)!;
  }

  try {
    const content = await context.app.vault.read(file);
    context.fileCache.set(file.path, content);
    return content;
  } catch (error) {
    console.error(`${MESSAGES.FILE_READ_ERROR}: ${file.path}`, error);
    throw new Error(`${MESSAGES.FILE_READ_ERROR}: ${file.path}`);
  }
}

/**
 * 检查是否为可处理的 Markdown 文件
 * @param file - 要检查的文件
 * @returns 是否为可处理的 Markdown 文件
 */
function isProcessableMarkdownFile(file: TFile): boolean {
  return (
    REGEX.MARKDOWN_FILE.test(file.name) &&
    !REGEX.MD5_FILENAME.test(file.name)
  );
}

/**
 * 标记文件为已处理
 * @param file - 要标记的文件
 * @param context - 合并上下文
 */
function markProcessedFile(file: TFile, context: MergeContext): void {
  if (isProcessableMarkdownFile(file)) {
    context.processedPaths.add(file.path);
  }
}

/**
 * 转义正则表达式特殊字符
 * @param str - 要转义的字符串
 * @returns 转义后的字符串
 */
function escapeRegex(str: string): string {
  return str.replace(REGEX.REGEX_ESCAPE, '\\$&');
}

/**
 * 创建 Wiki 链接替换正则表达式
 * @param link - Wiki 链接名称
 * @returns 用于替换的正则表达式
 */
function createLinkPattern(link: string): RegExp {
  return new RegExp(`\\[\\[${escapeRegex(link)}\\]\\]`, 'g');
}

/**
 * 处理单个文件的合并逻辑
 * @param file - 要处理的文件
 * @param context - 合并上下文
 * @returns 处理后的文件内容
 */
async function processFile(
  file: TFile,
  context: MergeContext
): Promise<string> {
  // 循环引用检测
  if (context.visited.has(file.path)) {
    console.warn(`${MESSAGES.CIRCULAR_REFERENCE}: ${file.path}`);
        return '';
      }
  context.visited.add(file.path);

  // 读取文件内容
  let fileContent = await getFileContent(file, context);
  const wikiLinks = extractWikiLinks(fileContent);

  // 处理每个 Wiki 链接
      for (const link of wikiLinks) {
    const targetFile = context.app.metadataCache.getFirstLinkpathDest(
          link,
      file.path
        );

        if (!targetFile) {
      context.missing.push(link);
          continue;
        }

    // 跳过已处理的文件
    if (context.processedPaths.has(targetFile.path)) {
      continue;
    }

        // 递归合并目标文件
    let mergedContent = await processFile(targetFile, context);

        // 插入分隔符
    if (context.settings.MergeSeparator) {
      mergedContent = `${context.settings.MergeSeparator}${mergedContent}${context.settings.MergeSeparator}`;
        }

        // 用目标内容替换 [[link]]
    const linkPattern = createLinkPattern(link);
        fileContent = fileContent.replace(linkPattern, mergedContent);

        // 标记已处理文件
    markProcessedFile(targetFile, context);
      }

      return fileContent;
}

/**
 * 删除已合并的源文件
 * @param context - 合并上下文
 * @param activeFilePath - 当前活动文件路径
 */
async function deleteMergedFiles(
  context: MergeContext,
  activeFilePath: string
): Promise<void> {
  if (!context.settings.DeleteTheReferencedSourceFile) {
    return;
  }

  for (const fPath of context.processedPaths) {
    if (fPath === activeFilePath) {
      continue;
    }

    const f = context.app.vault.getAbstractFileByPath(fPath);
    if (f) {
      try {
        await context.app.vault.trash(f, true);
      } catch (error) {
        console.error(`${MESSAGES.TRASH_FAILED}: ${f.path}`, error);
      }
    }
  }
}

/**
 * 主功能：合并引用到当前文件
 * @param app - Obsidian App 实例
 * @param settings - 插件设置
 * @throws 当没有活动文件或文件操作失败时抛出错误
 */
export async function mergeReferences(
  app: App,
  settings: MergeReferencesSettings
): Promise<void> {
  const activeFile = app.workspace.getActiveFile();
  if (!activeFile) {
    throw new Error(MESSAGES.NO_ACTIVE_FILE);
  }

  // 创建合并上下文
  const context: MergeContext = {
    app,
    settings,
    processedPaths: new Set<string>(),
    visited: new Set<string>(),
    missing: [],
    fileCache: new Map<string, string>(),
  };

  try {
    // 开始递归合并当前文件
    let content = await processFile(activeFile, context);

    // 保存合并后的内容
    await app.vault.modify(activeFile, content);

    // 删除已合并的文件
    await deleteMergedFiles(context, activeFile.path);

    // 显示结果通知
    let msg = getMergeCompleteMessage(context.processedPaths.size);
    if (context.missing.length) {
      msg += getMissingLinksMessage(context.missing.length);
    }
    new Notice(msg);
  } catch (error) {
    console.error('合并过程出错:', error);
    throw error;
  }
}
