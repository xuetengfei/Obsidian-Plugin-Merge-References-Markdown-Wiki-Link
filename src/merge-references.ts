import { App, Notice, TFile } from 'obsidian';
import { MyPluginSettings } from '../main';

export class MergeReferencesProcessor {
  private app: App;
  private settings: MyPluginSettings;

  constructor(app: App, settings: MyPluginSettings) {
    this.app = app;
    this.settings = settings;
  }

  // 提取 Wiki 链接 [[...]]
  extractWikiLinks(content: string): string[] {
    const wikiLinkRegex = /\[\[([^\]]+)\]\]/g;
    const imageExtRegex = /\.(jpg|jpeg|png|gif|bmp|svg|webp)$/i;

    const links: string[] = [];
    let match: RegExpExecArray | null;

    while ((match = wikiLinkRegex.exec(content)) !== null) {
      const link = match[1].trim();

      // 跳过图片文件
      if (imageExtRegex.test(link)) {
        continue;
      }

      links.push(link);
    }

    return links;
  }

  /**
   * 主功能：合并引用到当前文件
   */
  async mergeReferences() {
    const activeFile = this.app.workspace.getActiveFile();
    if (!activeFile) {
      new Notice('No active file found.');
      return;
    }

    let content = await this.app.vault.read(activeFile);
    const processedPaths = new Set<string>();
    const visited = new Set<string>(); // 循环检测
    const missing: string[] = [];

    // 正则匹配 MD5 文件名（附件命名）
    const md5Regex = /^[a-f0-9]{32}\.\w+$/i;

    const mergeFile = async (file: TFile): Promise<string> => {
      if (visited.has(file.path)) {
        console.warn(`检测到循环引用: ${file.path}`);
        return '';
      }
      visited.add(file.path);

      let fileContent = await this.app.vault.read(file);
      const wikiLinks = this.extractWikiLinks(fileContent);

      for (const link of wikiLinks) {
        const targetFile = this.app.metadataCache.getFirstLinkpathDest(
          link,
          file.path,
        );
        if (!targetFile) {
          missing.push(link);
          continue;
        }

        if (processedPaths.has(targetFile.path)) continue;

        // 递归合并目标文件
        let mergedContent = await mergeFile(targetFile);

        // 插入分隔符
        if (this.settings.MergeSeparator) {
          mergedContent = `${this.settings.MergeSeparator}${mergedContent}${this.settings.MergeSeparator}`;
        }

        // 用目标内容替换 [[link]]
        const linkPattern = new RegExp(
          `\\[\\[${link.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\]\\]`,
          'g',
        );
        fileContent = fileContent.replace(linkPattern, mergedContent);

        // 标记已处理文件
        if (/\.md$/i.test(targetFile.name) && !md5Regex.test(targetFile.name)) {
          processedPaths.add(targetFile.path);
        }
      }

      return fileContent;
    };

    // 开始递归合并当前文件
    content = await mergeFile(activeFile);

    // 保存合并后的内容
    await this.app.vault.modify(activeFile, content);
    // 安全删除已合并的文件（排除当前文件和 md5 附件）
    if (this.settings.DeleteTheReferencedSourceFile) {
      for (const fPath of processedPaths) {
        const f = this.app.vault.getAbstractFileByPath(fPath);
        if (f && f.path !== activeFile.path) {
          try {
            await this.app.vault.trash(f, true);
          } catch (e) {
            console.error('trash failed:', f.path, e);
          }
        }
      }
    }
    let msg = `已合并 ${processedPaths.size} 个文件内容`;
    if (missing.length) msg += `，未找到 ${missing.length} 个链接目标`;
    new Notice(msg);
  }
}
