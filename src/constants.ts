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
  NO_ACTIVE_FILE: '未找到活动文件',
  MERGE_SUCCESS: 'Wiki 链接合并完成！',
  MERGE_FAILED: '合并 Wiki 链接失败！',
  CIRCULAR_REFERENCE: '检测到循环引用',
  FILE_READ_ERROR: '读取文件失败',
  FILE_WRITE_ERROR: '写入文件失败',
  TRASH_FAILED: '删除文件失败',
} as const;


