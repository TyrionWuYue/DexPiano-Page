# DexPiano Project Page

独立的学术项目展示网站。纯 HTML / CSS / JavaScript，不依赖 DexPiano 训练代码或 Python 环境，不需要 npm 安装或构建。

## 本地预览

在本目录运行：

```bash
python3 -m http.server 8080 --bind 127.0.0.1 --directory dist
```

浏览器打开 http://127.0.0.1:8080 。按 Ctrl+C 关闭。

也可以直接打开 `dist/index.html` 浏览静态页面。

## 文件

- `dist/index.html`：页面文案、方法图、资源与媒体区域。
- `dist/styles.css`：桌面、手机与 reduced-motion 样式。
- `dist/app.js`：交互琴键、16 秒原创合成旋律、演示视图切换。
- `dist/assets/favicon.svg`：原创钢琴图标。

## 待补材料

- 确认正式副标题、作者全名、单位与主页。作者顺序已按维护者提供的列表填写。
- 论文 / arXiv / 数据集链接，目前显示 Coming soon。
- Teaser、真实机器人录像、仿真回放、人类演示及封面。
- 真实结果、评估协议、引用信息。当前没有虚构数据或论文引用。

钢琴和机器人手是原创 SVG / CSS 示意图，非硬件照片、非真实机器人录像；音符为演示旋律，不来自训练资产。页面默认静音，只在点击 Sound off 后启用合成声音。引用工程 README 中的流程与硬件名称，不代表已经完成硬件验收。

添加视频时将文件置于 `dist/assets/`，以 `<video controls playsinline preload="metadata" poster="…">` 替换对应占位区，并更新视图切换逻辑。资源使用相对路径，适合 GitHub Pages 的仓库子路径。

## 后续发布

独立仓库：https://github.com/TyrionWuYue/DexPiano-Page

GitHub Pages 默认地址：https://tyrionwuyue.github.io/DexPiano-Page/

`.github/workflows/pages.yml` 将 `dist/` 部署到 GitHub Pages。推送 `main` 上的网站或 workflow 改动时自动更新，也可在 Actions 页面手动触发。实际访问地址以 Pages 部署输出为准（个人主页的域名配置可能影响项目页地址）。

发布前本地预览并检查文案、链接和媒体；确认不包含私有训练数据、凭据或未授权发布的素材。仓库只维护网站，不同步或修改训练代码。

## 设计参考

- https://eigendexplore.github.io/ — 简洁标题、圆角资源入口、交互式研究展示。
- https://zhanyisun.github.io/dice.rl.2026/ — 学术项目页层次、方法与实验展示结构。

页面布局与图形为新建实现，未复制参考网站的源码、品牌图标或研究素材。
