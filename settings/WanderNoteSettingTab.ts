import { App, PluginSettingTab, Setting } from 'obsidian';
import type MergeReferencesPlugin from '../main';

/**
 * 插件设置面板
 */
export class MergeReferencesSettingTab extends PluginSettingTab {
  plugin: MergeReferencesPlugin;

  constructor(app: App, plugin: MergeReferencesPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  /**
   * 显示设置面板
   */
  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl('h2', { text: '合并 MD 文件插件设置' });

    new Setting(containerEl)
      .setName('删除被引用的源文件')
      .setDesc('合并后是否删除被引用的源文件')
      .addToggle(toggle =>
        toggle
          .setValue(this.plugin.settings.DeleteTheReferencedSourceFile)
          .onChange(async value => {
            this.plugin.settings.DeleteTheReferencedSourceFile = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName('合并内容分隔符')
      .setDesc('在合并内容前后插入的分隔符，可为空或自定义')
      .addText(text =>
        text
          .setPlaceholder('例如：\n\n---\n\n')
          .setValue(this.plugin.settings.MergeSeparator)
          .onChange(async value => {
            this.plugin.settings.MergeSeparator = value;
            await this.plugin.saveSettings();
          })
      );
  }
}
