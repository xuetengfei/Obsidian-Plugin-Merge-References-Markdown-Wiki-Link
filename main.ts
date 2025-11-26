import { Plugin, Notice } from 'obsidian';
import { MergeReferencesSettingTab } from './settings/WanderNoteSettingTab';
import { mergeReferences } from './src/merge-references';
import { MESSAGES } from './src/constants';

/**
 * 插件设置接口
 */
export interface MergeReferencesSettings {
  /** 是否删除被引用的源文件 */
  DeleteTheReferencedSourceFile: boolean;
  /** 合并内容分隔符 */
  MergeSeparator: string;
}

/**
 * 默认设置
 */
const DEFAULT_SETTINGS: MergeReferencesSettings = {
  DeleteTheReferencedSourceFile: false,
  MergeSeparator: '\n\n---\n\n', // 默认分隔符
};

/**
 * Merge References Plugin
 * 用于递归合并 Markdown 文件中的 Wiki 链接内容
 */
export default class MergeReferencesPlugin extends Plugin {
  settings: MergeReferencesSettings = DEFAULT_SETTINGS;

  /**
   * 加载设置
   */
  async loadSettings(): Promise<void> {
    const loaded = await this.loadData();
    this.settings = Object.assign({}, DEFAULT_SETTINGS, loaded);
  }

  /**
   * 保存设置
   */
  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
  }

  /**
   * 插件加载时调用
   */
  async onload(): Promise<void> {
    console.log('加载插件: Merge MD by Wiki Link');
    // 加载设置
    await this.loadSettings();
    this.addSettingTab(new MergeReferencesSettingTab(this.app, this));

    // 添加工具栏图标
    this.addRibbonIcon('merge', 'xtf222:Merge References', async () => {
      await this.mergeWikiLinks();
    });

    // 注册命令
    this.addCommand({
      id: 'merge-wiki-links',
      name: '合并 Wiki 链接',
      callback: () => this.mergeWikiLinks(),
    });
  }

  /**
   * 插件卸载时调用
   */
  onunload(): void {
    console.log('卸载插件: Merge MD by Wiki Link');
  }

  /**
   * 合并 Wiki 链接的主方法
   */
  async mergeWikiLinks(): Promise<void> {
    try {
      const activeFile = this.app.workspace.getActiveFile();
      if (!activeFile) {
        new Notice(MESSAGES.NO_ACTIVE_FILE);
        return;
      }

      await mergeReferences(this.app, this.settings);
      new Notice(MESSAGES.MERGE_SUCCESS);
    } catch (error) {
      console.error('合并失败:', error);

      let errorMessage: string = MESSAGES.MERGE_FAILED;
      if (error instanceof Error) {
        errorMessage = `${MESSAGES.MERGE_FAILED}: ${error.message}`;
      }

      new Notice(errorMessage, 5000);
    }
  }
}
