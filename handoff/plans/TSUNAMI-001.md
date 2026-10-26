kind: plan
task: TSUNAMI-001
round: 1
nonce: 85f9f2a106263201
brief_sha: 21876d94200c1cbb1971135837f19927952b30bc

# TSUNAMI-001｜海啸如何诞生：可验证的三维互动科普（一次性交付施工图）

文档状态：READY_FOR_EXECUTION；规划日：2026-10-27；交接目标：macOS arm64 本机执行 Agent；主分支 main。本文为实施规格，不是完成报告，不表示已运行本机代码或浏览器。简报原文与验收以 handoff/briefs/TSUNAMI-001.md（已读 blob SHA 21876d94200c1cbb1971135837f19927952b30bc）为唯一任务依据；质量线为 handoff/spec/design-quality-bar.md；规格为 handoff/spec/plan-spec.md。

## 1. 需求、范围与非目标

### 1.1 需求与核心承诺

用户原话：「做一个海啸原理的科普网页，可以用一个 3D 模型来讲解。」

交付一页中文、可静态部署、离线运行不向外域发请求的实时 WebGL2 Three.js 教学网页。唯一叙事主轴为海底俯冲型逆断层垂向错动→水柱整体响应→深海传播→地震与海啸传播速度差→陆架浅水变形→可能的先退与波前陡化→连续多波与沿岸淹没示意。主角是始终可操作的剖切三维海盆；标签、数字和讲解围绕同一海盆变化，不以视频、滚动长图或一张静帧冒充 3D。

学习成功判据：访问者在没有地球物理背景时可以用 7 个章节复述上述链条，改变海底抬升量和深海水深后，看到场景与同源公式值同步变化；明确分辨「真实物理定律」和「故意夸张的教学形状」，不会以为本页可进行海啸预报或危险区域判定。

### 1.2 范围内

- 单页语义化 HTML、中文内容、7 章导航、完整 3D 场景、章节镜头、播放/暂停、倍速固定档 1×/2×（教学时间倍率）、前后章、拖拽旋转有限角度、视角复位、参数控件、实时读数。
- 纯程序化海床、地壳块体、海面、海水剖切体、全水柱粒子行列、岸线/陆地/城市标志、地震波前与海啸波前、多波列及示意淹没覆盖层。
- c=√(g h)、λ=cT、Green 定律 H(h)=H0(h0/h)^(1/4) 的可复核计算；科学边界与来源板块；真实历史事件仅作为经核证的参考卡片。
- 参数及键盘路径单测、构建、真实 Chrome 截图与性能/对比度审计，完整执行报告；运行时外域请求严格为 0。

### 1.3 范围外

后端、数据库、登录、用户轨迹、真实海啸预报、海啸波二维数值求解与精确淹没建模、真实海岸 DEM、WebGPU、线上地图瓦片、GLB/GLTF、预渲染主画面、CDN、PWA、埋点、翻译、多语言、声效旁白、CI、线上服务器部署。海底错动与沿岸淹没为教学示意，不得作为真实震级→海底位移或位移→损失/淹没距离的定量预测。

### 1.4 验收闸门（全部为必须通过）

A01 npm ci && npm run build 退出 0；dist 经本地静态服务可用；一次加载加全章节交互后网络记录的域外请求数=0（包括 fonts、fetch、CSS、贴图、WebSocket）。
A02 真实 Chrome 生产构建 1440×900、390×844 console error=0、pageerror=0；并在 375×812、768×1024、1024×768 复测布局。
A03 前台页面连续 60 个 requestAnimationFrame 回调，帧 ID 唯一、performance.now() 时间戳严格递增；证据注明 document.visibilityState=visible 与窗口是否聚焦，此项只证实循环活着，不冒充 60fps。
A04 单测验证 9.81、h=4000 时 c≈198.09m/s≈713.11km/h、h=10 时 c≈9.9045m/s、4000→10 时 H 比≈4.4721，周期 600s 下 λ 同步随 c 变；页面数值与纯函数同源，容差详见第 8 节。
A05 七节点都有实际可切换场景变化和中文解说，包含断层、水柱、深海、预警示意、shoaling、可能先退、多波/淹没；从章节列表逐项实测。
A06 播放、暂停、跳章、海底抬升 0.5–3.0m 与深海水深 2000–6000m 在 100ms 内有反馈，视觉与数值更新；键盘 Tab、Space、ArrowLeft/ArrowRight；控件无焦点陷阱。
A07 1440×900、390×844 无横滚、无截字且画布可见可操作；375px 追加同标准。
A08 页面样式的正常正文 ≥4.5:1、大字 ≥3:1、非文字状态/边框 ≥3:1，禁用态自定 ≥2:1；prefers-reduced-motion 下无自动连续摄影运动且教学等价。
A09 无错别字与术语混乱；科学、教育、夸大比例声明持续可见；所有实时数据均由公式计算；来源清楚。
A10 F 类视觉走查 A–E 全项有证据，失败项不允许自报 READY。

### 1.5 依赖和预设

用户简报提供的工作站：macOS 26.4.1 arm64；Node 22.22.2、npm 10.9.7；Chrome、GPU、可用 npm registry。依赖 Three.js 和 Vite（简报当时探测版本分别为 0.186.1、8.3.5），Playwright-core（真实 Chrome 通道）、Lucide 图标（构建时本地打包）。项目起始无实现；不存在可复用源码、已有测试或合法下载的素材。初始化时固定 package-lock.json；只用 npm ci 重放；对实际安装版本及 Node engines 做本机验证，不把规划阶段的版本信息假称为已安装状态。基准 Chrome 桌面和 Chrome Android 仿真视口；WebGL2 可用才进入主体验，不可用提供同内容可读回退。

## 2. 调研结论与最高水准参照

以下链接在本轮网页调研中查证了对应页面及主要论述；它们是学习参照，不是获授权直接嵌入的资源。优先学习信息与交互方法，不复制图片、代码、商标。

| 对标（类型与确切入口） | 可核实的长处 | 本页照学的具体设计 | 不照抄 |
|---|---|---|---|
| USGS《Life of a Tsunami》，https://www.usgs.gov/centers/pcmsc/life-tsunami | 起始/分裂/浅化/涌岸四联剖面，一眼交代完整物理因果，图注明确波形高度夸张 | 唯一剖面坐标贯穿 7 章；固定地点深海到浅海，不换背景；给出「垂直夸张」标记 | 静态四格难操控、不能改参数；本页加同步数值与 3D 摄影机 |
| NOAA《Tsunami Propagation》，https://www.noaa.gov/jetstream/tsunamis/tsunami-propagation | 速度随水深改变，波长缩短、波高增加及船难察觉的对比清楚 | 第 3/5 章并排显示 c、λ、H 数值；参数改变即重算 | 不将教学夸大海浪样式描述为实际巨型翻卷浪 |
| NOAA/NCEI《Natural Hazards Education》，https://www.ncei.noaa.gov/news/ncei-supports-natural-hazards-education | 时间轴播放可浏览 1850 年以来海啸事件，让时间信息可被探索 | 用具有章节刻度的播放时间轴和自动暂停；历史事实卡片独立于计算模型 | 不下载实时远程事件库；不把真实事件当模拟输入 |
| NASA/JPL《Eyes》，https://science.nasa.gov/eyes/（含 Eyes on the Earth） | 浏览器实时 3D、时间快进、镜头漫游与实测数据/解说并置 | 场景主占比 + 讲解侧边栏 + 复位镜头 + 章内镜头关键帧 | 不模仿整颗地球的复杂导航或在线资源依赖 |
| The Pudding《The Physical Traits that Define Men and Women in Literature》，https://pudding.cool/2020/07/gendered-descriptions/ | 图表始终服务于解释文本，用户可调整筛选并看到即时反馈 | 一步一个问题与一个视觉变化；旁栏「观察—解释—记住」固定层次 | 不把统计可视化视觉语言生搬到水体物理上 |
| 科学解释方式补参：Distill《Feature Visualization》，https://distill.pub/2017/feature-visualization/ | 概念—可视物—局限三者同时在文章中交代 | 全水柱与幅度夸张均在视图区直接放图例与限制注记 | 不复制网络结构、不增加与海啸无关的复杂控件 |

设计系统与基础技术参照：

- IBM Carbon 色彩令牌、分层与 2px 焦点：https://www.carbondesignsystem.com/building-blocks/foundations/color/overview；本页统一语义令牌，单主强调色青蓝，不散写 hex。
- IBM Carbon Motion：https://www.carbondesignsystem.com/building-blocks/foundations/motion/overview；微动作使用 productive standard cubic-bezier(0.2,0,0.38,0.9)，只有镜头章节切换属于较长叙事运动。
- W3C WCAG 2.2 对比度：https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum；文本小字 4.5:1、大字 3:1；非文本依硬质量线 3:1 测。
- Three.js WebGLRenderer：https://threejs.org/docs/pages/WebGLRenderer；现代 WebGLRenderer 需要 WebGL2，必须显示检测错误而不是无反应。ShaderMaterial：https://threejs.org/docs/pages/ShaderMaterial；通过 uniforms 即时改变顶点高度与着色；不能假定 WebGL 粗线 linewidth 在设备上工作。
- 科学核证入口：USGS 2004 震源/海床垂向形变 https://www.usgs.gov/centers/pcmsc/science/tsunami-generation-2004-m91-sumatra-andaman-earthquake；NOAA 全水柱 https://www.noaa.gov/education/resource-collections/ocean-coasts/tsunamis；NOAA NCEI 公式 https://www.ncei.noaa.gov/products/natural-hazards/tsunamis-earthquakes-volcanoes/tsunamis/global-historical-data；NOAA/ITIC 日本资料含 Green 定律 https://www.weather.gov/media/itic-car/marine_guidance/japan/English%20version%2026_01.pdf；NOAA 教学 4000m→198m/s https://repository.library.noaa.gov/view/noaa/16263/noaa_16263_DS1.pdf；UNESCO-IOC 多波与防灾 https://tsunami.ioc.unesco.org/en/what-are-tsunamis 及 https://tsunami.ioc.unesco.org/en/what-do；JMA 先退非必然 https://www.jma.go.jp/jma/kishou/know/jishin/tsunami/generation.html；USGS 2011 案例 https://earthquake.usgs.gov/earthquakes/eventpage/usc0001xgp。
- 内容校对底线：真实传播往往包含折射、反射、方向性、海床复杂地形、非线性破碎、摩擦、沿岸地形等；本页 1D 教学海盆不含上述预测能力。船不易察觉不等于深海完全没有危险；海啸是波列而不保证先退，不能将第 6 章的示例误写为必然。

品类判断（2026）：优秀科学交互是「可操纵 + 可观察 + 可解释 + 明确模型局限」而不是视频般绚丽却不准的海浪；克制的仪器式界面、可信度注记、可回看时间轴、多端与低动效属于必须。淘汰做法：假海床随机噪声、持续爆炸镜头、红色全屏警报、资料注脚藏页尾、没有图例的夸张曲面。达标定义：7 章每个概念在同一可审计模型中可视且交互改变结果，并能把展示值追溯到物理函数与来源。

## 3. 设计语言：令牌与组件施工规格

### 3.1 单一令牌表（落位 src/styles/tokens.css，所有组件仅使用变量）

| 类别 | 令牌名与精确值 | 使用 |
|---|---|---|
| 主背景 | --bg-0:#071722；--bg-1:#0F2532；--bg-2:#153445；--bg-overlay:#09212F | 页面/卡片/抬升板/遮罩；仅这套暗色方案，不自动换主题 |
| 文字 | --text-1:#F4FBFF；--text-2:#C2D7E1；--text-3:#A0BDC9；--text-disabled:#7895A3；--text-inverse:#071722 | 标题/解释/辅助/禁用/强调按钮 |
| 边界 | --border-1:#618A9B；--border-2:#86C9DB；--focus:#FFD86A | 普通边框/活动边框/键盘焦点；不可用透明低对比线充当可见交互边界 |
| 语义 | --success:#7CE3B6；--warning:#FFC870；--danger:#FF8B86；--info:#88C7FF | 反馈均带文字及 Lucide 图标 |
| 强调 | --accent:#28C7D9；--accent-hover:#5CDBE6；--accent-pressed:#12A9BC；--accent-muted:#103F4A | 单主操作、进度与 3D 发光的统一语义 |
| 海洋 | --sea-top:#21758B；--sea-deep:#123C54；--sea-sub:#174354；--seabed:#7F7167；--rock:#655950；--land:#A69B81；--crest:#6BE5F3；--hazard:#FFC870 | 着色器及几何材质通过 src/scene/palette.js 唯一导出；避免代码散落裸 hex |
| 字体 | --font-cn: "Noto Sans SC","PingFang SC","Microsoft YaHei","Noto Sans CJK SC",sans-serif；--font-latin:"Inter","Helvetica Neue",Arial,sans-serif；--font-mono:"IBM Plex Mono","SFMono-Regular",Consolas,monospace | Noto Sans SC、Inter、IBM Plex Mono 的必要字重在 public/fonts/本地托管；不得运行时调用字体 URL |
| 字阶（比例约 1.25） | --fs-0:12px/18px/500/0.02em（上标，≤34字）；--fs-1:14px/20px/500/0（微文）；--fs-2:16px/26px/400/0（正文，≤38汉字/行）；--fs-3:20px/30px/600/-0.01em（卡标题）；--fs-4:25px/32px/650/-0.015em（章标题）；--fs-5:31px/39px/700/-0.02em（页标题）；--fs-6:39px/48px/700/-0.02em（首屏短句） | 数字 font-variant-numeric:tabular-nums；font-feature-settings:"kern" 1,"palt" 1；正文禁止首行缩进，段距 12px |
| 栅格与间距 | --space-1:4px；-2:8px；-3:12px；-4:16px；-6:24px；-8:32px；-12:48px；-16:64px；-24:96px；--container:1440px | 整页外边距桌面 32、平板 24、移动 16；主卡 padding24、内控 12；工具面板双列 12 |
| 圆角 | --radius-xs:4px；--radius-sm:8px；--radius-md:12px；--radius-lg:16px；--radius-pill:999px | 画布卡 16、面板卡 12、按钮与输入 8、标签 999 |
| 边框/阴影 | --line:1px solid var(--border-1)；--line-active:2px solid var(--border-2)；--shadow-0:none；--shadow-1:0 4px 12px rgba(0,0,0,.2)；--shadow-2:0 12px 28px rgba(0,0,0,.28)；--shadow-3:0 18px 44px rgba(0,0,0,.34)；--shadow-4:0 24px 64px rgba(0,0,0,.42) | 不可无目的同时堆边框+阴影+彩底；正常卡以层色+1px 边框表示，仅浮层 shadow-2 |
| z 层级 | --z-base:0；--z-canvas:1；--z-canvas-label:2；--z-sticky:10；--z-popover:20；--z-dialog:30；--z-toast:40 | 顶部导航 sticky；Canvas DOM 叠字不被 WebGL 遮住 |
| 动效 | --ease-standard:cubic-bezier(0.2,0,0.38,0.9)；--ease-enter:cubic-bezier(0,0,0.38,0.9)；--ease-exit:cubic-bezier(0.2,0,1,0.9)；--dur-fast:120ms；--dur-state:180ms；--dur-panel:240ms；--dur-camera:900ms | CSS 仅 transform/opacity 过渡；物理运动由 WebGL 时间变化；减弱动效时 CSS duration=0ms，相机 snap，仿真默认停 |
| 图标 | Lucide 20px 默认、16px 内联、24px 大控件；stroke-width 1.75；统一圆头 | 按钮 play/pause、arrow、rotate、info、alert 等；正式图标禁 emoji，SVG 包内静态 |

对比度预计算（WCAG 相对亮度公式，预期审计应与此一致）：text-1/bg-0≈17.40:1；text-2/bg-1≈10.59:1；text-3/bg-1≈7.98:1；text-disabled/bg-1≈4.98:1；accent/bg-1≈7.71:1；text-inverse/accent≈8.89:1；focus/bg-1≈11.48:1；border-1/bg-1≈4.22:1；danger/bg-1≈6.98:1。表中值供复测，不因显示四舍五入而放宽判据；accent-pressed 与其他动态态需脚本实算，低于阈值直接替换令牌并重测。WebGL 直接投影的文字全部由独立不透明 DOM 标签承载，始终以上述固定背景对比测试。

### 3.2 组件规格与统一状态契约

公共契约适用于 C01–C10：所有交互组件默认文字 text-1 / bg-1；仅鼠标指针支持 hover 时背景升一级、border 改 border-2，120ms；active 用 transform:scale(.98)、accent-pressed，120ms；focus-visible 2px 实线 focus + 2px outline-offset，禁止裁切；禁用视觉 text-disabled/低亮背景且 aria-disabled="true"；加载显示 Lucide loader +「正在准备海洋模型…」和可读取进度；错误为 danger 图标+具体原因+重试入口；空态为 info 图标+行动提示；成功为 success 图标+结果说明（1600ms 后关闭非关键 toast，屏读 live polite）。非适用的异步状态用同一个顶层 C09 状态层呈现，不得为每个无异步组件造虚假 spinner。所有可点击目标不小于 44×44px、短标签不小于 14px；错误写入 aria-describedby，输入有 label，图标按钮有 aria-label，动态提示使用单一 role=status。

| ID/组件 | DOM 结构与尺寸 | 行为、属性、四态的具体落地 |
|---|---|---|
| C01 站点页眉 | header：高72px 桌面/56px 移动，左右 padding32/16，名称20px、补充说明12px；底部 1px border-1 | 标题「海啸如何诞生」；右侧「原理来源」锚点；sticky；当前章节在导航 C02 呈现，页眉自身无额外动画；加载/错误/空由 C09 报告，正常不显示 |
| C02 七章轨道 | nav aria-label="课程章节"；桌面 7 个 44px 高按钮可换行，移动横排 7 个仅轨道内部滚动、带左右明确可见箭头，不滚全页；active 左竖线 3px accent 且文字「第 N 章」 | 按击切章；aria-current="step" 只给当前；空态「章节尚未就绪，先阅读下方原理概要」，重试回 C09；按下即切换高亮；左右键全局且在非输入聚焦时有效 |
| C03 主舞台 | figure + canvas + figcaption，桌面最小高 510px、宽占右侧可用宽；移动高 clamp(260px,38vh,420px)；16px 圆角；边框 1px | 焦点到「交互 3D 模型」按钮/容器时显示操作帮助；aria-describedby 指向等价文字；空/失败用同尺寸深海色 CSS 剖面 + 七章节文字静态替代，不用灰块；成功显示「模型已就绪」隐藏于视觉的 status；全屏占位固定尺寸不 CLS |
| C04 讲解卡 | aside 内 title 25px、正文16/26、三组「观察/解释/记住」各 12px 标签+16px 文本，max-width 38ch，padding24，radius12 | 章节进入 240ms opacity（reduced motion=0），主叙事 aria-live=off 避免每帧朗读；读屏「读取本章说明」按钮触发一次 polite；缺文案则显示「本章正在准备，请先使用上一章」且可返回 |
| C05 播放工具栏 | div role=group，播放/暂停主按钮宽≥112高44，前后章/复位各44；倍速用两个44px分段按钮；背景 bg-1 | 按播放立即变化为「暂停演示」，暂停后保持时间与相机；正在切镜头时重复点击幂等；结束显示「重新播放」；WebGL 失败时播放 disabled + 错误解释；Space 只在非输入/非按钮激活冲突时触发 |
| C06 参数双滑杆 | fieldset legend「改变条件」；range 水深 2000–6000 step500，抬升量 0.5–3.0 step0.25；轨道高6、拇指直径20但交互区域44；同行 output 数字和单位 | input 事件立即更新；数字范围严格校验；滑杆键盘原生 arrows/Home/End；aria-valuemin/max/now/valuetext；浮层说明「改变的是教学参数，不是地震震级」；值非法自动回退最近合法格并提示 |
| C07 数值仪表 | dl：水深 m、相速度 km/h、波高 m、波长 km、周期 min、Green 比率 ×；桌面 3×2、手机 2×3，padding16，数字20/30 mono tabular | 非适用章数值仍可见，当前关联一项 accent 下划线+文字「本章重点」；数值用 textContent 从 physics view model 同源更新；若公式返回非有限则显示「参数不可计算，已恢复默认值」而非 NaN |
| C08 概念标记/图例 | 舞台绝对定位 DOM overlay，深色不透明胶囊 padding 8×12 radius pill，12px；最多同时3个标记，遮挡时折为图例卡 | 标记不接收焦点（纯说明）；图例可按「显示说明」展开；标记图层与海面 pointer events 不冲突；空态显示「本章没有额外标记」仅在展开图例中 |
| C09 全局状态/反馈 | 固定舞台内部 alert panel，radius12 padding24，错误态图标24、原因16px、动作按钮44px；toast z40 | init/loading「正在建立三维海盆…」+ 数字进度阶段「准备几何/编译材质/首次渲染」；error「浏览器无法运行 WebGL2。文字课程仍可阅读。请更新浏览器或启用图形加速。」；retry「重新尝试 3D」；成功「模型已就绪，可开始第一章」；无脚本空态 noscript「启用 JavaScript 后可操作 3D；下方仍可阅读原理概要」 |
| C10 来源/限制/安全块 | section id=sources，max-width:960px，折叠 details，正文14/22px，引用列表链接≥44px 高；警告注记 warning 文案与 shield 类线图 | 固定写「示意，非等比；非实时预警及淹没预测」；提供来源名称、机构、URL、查证日；链接外开 target=_blank rel=noopener noreferrer（不自动请求）；加载/错误只关联阅读本地数据，不调用远程 API |

所有 10 个组件均有公共 focus/hover/pressed/disabled/加载/错误/空/成功规则；纯显示组件通过 C09 的统一状态及其自身文字空态满足 B1，禁止不适用状态伪装成实际有网络请求。组件不使用模态；如果使用原生 details 则键盘 Enter/Space 展开、aria-expanded 由浏览器管理。CSS 必须完全重置 button/input/h1–h6 的浏览器默认排版；文本行宽限制 ≤38ch。

## 4. 体验设计、界面分镜与可访问性

### 4.1 信息架构与主要旅程

层次严格 ≤3：单页主视图 → 7 个章节 → 本章说明与数值/参数；页面尾部来源和局限。URL 用 #chapter-1…#chapter-7 与 #sources，hashchange 切章节；浏览器 back/forward 恢复章节与该章默认时间，但不劫持自然页面滚动。保留当前修改的参数在章节切换中；刷新重置默认（水深4000m、抬升1.5m、周期600s、倍速1×、第一章、暂停），无 localStorage 和外部网络。

首访：看到核心标题、副题「从海底错动到海岸，沿着一列波走完它的旅程」、静止海盆与「开始演示」→点击后从第 1 章播放→播放到阶段边界自动跳下章并伴随说明→用户拖水深滑杆立刻看到 c/λ/波形变化→在第 5 章暂停作深浅水对照→第 6 章阅读「海水先退并非必然」→第 7 章看到沿岸覆盖示意与「切勿据此判断安全范围」→来源。次要旅程：读屏或无 WebGL2 用户按标题/上一章/下一章读同等完整中文文字与公式结果；无需观看动画也能学会七步。

### 4.2 固定布局（不随章节更换）

1440×900 首屏：72px header；其下带 24px 顶留白的 7 章轨道高56；主区最大宽1440、左右32 padding、gap24，左栏 360px 讲解卡及参数；右侧 minmax(0,1fr) 主舞台（≥510px）加数字卡；首屏显示开始按钮、当前标题、3D 与至少前两项数值。页尾来源与科学边界，不用全屏滚动劫持。

文字结构示意：
页眉：品牌名 / 来源
章节：01 起点 → 02 水柱 → 03 深海 → 04 预警 → 05 浅水 → 06 先退 → 07 多波
主内容：左 [观察|解释|记住] [两个参数]；右 [可操控 3D] [播放控件] [六个数值]
页尾：[模型局限] [真实事件] [机构来源] [安全提示]

响应式定死：
- ≥1280：两列 360px + 剩余，外边距32，舞台最小高度510；
- 1024–1279：左340 + 剩余，外边距24，舞台高480；
- 768–1023：单列；章轨道横滚，先 3D 高440，再控制条与数值卡，再讲解与参数；页眉64px；
- 481–767：单列；页眉56，舞台高 clamp(290px,42vh,410px)，控制44px按钮折为两行（播放居首）、数值2×3、讲解在数值下、参数两列；
- ≤480：容器左右16px；舞台高 clamp(260px,38vh,350px)，章节轨道单行横滚，参数单列，每滑杆高72px，数据 2×3，标题 fs-5 降为 fs-4（仍显式设置）；全局 overflow-x:hidden 不能用来掩盖溢出，必须审计元素 scrollWidth，只有章节内 rail 允许 overflow-x:auto。
- 200% 浏览器文本放大时舞台最小260但可缩、面板自然增高、控制按钮换行、不遮挡焦点。

### 4.3 七章逐屏固定文案骨架与场景变化

每屏四种信息必须同时存在：章标题／「观察」陈述／「解释」因果／「记住」一句总结；数据标签均绑定纯函数。

| 章 | 中文展示文本（必须按意写全，不任意删减） | 3D 必做可见变化 | 屏内标签与镜头 |
|---|---|---|---|
| 01 地壳一动，海底跟着变 | 观察：「两块板块在海沟附近相互挤压，上盘沿逆断层突然抬升，另一侧可下沉。」解释：「不是震级本身直接推出海浪，而是海底大面积垂向位移推动海水。」记住：「海啸的起点往往在海底。」 | 两块层理地壳、海沟、逆断层斜面、上盘上抬箭头、下沉补偿；错动持续2s后保留错动形状；绝不把所有地震说成会有海啸 | 标记「俯冲带」「逆断层」「抬升量 = X m（教学参数）」；相机近斜俯观察断层 |
| 02 动的是整根水柱 | 观察：「海底上抬时，海面也改变；水体并非只有表层被推动。」解释：「海啸是长波，运动影响由海面到底部的水柱，跟常见风浪不同。」记住：「水柱整体参与，而非一张海面皮。」 | 开启透明纵向剖切，8列×6深度采样粒子、横向位移流线；海底→海面因果箭头；切换「水柱」示意层，深浅粒子同步向岸水平移动（垂向变形小量显示） | 标记「整个水柱」「教学剖切」；视角从板块升到水柱纵剖 |
| 03 深海：快却不高 | 观察：「深海水面隆起可很低，波峰相距却很远；大船常不易察觉。」解释：「长波相速度由水深决定 c=√(g h)，波长 λ=cT。」记住：「深水快、波很长，肉眼不一定能发现。」 | 长周期低陡度海面；船为示意几何形，随表面高度轻轻上下；场景标注真实比例的波长量尺，不让船尺寸冒充等比 | 深海 h=Xm、c=Y km/h、λ=Z km、H0=0.25×(抬升/1.5)m；远海侧视，局部高度夸张 |
| 04 地震波先到，海啸波随后 | 观察：「地震波通常比海啸在水中的传播快，监测可争取时间。」解释：「以相同 300km 的极简演算，把假设地震波速度6km/s与均匀深水海啸速度相比；两者实际路径不同，不等于实际可预警时长。」记住：「预警需要监测与传播时间，近岸未必来得及。」 | 岩层内光圈或沿海沟地震波前先到岸侧标记，海面波前后到，两个不同速度曲线同屏可追踪；禁止做成用户真实预警倒计时 | 300km 假设、地震波 t=300/6 s、海啸 t=300000/c(h) s、差值由计算函数输出；镜头拉宽全海盆 |
| 05 浅水：慢下来、挤起来 | 观察：「同一列波进入浅水，前部先减速，后部追近，波长缩短、波高上升。」解释：「以理想、逐渐变化的水深示范 Green 定律 H2/H1=(h1/h2)^(1/4)。真实岸边更复杂。」记住：「慢、短、高，是浅水变形的关键。」 | 陆架斜坡成主画面、波峰间距随 x 收缩、剖面振幅增大；显示深 4000→10m 标尺的数值对比（参数改变后第一数值跟随） | c深/c浅、λ深/λ浅、H浅/H深；动态括号「约 4.47 倍」（默认参数）由函数输出；镜头转向斜坡 |
| 06 波前变陡，有时先退 | 观察：「若首先抵岸的是波谷，海水可能突然退去；也可能不退而直接涨水。」解释：「波列相位决定先来波谷还是波峰；先退不是海啸必经步骤。」记住：「海水异常退去是危险信号，但不应等待先退才撤离。」 | 提供两档可切换「先到波谷/先到波峰」（默认先到波谷，切换后波形相位翻转），海岸湿线出现明显前后变化；波前局部陡化而非卡通卷筒巨浪 | 文字「可能先退 ≠ 必定先退」，按钮同时用文字和箭头区别相位；近岸低角度 |
| 07 不止一道浪，上岸成灾 | 观察：「第一波不一定最高，后续多次上涨回落，危险可持续数小时。」解释：「冲上海岸的水可能像快速上涨的洪水，强水流与漂浮物很危险；此处彩色覆盖仅表达淹没概念。」记住：「保持远离低洼海岸，直至官方解除警报。」 | 至少3次不同波幅的波包连续抵岸；地面亮色半透明贴地遮罩随波次推进与退回、建筑轮廓示意；明确不输出米级淹没距离/灾害预测；最后停在安全提示 | 波序 1/3、2/3、3/3；「模拟时刻（教学）」「淹没范围：概念示意，不可用于实地避险」；45°岸线观察 |

现实危险提示必须准确：「若沿岸感到强烈或持续很久的摇晃，或海水异常快速涨落，应立即向高处和内陆撤离，遵从当地官方预警，不要去海边观察。」出处 UNESCO-IOC / NOAA。不得用互动仿真提示「距离到岸还有 X 分钟，安全」。

### 4.4 微交互、键盘与等价访问

Tab 顺序：品牌来源锚点→章节按钮1…7→舞台视角复位与图例按钮→播放/前后章/倍速→水深/抬升/相位→章节朗读按钮→页尾来源。焦点位置按 DOM 顺序；在移动布局中保持 CSS order 与 DOM 同步，不使用视觉反转的 order。Escape 关闭图例或展开提示，不暂停全页；Space 在非 input/range/button/details 焦点时切换播放，聚焦 button 时遵从原生 Space，防止执行两次；ArrowLeft/ArrowRight 仅在非滑杆/非输入/非横向滚动组件聚焦时切章（方向键放行原生 range 更重要）；首次按 Tab 让焦点环可见。所有 drag 是可选加值，平移/旋转不作为必需学习操作；可通过「复位视角」返回确定镜头。舞台三维剖面无法直接屏读，其替代是七章完整解释和数值表的可访问 DOM；Canvas aria-hidden=true，figure 的 figcaption 提供当前章说明；reduced-motion 默认暂停，按手动「单步演示（下一章）」无需动画也可完成学习，手动播放仅执行缓慢受控形变、无相机连续飞行。

四态文案：
空态「模型还没有开始。选择第一章，查看海底地震如何推动海水。」（空交互启动前并不显示假错误）
加载「正在建立三维海盆…」/「正在编译海面材质…」/「正在准备第一帧…」
错误「三维渲染暂不可用，可能是浏览器没有启用 WebGL2。您仍可通过七章文字和公式了解原理。」操作「重新尝试三维模式」
成功「场景已准备好。播放或选择章节开始学习。」。
交互响应阈值：点击 100ms 内高亮/状态变；章节轻量切换300ms 内文字变；摄像机动画900ms只作为视觉缓动、不能推迟内容更新；异步超过1s显示当前阶段，超过10s显示「取消加载，阅读文字课程」，可取消 RAF 与资源初始化，不能无限 spinner。

## 5. 技术实现、物理模型与边界处理

### 5.1 精确模块目录与接口

全新仓库按以下约定创建；这些是本轮要创建的文件，不暗示当前存在：

- package.json / package-lock.json / index.html / vite.config.js：Vite 入口，base:'./'，build target 'es2022'，禁止远程资产，node 22；package scripts dev、build、preview、test、audit:browser、audit:contrast、audit:physics。
- src/main.js：初始化 UI、state、WebGL 能力判定、销毁。
- src/styles/tokens.css / base.css / layout.css / components.css：唯一颜色真源与布局。
- src/content/chapters.js：7 条不可变记录；src/content/sources.js：显示来源、事实文本、验证时间；src/content/limitations.js：风险与免责声明。
- src/physics/tsunami.js：纯数值；src/physics/bathymetry.js：海盆几何及预积分；src/state/lessonMachine.js：状态 reducer 和章节时间锚。
- src/scene/palette.js：场景颜色唯一来源；src/scene/createScene.js：只建一次 scene；src/scene/terrain.js、fault.js、ocean.js、waterColumn.js、shore.js、wavefronts.js、cameraRig.js、labels.js、animationLoop.js：各只负责一种内容；src/scene/shaders/ocean.vert.glsl、ocean.frag.glsl（可使用 ?raw 本地构建）；
- src/ui/renderShell.js、bindControls.js、updateReadouts.js、keyboard.js、status.js、sourcePanel.js：语义 DOM 和事件；
- tests/physics.test.js、bathymetry.test.js、state.test.js、content.test.js、contrast.test.js；scripts/audit-browser.mjs、audit-contrast.mjs；reports/latest.md、reports/evidence/*（首次生成时提交）；
- public/fonts/*.woff2 及字体 OFL 许可证副本 public/fonts/LICENSES.md；public/favicon.svg（本地简单图形）。
- README.md：npm ci/build/preview/本地 Chrome 观察与安全说明。

精确导出契约（均 ES modules）：
physics/tsunami.js：GRAVITY=9.81；waveSpeed(depthM:number):number（m/s）；waveLength(depthM:number,periodSec:number):number（m）；greenFactor(h0:number,h1:number):number；waveHeightAtDepth(initialHeightM:number,h0:number,h1:number):number；travelTimeKm(startKm:number,endKm:number,lookup:(xKm)=>number,stepKm=0.5):number（s，梯形数值积分）；waveElevation(xKm:number,tSec:number,params:PhysicsParams):number（m）；compareArrival(depthM:number,distanceKm=300,seismicSpeedKmSec=6):{seismicSec,tsunamiSec,gapSec}。h<=0、period<=0、初始波高<0、无穷/NaN 一律抛 RangeError；UI 捕获后钳制恢复默认，不向 WebGL 传 NaN。

PhysicsParams={deepDepthM:4000, upliftM:1.5, initialWaveHeightM:0.25*(upliftM/1.5), periodSec:600, phaseMode:"trough-first"|"crest-first", packetCount:3}。注意 initialWaveHeightM 的数值是人为设置的教学比例映射，不是从实际地震位错推算的震源解；不可写「抬升 1.5m 必然形成0.25m海啸」。取 hNear=10m；默认深海波高0.25m→ h=10 时理想公式波高约1.118m；4000m 的相速度198.09m/s、713.11km/h；10m 相速度9.9045m/s、35.66km/h；T=600s 时深海波长约118.86km、10m 波长5.94km；greenFactor≈4.4721。速度是波形传播相速度，不是水粒子流速。

bathymetry.js：depthAt(xKm,deepDepthM) 在 x∈[0,800]；x≤620 为 deepDepthM；620<x<795 使用 s=(x-620)/175，smoothstep(s)=s*s*(3-2*s)，为避免骤变与近岸不合理地形，h=exp((1-S)*ln(deepDepthM)+S*ln(10))；x≥795 为 10；所有 h≥10；x>800 进入无海水陆地展示，禁止送入 c=√(gh)。x 采样 0.5km → 1601点；累计时间表 tau[0]=0，tau[i]=tau[i-1]+500/(0.5*(c[i-1]+c[i]))（用 m 与 m/s，注意数值积分的倒速度应按梯形 (500/2)*(1/c[i-1]+1/c[i])，以此式为准）；运行时在相邻网格线性插值 tau(x)。参数改变重建表一次，小于100ms 触发 UI 反馈，预计不超过300ms 计算完成。海底地形是解释模型而非真实某国海岸线。

lessonMachine.js：LessonState={chapterIndex:0..6,playing:boolean,rate:1|2,simTimeSec:number,params:PhysicsParams,webglStatus:"idle"|"loading"|"ready"|"error"|"cancelled",phaseOverlay:boolean,labelsVisible:boolean,reducedMotion:boolean,activeToast:string|null,dragActive:boolean}；actions PLAY,PAUSE,TOGGLE,CHAPTER_SET,CHAPTER_NEXT,CHAPTER_PREV,PARAM_DEPTH,PARAM_UPLIFT,PHASE_SET,RATE_SET,CAMERA_RESET,TICK,WEBGL_READY,WEBGL_ERROR,RETRY,CANCEL；reducer(state,action) 纯函数、不改传入 state。所有更新时间只经 dispatch；UI updateReadouts(state,metrics) 与 scene.update(state,dt) 接同一快照；不用多个独立 setInterval，卸载后 cancelAnimationFrame + dispose()。倍速=80模拟秒/现实秒（1×），2×=160模拟秒/现实秒；固定 timestep clamp delta wall time ≤0.05s 避免失焦瞬间时间突进；不可见自动暂停并提示「已暂停，切回本页后继续」。

章节锚点不手写常量：根据 tau(x) 求 cuts=[0,90,240,tau(400),tau(610),tau(770),tau(790),tau(800)+2*T]（严格递增检查）；CHAPTER_SET 将 simTimeSec 设为当前 cuts[i]，同时立即更新文字/相机/模型；TICK 越过 cuts[i+1] 自动进入下一章，但最多推进一次/帧且 carry 余量，最终 chapter=6、playing=false，展示「课程完成，重新播放」；水深改变后保留当前章内归一化进度 f=(t-oldCut[i])/(oldCut[i+1]-oldCut[i])，用新 cuts 恢复位置，避免突然跳到别章。初始 pause 为 true；用户点击开始演示后自动播放。跳章不受 autoplay 与 WebGL loading 干扰，降级文字路径同样可执行。

### 5.2 3D 坐标、场景图与摄影机关键帧

物理 x∈[0,800]km，从外海向右到岸；演示陆地延展至 x=880km；3D 单位不代表米，X=(xKm/800)*18-9；Z∈[-2.8,2.8] 为海盆横宽；Y 为视觉标尺非真实高程：海面静水位=0；海床 Y_bed=-(0.65+3.0*(h/4000)^0.38)，在4000m 时约 -3.65，在10m时约 -0.96；陆地 Y_land=0.04+1.4*smoothstep((x-800)/80)，仅右侧。海浪顶点视觉高度 y=etaM*S_eta，S_eta=0.70 场景单位/米，物理 h 与横向映射不同比例，必须永久贴「教学剖切 · 水平/垂直非等比；波高已夸张显示」；模型刻度总用真实公式计算的米/公里，而不是从 Y 值反算。

场景树：
Scene(root)
— lighting (AmbientLight、DirectionalLight、HemisphereLight；雾只为层次不遮标记)
— basinGroup (seabed mesh；faultPlaneAndTwoCrustBlocks；trench contour；land mesh；simple skyline silhouettes；shoreline)
— waterGroup (ocean shader surface；near/far side transparent cut walls；deep volume tinted shell；64个 water-column particles InstancedMesh；surface vessel；crest/trough thin line segments)
— overlayGroup (earthquake P-wave front; tsunami leading front; distance ticks; inundation conceptual translucent land overlay; source marker)
— cameraRig (PerspectiveCamera fov42 near0.1 far200; deterministic target; limited orbit controls by in-house pointer handler or local Three OrbitControls)
— HTML overlay (C08/C09; all accessible labels DOM not GPU text)
禁止依赖像素宽度 >1 的 WebGL gl.LINES；需清晰描边用窄三角形带或 CylinderGeometry。

海床网格 x=181列（4.44km间隔）× z=17行=3077顶点、约 5760三角形；海面 x=257列×z=33行=8481顶点、约16384三角形；海面顶点 shader 位移无需每帧全量 CPU 上传。地壳二维错动在章1只移动 2 个块体 + 局部 3D 断层，板块间隙不出现空洞（侧面封盖）。水柱粒子为一份 InstancedMesh，8列×8层=64实例，帧动画更新 matrix 最多64次；岸边建筑≤20实例。透明剖切外壳材质 depthWrite=false、固定渲染排序，解决闪烁与前后面；只在第2章启用全水柱强调，其余变暗。

摄影机 world units 坐标取 Y 朝上、X向右，沿 Z 轴向近景观察；预设相机位置→注视点：
K1 chapter1 pos(-7,5,10), target(-7,-1,0)
K2 ch2 pos(-5,3,10), target(-5,-1.4,0)
K3 ch3 pos(-3,7,14), target(-3,-.2,0)
K4 ch4 pos(0,10,18), target(0,-.5,0)
K5 ch5 pos(4,6,12), target(4,-.5,0)
K6 ch6 pos(8,3,9), target(8,0,0)
K7 ch7 pos(9,8,13), target(9,.3,0)
镜头插值 t=elapsed/0.9s；坐标 linear interpolation 用 easing E(t)：参照 cubic-bezier(0.2,0,0.38,0.9)；旋转由相机 lookAt(target)（或 quaternion.slerp 统一）避免逆转；切章起点为当前摄影机位姿，反复点击不累积漂移；拖拽时只改变 yaw ±30°/pitch 15–65°（避免穿海床），按复位900ms 回到本章 K；reduced-motion 直接 snap 至 K、不自动游动。参数变化不改摄影机，避免反复眩晕。视锥适配窄屏：fov 42 保持，distance×1.15 + target适量靠中，以能见全部核心标记为准；不要简单缩小 CSS Canvas 造成 3D 裁切。

### 5.3 海面顶点公式、物理计算与波峰表现

这不是 Navier–Stokes 求解，也不是真实海啸数值预报；采用 1D 缓变介质的教学波列、在 3D 横宽 Z 上微弱同步变化（同一波峰线沿 Z 基本平直）。关键物理：
g=9.81m/s²；c(x)=sqrt(g*h(x))；T=600s 固定，lambda(x)=c(x)*T；r(x,t)=t-tau(x)；A(x)=H(x)/2=H0/2*(h0/h(x))^0.25。
定义脉冲 G(a,sigma)=exp(-0.5*(a/sigma)^2)，sigma=T/6。令 a_j=r-(60+j*T)，j=0,1,2，权重 w=[0.78,1,0.66]。波谷先到模式 η(x,t)=A(x)*sum_j w_j*(-G(a_j,sigma)+G(a_j-T/2,sigma))；波峰先到模式乘 -1。超出 [-A,A] 的样本仅视觉幅度作 clamp；用于数据卡的理论波高始终 H(x)，不拿 shader 点样本去当现场浪高。压缩波长来自 tau(x) 的 x 向梯度而不是手工缩波网格。r< -3sigma 时波面≈0。每一段波前遵循同一 tau；章7波列 3 次由权重与周期控制（对 600s 的波列称持续数十分钟的动画段，真实海啸可持续数小时，不能伪称本仿真展示了几小时全部实况）；若希望展示多小时，文字直接明确真实持续时长、示意动画不等于真实事件时长。

ShaderMaterial 顶点计算步骤：把 mesh 原始 x world 还原为 xKm；通过预积分 tau/h、H 的固定 1601 样本 DataTexture（RGBA32F 如果可用，经本机 float texture 支持检查；默认更稳：用纹理 RGBA8 打包并在 shader 恢复范围，或使用 257 个 x 位置插值的 uniform float 数组；为避免 shader uniform 上限，此项目明确选择在 JS 每次参数变化重建 1024×1 Float32Array DataTexture 的 RGBA 浮点像素，支持不足时改为每帧 CPU 采样更新 8481 顶点 position.y，且在报告记降级），每顶点线性采样 tau、h；在 vertex shader 计算 η、把 position.y 增加 S_eta*η，normal 顶点局部有限差分邻域求偏导后近似法向；fragment 使用深浅水基色 lerp、掠射 Fresnel 弱高光、定向日光项、泡沫仅在岸段且需依据坡度/岸线，禁止噪声制造远海破碎尖浪。数据纹理必须用 NearestFilter 取 texelFetch 相邻两点再手动线性插值，避免 float linear filter 扩展依赖；色域用 THREE.SRGBColorSpace 输出。Shader 的浮点 DataTexture 上传后标记 needsUpdate=true，仅参数修改时上传，不逐帧重新分配。若 GPU 不支持顶点纹理采样（MAX_VERTEX_TEXTURE_IMAGE_UNITS=0）转 CPU 动态 BufferGeometry 路径；两条路径复用同一 waveElevation 纯函数并有一致性采样测试。海浪每帧只更新 uTime/uniform，而不是重新生成 Geometry。

透视下能看见 wave 与海床关联；水体侧面剖切沿可见 Z 边缘几何每次帧必要时更新256段，使用和顶点波函数相同的 eta，但水色透明度保持0.25左右，深海可视。镜面不要占多数面积的镜面反射；默认关闭实时阴影贴图，依平行光+顶点法线亮度+接触暗色让地形可信。

水柱运动：在线性浅水长波近似，远离震源时水平质点速度 u(x,t)≈c(x)*η(x,t)/h(x)（m/s），不同水深层近似同向；不是「每个深度层以海啸传播相速度 c 移动」。将粒子水平显示偏移设置为对 u 进行数值时间积分后的周期性小位移，并限制到可见幅度，例如 offsetSceneX = clamp(0.08*integral(u dt),-0.45,0.45)，标注放大，恢复中性位置避免漂移；第2章附加初始水柱上抬0→1缓动，与断层错动同步。垂直粒子位移展示采用上下层弱差异示意，实际长波主要水平流速与浅水方程相符，不画整根水柱永久整体向前运输。颜色/箭头方向与 x 正向同步。

地震波比较：固定教学假设 P 波 6km/s、路径均取300km、海啸均匀水深 h0；页面数字 sec→min 要保留说明「同程理想对比、非实际预警窗口」。视觉用快速可见激发（时间缩放独立于章节慢波），若视觉时间差太大，屏内并列两个运动轨道并注明「独立时间缩放」，禁止一边真实秒一边夸张秒还声称等速。

海岸：x=800km 的海岸线旁第7章覆盖使用一个预设曲线遮罩，随 t 与 3 波包推进 0→1→0 显示，标记「覆盖轮廓仅示意」，不输出模拟淹没面积、进入公里数、灾损值。此遮罩与 H(x) 不存在物理推导关系，改变 uplift 仅改变海面波幅，遮罩颜色强度可同向变化但范围不跟随参数避免伪装预测。绝不将 Green 定律延伸到 h→0（发散），只算到近岸 h=10m；岸上线无公式波高、海岸上地形也不交给 c 公式。

### 5.4 性能/异常预算

桌面目标稳态 60fps（P95 帧间隔≤25ms、P50≤17ms，录60实际可见帧）；主海面≤20k三角、全场景≤80k三角、draw calls ≤50、几何总顶点≤45k、纹理显存预算≤16MB、Canvas DPR=min(devicePixelRatio,1.75)；手机 DPR≤1.25，GPU 降级阈值连续120帧 P95>28ms 则 DPR 降至1、关闭体积透明双面、粒子数量减半、降低海面几何到129×25，仍保留关键可视化；静止/隐藏时可暂停 RAF（可见播放时绝不停）；截图时强制 requestAnimationFrame 真正递增。性能指标首屏可交互≤2.5s（本机温启动采集），本地 JS/CSS 压缩资源总计≤900KiB gzip（不含本地中文字体）；本地字体合计≤3MiB，超过则静态分包子集且不远程加载；CLS≤0.1，操作反馈≤100ms、文字/数据切换≤300ms。由于真实设备/GPU 未验证，未达目标必须按第 7/8 节处理与报告，不得声称达标。

WebGL2 不支持/上下文丢失：监听 webglcontextlost preventDefault，暂停、释放目标、展示静态教育文字与「重试」；恢复事件重新初始化必要资源，最多自动重试1次，用户主动重试不限但每次先 dispose；离线正常（所有资源自包）；字体失败用明确 fallback 且加载警告记录；深海参数非法 clamp、输入 rapid-fire 每帧最多一次 batched render、hash 不合法归 chapter1；触屏 pointercancel/blur 停止拖动，resize 使用 ResizeObserver 限频；文本超过38ch 自动换行不省略重要科学内容；无远程数据、无大列表（七章），不引分页；视频、滚轮 hijack、浏览器标准警报禁止。外域来源链接仅用户主动点击才打开，验收过程不点来源外链。

## 6. 任务拆解（强制依赖顺序；每项七要素）

执行顺序以 T01→T12 为准；每项均为一次本机可做完、可验证的任务。涉及新建文件，文中函数名即代码落点，不虚构现有行号。质量线以 A1…G 与上述 Cxx 令牌标记。

### T01：初始化依赖与可复现构建（依赖无；A01/E）
- 前置：main 分支有任务简报及规格，Node22 和 npm10 可运行。
- 步骤：建立 package.json（type:module）；安装 three@0.186.1、vite@8.3.5、lucide（只选择单一 Lucide SVG 实现）及 dev playwright-core；将 npm 实际 resolve 版本固化到 package-lock；创建 Vite 最小 index.html/ src/main.js / vite.config.js base='./'；设 scripts build/test/preview；禁止线上字体/脚本。
- 位置：package.json、package-lock.json、vite.config.js、index.html、src/main.js；npm test 指向 node --test tests/*.test.js。
- 产物：可启动空页面与稳定 lock；README 的命令骨架。
- 自查：npm ls three vite playwright-core；grep HTML 无 https:// 运行资源；检查 base='./'。
- 测试：npm ci && npm run build；预期均退出0，dist/index.html 存在。
- 完成：新机 npm ci 可重复，使用本地包无外链；若版本 engines 不符执行 U01 固定分支。

### T02：字体、令牌与栅格（依赖 T01；A1–A5/E/C01）
- 前置：Vite 构建通。
- 步骤：取权属可核的 Noto Sans SC/Inter/IBM Plex Mono WOFF2 必需字重，本地托管并保存许可证；建 tokens.css/base.css/layout.css，重置默认 h1–h6、button/range/details；写出 6+1 字阶、颜色、圆角、z、对比度测例。
- 位置：public/fonts/、src/styles/*、tests/contrast.test.js。
- 产物：页面骨架与全部设计变量、许可文档。
- 自查：DevTools computed font-family 与 Network 字体来源为 localhost；断点截图无默认风格。
- 测试：npm run build && npm test；文本/背景预选颜色 contrast≥目标；命令退出0。
- 完成：A1–A5 的设计令牌、许可证、数值全存在且可复算。

### T03：七章语义内容 + 限制（依赖 T02；B3/B4/C04/C10）
- 前置：完整色板及字体可用。
- 步骤：将第4.3节7条文案逐条写成对象 {id,title,observe,explain,remember,labels,cameraKey}；生成可读导航、解释卡、公式文本、来源列表、模型局限与真实事件卡；2004 印度洋 USGS Mw9.1，2011日本东北 USGS Mw9.1，标清来源与日期，不写未经核查的伤亡数/浪高数。
- 位置：src/content/*、src/ui/renderShell.js、sourcePanel.js、tests/content.test.js。
- 产物：即便关闭 Canvas 仍完整的中文文字课程。
- 自查：章节长度=7、链接均在 Sources；title 与 heading 顺序正确，无 placeholder/TODO。
- 测试：npm test，content.test.js 校验七章唯一 ID、四段说明、来源 URL 与术语。
- 完成：C04/C10 七节点文字和真实来源完整，独立于 WebGL 可学习。

### T04：物理纯函数与波幅边界（依赖 T01/T03；A04/第5.1物理）
- 前置：Node test runner 可运行，指标术语已明确。
- 步骤：实现 tsunami.js 的所有公式与 RangeError，分离物理量和渲染夸张系数；Green 最低海深10m；实现双相位、三个不同权重波列。
- 位置：src/physics/tsunami.js、tests/physics.test.js。
- 产物：无 Canvas 依赖纯物理模型。
- 自查：手算默认 c、λ、Green 与 API 输出匹配、单调性随水深正确。
- 测试：node --test tests/physics.test.js，含4000/10/Green/周期/异常/相位；全部 PASS。
- 完成：数据面板将来只需复用此模块，绝不出现硬编码展示值。

### T05：海盆深度、积分时间表与阶段锚点（依赖 T04；A04/A05）
- 前置：物理函数及参数已经有稳定接口。
- 步骤：写 bathymetry.js，深海620km常数、620–795km平缓过渡、795–800km保持10m；从1/c梯形积分构建时间表，插值函数与切章锚点；校验所有 cut 严格递增。
- 位置：src/physics/bathymetry.js、src/state/lessonMachine.js 初步 cuts、tests/bathymetry.test.js。
- 产物：海床曲线、传播到达时间查表与章节时间表。
- 自查：画最小调试折线验证无负深/跳步，0、620、795、800各点符合规则。
- 测试：node --test tests/bathymetry.test.js；tau 严格递增，积分分辨率1/0.5/0.25km误差逐级收敛。
- 完成：所有场景与时间轴共享唯一地形与时间表。

### T06：状态机、章节切换与键盘（依赖 T03/T05；B1–B4/C02/C05/C06）
- 前置：章数据与 cut 可用。
- 步骤：实现 reducer、跳章 hash 与状态恢复、播放暂停、失焦暂停、参数改变保留章内进度；绑定 Space/方向键并排除原生控件输入焦点；触控/鼠标一致的指针反馈；建立 C02/C05/C06。
- 位置：src/state/lessonMachine.js、src/ui/bindControls.js、keyboard.js、tests/state.test.js。
- 产物：不依赖 Three 的可操作控制流程。
- 自查：无 WebGL 时仍能使用按钮/Tab/滑杆改变当前讲解与读数。
- 测试：node --test tests/state.test.js，覆盖章首尾、参数范围、Space 不双触发、input 方向键不切章、hash 退回。
- 完成：B1–B4 可测、无无限循环和重复监听。

### T07：三维基础、地壳与镜头（依赖 T02/T05/T06；A05/D/C03）
- 前置：应用状态与地形曲线已定。
- 步骤：WebGL2 capability 检测；创建 renderer、海床/陆地、逆断层双块体、朝向、灯光与镜头7关键帧；resize、pointer limits、context loss/dispose；第一次 render 后 signal ready。
- 位置：src/scene/createScene.js、terrain.js、fault.js、cameraRig.js、palette.js、src/main.js。
- 产物：实时可拖拽海盆及第一章断层错动。
- 自查：Chrome 观察块体不穿透海底、无 z-fighting，拖拽/复位不跳视角。
- 测试：npm run build + npm run audit:browser（T11脚本未完成前先手动 Chrome 查 screenshot/console，并在 T11 自动补）；预期 WebGL2 ready 和无错误。
- 完成：C03 有真实 3D 地形，不是图片或伪 Canvas。

### T08：海面 shader、长波、全水柱与比较波前（依赖 T04/T05/T07；A04/A05/D）
- 前置：地形和 renderer 正常。
- 步骤：建 ocean shaders、统一 DataTexture 深度/tau 查表、固定 period/Green 波形、顶点法向、高低幅视觉夸张声明；建立第2章64粒子水柱、第3章船/波长量尺、第4章地震/海啸波前比较；沿 Z 剖切壁同步波高。
- 位置：src/scene/ocean.js、shaders/*、waterColumn.js、wavefronts.js、labels.js。
- 产物：前四章每章对应真实运动，公式一致。
- 自查：更改深度后 λ、c、纹理/波列马上变化；改变抬升只改变 H，不改变 c；船没有被巨浪举起。
- 测试：npm test + 实际 Chrome 第1–4章截图/短录；至少取3个 x、3个时间点比较 CPU 与 shader 顶点高度，容差为波高幅值的2%以内。
- 完成：全水柱可见、深海低幅、高速对照不是口头解释。

### T09：浅化、可能先退、多波与淹没示意（依赖 T08；A05/C08）
- 前置：深海波列与岸线存在。
- 步骤：实现浅海几何波长压缩/波高增长、第6章波峰波谷切换与退潮湿线、第7章三次波列及概念覆盖；控制视图限制与短警告字幕。
- 位置：src/scene/ocean.js、shore.js、src/ui/renderShell.js、content/chapters.js。
- 产物：后三章的 3D 动画与非预测声明。
- 自查：2000/6000m两端 h=10 恒定，波高比随参数更新；phaseMode 切换后首波符号翻转；三次波幅不相同；淹没区域永远标「概念示意」。
- 测试：npm test + Chrome 第5–7章路径实测截图；断言不向用户显示计算得到的真实淹没距离。
- 完成：七节点全部由3D可见变化支持，不出现「先退必然」。

### T10：完成界面四态、响应式、无障碍（依赖 T06/T09；A/B/C/G全套）
- 前置：全部正常态逻辑与3D构件存在。
- 步骤：建立 C07数值、C08图例、C09错误/空/加载/success；实现支持 WebGL 失败的文字模式；落实五组断点、屏幕放大、键盘焦点、reduced-motion、触摸目标；错误场景 aria-describedby。
- 位置：src/ui/*、src/styles/components.css/layout.css、src/main.js、tests/content.test.js。
- 产物：完整可响应科普页及无障碍替代。
- 自查：375/390/768/1024/1440 逐一人工查看默认/加载/错误/空/成功，文字长、触控、焦点、无横滚；模拟无WebGL。
- 测试：npm run build；Chrome 验证操作与 accessibility snapshot/ARIA；T11审计脚本补自动回归。
- 完成：无障碍、四态、移动端不依赖 hover；A–C无 FAIL。

### T11：自动化真实浏览器和对比度/性能审计（依赖 T10；A01–A09/F）
- 前置：生产 dist 可启动；playwright-core 能访问 channel:'chrome'。
- 步骤：建 scripts/audit-browser.mjs 启动已在4173端口的 preview；采集console/pageerror/request origin、7章、双滑杆/键盘、RAF 60 连续时间戳/可见性、文字/边界截图、CLS/时序/渲染 info、失焦处理、reduced motion；contrast 按 tokens 与样式实际值计算；将 JSON 机器输出到 reports/evidence/audit.json。
- 位置：scripts/audit-browser.mjs、audit-contrast.mjs、package.json scripts、tests/contrast.test.js。
- 产物：可复跑的 browser/contrast/physics 审计与证据 JSON、截图。
- 自查：测试引入一条故意错误颜色/外域请求时应 FAIL（之后恢复），证明审计非假 PASS；截图帧有实际不同波形。
- 测试：npm run test && npm run build && npm run audit:browser && npm run audit:contrast；预期全退出0、实际通过数从机器输出取。
- 完成：A01–A09每项至少一份实际测试证据，既不把“60个RAF回调”当“60fps”，也不把模拟 Chrome 视口冒充真实手机。

### T12：终验、证据归档与交接（依赖 T11；F/G）
- 前置：自动审计已通过。
- 步骤：从干净 npm ci 重新 build/test/preview；在真实 Chrome 桌面手看1440与390/375；实测主流程、无WebGL、reduced motion、焦点/放大；核对第4.3七章文案与权威来源，填第9节报告/证据/限制；git status、commit并 push 指定执行分支（由本地工作流程确定，不擅自修改规划文件）。
- 位置：README.md、reports/latest.md、reports/evidence/*、源文件现状。
- 产物：首次交付的工程、报告、截图、审计原始数据、清单。
- 自查：报告逐项映射 A01–A10 与质量线 A–G，没有未证实的 PASS；不存在构建缓存/密钥进入 git。
- 测试：第8节全套命令全0；git diff --check；浏览器检查表每格有具体现象。
- 完成：硬闸门100% PASS 才标 READY_FOR_DELIVERY，否则标 BLOCKED 并逐项披露。

## 7. 未知信息的调查入口与定死分支

### 7.0 未知项总览

| ID | 分类 | 待确认的影响点 |
|---|---|---|
| U01 | 有入口 | Node22 与指定 Vite/Three 依赖的实际兼容性 |
| U02 | 有入口 | Green 定律与震级/海床位移的适用边界、事件来源 |
| U03 | 有入口 | 本地中文字库与许可证、字体包大小 |
| U04 | 有入口 | Playwright-core 的 Chrome 驱动 channel 配置 |
| U05 | 无入口（需本机实测） | GPU 顶点浮点纹理支持、实际 shader 精度 |
| U06 | 无入口（需本机实测） | 真实帧时/首屏/内存能否达到预算 |
| U07 | 无入口（需本机实测） | 390px/375px、200%缩放与 Chrome 字体字形的真实布局 |
| U08 | 有入口 | 长波速度、海水先退、多波与安全提示的权威措辞 |

### 7.1 已找到真实查证入口（五要素逐项齐全）

U01：问题：指定版 three/vite 是否满足本机 Node v22.22.2 的 engines 和构建。入口：npm view vite@8.3.5 engines --json；npm view three@0.186.1 version；npm view playwright-core version；https://vite.dev/guide/。判据：npm ci 与 npm run build 都退出0且 npm ls 不见 invalid、unsupported。分支：全部通过则固定版本+lock；若 vite engines 不兼容则先将 Node 更新至该版本要求的稳定 Node22 补丁，仍失败则用 npm view 查询同 major 中 engines 兼容的最高已发布版并固定、报告偏离；不得使用未验证的版本字符串。耗时上限：本机 15分钟，超时保守锁在当前实际可构建组合，报告本地验证缺口并 BLOCKED A01。

U02：问题：Green 定律在现实海岸与事件事实是否被过度延伸。入口：NOAA/ITIC https://www.weather.gov/media/itic-car/marine_guidance/japan/English%20version%2026_01.pdf；USGS https://www.usgs.gov/centers/pcmsc/life-tsunami；NCEI https://www.ncei.noaa.gov/products/natural-hazards/tsunamis-earthquakes-volcanoes/tsunamis/global-historical-data；2004 https://www.usgs.gov/centers/pcmsc/science/tsunami-generation-2004-m91-sumatra-andaman-earthquake；2011 https://earthquake.usgs.gov/earthquakes/eventpage/usc0001xgp。判据：阅读到 √gh、H∝h^-1/4、海床垂向移位、各事件日期和 Mw 来源；记录逐条 URL。分支：有一手资料则使用当前默认数值和事件卡；没有一手验证的事件值删除该值只保留机构链接；任何条件下严禁真实淹没预测。耗时上限：20分钟；超时以不展示未经证实的史实数值、保留「教学模拟」为兜底。

U03：问题：Noto Sans SC、Inter、IBM Plex Mono 可合法本地托管及实际字体体积。入口：https://github.com/google/fonts（字体源和 OFL LICENSE）；https://fonts.google.com/specimen/Noto+Sans+SC；https://fonts.google.com/specimen/Inter；https://fonts.google.com/specimen/IBM+Plex+Mono。判据：下载的本地 WOFF2 与对应许可证路径并存、DevTools 显示 localhost 200、外域请求0、总包体字体≤3MiB。分支：满足则自托管三族；若中文全量字体>预算则以必需汉字子集生成 WOFF2，非正文字符以显式 fallback 名称呈现并在报告列字形覆盖；缺许可证的文件一律不使用；无下载可用则回退到明确列出的本地安装字体且报告 A1 字体差异。耗时上限：20分钟；超时继续功能但 A01/字体要求不满足时 BLOCKED。

U04：问题：本机 Chrome 是否能由 playwright-core 操控。入口：https://playwright.dev/docs/browsers；本机 npx playwright --version（仅若 CLI 依赖存在），node -e "import('playwright-core').then(async({chromium})=>{const b=await chromium.launch({channel:'chrome',headless:true});console.log(b.version());await b.close()})"。判据：实际打印 Chrome 版本，无 executable missing。分支：能用 channel:'chrome' 就按计划执行；若安装 Chrome 路径存在但通道失效，则指定 executablePath 为机器上实际查得的 Google Chrome 可执行文件；若仍失败报告 BLOCKED 而不是把 puppeteer/模拟截图当真实 Chrome。耗时上限：10分钟。

U08：问题：是否误称先退必然、第一波最大、深海只有表面动、真实预警时间有保障。入口：https://www.jma.go.jp/jma/kishou/know/jishin/tsunami/generation.html；https://tsunami.ioc.unesco.org/en/what-are-tsunamis；https://tsunami.ioc.unesco.org/en/what-do；https://www.noaa.gov/education/resource-collections/ocean-coasts/tsunamis；https://www.noaa.gov/jetstream/tsunamis/tsunami-inundation。判据：JMA 明确说先退不必然，UNESCO/NOAA 明确多波/自然警示/全水柱。分支：核验成功使用第4.3固定文案；若页面暂不可读，依已核验本轮资料仍保留保守「可能」措辞，不添加新事实；不得因缺网络省掉警示。耗时上限：10分钟。

### 7.2 只有执行机可自证的未知（无可直接给出答案的公开入口）

U05：待查：目标 Chrome/GPU 中 MAX_VERTEX_TEXTURE_IMAGE_UNITS 与 float DataTexture 顶点采样是否支持，CPU/GPU采样差多少？方法：在本机运行第T08的检测页，打印 renderer.capabilities 与 getParameter；比较 CPU/GPU 3×3 波高点采样与 pixel/readback。受影响决策：顶点位移路径=GPU DataTexture（支持且误差≤2%）或 CPU BufferGeometry 8481顶点（否则）；若 CPU 仍超预算进一步降海面129×25。默认：CPU BufferGeometry 路线以最大兼容性优先；报告必须写默认与量测结果；本地调查上限15分钟。

U06：待查：当地真实 Chrome 前台 60 帧 P50/P95、首屏交互耗时、draw calls、JS gzip 与字体开销。方法：npm run audit:browser 采 performance 及 renderer.info，Chrome DevTools Performance、网络资源 timing；记录截图和 JSON。受影响决策：DPR 1.75→1.0、网格257×33→129×25、InstancedMesh64→32、取消额外透明层；默认优先低档 DPR1.0 + 129×25，保留7章全部功能；调查15分钟，未达A03或加载门槛 BLOCKED 而非放松验收。

U07：待查：375/390 Chrome 以及200%字体放大后，显示中文、控件焦点环与讲解有没有被 Canvas/布局裁切。方法：浏览器 viewport 测量所有 scrollWidth/clientWidth 与 boundingClientRect，截图并用 Tab/Enter/Escape 全路径；用浏览器缩放200%复验。受影响决策：舞台高 38vh 或固定260px下限、讲解前后顺序、控件横排/折行；默认采用≤480的单列+播放控制换行+卡片自然增高，不截字也不隐藏操作；调查20分钟，未通过则 BLOCKED A07/A08，报告列真实问题。三条未知都要在 reports/latest.md「未知项调查结果」里注明采用分支或默认，绝不把无入口写成无需处理。

### 7.3 自检结论

8个未知均有判据、行动与兜底；不向用户提问。安全内容无法证实则删具体数字而保留保守事实；环境无法使必验项通过就如实 BLOCKED；不得虚报通过以换取进度。

## 8. 验收计划：命令、操作、证据、判定

### 8.1 必跑本机命令（按顺序）

1. 在仓库根目录运行 node --version && npm --version && npm ci；预期 Node22、npm10 实际版本有日志，退出0，依赖完全来自锁文件。若失败 FAIL A01。
2. npm test；node --test 运行至少 physics、bathymetry、state、content、contrast 五类测试；预期 fail=0，pass 数以原生 runner 最末汇总为准，日志完整归档。任何失败 FAIL。
3. npm run build；预期 vite 生产构建退出0，dist/index.html/assets 存在，无远程绝对资源 URL。
4. npm run preview -- --host 127.0.0.1 --port 4173 --strictPort；预期静态服务仅回环地址可访问。保持前台或本机另终端运行；本命令是持续服务，不拿 timeout 判失败。
5. 另终端运行 npm run audit:browser；预期 Playwright-core 连接真实 Chrome（channel chrome），读取 http://127.0.0.1:4173，写 reports/evidence/audit.json 与不少于 4 张截图，退出0。
6. npm run audit:contrast；预期所有实际 DOM/令牌组合通过；测试输出每组配对、比值、阈值，退出0。
7. npm run audit:physics；预期显式打印默认 h/c/λ/H 比与不同参数的动态数值来源，对照 PASS。
8. git diff --check；预期退出0；git status --short 确认没有源码构建垃圾、敏感信息，提交前 human-readable 结果留存。

上述 scripts 是 T01/T11 要创建的真实项目接口，当前仓库没有，执行前必须先创建，禁止在规划完成时假称已跑通。

### 8.2 浏览器实测动作与自动断言

| 验收 | 操作 | 预期可观察结果 / PASS 判据 | 证据 |
|---|---|---|---|
| A01 静态离线 | 生产预览，DevTools 禁缓存、拒绝公网或拦截非 127.0.0.1 请求，点 7 章与滑杆 | 全请求 URL origin 必须等于 http://127.0.0.1:4173，externalCount=0，所有本地关键资源 HTTP200；FAIL任何外域 | audit.json requests + network 截图 |
| A02 控制台 | 在1440/390加载、播放、跳章、重试 | pageErrors.length=0、consoleErrors.length=0；WebGL context 丢失测试引发的预期错误须在对应受控场景单独记录，不混入正常态 | audit.json exceptions |
| A03 RAF | 前台 document.visibilityState=="visible"，页面聚焦，恢复动画后60次raf收集 stamp/sequence | 60 个不同 ordinal，严格递增 timestamp；另测60帧 interval P50/P95，记录而非替代帧序条件；隐藏 tab 失败不得误报PASS | audit.json raf/perf |
| A04 物理 | 读取纯函数输出与 页面 data-testid 的4组值 | c4000在198.0–198.2m/s、km/h 712.9–713.3，c10在9.89–9.92，Green 4.47±0.01；λ4000≈118.9km、λ10≈5.94km，显示单位与四舍五入允许末位半单位；改水深后更新并与函数同源 | physics test + DOM values |
| A05 7 节 | 逐点章节1–7，录画布 tA/tB 两张像素差+人工肉眼证实关联场景变化 | 七章均有观察、解释、记住与对应的3D可辨形态；WebGL渲染确有变化而非静态图；先退/非先退均能切换；多波至少3次 | 7章截图+章节日志 |
| A06 交互 | 鼠标播放暂停、跳到第5章、改变 uplift 与 depth、Tab/Space/Arrow 路径 | 按钮文本即时更新≤100ms；数据≤300ms；暂停后时间恒定、空格继续；输入聚焦箭头只改变 range，不会换章节 | interaction test + audit timestamps |
| A07 响应 | 1440×900/390×844/375×812/768×1024/1024×768；滚动到内容末尾 | documentElement.scrollWidth<=innerWidth+1，所有可见文本 bounding box 不越界、不重叠；舞台占宽≥容器90%（单列），并可点击；页面整体没有横向拖动 | 五组 screenshot + overflow JSON |
| A08 无障碍 | CSS reducedMotion reduce、Tab-only、200%放大；计算 computed color 及背景；强制无WebGL2路径 | 所有按钮焦点环可见且44×44，说明/数据仍可读，CSS和摄像机降动效；正文≥4.5、大字≥3、非文≥3、禁用≥2，任何一个小于阈值FAIL | accessibility audit + focus/zoom screenshot |
| A09 内容 | 审校 7段，查 sources 所有来源名称、日期、URL、已核事实 | 公式与中文一致，不用「潮汐波」、不保证先退、未把 Green 计算写成真实海岸灾情；事件数值标出来源，不明信息不展示 | reports/latest.md 术语检查表 |
| A10 质量线 | A1–A5、B1–B5、C、D、E、F、G 每项对照观察和运行 | 每项 PASS 或写有实际理由的 N/A；硬约束不能 N/A 回避；G 任一违规直接 FAIL | reports/latest.md A–G 矩阵 |

具体回归：默认参数后重置、末章再播放、跳章后浏览器后退、depth 连续滑至两端、uplift半格钳位、夜间不可见自动暂停、窗口 resize、pointercancel、contextlost 恢复、字体阻断、本地无网、低动效、图例折叠、文本200%放大；每次变更 renderer/样式至少跑 A01–A09 子集并在最终全跑。截图命名 reports/evidence/desktop-1440.png、mobile-390.png、mobile-375.png、webgl-fallback.png、focus-zoom.png、chapters/chapter-01.png…chapter-07.png；录屏可加但不是截图替代。

### 8.3 失败与交付裁决

PASS 仅在所有 A01–A10 均通过并附原始输出，F 每条有观察记录，G 无任一违规；质量线中性能和科学陈述不可跳过。任何硬条件失败结论 BLOCKED，不得写 READY_FOR_DELIVERY。清楚区分：代码检查通过、浏览器模拟视口通过、真正手机实机未测；真实 Chrome 桌面不是实体安卓手机。

## 9. 首次交付必须提交的产物

仓库文件：第5.1列出的 package.json/package-lock/index.html/vite.config.js；src/content、physics、state、scene（含 GLSL）、styles、ui、main.js；public/fonts 与许可证、favicon；tests 至少5类；scripts/audit-browser.mjs、audit-contrast.mjs；README.md；reports/latest.md 与 reports/evidence/audit.json、完整测试输出、5组截图、七章截图、无WebGL替代截图、焦点/放大截图；dist 不提交（除项目既定部署规则另行要求，此次默认不提交），node_modules 不提交，忽略缓存。

reports/latest.md 必须包含：
1. 精确源码 SHA、运行环境 Node/npm/Chrome/GPU、依赖 lock 指纹；
2. 实施变更清单（文件→功能→计划任务 Txx）；
3. 科学事实核对表（命题→来源 URL→应用在第几章→模型限制）；
4. 运行命令及真实退出码、完整终端 stdout/stderr 保存路径、Node test 唯一来源 pass/fail/skipped（从日志或 JSON 自动提取，严禁手抄数量）；
5. A01–A10 逐项表：PASS/FAIL、命令、观测数值、截图或 JSON 相对路径；
6. 质量线 A–G 逐项证据（对比度配对、五尺寸、焦点、四态、首屏、RAF、CLS），不可只有「检查过」；
7. U01–U08 未知项调查结果、选择分支/默认值及证据；
8. 已知限制：1D 浅水理想模型、非预测淹没、非真实地形、垂直夸张、无真实警报、手机为仿真视口；解释原因与影响；
9. 偏离规划案记录（条款/原因/替代/复测），剩余阻塞与最终 verdict READY_FOR_DELIVERY 或 BLOCKED。

测试证据：将每次完整 npm test、npm build、浏览器脚本、contrast 的日志按固定文件保存为 reports/evidence/*.txt；提取 JSON 保留机器计数及 Chrome 原始 console/request 明细；可在报告中引用相对路径但不能声称未存在的截图。确保报告标明本机真实测试的运行时刻与运行者身份；不将规划 Agent 的在线调研误报为执行机验收。

页面「事实与来源」板块首要机构链接固定为：
NOAA/NCEI：https://www.ncei.noaa.gov/products/natural-hazards/tsunamis-earthquakes-volcanoes/tsunamis/global-historical-data
NOAA 传播：https://www.noaa.gov/jetstream/tsunamis/tsunami-propagation
USGS 生命周期：https://www.usgs.gov/centers/pcmsc/life-tsunami
USGS 2004：https://www.usgs.gov/centers/pcmsc/science/tsunami-generation-2004-m91-sumatra-andaman-earthquake
UNESCO-IOC：https://tsunami.ioc.unesco.org/en/what-are-tsunamis
JMA：https://www.jma.go.jp/jma/kishou/know/jishin/tsunami/generation.html
NOAA/ITIC Green：https://www.weather.gov/media/itic-car/marine_guidance/japan/English%20version%2026_01.pdf
中国海啸预警：若执行方能从自然资源部/海啸预警中心官方网站确证最新有效的中文权威入口则加入；无法确证不编造 URL、不让不存在的入口影响其它引用。所有链接仅呈文字/可点击锚，不在网页自动请求远程 API。

## 10. 执行 Agent 遇困处置规则

1. 规划未覆盖的情况：执行 Agent 独立解决，不向用户或网页版 GPT 追问；优先物理准确、无障碍、离线运行、无误导，在设计令牌与质量线范围内取保守实现；在报告中记新发现、采用规则、复测结果。
2. 文中引用的 API 实际不存在或版本不兼容：以本机可以真正构建运行且达到原功能为原则选择最小替换（例如不支持浮点顶点纹理→第 U05 的 CPU BufferGeometry），不得移除 7 节讲解或虚报支持；逐条注明「偏离第5.x/Txx、为什么、替代、测试」。
3. 困难排序：先避免科学假象/安全错误，其次核心实时3D与7章联动，再保证键盘和响应式，再做精致光影；不能牺牲 A01–A10 以换视觉特效。遇到性能落后先降 DPR、几何与透明层，不删除物理说明或读数。
4. 查证失败时按 Uxx 兜底执行，事实不确定就删除未经证实的具体值；核心验证失败保持 BLOCKED、附证据及已完成内容，不篡改测试日志。
5. 不新增后端、CDN、在线图形资源、账号、遥测或 CI；不改简报/规格；不请求第二轮规划。这是唯一规划交接。
6. 本机执行的终点是实际源码、浏览器实测证据和报告，不是「完成开发」的主观声明。最终报告若可交写 READY_FOR_DELIVERY，失败写 BLOCKED + 明确阻塞点。

—— 本规划案结束；执行方从 T01 按依赖顺序实施，验收一律依 A01–A10 和质量线 A–G。