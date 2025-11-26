# 项目优化建议

本文档基于对项目的全面分析，列出了可以优化的点。

## 📋 目录

1. [代码结构与命名](#1-代码结构与命名)
2. [类型安全](#2-类型安全)
3. [错误处理](#3-错误处理)
4. [代码质量](#4-代码质量)
5. [配置优化](#5-配置优化)
6. [依赖管理](#6-依赖管理)
7. [性能优化](#7-性能优化)
8. [国际化](#8-国际化)
9. [开发体验](#9-开发体验)
10. [功能增强](#10-功能增强)

---

## 1. 代码结构与命名

### 1.1 类名和接口名不统一

**问题：**
- `main.ts` 中类名是 `MyPlugin`，应该改为更具体的名称
- 设置类名 `WanderNoteSettingTab` 与插件名称不匹配
- 接口名 `MyPluginSettings` 应该改为更具体的名称

**建议：**
```typescript
// main.ts
export interface MergeReferencesSettings {
  DeleteTheReferencedSourceFile: boolean;
  MergeSeparator: string;
}

export default class MergeReferencesPlugin extends Plugin {
  // ...
}

// settings/WanderNoteSettingTab.ts
export class MergeReferencesSettingTab extends PluginSettingTab {
  // ...
}
```

### 1.2 函数式编程范式

**问题：**
- 用户规则要求尽量避免使用 OOP，但 `MergeReferencesProcessor` 使用了类

**建议：**
- 将 `MergeReferencesProcessor` 改为函数式实现
- 使用函数组合替代类方法

```typescript
// src/merge-references.ts
export interface MergeContext {
  app: App;
  settings: MergeReferencesSettings;
  processedPaths: Set<string>;
  visited: Set<string>;
  missing: string[];
}

export async function mergeReferences(
  app: App,
  settings: MergeReferencesSettings
): Promise<void> {
  // 实现逻辑
}

export function extractWikiLinks(content: string): string[] {
  // 实现逻辑
}
```

---

## 2. 类型安全

### 2.1 非空断言使用

**问题：**
- `main.ts` 中 `settings!: MyPluginSettings` 使用了非空断言，可能导致运行时错误

**建议：**
```typescript
export default class MergeReferencesPlugin extends Plugin {
  settings: MergeReferencesSettings = DEFAULT_SETTINGS;
  
  async loadSettings() {
    const loaded = await this.loadData();
    this.settings = Object.assign({}, DEFAULT_SETTINGS, loaded);
  }
}
```

### 2.2 缺少类型定义

**问题：**
- 一些函数参数和返回值缺少明确的类型定义

**建议：**
- 为所有函数添加明确的类型注解
- 使用 TypeScript 的严格模式

---

## 3. 错误处理

### 3.1 错误处理不够详细

**问题：**
- `mergeWikiLinks` 方法中的错误处理过于简单
- 缺少对不同错误类型的区分处理

**建议：**
```typescript
async mergeWikiLinks() {
  try {
    const activeFile = this.app.workspace.getActiveFile();
    if (!activeFile) {
      new Notice('请先打开一个文件');
      return;
    }
    
    await mergeReferences(this.app, this.settings);
    new Notice('Wiki 链接合并完成！');
  } catch (error) {
    console.error('合并失败:', error);
    
    let errorMessage = '合并 Wiki 链接失败！';
    if (error instanceof Error) {
      errorMessage = `合并失败: ${error.message}`;
    }
    
    new Notice(errorMessage, 5000);
  }
}
```

### 3.2 文件操作错误处理

**问题：**
- `merge-references.ts` 中文件读取和写入操作缺少错误处理

**建议：**
```typescript
try {
  let fileContent = await this.app.vault.read(file);
} catch (error) {
  console.error(`读取文件失败: ${file.path}`, error);
  throw new Error(`无法读取文件: ${file.path}`);
}
```

---

## 4. 代码质量

### 4.1 硬编码字符串

**问题：**
- 代码中硬编码了中文字符串，不利于维护和国际化

**建议：**
- 创建常量文件或使用 i18n 库
```typescript
// src/constants.ts
export const MESSAGES = {
  NO_ACTIVE_FILE: '未找到活动文件',
  MERGE_SUCCESS: 'Wiki 链接合并完成！',
  MERGE_FAILED: '合并 Wiki 链接失败！',
  CIRCULAR_REFERENCE: '检测到循环引用',
  // ...
} as const;
```

### 4.2 正则表达式提取

**问题：**
- 正则表达式直接写在函数中，不利于维护和测试

**建议：**
```typescript
// src/constants.ts
export const REGEX = {
  WIKI_LINK: /\[\[([^\]]+)\]\]/g,
  IMAGE_EXT: /\.(jpg|jpeg|png|gif|bmp|svg|webp)$/i,
  MD5_FILENAME: /^[a-f0-9]{32}\.\w+$/i,
  MARKDOWN_FILE: /\.md$/i,
} as const;
```

### 4.3 函数职责不清

**问题：**
- `mergeFile` 函数职责过多，既处理合并逻辑，又处理文件删除标记

**建议：**
- 将函数拆分为更小的单一职责函数
```typescript
async function processFile(
  file: TFile,
  context: MergeContext
): Promise<string> {
  // 处理单个文件
}

function markProcessedFile(
  file: TFile,
  context: MergeContext
): void {
  // 标记已处理文件
}
```

### 4.4 缺少 JSDoc 注释

**问题：**
- 函数缺少详细的文档注释

**建议：**
```typescript
/**
 * 提取内容中的所有 Wiki 链接
 * @param content - 要处理的 Markdown 内容
 * @returns Wiki 链接名称数组，已过滤图片文件
 * @example
 * extractWikiLinks("[[Note1]] and [[Note2]]")
 * // returns ["Note1", "Note2"]
 */
export function extractWikiLinks(content: string): string[] {
  // ...
}
```

---

## 5. 配置优化

### 5.1 TypeScript 配置

**问题：**
- `tsconfig.json` 的 `include` 只包含 `main.ts`，应该包含所有 TypeScript 文件

**建议：**
```json
{
  "compilerOptions": {
    // ... 现有配置
  },
  "include": [
    "**/*.ts"
  ],
  "exclude": [
    "node_modules",
    "dist"
  ]
}
```

### 5.2 Rollup 配置

**问题：**
- `rollup.config.js` 缺少一些必要的插件配置
- 缺少外部依赖处理

**建议：**
```javascript
import typescript from 'rollup-plugin-typescript2';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: 'main.ts',
  output: {
    dir: 'dist',
    format: 'cjs',
    sourcemap: true,
  },
  external: ['obsidian'],
  plugins: [
    typescript({
      tsconfig: 'tsconfig.json',
    }),
    nodeResolve({ browser: true }),
    commonjs(),
  ],
};
```

---

## 6. 依赖管理

### 6.1 未使用的依赖

**问题：**
- `package.json` 中有 `trash` 依赖，但代码中使用的是 `this.app.vault.trash`，不需要这个依赖

**建议：**
- 移除 `trash` 依赖
```json
{
  "dependencies": {}
}
```

### 6.2 依赖版本管理

**问题：**
- 一些依赖使用了 `latest` 版本，不利于版本锁定

**建议：**
- 使用具体版本号
```json
{
  "devDependencies": {
    "obsidian": "^1.0.0"
  }
}
```

---

## 7. 性能优化

### 7.1 文件读取优化

**问题：**
- 递归合并时可能重复读取同一文件

**建议：**
- 添加文件内容缓存
```typescript
interface MergeContext {
  // ... 现有字段
  fileCache: Map<string, string>;
}

async function getFileContent(
  file: TFile,
  context: MergeContext
): Promise<string> {
  if (context.fileCache.has(file.path)) {
    return context.fileCache.get(file.path)!;
  }
  
  const content = await context.app.vault.read(file);
  context.fileCache.set(file.path, content);
  return content;
}
```

### 7.2 进度提示

**问题：**
- 处理大量文件时缺少进度提示

**建议：**
- 添加进度通知
```typescript
let processedCount = 0;
const totalFiles = wikiLinks.length;

for (const link of wikiLinks) {
  // ... 处理逻辑
  processedCount++;
  new Notice(`处理中: ${processedCount}/${totalFiles}`, 1000);
}
```

---

## 8. 国际化

### 8.1 混合语言

**问题：**
- 代码中混合了中英文，不利于国际化

**建议：**
- 统一使用英文作为代码语言
- 用户界面文本可以支持多语言
- 创建 i18n 模块

```typescript
// src/i18n.ts
export const i18n = {
  en: {
    NO_ACTIVE_FILE: 'No active file found.',
    MERGE_SUCCESS: 'Wiki links merged successfully!',
    // ...
  },
  zh: {
    NO_ACTIVE_FILE: '未找到活动文件',
    MERGE_SUCCESS: 'Wiki 链接合并完成！',
    // ...
  },
};
```

---

## 9. 开发体验

### 9.1 缺少代码格式化配置

**问题：**
- 项目缺少 `.prettierrc` 或 `.eslintrc` 配置

**建议：**
- 添加 Prettier 配置
```json
// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2
}
```

### 9.2 缺少 .gitignore

**问题：**
- 项目可能缺少 `.gitignore` 文件

**建议：**
```gitignore
# .gitignore
node_modules/
dist/
.DS_Store
*.log
.obsidian/
```

### 9.3 缺少单元测试

**问题：**
- 项目缺少单元测试，不利于重构和维护

**建议：**
- 添加测试框架（如 Jest 或 Vitest）
- 为核心函数添加单元测试
```typescript
// src/merge-references.test.ts
import { extractWikiLinks } from './merge-references';

describe('extractWikiLinks', () => {
  it('should extract wiki links from content', () => {
    const content = '[[Note1]] and [[Note2]]';
    const links = extractWikiLinks(content);
    expect(links).toEqual(['Note1', 'Note2']);
  });
});
```

---

## 10. 功能增强

### 10.1 撤销功能

**问题：**
- 合并操作不可撤销，用户可能误操作

**建议：**
- 在合并前备份原文件内容
- 提供撤销命令

### 10.2 预览功能

**问题：**
- 合并前无法预览将要合并的内容

**建议：**
- 添加预览模式，显示将要合并的文件列表
- 允许用户选择性地合并某些链接

### 10.3 批量处理

**问题：**
- 只能处理当前活动文件

**建议：**
- 支持批量处理多个文件
- 支持处理整个文件夹

### 10.4 合并选项

**问题：**
- 合并选项较少

**建议：**
- 添加去重选项
- 添加排序选项
- 添加合并顺序选项（深度优先/广度优先）

### 10.5 日志记录

**问题：**
- 缺少详细的操作日志

**建议：**
- 记录合并的文件列表
- 记录合并时间
- 提供日志查看功能

---

## 优先级建议

### 高优先级（立即修复）
1. ✅ 移除未使用的 `trash` 依赖
2. ✅ 修复 `tsconfig.json` 的 `include` 配置
3. ✅ 改进错误处理
4. ✅ 统一命名规范

### 中优先级（近期优化）
1. ⚠️ 添加类型安全改进
2. ⚠️ 提取硬编码字符串
3. ⚠️ 优化 Rollup 配置
4. ⚠️ 添加代码格式化配置

### 低优先级（长期改进）
1. 📝 函数式编程重构
2. 📝 添加单元测试
3. 📝 国际化支持
4. 📝 功能增强（预览、撤销等）

---

## 总结

本项目整体结构清晰，功能实现完整。主要优化方向包括：

1. **代码质量**：统一命名、改进类型安全、提取常量
2. **错误处理**：增强错误处理的详细程度和用户友好性
3. **配置优化**：完善构建和开发配置
4. **开发体验**：添加代码格式化、测试等工具
5. **功能增强**：根据用户需求添加新功能

建议按照优先级逐步实施这些优化，确保项目的可维护性和用户体验不断提升。

