# Merge MD by Wiki Link

**An Obsidian plugin to recursively merge the content of Wiki links in Markdown files into the current file.**

---

## 🔹 Core Features

1. **Recursive Merge of Wiki Links**

   - Automatically scans the active Markdown file for `[[Wiki]]` links.
   - Inserts the content of linked files directly into the current file.
   - Supports multi-level nested links, merging referenced files recursively.

2. **Clean Up Wiki Links**

   - Automatically removes `[[Wiki]]` links after merging.
   - Regular Markdown links `[text](...)` remain intact.

3. **Cycle Detection**

   - Detects and prevents infinite loops caused by circular references.

4. **Optional Deletion of Merged Files**

   - Users can choose to move merged source files to trash after merging.
   - Current file and MD5-named attachments are excluded from deletion.

5. **Customizable Merge Separator**

   - Insert a configurable separator before and after each merged content block for clarity.
   - Default separator is:

   ```
   ---
   ```

---

## 🔹 Usage

1. **Install the Plugin**

   - Place the plugin in Obsidian's `plugins` directory.
   - Enable the plugin in Obsidian settings.

2. **Open the Target Markdown File**

   - Open the file where you want to merge Wiki links.

3. **Run the Merge Command**

   - Open the command palette (Ctrl/Cmd + P), search for **"合并 Wiki 链接"** (or use the ribbon icon), and execute it.
   - The plugin will recursively merge content from linked files and replace the corresponding `[[Wiki]]` links.

4. **View Results**

   - The current file will be updated with merged content.
   - A notice will show the number of files merged and any missing links (e.g., "Merged 3 file(s), 1 link target(s) not found").

---

## 🔹 Plugin Settings

| Setting                        | Description                                        | Default       |
| ------------------------------ | -------------------------------------------------- | ------------- |
| **Delete Merged Source Files** | Whether to delete source files after merging       | false         |
| **Merge Separator**            | Separator inserted before and after merged content | `\n\n---\n\n` |

> Example:
>
> - Delete Source Files: If enabled, merged files will be moved to the trash.
> - Merge Separator: Can be any text or Markdown, e.g., `\n\n--- Source: filename.md ---\n\n`.

---

## 🔹 Notes

- Only merges Wiki links in the currently active file. Other files remain unaffected.
- Only `[[Wiki]]` links are removed after merging; `[text](...)` links are preserved.
- It is recommended to back up files before performing batch merges.
- Image files (jpg, jpeg, png, gif, bmp, svg, webp) are automatically excluded from merging.

---

## 🔹 Development & Contribution

### Project Structure

```
.
├── main.ts                      # Plugin entry point
├── src/
│   ├── constants.ts            # Constants (regex, messages)
│   └── merge-references.ts    # Core merge logic (functional style)
├── settings/
│   └── WanderNoteSettingTab.ts # Settings UI
├── dist/                       # Build output
├── package.json
├── tsconfig.json
└── rollup.config.js
```

### Tech Stack

- **TypeScript** - Type-safe development
- **Rollup** - Module bundling
- **Obsidian API** - Plugin framework

### Development Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd Obsidian-Plugin-Merge-References_副本
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Development mode** (watch mode)

   ```bash
   pnpm run dev
   ```

4. **Build for production**

   ```bash
   pnpm run build
   ```

### Code Architecture

The plugin follows a **functional programming paradigm**:

- **Core logic** (`src/merge-references.ts`): Pure functions for merging logic
- **Constants** (`src/constants.ts`): Centralized constants and message helpers
- **Plugin class** (`main.ts`): Minimal OOP wrapper required by Obsidian API
- **Settings** (`settings/WanderNoteSettingTab.ts`): Settings UI component

### Key Features of the Codebase

- ✅ **Type-safe**: Full TypeScript with strict mode
- ✅ **Functional style**: Core logic uses pure functions instead of classes
- ✅ **Error handling**: Comprehensive error handling with user-friendly messages
- ✅ **Code organization**: Clear separation of concerns
- ✅ **Documentation**: JSDoc comments for all public functions
- ✅ **Constants extraction**: All messages and regex patterns in constants file
- ✅ **File caching**: Optimized file reading with caching mechanism

### Contributing

Contributions are welcome! Here are some areas for improvement:

- Add deduplication of merged content
- Add sorting options for merged content
- Support for batch processing multiple files
- Preview mode before merging
- Undo functionality
- More configuration options

Please feel free to submit Issues or Pull Requests.

---

## 🔹 Author

**xuetengfei**

- GitHub: [@xuetengfei](https://github.com/xuetengfei)

---

# 中文版本

# Merge MD by Wiki Link 插件

**将 Markdown 文件中的 Wiki 链接内容递归合并到当前文件的 Obsidian 插件。**

---

## 🔹 核心功能

1. **递归合并 Wiki 链接内容**

   - 自动扫描当前 Markdown 文件中的 `[[Wiki]]` 链接，将目标文件内容插入到当前文件中。
   - 支持多层嵌套链接，递归合并引用的文件内容。

2. **清理 Wiki 链接**

   - 合并后自动删除 `[[Wiki]]` 链接，保持文件整洁。
   - 保留普通 Markdown 链接 `[文本](...)` 不受影响。

3. **循环引用检测**

   - 自动识别循环引用，避免重复合并导致无限循环。

4. **可选删除已合并源文件**

   - 用户可选择在合并后删除被引用的源文件，避免文件冗余。
   - 会排除当前文件和特殊附件（如 MD5 命名的资源文件）。

5. **可配置合并分隔符**

   - 支持在每个被合并内容前后插入自定义分隔符，让合并后的内容更加清晰。
   - 默认分隔符为：

   ```
   ---
   ```

---

## 🔹 使用方法

1. **安装插件**

   - 将插件放入 Obsidian 的 `plugins` 目录。
   - 在 Obsidian 设置中启用插件。

2. **打开目标 Markdown 文件**

   - 打开你想要合并的 Markdown 文件（当前激活文件）。

3. **运行合并命令**

   - 在命令面板（Ctrl/Cmd + P）搜索 **"合并 Wiki 链接"** 并执行，或点击工具栏图标。
   - 插件会递归合并文件内容并替换对应的 `[[Wiki]]` 链接。

4. **查看结果**

   - 当前文件内容被更新，Wiki 链接被替换为对应内容。
   - 弹窗提示已合并的文件数量以及缺失链接（例如："Merged 3 file(s), 1 link target(s) not found"）。

---

## 🔹 插件设置

在设置面板中，你可以配置以下选项：

| 设置项                 | 功能说明                                 | 默认值        |
| ---------------------- | ---------------------------------------- | ------------- |
| **删除被引用的源文件** | 合并后是否删除已合并的源文件             | false         |
| **合并内容分隔符**     | 在合并内容前后插入的分隔符，便于区分来源 | `\n\n---\n\n` |

> 配置示例：
>
> - 删除源文件：开启后，合并完成的源文件会被移动到回收站。
> - 合并分隔符：可以填写任意文本或 Markdown，例如 `\n\n--- 来自文件 ---\n\n`。

---

## 🔹 注意事项

- 仅合并当前激活文件中的 Wiki 链接，其他文件不受影响。
- 只删除 `[[Wiki]]` 链接，原本的 Markdown 链接 `[文本](...)` 保留。
- 建议在批量操作前备份文件，避免误删或合并错误。
- 图片文件（jpg, jpeg, png, gif, bmp, svg, webp）会自动排除，不参与合并。

---

## 🔹 开发与贡献

### 项目结构

```
.
├── main.ts                      # 插件入口文件
├── src/
│   ├── constants.ts            # 常量定义（正则表达式、消息文本）
│   └── merge-references.ts    # 核心合并逻辑（函数式风格）
├── settings/
│   └── WanderNoteSettingTab.ts # 设置界面
├── dist/                       # 构建输出目录
├── package.json
├── tsconfig.json
└── rollup.config.js
```

### 技术栈

- **TypeScript** - 类型安全的开发
- **Rollup** - 模块打包工具
- **Obsidian API** - 插件框架

### 开发环境设置

1. **克隆仓库**

   ```bash
   git clone <repository-url>
   cd Obsidian-Plugin-Merge-References_副本
   ```

2. **安装依赖**

   ```bash
   pnpm install
   ```

3. **开发模式**（监听文件变化）

   ```bash
   pnpm run dev
   ```

4. **构建生产版本**

   ```bash
   pnpm run build
   ```

### 代码架构

插件采用**函数式编程范式**：

- **核心逻辑** (`src/merge-references.ts`): 纯函数实现合并逻辑
- **常量定义** (`src/constants.ts`): 集中管理常量和消息辅助函数
- **插件类** (`main.ts`): 符合 Obsidian API 要求的最小 OOP 包装
- **设置界面** (`settings/WanderNoteSettingTab.ts`): 设置 UI 组件

### 代码特性

- ✅ **类型安全**: 完整的 TypeScript 严格模式
- ✅ **函数式风格**: 核心逻辑使用纯函数而非类
- ✅ **错误处理**: 完善的错误处理机制，提供用户友好的错误消息
- ✅ **代码组织**: 清晰的职责分离
- ✅ **文档注释**: 所有公共函数都有 JSDoc 注释
- ✅ **常量提取**: 所有消息和正则表达式都在常量文件中
- ✅ **文件缓存**: 优化的文件读取机制，带缓存功能

### 贡献指南

欢迎贡献代码！以下是一些可以改进的方向：

- 添加合并内容的去重功能
- 添加合并内容的排序选项
- 支持批量处理多个文件
- 合并前的预览模式
- 撤销功能
- 更多配置选项

欢迎提交 Issue 或 Pull Request。

---

## 🔹 作者

**xuetengfei**

- GitHub: [@xuetengfei](https://github.com/xuetengfei)
