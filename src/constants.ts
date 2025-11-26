/**
 * 常量定义文件
 * 包含正则表达式、消息文本等常量
 */

/**
 * 正则表达式常量
 */
export const REGEX = {
  /** Wiki 链接正则：匹配 [[...]] 格式 */
  WIKI_LINK: /\[\[([^\]]+)\]\]/g,
  /** 图片文件扩展名正则 */
  IMAGE_EXT: /\.(jpg|jpeg|png|gif|bmp|svg|webp)$/i,
  /** MD5 文件名正则（32位十六进制 + 扩展名） */
  MD5_FILENAME: /^[a-f0-9]{32}\.\w+$/i,
  /** Markdown 文件扩展名正则 */
  MARKDOWN_FILE: /\.md$/i,
  /** 转义正则表达式特殊字符 */
  REGEX_ESCAPE: /[-/\\^$*+?.()|[\]{}]/g,
} as const;

/**
 * 消息文本常量
 */
export const MESSAGES = {
  NO_ACTIVE_FILE: 'No active file found.',
  MERGE_SUCCESS: 'Wiki links merged successfully!',
  MERGE_FAILED: 'Failed to merge wiki links!',
  CIRCULAR_REFERENCE: 'Circular reference detected',
  FILE_READ_ERROR: 'Failed to read file',
  FILE_WRITE_ERROR: 'Failed to write file',
  TRASH_FAILED: 'Failed to delete file',
} as const;

/**
 * 生成合并完成消息
 * @param count - 合并的文件数量
 * @returns 合并完成消息
 */
export function getMergeCompleteMessage(count: number): string {
  return `Merged ${count} file(s)`;
}

/**
 * 生成缺失链接消息
 * @param count - 缺失链接数量
 * @returns 缺失链接消息
 */
export function getMissingLinksMessage(count: number): string {
  return `, ${count} link target(s) not found`;
}


