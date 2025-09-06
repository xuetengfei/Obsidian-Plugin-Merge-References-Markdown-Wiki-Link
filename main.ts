import { Plugin, Notice } from 'obsidian';
import { WanderNoteSettingTab } from './settings/WanderNoteSettingTab';
import { MergeReferencesProcessor } from './src/merge-references';

export interface MyPluginSettings {
  DeleteTheReferencedSourceFile: boolean;
  MergeSeparator: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
  DeleteTheReferencedSourceFile: false,
  MergeSeparator: '\n\n---\n\n', // 默认分隔符
};

export default class MyPlugin extends Plugin {
  settings!: MyPluginSettings;
  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }
  async saveSettings() {
    await this.saveData(this.settings);
  }
  async onload() {
    console.log('加载插件: Merge MD by Wiki Link');
    // 加载设置
    await this.loadSettings();
    this.addSettingTab(new WanderNoteSettingTab(this.app, this));

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
  onunload() {
    console.log('卸载插件: Merge MD by Wiki Link');
  }
  async mergeWikiLinks() {
    try {
      const merge = new MergeReferencesProcessor(this.app, this.settings);
      await merge.mergeReferences();
      new Notice('Wiki 链接合并完成！');
    } catch (e) {
      console.error(e);
      new Notice('合并 Wiki 链接失败！');
    }
  }
}
