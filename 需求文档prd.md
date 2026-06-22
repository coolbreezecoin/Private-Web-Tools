# 在线工具站 PRD

## 1. 文档信息

- 产品名称：待定，临时项目名为 `Private Web Tools`
- 目标市场：海外英文用户
- 当前阶段：MVP 需求确认
- 当前版本：v0.2
- 文档语言：中文
- 产品 UI、代码、标识符、页面内容语言：英文
- 视觉参考：`design_handoff_toolkit/Toolkit Home.dc.html` 作为高保真视觉风格基线，不作为生产代码直接复制。

## 2. 产品概述

本项目是一个面向普通大众和社媒用户的在线工具站。站点提供少量高质量、即开即用的浏览器本地工具，每个工具拥有独立 SEO 落地页，所有文本与文件处理均在用户浏览器本地完成，不上传到服务器。

核心定位：

- Privacy-first：用户输入、文本、图片、文件不上传。
- Instant-use：无需登录、无需注册、打开即可使用。
- SEO-led growth：每个工具和高价值长尾词都有独立、真实内容的落地页。
- Lightweight monetization：通过广告位变现，但广告集成必须可关闭、可延后、可替换。

## 3. 产品目标

### 3.1 业务目标

- 建立一个可长期扩展的英文在线工具站基础架构。
- 通过少而精的工具页获取长尾 SEO 流量。
- 为后续广告审批、广告投放和内容扩展预留能力。
- 第一个可上线工具为 `Fancy Text Generator`，覆盖社媒花体文字相关长尾搜索需求。

### 3.2 用户目标

- 用户能在不注册、不安装插件、不上传数据的情况下，快速生成可复制的花体文字。
- 用户能明确理解站点不会上传其输入内容。
- 用户能从搜索引擎进入某个具体落地页后，立即完成任务。

### 3.3 成功指标

MVP 阶段建议关注：

- Organic sessions：自然搜索访问量。
- Tool activation rate：访问工具页后开始输入的用户比例。
- Copy action rate：点击复制按钮的用户比例。
- Landing page indexed count：工具页与长尾页被搜索引擎收录的数量。
- Lighthouse score：Performance、SEO、Accessibility 目标均为 90+。
- Ad readiness：广告组件可接入、可关闭，不影响无广告状态下的页面使用。

## 4. 目标用户

### 4.1 核心用户

- Instagram、TikTok、X、Discord、YouTube 等平台的普通用户。
- 希望让 bio、caption、username、post、comment 更醒目的社媒用户。
- 不懂设计工具，但想快速复制特殊文字样式的用户。

### 4.2 次级用户

- 内容创作者、社媒运营、直播主播。
- 游戏社区、论坛、聊天社区用户。
- 搜索“cursive text generator”“bold text for Instagram”“fancy font copy paste”等长尾关键词的用户。

### 4.3 用户痛点

- 大多数工具站广告过重、加载慢、页面杂乱。
- 用户担心输入内容或文件被上传。
- 很多页面只是空壳工具，缺少清晰说明和可信度。
- 复制体验不稳定，移动端使用不顺手。

## 5. 变现模式与非功能性要求

### 5.1 变现模式

主要通过广告变现。MVP 阶段先预留广告位，不硬编码广告脚本。等站点有稳定内容和流量、通过广告平台审批后，再通过配置接入广告脚本。

推荐广告位：

- 工具页正文上方或说明区下方的横幅广告位。
- 工具输出列表中间的原生广告位。
- FAQ 前后的低干扰广告位。
- 移动端避免首屏遮挡工具本体。

### 5.2 广告带来的非功能性要求

- 广告组件必须可配置开关。
- 无广告脚本时页面必须正常渲染，不出现空白布局坍塌或错误。
- 广告脚本不得阻塞核心工具交互。
- 广告位布局要稳定，减少 CLS。
- 广告组件与页面内容解耦，不能把第三方脚本散落在工具页面中。
- 后续可通过环境变量或站点配置切换广告 provider。

## 6. 范围定义

### 6.1 MVP 范围

- Astro + TypeScript 静态站点。
- 首页，采用现有 Toolkit 原型的视觉风格，但只展示真实可用工具。
- 工具目录/导航基础。
- Privacy、About、All tools 基础静态页面。
- `Fancy Text Generator` 主工具页。
- 首批 3 个 `Fancy Text Generator` 长尾落地页，验证收录和流量后扩展到 6-8 个。
- 工具注册表驱动的路由、目录和 SEO 元数据。
- sitemap.xml、robots.txt。
- HowTo 与 FAQPage 结构化数据。
- 隐私友好统计。
- 广告位组件占位与开关配置。
- Cloudflare Pages 部署说明。

### 6.2 非 MVP 范围

- 用户账号、云端保存、会员系统。
- 服务端文件处理。
- 后台 CMS。
- 广告收益优化后台。
- 图片压缩、视频、音频工具的完整实现。
- ffmpeg.wasm 工具实现。
- 多语言正式上线。
- 在首页展示大量未上线工具并伪装成可用入口。

## 7. 信息架构与路由设计

### 7.1 站点结构

- 首页：展示站点价值主张、真实可用工具入口、隐私承诺、精选工具；未上线工具只能以非主路径的 `Coming soon` 方式弱提示。
- 工具页：每个工具一个独立路由，作为 SEO 落地页。
- 长尾落地页：围绕高价值关键词生成差异化内容，共用核心工具组件。
- 静态内容区：每个工具页包含说明、How-to、FAQ、隐私提示。

### 7.2 路由规划

MVP 首批路由：

| 路由 | 页面类型 | 目标关键词 | 说明 |
| --- | --- | --- | --- |
| `/` | 首页 | online privacy tools, free online tools | 站点入口与工具索引 |
| `/privacy` | 静态信任页 | privacy policy | 说明本地处理、统计和广告策略 |
| `/about` | 静态信任页 | private online tools | 说明站点定位与隐私承诺 |
| `/all-tools` | 工具目录页 | free online tools | 展示已上线工具和轻量 Coming soon |
| `/fancy-text` | 主工具页 | fancy text generator | 花体文字主落地页 |
| `/fancy-text/cursive` | 长尾工具页 | cursive text generator | 强调 cursive/script 输出 |
| `/fancy-text/bold-for-instagram` | 长尾工具页 | bold text for Instagram | 强调 Instagram bio/caption |
| `/fancy-text/italic` | 长尾工具页 | italic text generator | 强调 italic 样式 |

验证后扩展路由：

| 路由 | 页面类型 | 目标关键词 | 说明 |
| --- | --- | --- | --- |
| `/fancy-text/monospace` | 长尾工具页 | monospace text generator | 强调 monospace 样式 |
| `/fancy-text/bubble` | 长尾工具页 | bubble text generator | 强调 bubble 样式 |
| `/fancy-text/strikethrough` | 长尾工具页 | strikethrough text generator | 强调删除线样式 |

### 7.3 后续可扩展路由

为后续图片工具预留：

- `/image-compressor`
- `/image-converter`
- `/resize-image`
- `/webp-converter`
- `/avif-converter`

上述路由暂不实现，只在架构层面预留工具类型、worker 能力和 jSquash WASM 缓存方案。首页 MVP 不把这些工具渲染为可点击主卡片，避免用户误以为已经可用。

## 8. 页面内容要求

每个工具页必须包含：

- 唯一 H1。
- 清晰的英文说明文本。
- 工具交互区域。
- 明确隐私提示，例如 `Your text stays in your browser. Nothing is uploaded.`
- How-to 内容。
- FAQ 内容。
- 内链到相关长尾页。
- 独立 meta title、meta description、canonical、OpenGraph。
- HowTo schema 与 FAQPage schema。

页面不得只有工具组件和少量空泛文字。

## 9. 视觉设计与首页规范

### 9.1 视觉方向

以 `design_handoff_toolkit/Toolkit Home.dc.html` 为视觉风格参考，目标气质是干净、可信、轻量、略带高级感。该原型用于还原视觉语言，不直接复制其 HTML 运行时代码。

保留方向：

- 暖白浅色背景与深色模式。
- 靛蓝色 accent。
- 圆角卡片、柔和边框、轻微 hover lift。
- 首屏突出隐私承诺。
- 搜索与分类筛选作为工具目录的长期能力。
- 页脚包含 Privacy、About、All tools 等信任入口。

需要调整：

- MVP 不使用 `Search 40+ tools...` 这类超前文案，改为 `Search tools...` 或 `Search private tools...`。
- MVP 首页不展示大量未上线工具主卡片。
- 原型中的广告占位在生产默认隐藏，等广告开启后再出现。
- `Tiny tools that just work.` 可作为风格参考，但首页 H1 建议更明确表达产品定位。

### 9.2 首页首屏建议文案

候选 H1：

- `Private online tools that just work.`
- `Free browser tools that keep your data private.`

候选副标题：

- `Style your text, shrink images, and convert files right in your browser. No sign-up, no uploads, no waiting.`

MVP 阶段如图片/文件工具尚未上线，应避免在副标题中承诺未上线能力。首版可使用：

- `Create stylish text for social profiles and posts right in your browser. No sign-up, no uploads, no waiting.`

### 9.3 首页内容结构

MVP 首页结构：

1. Sticky header：logo、基础导航、主题切换。
2. Hero：隐私承诺 pill、H1、副标题。
3. Primary tool entry：突出 `Fancy Text Generator`。
4. Tool directory：仅展示已可用工具；未上线工具放入轻量 `Coming soon` 区域。
5. Trust strip：Private by default、Instant results、Free, no sign-up。
6. SEO 内容区：用英文解释站点为什么本地处理、适合哪些用户。
7. Footer：Privacy、About、All tools。

### 9.4 设计 Token

生产实现使用 CSS variables 复刻原型核心 token：

- `--color-bg`
- `--color-surface`
- `--color-text`
- `--color-muted`
- `--color-border`
- `--color-accent`
- `--color-accent-soft-bg`
- `--color-accent-soft-text`
- `--radius-card`
- `--radius-pill`
- `--shadow-card`
- `--shadow-card-hover`

字体策略：

- 原型使用 `Plus Jakarta Sans`。
- 生产优先自托管字体，或使用系统字体栈，避免 privacy-first 站点首屏依赖 Google Fonts。

### 9.5 移动端要求

移动端是核心场景，不是后置补充。MVP 必须满足：

- 首屏不被广告或过大 hero 挤压。
- 工具输入框、复制按钮、分类筛选的点击区域不小于 44px。
- 首页工具卡单列或 2 列自适应。
- 工具页输出卡片在小屏上可快速扫读和复制。
- Sticky header 不遮挡内容。
- 横向滚动只允许用于明确的 chip 列表，不允许页面整体横向溢出。

## 10. 第一个工具：Fancy Text Generator

### 10.1 工具目标

帮助用户把普通英文文本即时转换为多种 Unicode 风格文本，并一键复制到剪贴板，用于 Instagram bio、captions、Discord names、social posts、comments 等场景。

### 10.2 用户故事

- 作为社媒用户，我想输入普通文本并看到多种 fancy text 输出，以便选择适合 bio 或 caption 的样式。
- 作为移动端用户，我想一键复制某个样式，以便快速粘贴到社媒 App。
- 作为隐私敏感用户，我想知道文字不会上传，以便放心输入。
- 作为搜索用户，我想从 `bold text for Instagram` 这类页面直接看到相关样式，以便不必再筛选。

### 10.3 核心功能

- 输入框：
  - 支持英文文本、数字、常见符号。
  - 实时转换，无需点击提交。
  - 提供默认 placeholder，例如 `Type your text here...`
  - 支持清空输入。

- 输出样式：
  - Bold
  - Italic
  - Bold Italic
  - Script / Cursive
  - Monospace
  - Bubble
  - Square
  - Strikethrough
  - Small Caps
  - Zalgo

- 复制：
  - 每种输出提供 `Copy` 按钮。
  - 复制成功后按钮状态短暂变为 `Copied`。
  - Clipboard API 不可用时提供降级方案，例如选中文本或显示错误提示。

- 长尾页差异化：
  - `/fancy-text` 展示所有样式。
  - `/fancy-text/cursive` 默认突出 Script / Cursive。
  - `/fancy-text/bold-for-instagram` 默认突出 Bold、Bold Italic，并在文案中强调 Instagram bio 和 caption。
  - 其他长尾页根据关键词调整 H1、说明、FAQ 和默认排序。

### 10.4 转换规则

- 花体文字通过纯 JavaScript Unicode 字符映射实现。
- 不使用 WASM。
- 输入文本不上传，不存储到服务器。
- 不承诺所有平台都能完美显示，因为不同平台字体支持不同；FAQ 中说明兼容性。
- 对无映射字符保持原样。
- Zalgo 输出需要控制强度，避免生成极端长字符串影响性能和可读性。

### 10.5 可访问性要求

- 输入框有明确 label。
- 输出结果可被屏幕阅读器理解。
- Copy 按钮有明确文本或 aria-label。
- 复制状态变化使用 `aria-live` 提示。
- 键盘可完整操作。
- 颜色对比度符合 WCAG AA。

### 10.6 验收标准

- 用户在 `/fancy-text` 输入 `Hello 123` 后，所有样式实时出现。
- 用户点击任意输出的 `Copy` 后，剪贴板中包含对应转换结果。
- 长尾页使用同一个核心组件，但页面 H1、title、description、FAQ 文案不同。
- 断网打开已加载页面时，核心文本转换逻辑仍可用。
- 页面源代码中包含可索引的说明、How-to、FAQ 文本。
- Lighthouse Performance、SEO、Accessibility 均达到 90+。

## 11. SEO 方案

### 11.1 页面级 SEO

每个工具和长尾页配置：

- `title`
- `description`
- `canonical`
- `openGraph.title`
- `openGraph.description`
- `openGraph.url`
- `openGraph.type`
- 可选 `openGraph.image`

示例：

- `/fancy-text`
  - Title：`Fancy Text Generator - Copy and Paste Stylish Unicode Text`
  - Description：`Create bold, cursive, italic, bubble, monospace, and other fancy Unicode text styles instantly. Your text stays in your browser.`

- `/fancy-text/bold-for-instagram`
  - Title：`Bold Text for Instagram - Copy and Paste Bold Unicode Fonts`
  - Description：`Make bold text for Instagram bios, captions, comments, and posts. Free, instant, and private in your browser.`

### 11.2 结构化数据

每个工具页注入：

- `HowTo` schema：描述 3-5 步使用方法。
- `FAQPage` schema：对应页面实际 FAQ 内容。

结构化数据内容必须和页面可见文本一致，避免搜索引擎认为是隐藏内容。

### 11.3 Sitemap 与 Robots

- 自动生成 `sitemap.xml`，包含首页、静态信任页、工具主页面、长尾落地页。
- 自动生成或静态提供 `robots.txt`。
- `robots.txt` 指向 sitemap。
- 后续新增工具时，工具注册表应自动影响 sitemap。

### 11.4 语义化与可访问性

- 页面使用语义化 HTML：`main`、`section`、`article`、`nav`、`header`、`footer`。
- 每页唯一 H1。
- 按钮、表单控件具备可访问名称。
- FAQ 使用语义化标题结构。
- 内链使用可描述的 anchor text。

### 11.5 i18n 预留

当前只做英文页面，但结构预留多语言：

- 工具注册表支持 `locale` 或 `contentByLocale` 扩展。
- 路由结构未来可扩展为 `/en/...`、`/es/...` 等。
- 当前 canonical 使用无 locale 的英文默认路由。
- 所有 UI 字符串集中管理，避免散落在组件中。

## 12. 技术架构

### 12.1 框架

- Astro + TypeScript。
- 静态优先输出，适配 Cloudflare Pages。
- 工具交互使用 island 组件，仅在工具区域 hydration。

### 12.2 Island 框架选择

建议选择 Svelte。

理由：

- 编译产物轻，适合 SEO 工具站对最小 JS 的要求。
- 响应式状态写法简洁，适合输入实时转换、复制状态等轻交互。
- 对当前工具需求来说，不需要 React 生态复杂度。
- Astro 与 Svelte 集成成熟，island hydration 成本低。

保留原则：若后续需要大量复杂组件生态或现成 React 库，再评估 React；MVP 使用 Svelte 更符合轻量目标。

### 12.3 样式方案

建议使用原生 CSS + CSS variables。

理由：

- 工具站首屏和组件数量有限，原生 CSS 足够。
- 避免 Tailwind 构建和 class 体积/维护心智。
- 更容易控制关键 CSS、减少运行时和构建复杂度。
- 通过全局设计 token 保持一致性。

可预留：

- `src/styles/tokens.css`
- `src/styles/global.css`
- 组件级局部样式

如果后续组件量显著增加，可再引入 Tailwind。

### 12.4 目录结构建议

```text
src/
  components/
    ads/
    layout/
    tools/
  content/
    tools/
  data/
    tools.ts
  layouts/
  pages/
    index.astro
    fancy-text/
      index.astro
      [slug].astro
  scripts/
  styles/
  utils/
    seo.ts
    schema.ts
    textTransforms.ts
  workers/
public/
  _headers
  robots.txt
```

## 13. Tools Registry 设计

新增工具应遵循“加配置 + 加组件 + 加内容”的模式。

工具注册表建议包含：

- `id`
- `name`
- `category`
- `route`
- `component`
- `status`
- `visibility`
- `seo`
- `og`
- `howTo`
- `faq`
- `relatedTools`
- `privacyNote`
- `landingPages`

`landingPages` 建议包含：

- `slug`
- `route`
- `keyword`
- `h1`
- `intro`
- `featuredStyles`
- `seo`
- `howTo`
- `faq`

目录页、内链、sitemap、schema 和路由生成尽量从 registry 读取，避免重复维护。

工具状态建议：

- `available`：已上线，可出现在首页主工具卡、目录页和 sitemap。
- `comingSoon`：未上线，只能出现在轻量预告区域，不生成可索引工具页。
- `hidden`：内部预留，不出现在用户可见入口。

`visibility` 用于控制是否进入首页、目录页、导航、sitemap，避免未完成工具被搜索引擎抓取。

## 14. 隐私方案

### 14.1 产品层隐私承诺

所有工具页明确展示英文隐私提示：

- `Your text stays in your browser. Nothing is uploaded.`
- 对文件类工具可使用：`Your files are processed locally in your browser and never uploaded to our servers.`

### 14.2 技术层隐私要求

- 文本转换在浏览器本地完成。
- 不向服务器发送用户输入内容。
- 不在 analytics 中记录用户输入。
- 不使用会收集输入内容的第三方脚本。
- 广告脚本加载必须与工具输入隔离，不能访问工具状态。
- 文件工具未来使用 Web Worker 本地处理。

### 14.3 Analytics 隐私

推荐方案二选一：

- Cloudflare Web Analytics：部署在 Cloudflare Pages 上集成方便，不使用 cookie。
- Plausible：隐私友好，可自托管或云服务，事件追踪能力更清晰。

MVP 建议优先 Cloudflare Web Analytics，减少外部依赖；若需要更完整的转化漏斗，再评估 Plausible。

## 15. 性能方案

### 15.1 目标

- Lighthouse Performance：90+
- Lighthouse SEO：95+
- Lighthouse Accessibility：90+
- 首屏 HTML 静态生成。
- 工具 island JS 尽量小。
- 非关键脚本延后加载。
- 广告脚本默认关闭，不阻塞首屏。

### 15.2 实现原则

- Astro 静态输出。
- 只对工具交互区域 hydrate。
- Fancy Text 使用纯 JS 映射，不引入大依赖。
- 复杂处理未来放入 Web Worker。
- WASM 仅在图片/音频工具需要时懒加载。
- 使用 Service Worker 缓存 WASM 资源。
- 避免布局抖动，广告位预留尺寸。

## 16. 图片与未来重处理工具预留

后续图片工具使用 jSquash 系列：

- `@jsquash/jpeg`
- `@jsquash/png`
- `@jsquash/webp`
- `@jsquash/avif`
- `@jsquash/resize`

设计要求：

- 图像编码、解码、缩放放在 Web Worker 中执行。
- 主线程只负责 UI 状态和进度展示。
- WASM 包按工具懒加载。
- Service Worker 缓存 WASM，降低重复访问成本。
- 文件不上传，处理结果通过 Blob URL 下载。

为未来 ffmpeg.wasm 音频工具预留：

- Cloudflare Pages `_headers` 配置 COOP/COEP。
- 先预留响应头，不在 MVP 中实现音频工具。

## 17. Cloudflare Pages 部署要求

### 17.1 构建输出

- Astro 静态输出。
- 构建命令：`npm run build`
- 输出目录：`dist`

### 17.2 `_headers` 预留

需要在 `public/_headers` 中预留：

```text
/*
  Cross-Origin-Opener-Policy: same-origin
  Cross-Origin-Embedder-Policy: require-corp
```

说明：

- 这为未来需要 SharedArrayBuffer 的 ffmpeg.wasm 等工具做准备。
- 若第三方广告或分析脚本受 COEP 影响，后续需要按 provider 测试并调整策略。

## 18. 广告集成设计

### 18.1 广告组件

建议建立通用组件：

- `AdSlot`
- `AdProviderScript`

`AdSlot` 接收：

- `slotId`
- `placement`
- `enabled`
- `reservedHeight`
- `label`

### 18.2 配置方式

建议通过站点配置和环境变量控制：

- `ADS_ENABLED`
- `ADS_PROVIDER`
- `ADS_CLIENT_ID`

初期默认：

- `ADS_ENABLED=false`
- 广告组件存在于代码中，但不渲染可见广告占位，也不加载广告脚本。
- 广告开启后再为对应 placement 预留稳定尺寸，减少 CLS。

### 18.3 页面要求

- 广告位不能遮挡工具输入和输出。
- 移动端广告位不能制造误触。
- 广告组件未启用时不显示无意义的空白或错误。
- 后续接入 Google AdSense 或其他广告平台时，只修改广告 provider 层。

## 19. 可扩展性设计

### 19.1 新增工具流程

新增工具时应只需要：

1. 在 tools registry 添加工具配置。
2. 添加工具 island 组件。
3. 添加英文页面内容，包括说明、How-to、FAQ。
4. 如有重处理，添加对应 worker。
5. 运行构建，自动生成路由、sitemap、schema。

### 19.2 内容可维护性

- 工具元数据与 SEO 内容结构化维护。
- UI 文案集中管理。
- FAQ 和 How-to 内容可被 schema 复用。
- 长尾页通过配置差异化，而不是复制整页组件。

### 19.3 代码边界

- `utils/textTransforms.ts`：纯文本转换逻辑。
- `components/tools/FancyTextGenerator.svelte`：交互 UI。
- `data/tools.ts`：工具注册表。
- `utils/seo.ts`：meta/canonical/OG 生成。
- `utils/schema.ts`：HowTo/FAQ schema 生成。
- `workers/`：未来重处理工具。

## 20. 里程碑与交付顺序

### Milestone 1：PRD 确认

交付：

- 中文 PRD。
- 明确 MVP 范围。
- 明确技术选型、路由、SEO、隐私、广告和扩展方案。

验收：

- 用户确认 PRD 可进入开发。

### Milestone 2：仓库脚手架

交付：

- Astro + TypeScript 项目。
- Svelte island 集成。
- 基础目录结构。
- 全局样式与布局。
- 按 Toolkit 原型还原首页视觉基线。
- tools registry 初版。
- Privacy、About、All tools 静态页。
- sitemap/robots 配置。
- `_headers`。
- Cloudflare Pages 构建配置。

验收：

- 本地能启动开发服务器。
- 首页能访问。
- 构建能成功输出静态文件。

### Milestone 3：Fancy Text Generator MVP

交付：

- `/fancy-text` 主工具页。
- 多种 Unicode 输出。
- 一键复制。
- 隐私提示。
- How-to 与 FAQ。
- 页面级 SEO 元数据。
- HowTo 与 FAQPage schema。

验收：

- 输入后实时生成结果。
- 复制功能可用。
- 页面源码含可索引内容与 schema。
- Lighthouse 目标达标或记录优化项。

### Milestone 4：长尾落地页

交付：

- `/fancy-text/cursive`
- `/fancy-text/bold-for-instagram`
- `/fancy-text/italic`

验收：

- 每页 H1、title、description、FAQ 不同。
- 每页共用核心工具组件。
- sitemap 自动包含所有长尾页。
- 页面之间有合理内链。

后续扩展候选：

- `/fancy-text/monospace`
- `/fancy-text/bubble`
- `/fancy-text/strikethrough`

### Milestone 5：分析、广告预留与部署说明

交付：

- 隐私友好 analytics 接入方案。
- 广告组件占位与配置开关。
- Cloudflare Pages 部署步骤说明。
- 基础 README。

验收：

- `ADS_ENABLED=false` 时站点无错误。
- 部署说明可从零完成 Cloudflare Pages 发布。
- analytics 不采集用户输入内容。

## 21. 风险与应对

| 风险 | 影响 | 应对 |
| --- | --- | --- |
| SEO 页面内容重复度高 | 收录和排名受影响 | 长尾页 H1、说明、FAQ、默认样式排序差异化 |
| 广告脚本影响性能 | Lighthouse 降分、用户体验下降 | 广告默认关闭，异步加载，预留尺寸 |
| COOP/COEP 与第三方脚本冲突 | 分析或广告脚本加载失败 | MVP 阶段测试 provider，必要时按路径或功能调整 header |
| Unicode 字体兼容不一致 | 用户复制后平台显示异常 | FAQ 明确说明平台支持差异 |
| Zalgo 文本过长 | 卡顿或复制体验差 | 限制强度和输出长度 |
| 后续工具体积膨胀 | 首屏性能下降 | Worker + lazy loading + registry 分组加载 |

## 22. 待确认问题

- 站点正式名称和域名是否已确定。
- Analytics 首选 Cloudflare Web Analytics 还是 Plausible。
- 是否需要单独 Cookie Policy；Privacy 页面已纳入 MVP。
- 广告平台是否预期为 Google AdSense，还是先保持 provider-agnostic。

## 23. 下一步

待本 PRD 确认后，进入 Milestone 2：仓库脚手架。开发阶段将遵守以下原则：

- 所有代码、标识符、UI 文案和页面内容使用英文。
- 工具处理全部在浏览器本地完成。
- 先完成少而精的 Fancy Text Generator，再扩展其他工具。
- 每个新增工具必须同时交付可索引内容、SEO 元数据、How-to、FAQ 和隐私提示。
