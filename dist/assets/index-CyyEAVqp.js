const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./sceneController-DwiKOX4z.js","./three-BSa0mXZO.js"])))=>i.map(i=>d[i]);
(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=[{id:`chapter-1`,index:0,cameraKey:`K1`,readoutFocus:null,title:`地壳一动，海底跟着变`,observe:`两块板块在海沟附近相互挤压，上盘沿逆断层突然抬升，另一侧可下沉。`,explain:`不是震级本身直接推出海浪，而是海底大面积垂向位移推动海水。`,remember:`海啸的起点往往在海底。`,labels:[`俯冲带`,`逆断层`,`抬升量 = X m（教学参数）`],scene:`两块层理地壳、海沟、逆断层斜面、上盘上抬箭头、下沉补偿；错动持续 2s 后保留错动形状；绝不把所有地震说成会有海啸。`,note:`海啸通常由俯冲带的逆断层垂向错动触发；并非所有地震都会生成海啸。`},{id:`chapter-2`,index:1,cameraKey:`K2`,readoutFocus:null,title:`动的是整根水柱`,observe:`海底上抬时，海面也改变；水体并非只有表层被推动。`,explain:`海啸是长波，运动影响由海面到底部的水柱，跟常见风浪不同。`,remember:`水柱整体参与，而非一张海面皮。`,labels:[`整个水柱`,`教学剖切`],scene:`透明纵向剖切，8列×6深度采样粒子、横向位移流线；海底→海面因果箭头；切换水柱示意层，深浅粒子同步向岸水平移动。`,note:`长波的能量贯穿整个水柱；这与只在表层起伏的风浪不同。`},{id:`chapter-3`,index:2,cameraKey:`K3`,readoutFocus:`speed`,title:`深海：快却不高`,observe:`深海水面隆起可很低，波峰相距却很远；大船常不易察觉。`,explain:`长波相速度由水深决定 c=√(g h)，波长 λ=cT。`,remember:`深水快、波很长，肉眼不一定能发现。`,labels:[`深海 h=X m`,`c=Y km/h`,`λ=Z km`,`H0=0.25×(抬升/1.5) m`],scene:`长周期低陡度海面；船为示意几何形，随表面高度轻轻上下；场景标注真实比例的波长量尺，不让船尺寸冒充等比。`,note:`深海波速可达约 700 km/h，但波高常不足 1 m，故行船难察觉。`},{id:`chapter-4`,index:3,cameraKey:`K4`,readoutFocus:null,title:`地震波先到，海啸波随后`,observe:`地震波通常比海啸在水中的传播快，监测可争取时间。`,explain:`以相同 300km 的极简演算，把假设地震波速度 6km/s 与均匀深水海啸速度相比；两者实际路径不同，不等于实际可预警时长。`,remember:`预警需要监测与传播时间，近岸未必来得及。`,labels:[`300km 假设`,`地震波 t=300/6 s`,`海啸 t=300000/c(h) s`,`差值由计算函数输出`],scene:`岩层内光圈或沿海沟地震波前先到岸侧标记，海面波前后到，两个不同速度曲线同屏可追踪；禁止做成用户真实预警倒计时。`,note:`此为同程理想对比，并非真实预警窗口；近岸往往来不及。`},{id:`chapter-5`,index:4,cameraKey:`K5`,readoutFocus:`height`,title:`浅水：慢下来、挤起来`,observe:`同一列波进入浅水，前部先减速，后部追近，波长缩短、波高上升。`,explain:`以理想、逐渐变化的水深示范 Green 定律 H₂/H₁=(h₁/h₂)^(1/4)。真实岸边更复杂。`,remember:`慢、短、高，是浅水变形的关键。`,labels:[`c深/c浅`,`λ深/λ浅`,`H浅/H深`,`约 4.47 倍（默认参数）`],scene:`陆架斜坡成主画面、波峰间距随 x 收缩、剖面振幅增大；显示深 4000→10m 标尺的数值对比。`,note:`Green 定律只在 h≥10m 使用；真实海岸还含折射、反射、摩擦等，不可预测淹没。`},{id:`chapter-6`,index:5,cameraKey:`K6`,readoutFocus:null,title:`波前变陡，有时先退`,observe:`若首先抵岸的是波谷，海水可能突然退去；也可能不退而直接涨水。`,explain:`波列相位决定先来波谷还是波峰；先退不是海啸必经步骤。`,remember:`海水异常退去是危险信号，但不应等待先退才撤离。`,labels:[`可能先退 ≠ 必定先退`],scene:`两档可切换「先到波谷/先到波峰」（默认先到波谷，切换后波形相位翻转），海岸湿线出现明显前后变化；波前局部陡化而非卡通卷筒巨浪。`,note:`先退与否取决于波列相位，绝非必然；切勿因未见退水而放松警惕。`},{id:`chapter-7`,index:6,cameraKey:`K7`,readoutFocus:null,title:`不止一道浪，上岸成灾`,observe:`第一波不一定最高，后续多次上涨回落，危险可持续数小时。`,explain:`冲上海岸的水可能像快速上涨的洪水，强水流与漂浮物很危险；此处彩色覆盖仅表达淹没概念。`,remember:`保持远离低洼海岸，直至官方解除警报。`,labels:[`波序 1/3、2/3、3/3`,`模拟时刻（教学）`,`淹没范围：概念示意，不可用于实地避险`],scene:`至少 3 次不同波幅的波包连续抵岸；地面亮色半透明贴地遮罩随波次推进与退回、建筑轮廓示意；明确不输出米级淹没距离/灾害预测。`,note:`彩色覆盖仅表达淹没概念，不输出真实淹没距离、进入公里数或灾损值。`}];e.length;var t=`示意，非等比；非实时预警及淹没预测。剖切面的水平与垂直方向均非等比，波高已夸张显示。`,n=e=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${e}</svg>`,r={play:n(`<polygon points="6 4 20 12 6 20 6 4" fill="currentColor" stroke="none"/>`),pause:n(`<rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor" stroke="none"/><rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor" stroke="none"/>`),prev:n(`<line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>`),next:n(`<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>`),rotate:n(`<polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>`),info:n(`<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>`),alert:n(`<path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>`),check:n(`<polyline points="20 6 9 17 4 12"/>`),loader:n(`<line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/>`),x:n(`<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>`),chevron:n(`<polyline points="6 9 12 15 18 9"/>`),refresh:n(`<polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>`),eye:n(`<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>`)};function i(e){return r[e]||``}var a=[{title:`1D 理想浅水长波模型`,body:`本页采用一维缓变介质中的教学波列：不含折射、反射、方向性、非线性破碎、摩擦与真实海岸地形。它用于解释因果，不能预测真实海啸。`},{title:`非真实地形`,body:`海床地形是解释性模型，不代表任何真实国家或海岸线；参数改变仅用于演示物理趋势。`},{title:`垂直与水平均非等比`,body:`剖切面的水平与垂直方向刻意采用不同比例，波高为便于观察已夸张显示；真实波高由公式计算并以公里/米标注，不从画面高度反推。`},{title:`非实时预警 / 非淹没预测`,body:`第 4 章的「地震波 vs 海啸波」是同程理想对比，并非真实预警时长；第 7 章的彩色覆盖只表达淹没概念，不输出真实淹没距离、进入公里数或灾损值。`},{title:`无真实警报能力`,body:`本页不能发布、也不能替代任何官方海啸预警。是否安全取决于当地官方机构的判断。`}],o=`真实危险提示`,s=`若沿岸感到强烈或持续很久的摇晃，或海水异常快速涨落，应立即向高处和内陆撤离，遵从当地官方预警，不要去海边观察。`,c=`2026-10-27`,l=[{name:`NOAA / NCEI 全球历史海啸数据`,org:`National Oceanic and Atmospheric Administration`,url:`https://www.ncei.noaa.gov/products/natural-hazards/tsunamis-earthquakes-volcanoes/tsunamis/global-historical-data`,verifiedDate:c,used:`波速、波长、Green 定律与历史事件的背景数据。`},{name:`NOAA JetStream：海啸传播`,org:`NOAA National Weather Service`,url:`https://www.noaa.gov/jetstream/tsunamis/tsunami-propagation`,verifiedDate:c,used:`速度随水深改变、波长缩短、波高增加的对照说明。`},{name:`USGS：海啸的生命周期（Life of a Tsunami）`,org:`U.S. Geological Survey`,url:`https://www.usgs.gov/centers/pcmsc/life-tsunami`,verifiedDate:c,used:`起始 / 分裂 / 浅化 / 涌岸四联剖面叙事结构。`},{name:`USGS：2004 年 Mw 9.1 苏门答腊—安达曼地震海啸生成`,org:`U.S. Geological Survey`,url:`https://www.usgs.gov/centers/pcmsc/science/tsunami-generation-2004-m91-sumatra-andaman-earthquake`,verifiedDate:c,used:`2004 印度洋事件震级与海床垂向形变的事实来源。`},{name:`UNESCO-IOC：什么是海啸`,org:`Intergovernmental Oceanographic Commission`,url:`https://tsunami.ioc.unesco.org/en/what-are-tsunamis`,verifiedDate:c,used:`多波列、自然预警信号与全水柱的科学表述。`},{name:`日本气象厅（JMA）：海啸的生成`,org:`Japan Meteorological Agency`,url:`https://www.jma.go.jp/jma/kishou/know/jishin/tsunami/generation.html`,verifiedDate:c,used:`「先退并非必然」的权威表述。`},{name:`NOAA / ITIC：Green 定律与日本海啸指引（PDF）`,org:`NOAA / International Tsunami Information Center`,url:`https://www.weather.gov/media/itic-car/marine_guidance/japan/English%20version%2026_01.pdf`,verifiedDate:c,used:`Green 定律 H₂/H₁=(h₁/h₂)^(1/4) 的公式来源。`}],u=[{year:2004,name:`印度洋大地震与海啸`,magnitude:`Mw 9.1（USGS）`,summary:`苏门答腊—安达曼俯冲带逆断层错动触发，为有记录以来最强地震之一；海啸波及印度洋周边多国。`,source:l.find(e=>e.url.includes(`2004-m91`))??l[3]},{year:2011,name:`日本东北地方太平洋近海地震`,magnitude:`Mw 9.1（USGS）`,summary:`俯冲带大规模错动生成海啸，影响日本东北沿太平洋海岸；警示近岸预警时间有限。`,source:{name:`USGS 事件页`,org:`U.S. Geological Survey`,url:`https://earthquake.usgs.gov/earthquakes/eventpage/usc0001xgp`,verifiedDate:c,used:`2011 事件事实来源。`}}];function d(e){let n=a.map(e=>`<div class="limitation"><h3>${e.title}</h3><p>${e.body}</p></div>`).join(``),r=u.map(e=>`<div class="event">
       <div class="ev-year">${e.year}</div>
       <div class="ev-name">${e.name}</div>
       <div class="ev-mag">${e.magnitude}</div>
       <div class="ev-sum">${e.summary}</div>
     </div>`).join(``),d=l.map(e=>`<div class="source-item">
       <a href="${e.url}" target="_blank" rel="noopener noreferrer">${e.name}</a>
       <span class="src-org">${e.org} · 核证 ${e.verifiedDate}</span>
       <span class="src-used">${e.used}</span>
     </div>`).join(``);e.innerHTML=`
    <h2>事实与来源</h2>
    <div class="limitations">${n}</div>
    <div class="safety">
      <h3>${i(`alert`)} ${o}</h3>
      <p>${s}</p>
    </div>
    <h2 style="margin-top:var(--space-8)">真实历史事件（仅已核证事实）</h2>
    <div class="events">${r}</div>
    <h2 style="margin-top:var(--space-8)">权威来源</h2>
    <div class="source-list">${d}</div>
    <div class="disclaimer-bar">${t} · 来源核证日 ${c}</div>
  `}var f=[{key:`depth`,label:`深海水深`,unit:`m`},{key:`speed`,label:`相速度`,unit:`km/h`},{key:`height`,label:`波高（近岸）`,unit:`m`},{key:`wavelength`,label:`波长（深海）`,unit:`km`},{key:`period`,label:`周期`,unit:`min`},{key:`green`,label:`Green 比率`,unit:`×`}];function p(t){t.innerHTML=`
  <div class="page">
    <header class="site-header">
      <div class="brand">
        <span class="name">海啸如何诞生</span>
        <span class="sub">从海底错动到海岸的三维互动科普</span>
      </div>
      <a class="source-link" href="#sources">原理来源</a>
    </header>

    <section class="hero">
      <h1>海啸如何诞生</h1>
      <p class="lede">从海底错动到海岸，沿着一列波走完它的旅程。</p>
      <button class="btn-play" id="startBtn" data-testid="start">开始演示</button>
    </section>

    <section class="lesson" id="lesson" aria-label="海啸原理课程">
      <nav class="chapter-rail" aria-label="课程章节">
        <button class="rail-arrow" id="railLeft" aria-label="向左滚动章节">${i(`prev`)}</button>
        <div class="rail-scroll" id="railScroll"></div>
        <button class="rail-arrow" id="railRight" aria-label="向右滚动章节">${i(`next`)}</button>
      </nav>

      <div class="lesson-grid">
        <aside class="panel-left">
          <div class="card explain-card" id="explainCard" aria-live="off"></div>
          <fieldset class="param-fieldset" id="paramFieldset">
            <legend>改变条件（教学参数，非地震震级）</legend>
            <div class="param-row">
              <label class="param-label" for="depthRange">深海水深</label>
              <output class="param-output" id="depthOut">4000 m</output>
            </div>
            <input type="range" id="depthRange" min="2000" max="6000" step="500" value="4000"
              aria-label="深海水深（米）" aria-valuemin="2000" aria-valuemax="6000" aria-valuenow="4000">
            <div class="param-row">
              <label class="param-label" for="upliftRange">海底抬升量</label>
              <output class="param-output" id="upliftOut">1.50 m</output>
            </div>
            <input type="range" id="upliftRange" min="0.5" max="3.0" step="0.25" value="1.5"
              aria-label="海底抬升量（米，教学参数）" aria-valuemin="0.5" aria-valuemax="3.0" aria-valuenow="1.5">
            <p class="param-hint">改变的是教学参数，不是地震震级；初始波高按 0.25×(抬升/1.5) 映射。</p>
          </fieldset>
          <button class="btn-ghost read-aloud" id="readAloud" type="button" aria-pressed="false" aria-label="朗读本章说明">${i(`eye`)} 朗读本章说明</button>
        </aside>

        <div class="stage-col">
          <figure class="stage-figure" id="stageFigure">
            <canvas class="stage-canvas" id="stageCanvas" data-testid="scene-canvas" aria-hidden="true"></canvas>
            <div class="model-tag">教学剖切 · 水平/垂直非等比；波高已夸张</div>
            <div class="stage-help" id="stageHelp">拖拽旋转（有限角度）；点“复位视角”复位</div>
            <div class="stage-labels" id="stageLabels"></div>
            <figcaption id="figcaption">交互三维海盆：从海底错动到海啸上岸的完整过程。</figcaption>
            <div class="status-panel" id="statusPanel"></div>
          </figure>

          <div class="transport">
            <div class="controls" role="group" aria-label="播放控制">
              <button class="btn-icon" id="prevBtn" aria-label="上一章">${i(`prev`)}</button>
              <button class="btn-play" id="playBtn" data-testid="play" aria-label="播放或暂停">开始演示</button>
              <button class="btn-icon" id="nextBtn" aria-label="下一章">${i(`next`)}</button>
              <button class="btn-icon" id="resetCamBtn" aria-label="复位视角">${i(`rotate`)}</button>
              <div class="rate-group" role="group" aria-label="倍速">
                <button class="rate-btn" id="rate1" aria-pressed="true">1×</button>
                <button class="rate-btn" id="rate2" aria-pressed="false">2×</button>
              </div>
              <div class="rate-group" role="group" aria-label="波列相位（第 6 章相关）">
                <button class="rate-btn" id="phaseTrough" aria-pressed="true">波谷先到</button>
                <button class="rate-btn" id="phaseCrest" aria-pressed="false">波峰先到</button>
              </div>
            </div>
          </div>

          <dl class="readouts" id="readouts"></dl>
        </div>
      </div>
    </section>

    <section id="sources" class="sources" aria-label="事实与来源"></section>

    <div class="toast" id="toast" role="status" hidden></div>
  </div>`;let n=t.querySelector(`#railScroll`),r=e.map(e=>{let t=document.createElement(`button`);return t.className=`chapter-btn`,t.type=`button`,t.dataset.index=String(e.index),t.dataset.testid=`chapter-${e.index+1}`,t.innerHTML=`<span class="num">0${e.index+1}</span><span>${e.title}</span>`,n.appendChild(t),t}),a=t.querySelector(`#readouts`),o=f.map(e=>{let t=document.createElement(`div`);return t.className=`metric`,t.dataset.key=e.key,t.dataset.testid=`readout-${e.key}`,t.innerHTML=`<span class="m-label">${e.label}</span><span class="m-value"><span class="v">–</span><span class="m-unit">${e.unit}</span></span>`,a.appendChild(t),{el:t,v:t.querySelector(`.v`)}});return d(t.querySelector(`#sources`)),{root:t,chapterBtns:r,railScroll:n,explainCard:t.querySelector(`#explainCard`),depthRange:t.querySelector(`#depthRange`),depthOut:t.querySelector(`#depthOut`),upliftRange:t.querySelector(`#upliftRange`),upliftOut:t.querySelector(`#upliftOut`),startBtn:t.querySelector(`#startBtn`),playBtn:t.querySelector(`#playBtn`),prevBtn:t.querySelector(`#prevBtn`),nextBtn:t.querySelector(`#nextBtn`),resetCamBtn:t.querySelector(`#resetCamBtn`),rate1:t.querySelector(`#rate1`),rate2:t.querySelector(`#rate2`),phaseTrough:t.querySelector(`#phaseTrough`),phaseCrest:t.querySelector(`#phaseCrest`),stageCanvas:t.querySelector(`#stageCanvas`),stageLabels:t.querySelector(`#stageLabels`),statusPanel:t.querySelector(`#statusPanel`),figcaption:t.querySelector(`#figcaption`),readouts:o,sources:t.querySelector(`#sources`),toast:t.querySelector(`#toast`),railLeft:t.querySelector(`#railLeft`),railRight:t.querySelector(`#railRight`),stageHelp:t.querySelector(`#stageHelp`)}}var m=9.81;function h(e={}){let t=e.upliftM??1.5,n=e.deepDepthM??4e3,r=e.periodSec??600,i=e.phaseMode??`trough-first`,a=e.packetCount??3;return{deepDepthM:n,upliftM:t,initialWaveHeightM:e.initialWaveHeightM??t/1.5*.25,periodSec:r,phaseMode:i,packetCount:a}}function g(e,t){if(!Number.isFinite(e)||e<=0)throw RangeError(`${t} 必须为有限正数，收到：${e}`);return e}function _(e){return g(e,`depthM`),Math.sqrt(m*e)}function v(e,t){return g(e,`depthM`),g(t,`periodSec`),_(e)*t}function y(e,t){return g(e,`h0`),g(t,`h1`),(e/t)**.25}function ee(e,t,n){if(!Number.isFinite(e)||e<0)throw RangeError(`initialHeightM 必须为有限非负数，收到：${e}`);return g(t,`h0`),g(n,`h1`),e*(t/n)**.25}var te=1/6;function b(e,t){return Math.exp(e/t*-.5*(e/t))}function ne(e,t,n,r,i={}){if(typeof r!=`object`||!r)throw RangeError(`waveElevation 需要 env（hAt/tauAt/H）`);let{hAt:a,tauAt:o,H:s}=r;if(typeof a!=`function`||typeof o!=`function`||typeof s!=`function`)throw RangeError(`env 必须提供 hAt/tauAt/H 函数`);let c=g(n.periodSec,`periodSec`),l=c*te,u=a(e);if(!Number.isFinite(u)||u<=0)throw RangeError(`x=${e} 处水深非法（陆地或无效）`);let d=l,f=i.minWavelengthKm??0;if(f>0){let e=f*1e3/_(u);e>d&&(d=e)}let p=s(e)/2,m=t-o(e);if(m<-3*d)return 0;let h=[.78,1,.66],v=0;for(let e=0;e<h.length;e++){let t=m-(60+e*c);v+=h[e]*(-b(t,d)+b(t-c/2,d))}let y=p*v;return n.phaseMode===`crest-first`&&(y=-y),y>p&&(y=p),y<-p&&(y=-p),y}var x=.5,S=Math.floor(800/x)+1;function re(e){return e<=0?0:e>=1?1:e*e*(3-2*e)}function C(e,t){if(!Number.isFinite(e)||!Number.isFinite(t)||t<=0)throw RangeError(`depthAt 参数非法`);if(e>=795)return 10;if(e<=620)return t;let n=re((e-620)/175),r=Math.exp((1-n)*Math.log(t)+n*Math.log(10));return Math.max(10,r)}function w(e){let t=e.deepDepthM,n=e.initialWaveHeightM,r=new Float64Array(S);for(let e=0;e<S;e++)r[e]=C(e*x,t);let i=new Float64Array(S);i[0]=0;for(let e=1;e<S;e++){let t=_(r[e-1]),n=_(r[e]);i[e]=i[e-1]+x*1e3/2*(1/t+1/n)}function a(e){return Math.min(Math.max(e,0),800)/x}function o(e){if(e>800)return 0;let t=a(e),n=Math.floor(t),i=t-n;return n>=1600?r[1600]:r[n]*(1-i)+r[n+1]*i}function s(e){let t=Math.min(Math.max(e,0),800)/x,n=Math.floor(t),r=t-n;return n>=1600?i[1600]:i[n]*(1-r)+i[n+1]*r}function c(e){let r=o(e);return r<=0?0:ee(n,t,r)}function l(e){let t=[0,90,240,s(400),s(610),s(770),s(790),s(800)+2*e];for(let e=1;e<t.length;e++)if(!(t[e]>t[e-1]))throw RangeError(`章节锚点非严格递增：第 ${e} 项 ${t[e]} ≤ ${t[e-1]}`);return t}let u=l(e.periodSec);return{deepDepthM:t,initialWaveHeightM:n,periodSec:e.periodSec,hSamples:r,tau:i,hAt:o,tauAt:s,H:c,depthAt:e=>C(e,t),cuts:u,rebuild(e){return w(e)},buildCuts:l}}function T(e,t){let n=0;for(let r=0;r<e.length;r++)t>=e[r]&&(n=r);return Math.min(n,6)}var E={deepDepthM:{min:2e3,max:6e3,step:500},upliftM:{min:.5,max:3,step:.25}};function D(e){let t={...h(),...e};return t.deepDepthM=Math.min(E.deepDepthM.max,Math.max(E.deepDepthM.min,t.deepDepthM)),t.upliftM=Math.min(E.upliftM.max,Math.max(E.upliftM.min,t.upliftM)),t.initialWaveHeightM=.25*(t.upliftM/1.5),t.periodSec=t.periodSec||600,t.phaseMode!==`crest-first`&&(t.phaseMode=`trough-first`),t}function ie(e={}){let t=D(e),n=w(t);return{chapterIndex:0,playing:!1,rate:1,simTimeSec:0,params:t,bathy:n,cuts:n.cuts,webglStatus:`idle`,phaseOverlay:!1,labelsVisible:!0,reducedMotion:!1,activeToast:null,dragActive:!1,cameraResetNonce:0}}function ae(e,t,n,r){let i=Math.min(r,t.length-2),a=e[i],o=e[i+1]-a,s=o>0?(n-a)/o:0,c=Math.min(1,Math.max(0,s));return t[i]+c*(t[i+1]-t[i])}function O(e,t){switch(t.type){case`PLAY`:return e.simTimeSec>=e.cuts[e.cuts.length-1]?{...e,playing:!0,simTimeSec:e.cuts[0],chapterIndex:0}:{...e,playing:!0,activeToast:null};case`PAUSE`:return{...e,playing:!1};case`TOGGLE`:return O(e,{type:e.playing?`PAUSE`:`PLAY`});case`CHAPTER_SET`:{let n=Math.min(Math.max(0,t.index|0),6);return{...e,chapterIndex:n,simTimeSec:e.cuts[n],playing:e.playing}}case`CHAPTER_NEXT`:{let t=Math.min(e.chapterIndex+1,6);return{...e,chapterIndex:t,simTimeSec:e.cuts[t]}}case`CHAPTER_PREV`:{let t=Math.max(e.chapterIndex-1,0);return{...e,chapterIndex:t,simTimeSec:e.cuts[t]}}case`PARAM_DEPTH`:case`PARAM_UPLIFT`:{let n=t.type===`PARAM_DEPTH`?`deepDepthM`:`upliftM`,r=D({...e.params,[n]:t.value});if(r[n]===e.params[n]&&r.initialWaveHeightM===e.params.initialWaveHeightM)return e;let i=e.cuts,a=e.simTimeSec,o=e.chapterIndex,s=w(r),c=ae(i,s.cuts,a,o);return{...e,params:r,bathy:s,cuts:s.cuts,simTimeSec:c,chapterIndex:T(s.cuts,c)}}case`PHASE_SET`:{let n=t.mode===`crest-first`?`crest-first`:`trough-first`;return n===e.params.phaseMode?e:{...e,params:{...e.params,phaseMode:n}}}case`RATE_SET`:{let n=t.rate===2?2:1;return{...e,rate:n}}case`CAMERA_RESET`:return{...e,cameraResetNonce:e.cameraResetNonce+1};case`TICK`:{if(!e.playing)return e;let n=Math.min(t.dtSec,.05),r=e.simTimeSec+n*e.rate*80,i=e.cuts[e.cuts.length-1];if(r>=i)return{...e,simTimeSec:i,chapterIndex:6,playing:!1};let a=T(e.cuts,r);return{...e,simTimeSec:r,chapterIndex:a}}case`WEBGL_READY`:return{...e,webglStatus:`ready`,activeToast:null};case`WEBGL_ERROR`:return{...e,webglStatus:`error`};case`RETRY`:return{...e,webglStatus:`loading`};case`CANCEL`:return{...e,webglStatus:`cancelled`,playing:!1};case`SET_LABELS`:return{...e,labelsVisible:t.visible};case`MOTION_SET`:return{...e,reducedMotion:!!t.reduced};default:return e}}var k=-1;function oe(t,n){let r=e[n.chapterIndex];r&&r.index!==k&&(k=r.index,t.explainCard.innerHTML=`
    <h2><span class="chapter-num">0${r.index+1}</span>${r.title}</h2>
    <div class="explain-body">
      <div class="explain-block">
        <span class="tag">观察</span>
        <p class="txt">${r.observe}</p>
      </div>
      <div class="explain-block">
        <span class="tag">解释</span>
        <p class="txt">${r.explain}</p>
      </div>
      <div class="explain-block">
        <span class="tag">记住</span>
        <p class="txt">${r.remember}</p>
      </div>
    </div>
    <p class="chapter-note">${r.note}</p>
  `,t.explainCard.getAttribute(`aria-live`)!==`polite`&&t.explainCard.setAttribute(`aria-live`,`polite`))}function A(e){return Number.isFinite(e)?Math.round(e).toLocaleString(`zh-CN`):`–`}function j(e,t=1){return Number.isFinite(e)?e.toFixed(t):`–`}function M(e){let{deepDepthM:t,periodSec:n}=e.params;return{depth:t,speed:_(t)*3.6,height:e.bathy.H(795),wavelength:v(t,n)/1e3,period:n/60,green:y(t,10)}}function se(e,t){switch(e){case`depth`:return A(t.depth);case`speed`:return j(t.speed,1);case`height`:return j(t.height,2);case`wavelength`:return j(t.wavelength,1);case`period`:return A(t.period);case`green`:return j(t.green,2);default:return`–`}}function ce(t,n){let r=M(n),i=e[n.chapterIndex]?.readoutFocus??null,a=!1;for(let{el:e,v:n}of t.readouts){let t=e.dataset.key,o=se(t,r);n.textContent!==o&&(n.textContent=o,a=!0);let s=t===i;e.classList.contains(`focus`)!==s&&e.classList.toggle(`focus`,s)}return a}var le=1010,ue=2.1,de=4e3,fe=-5.65;function pe(e){return Math.min(e-1.15,fe)}var me=.26;function he(e){return e/800*18-9}function ge(e){return e<=0?0:e>=1?1:e*e*(3-2*e)}function N(e){return-(.6+3.9*(Math.max(e,1)/de)**.4)}function P(e){return e<=800?0:.03+.68*ge((e-800)/100)}function _e(e,t,n){let r=Math.max(t,.02),i=r/Math.max(n,1e-6),a=Math.min(.44,me*i**.5);return e/(r/2)*a}function ve(e){return e*.7}var F=ue+.25;function ye(e){let t=e.chapterIndex,n=e.params.deepDepthM,r=_(n);if(t===0){let t=e=>N(C(e,n));return[{text:`俯冲板片`,xKm:624,y:t(624)-.25,z:F},{text:`逆断层`,xKm:690,y:t(690)+.75,z:F},{text:`海底抬升 ${j(e.params.upliftM,2)} m（教学参数）`,xKm:752,y:t(752)+1.15,z:1,accent:!0}]}return t===1?[{text:`整根水柱一起参与`,xKm:560,y:-1.7,z:.6,accent:!0},{text:`海面`,xKm:300,y:.32,z:F}]:t===2?[{text:`深海 h = ${A(n)} m`,xKm:200,y:.5,z:F},{text:`c = ${j(r*3.6,0)} km/h`,xKm:430,y:.5,z:1.1,accent:!0},{text:`λ = ${j(v(n,e.params.periodSec)/1e3,0)} km`,xKm:660,y:.5,z:F}]:t===3?[{text:`地震波：先到`,xKm:300,y:.9,z:1.2,accent:!0},{text:`海啸波：随后`,xKm:640,y:.5,z:F},{text:`300 km 同程假设`,xKm:470,y:-.65,z:F}]:t===4?[{text:`深 ${A(n)} m`,xKm:640,y:.55,z:F},{text:`浅 10 m`,xKm:790,y:.4,z:1.1,accent:!0}]:t===5?[{text:`可能先退 ≠ 必定先退`,xKm:786,y:.75,z:1,accent:!0}]:t===6?[{text:`第 1 / 3 波`,xKm:826,y:P(826)+1.5,z:.8,accent:!0},{text:`淹没范围：概念示意`,xKm:852,y:P(852)+.9,z:F}]:[]}var I=-1,L=null,R=[];function be(e,t){let n=e.stageLabels;if(n.innerHTML=``,R=[],t.labelsVisible)for(let e of ye(t)){let t=document.createElement(`span`);t.className=`label-pill`+(e.accent?` accent`:``),t.textContent=e.text,n.appendChild(t),R.push({el:t,spec:e})}}function z(e,t,n){if(!t||!t.ok){R.length&&(e.stageLabels.innerHTML=``,R=[]),I=-1;return}(n.chapterIndex!==I||n.labelsVisible!==L)&&(I=n.chapterIndex,L=n.labelsVisible,be(e,n));let r=e.stageLabels.clientWidth,i=e.stageLabels.clientHeight;for(let{el:e,spec:n}of R){let a=t.project(n.xKm,n.y,n.z);if(!a.visible||a.x<-80||a.x>r+80){e.style.opacity=`0`;continue}e.style.opacity=`1`;let o=Math.min(Math.max(a.x,64),Math.max(64,r-64)),s=Math.min(Math.max(a.y,46),Math.max(46,i-46));e.style.transform=`translate(-50%, -120%) translate(${o.toFixed(1)}px, ${s.toFixed(1)}px)`}}function B(){I=-1,L=null}var V=!1;function xe(e){return`第${e.index+1}章，${e.title}。观察：${e.observe} 解释：${e.explain} 记住：${e.remember} 注意：${e.note}`}function H(){typeof speechSynthesis<`u`&&(speechSynthesis.cancel(),V=!1)}function Se({refs:t,dispatch:n,getState:r,onStatusAction:a,toast:o}){let{root:s}=t;t.startBtn.addEventListener(`click`,()=>{n({type:`PLAY`}),n({type:`CHAPTER_SET`,index:0}),s.querySelector(`#lesson`)?.scrollIntoView({behavior:r().reducedMotion?`auto`:`smooth`,block:`start`}),t.playBtn.focus({preventScroll:!0})}),t.playBtn.addEventListener(`click`,()=>n({type:`TOGGLE`})),t.prevBtn.addEventListener(`click`,()=>n({type:`CHAPTER_PREV`})),t.nextBtn.addEventListener(`click`,()=>n({type:`CHAPTER_NEXT`})),t.resetCamBtn.addEventListener(`click`,()=>n({type:`CAMERA_RESET`})),t.rate1.addEventListener(`click`,()=>n({type:`RATE_SET`,rate:1})),t.rate2.addEventListener(`click`,()=>n({type:`RATE_SET`,rate:2})),t.phaseTrough.addEventListener(`click`,()=>n({type:`PHASE_SET`,mode:`trough-first`})),t.phaseCrest.addEventListener(`click`,()=>n({type:`PHASE_SET`,mode:`crest-first`})),t.depthRange.addEventListener(`input`,e=>{n({type:`PARAM_DEPTH`,value:Number(e.target.value)})}),t.upliftRange.addEventListener(`input`,e=>{n({type:`PARAM_UPLIFT`,value:Number(e.target.value)})});for(let e of t.chapterBtns)e.addEventListener(`click`,()=>{n({type:`CHAPTER_SET`,index:Number(e.dataset.index)})});t.railLeft.addEventListener(`click`,()=>{t.railScroll.scrollBy({left:-240,behavior:r().reducedMotion?`auto`:`smooth`})}),t.railRight.addEventListener(`click`,()=>{t.railScroll.scrollBy({left:240,behavior:r().reducedMotion?`auto`:`smooth`})}),t.statusPanel.addEventListener(`click`,e=>{let t=e.target.closest(`[data-action]`);t&&a(t.dataset.action)}),t.readAloudBtn=s.querySelector(`#readAloud`),t.readAloudBtn.addEventListener(`click`,()=>{let n=e[r().chapterIndex];if(typeof speechSynthesis>`u`||typeof SpeechSynthesisUtterance>`u`){o(`当前浏览器不支持语音朗读，讲解文字已在左侧完整显示。`);return}if(V){H(),t.readAloudBtn.setAttribute(`aria-pressed`,`false`),t.readAloudBtn.innerHTML=`${i(`eye`)} 朗读本章说明`;return}let a=new SpeechSynthesisUtterance(xe(n));a.lang=`zh-CN`,a.rate=1,a.onend=()=>{V=!1,t.readAloudBtn.setAttribute(`aria-pressed`,`false`),t.readAloudBtn.innerHTML=`${i(`eye`)} 朗读本章说明`},a.onerror=()=>{V=!1,t.readAloudBtn.setAttribute(`aria-pressed`,`false`)},V=!0,t.readAloudBtn.setAttribute(`aria-pressed`,`true`),t.readAloudBtn.innerHTML=`${i(`pause`)} 停止朗读`,speechSynthesis.speak(a)});function c(e){return!!(e&&e.closest(`input, textarea, select, [contenteditable="true"]`))}function l(e){return!!(e&&e.closest(`button, a, input, textarea, select, summary, [role="button"]`))}window.addEventListener(`keydown`,a=>{if(a.metaKey||a.ctrlKey||a.altKey)return;let s=a.target;if(r(),a.code===`Space`||a.key===` `){if(l(s))return;a.preventDefault(),n({type:`TOGGLE`})}else if(a.key===`ArrowRight`||a.key===`ArrowLeft`){if(c(s))return;a.preventDefault(),n({type:a.key===`ArrowRight`?`CHAPTER_NEXT`:`CHAPTER_PREV`})}else if(a.key===`Home`||a.key===`End`){if(c(s))return;a.preventDefault(),n({type:`CHAPTER_SET`,index:a.key===`Home`?0:e.length-1})}else if(/^[1-7]$/.test(a.key)){if(c(s))return;n({type:`CHAPTER_SET`,index:Number(a.key)-1})}else a.key===`Escape`&&V?(H(),t.readAloudBtn.setAttribute(`aria-pressed`,`false`),t.readAloudBtn.innerHTML=`${i(`eye`)} 朗读本章说明`):a.key.toLowerCase()===`l`&&!c(s)?(n({type:`SET_LABELS`,visible:!r().labelsVisible}),o(r().labelsVisible?`已显示场景标注`:`已隐藏场景标注`)):a.key.toLowerCase()===`r`&&!c(s)&&(n({type:`CAMERA_RESET`}),o(`视角已复位`))}),window.addEventListener(`beforeunload`,H)}function Ce(t,n){let r=e[n.chapterIndex],a=n.cuts[n.cuts.length-1],o=`开始演示`,s=i(`play`);n.playing?(o=`暂停`,s=i(`pause`)):n.simTimeSec>=a-1e-6?o=`重新播放`:n.simTimeSec>n.cuts[0]+1e-6&&(o=`继续`);let c=`${s} ${o}`;t.playBtn.innerHTML!==c&&(t.playBtn.innerHTML=c,t.playBtn.setAttribute(`aria-label`,n.playing?`暂停演示`:`${o}`));for(let e of t.chapterBtns)Number(e.dataset.index)===n.chapterIndex?e.setAttribute(`aria-current`,`step`):e.removeAttribute(`aria-current`);let l=t.chapterBtns[n.chapterIndex];if(l&&!t.railScroll.dataset.scrolledFor?.endsWith(`:${n.chapterIndex}`)){t.railScroll.dataset.scrolledFor=`c:${n.chapterIndex}`;let e=l.offsetLeft-t.railScroll.clientWidth/2+l.clientWidth/2;t.railScroll.scrollTo({left:Math.max(0,e),behavior:n.reducedMotion?`auto`:`smooth`})}t.rate1.setAttribute(`aria-pressed`,String(n.rate===1)),t.rate2.setAttribute(`aria-pressed`,String(n.rate===2)),t.phaseTrough.setAttribute(`aria-pressed`,String(n.params.phaseMode===`trough-first`)),t.phaseCrest.setAttribute(`aria-pressed`,String(n.params.phaseMode===`crest-first`));let u=n.params.deepDepthM,d=n.params.upliftM;Number(t.depthRange.value)!==u&&(t.depthRange.value=String(u)),t.depthRange.setAttribute(`aria-valuenow`,String(u)),t.depthRange.setAttribute(`aria-valuetext`,`${u} 米`),Number(t.upliftRange.value)!==d&&(t.upliftRange.value=String(d)),t.upliftRange.setAttribute(`aria-valuenow`,d.toFixed(2)),t.upliftRange.setAttribute(`aria-valuetext`,`${d.toFixed(2)} 米`);let f=`${u} m`;t.depthOut.textContent!==f&&(t.depthOut.textContent=f);let p=`${j(d,2)} m`;t.upliftOut.textContent!==p&&(t.upliftOut.textContent=p),t.prevBtn.disabled=n.chapterIndex===0&&n.simTimeSec<=n.cuts[0],t.nextBtn.disabled=n.chapterIndex===e.length-1;let m=`第 ${n.chapterIndex+1} 章 · ${r.title}（三维示意图，水平与垂直均非等比）`;t.figcaption.textContent!==m&&(t.figcaption.textContent=m),t.depthRange.min=String(E.deepDepthM.min),t.depthRange.max=String(E.deepDepthM.max),t.upliftRange.min=String(E.upliftM.min),t.upliftRange.max=String(E.upliftM.max)}var we=`
<svg class="static-figure" viewBox="0 0 680 280" role="img"
     aria-label="静态剖面示意：左侧为深海与整根水柱，中部海床沿逆断层抬升，右侧为陆架变浅与海岸；海面波列自左向右传播。">
  <defs>
    <linearGradient id="sf-water" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1B4A5E" stop-opacity="0.85"/>
      <stop offset="100%" stop-color="#0A1E2A" stop-opacity="0.95"/>
    </linearGradient>
    <linearGradient id="sf-crust" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#5A4636"/>
      <stop offset="100%" stop-color="#2B211A"/>
    </linearGradient>
  </defs>

  <rect x="0" y="0" width="680" height="280" fill="#09212F"/>

  <!-- 水体 -->
  <path d="M24 96 L520 96 L620 150 L664 150 L664 236 L24 236 Z" fill="url(#sf-water)"/>
  <!-- 海面波列（波谷先到） -->
  <path d="M24 96 C70 96 96 78 140 78 C184 78 206 112 250 112 C294 112 318 80 362 80 C406 80 428 110 472 110 C504 110 520 96 520 96"
        fill="none" stroke="#53C7E8" stroke-width="2.6" stroke-linecap="round"/>
  <!-- 海床 / 陆坡 -->
  <path d="M24 236 L470 236 L470 214 L520 196 L600 172 L640 168 L664 168 L664 236 Z" fill="url(#sf-crust)"/>
  <!-- 逆断层 -->
  <path d="M470 236 L520 196" stroke="#E0B25A" stroke-width="3" stroke-linecap="round"/>
  <path d="M478 206 L500 192" stroke="#E0B25A" stroke-width="2" stroke-dasharray="4 4"/>
  <!-- 抬升箭头 -->
  <path d="M545 190 L545 150" stroke="#E0B25A" stroke-width="2.4" stroke-linecap="round"/>
  <path d="M539 158 L545 148 L551 158" fill="none" stroke="#E0B25A" stroke-width="2.4" stroke-linecap="round"/>

  <!-- 水柱箭头（整根水柱参与） -->
  <g stroke="#7FD4EA" stroke-width="1.6" stroke-linecap="round" opacity="0.85">
    <path d="M120 100 L120 226"/><path d="M114 218 L120 228 L126 218"/>
    <path d="M300 104 L300 226"/><path d="M294 218 L300 228 L306 218"/>
    <path d="M420 108 L420 226"/><path d="M414 218 L420 228 L426 218"/>
  </g>
  <!-- 陆上建筑轮廓 -->
  <g fill="#7C6A55">
    <rect x="596" y="146" width="12" height="24"/><rect x="614" y="138" width="12" height="32"/>
    <rect x="632" y="150" width="12" height="20"/><rect x="650" y="142" width="12" height="28"/>
  </g>

  <!-- 标注 -->
  <g fill="#C9DDE7" font-size="12" font-family="'Noto Sans SC', system-ui, sans-serif">
    <text x="34" y="88">海面</text>
    <text x="132" y="248">整根水柱一起参与（长波）</text>
    <text x="430" y="262">逆断层：上盘抬升，另一侧可下沉</text>
    <text x="556" y="138" fill="#E0B25A">海底抬升</text>
    <text x="608" y="132">海岸</text>
  </g>
  <text x="24" y="24" fill="#7FA6B8" font-size="11" font-family="'IBM Plex Mono', ui-monospace, monospace">
    STATIC SECTION · 静态剖面 · 非等比示意
  </text>
</svg>`;function Te(e){let t=e.querySelector(`.static-figure`);if(!t){let n=document.createElement(`div`);n.className=`static-holder`,n.innerHTML=we,e.appendChild(n),t=n.querySelector(`.static-figure`)}return t}function Ee(e,t,n=``){let r=e.statusPanel,a=e.root.querySelector(`#stageFigure`);if(t===`idle`){r.className=`status-panel`,r.innerHTML=``;return}let o=t===`error`||t===`cancelled`;o&&Te(a),a.classList.toggle(`text-mode`,o),t===`loading`?(r.className=`status-panel show loading`,r.setAttribute(`role`,`status`),r.innerHTML=`
      <span class="status-icon spin">${i(`loader`)}</span>
      <p class="status-msg">正在准备三维场景</p>
      <p class="status-sub">三维库从本站加载，不请求任何外域资源。</p>
      <button class="status-action" type="button" data-action="cancel">先看文字讲解</button>
    `):t===`ready`?(r.className=`status-panel show success`,r.setAttribute(`role`,`status`),r.innerHTML=`
      <span class="status-icon">${i(`check`)}</span>
      <p class="status-msg">三维场景已就绪</p>
    `):t===`error`?(r.className=`status-panel show error`,r.setAttribute(`role`,`alert`),r.innerHTML=`
      <span class="status-icon">${i(`alert`)}</span>
      <p class="status-msg">三维场景无法启动</p>
      <p class="status-sub">${n||`当前浏览器或显卡不支持 WebGL2`}。下方静态剖面与完整七章讲解仍可阅读。</p>
      <div class="status-actions">
        <button class="status-action" type="button" data-action="retry">重试</button>
        <button class="status-action ghost" type="button" data-action="cancel">只看文字</button>
      </div>
    `):(r.className=`status-panel show`,r.setAttribute(`role`,`status`),r.innerHTML=`
    <span class="status-icon">${i(`info`)}</span>
    <p class="status-msg">已切换到文字讲解</p>
    <p class="status-sub">静态剖面与全部章节文字仍然完整；随时可重新加载三维场景。</p>
    <button class="status-action" type="button" data-action="load">重新加载三维场景</button>
  `)}function De(e,t=1800){window.setTimeout(()=>{e.statusPanel.classList.contains(`success`)&&e.statusPanel.classList.remove(`show`)},t)}var Oe=`modulepreload`,ke=function(e,t){return new URL(e,t).href},Ae={},je=function(e){return e.pathname.endsWith(`.css`)},Me=function(e,t,n){if(t in e)return e[t];let r=n();if(!r){e[t]=void 0;return}let i=r.then(()=>{e[t]=void 0},n=>{throw e[t]=void 0,n});return e[t]=i,i},Ne=function(e,t,n){let r=Promise.resolve();if(t&&t.length>0){let e,i=document.querySelector(`meta[property=csp-nonce]`),a=i?.nonce||i?.getAttribute(`nonce`);function o(e){return Promise.all(e.map(e=>Promise.resolve(e).then(e=>({status:`fulfilled`,value:e}),e=>({status:`rejected`,reason:e}))))}function s(e){return import.meta.resolve?new URL(import.meta.resolve(e)):new URL(e,import.meta.url)}r=o(t.map(t=>{t=ke(t,n);let r=s(t),i=je(r);return Me(Ae,r.href,()=>{if(e===void 0){e={all:new Set,styles:new Set};let t=document.getElementsByTagName(`link`);for(let n=t.length-1;n>=0;n--){let r=t[n];e.all.add(r.href),r.rel===`stylesheet`&&e.styles.add(r.href)}}if((i?e.styles:e.all).has(r.href))return;let t=document.createElement(`link`);if(t.rel=i?`stylesheet`:Oe,i||(t.as=`script`),t.crossOrigin=``,t.href=r.href,a&&t.setAttribute(`nonce`,a),document.head.appendChild(t),i)return new Promise((e,n)=>{t.addEventListener(`load`,e),t.addEventListener(`error`,()=>n(Error(`Unable to preload CSS for ${r}`)))})})}).filter(e=>e!==void 0))}function i(e){let t=new Event(`vite:preloadError`,{cancelable:!0});if(t.payload=e,window.dispatchEvent(t),!t.defaultPrevented)throw e}return r.then(t=>{for(let e of t||[])e.status===`rejected`&&i(e.reason);return e().catch(i)})},U=document.querySelector(`#app`),W=p(U),G=window.matchMedia(`(prefers-reduced-motion: reduce)`),K=ie();K=O(K,{type:`MOTION_SET`,reduced:G.matches}),document.documentElement.classList.toggle(`reduced-motion`,G.matches);var q=null,J=``,Y=`idle`,Pe=0;function X(e){let t=O(K,e);t!==K&&(K=t,Re())}var Fe={idle:`idle`,loading:`loading`,ready:`ready`,error:`error`,cancelled:`cancelled`};function Ie(){let e=Fe[K.webglStatus]||`idle`;e!==Y&&(Y=e,Ee(W,e,J),e===`ready`&&De(W,1600))}var Z=``;function Le(e){let t=e.cuts[e.cuts.length-1];return[e.chapterIndex,e.params.deepDepthM,e.params.upliftM,e.params.phaseMode,e.rate,+!!e.playing,+(e.simTimeSec>=t-1e-6),+(e.simTimeSec>e.cuts[0]+1e-6)].join(`|`)}function Re(){oe(W,K),ce(W,K);let e=Le(K);e!==Z&&(Z=e,Ce(W,K)),Ie()}function ze(e,t=2600){let n=W.toast;n.textContent=e,n.hidden=!1,window.clearTimeout(Pe),Pe=window.setTimeout(()=>{n.hidden=!0},t)}async function Be(){if(K.webglStatus===`loading`)return;J=``,X({type:`RETRY`}),await new Promise(e=>requestAnimationFrame(()=>setTimeout(e,0)));let e;try{e=await Ne(()=>import(`./sceneController-DwiKOX4z.js`),__vite__mapDeps([0,1]),import.meta.url)}catch(e){J=`三维模块加载失败：${e?.message||e}`,X({type:`WEBGL_ERROR`});return}try{q&&q.ok&&q.dispose(),q=e.createController(W.stageCanvas)}catch(e){J=`场景初始化异常：${e?.message||e}`,X({type:`WEBGL_ERROR`});return}if(!q||!q.ok)J=q?.error||`未知原因`,X({type:`WEBGL_ERROR`});else{try{q.handleResize()}catch{}B(),X({type:`WEBGL_READY`}),W.stageCanvas.focus?.({preventScroll:!0})}}function Ve(e){e===`retry`||e===`load`?Be():e===`cancel`&&(q&&q.ok&&(q.dispose(),q=null),X({type:`CANCEL`}),B(),ze(`已切换到文字讲解，七章内容与静态剖面完整可用。`))}Se({refs:W,dispatch:X,getState:()=>K,onStatusAction:Ve,toast:ze});var Q=performance.now(),He=0;function Ue(e){let t=Math.min(.05,Math.max(0,(e-Q)/1e3));if(Q=e,He+=1,K.playing&&X({type:`TICK`,dtSec:t}),q&&q.ok)try{q.update(K,t),z(W,q,K)}catch(e){J=`渲染异常：${e?.message||e}`,X({type:`WEBGL_ERROR`}),q=null}requestAnimationFrame(Ue)}var $=0,We=U.querySelector(`#stageFigure`);new ResizeObserver(()=>{$||=requestAnimationFrame(()=>{$=0,q&&q.ok&&q.handleResize(),z(W,q,K)})}).observe(We),window.addEventListener(`resize`,()=>{q&&q.ok&&q.handleResize()}),document.addEventListener(`visibilitychange`,()=>{Q=performance.now()}),G.addEventListener?.(`change`,e=>{document.documentElement.classList.toggle(`reduced-motion`,e.matches),X({type:`MOTION_SET`,reduced:e.matches})}),W.stageCanvas.addEventListener(`webglcontextlost`,e=>{e.preventDefault(),J=`图形上下文丢失（可能是显存或驱动问题）`,q=null,X({type:`WEBGL_ERROR`})}),Re(),requestAnimationFrame(Ue),Be(),window.__tsunami={getState:()=>K,dispatch:X,metrics:()=>M(K),chapters:e.map(e=>({index:e.index,title:e.title})),get frameNo(){return He},get webglStatus(){return K.webglStatus},get controller(){return q}};export{_e as a,he as c,ve as i,C as l,ue as n,P as o,N as r,pe as s,le as t,ne as u};