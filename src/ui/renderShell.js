// src/ui/renderShell.js
// 构建整页语义 DOM 骨架，并返回动态元素引用。所有内容围绕同一海盆变化。
import { CHAPTERS } from '../content/chapters.js';
import { icon } from './icons.js';
import { buildSources } from './sourcePanel.js';

const METRICS = [
  { key: 'depth', label: '深海水深', unit: 'm' },
  { key: 'speed', label: '相速度', unit: 'km/h' },
  { key: 'height', label: '波高（近岸）', unit: 'm' },
  { key: 'wavelength', label: '波长（深海）', unit: 'km' },
  { key: 'period', label: '周期', unit: 'min' },
  { key: 'green', label: 'Green 比率', unit: '×' },
];

export function renderShell(root) {
  root.innerHTML = `
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
        <button class="rail-arrow" id="railLeft" aria-label="向左滚动章节">${icon('prev')}</button>
        <div class="rail-scroll" id="railScroll"></div>
        <button class="rail-arrow" id="railRight" aria-label="向右滚动章节">${icon('next')}</button>
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
          <button class="btn-ghost read-aloud" id="readAloud" type="button" aria-pressed="false" aria-label="朗读本章说明">${icon('eye')} 朗读本章说明</button>
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
              <button class="btn-icon" id="prevBtn" aria-label="上一章">${icon('prev')}</button>
              <button class="btn-play" id="playBtn" data-testid="play" aria-label="播放或暂停">开始演示</button>
              <button class="btn-icon" id="nextBtn" aria-label="下一章">${icon('next')}</button>
              <button class="btn-icon" id="resetCamBtn" aria-label="复位视角">${icon('rotate')}</button>
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
  </div>`;

  // 章节轨道按钮
  const railScroll = root.querySelector('#railScroll');
  const chapterBtns = CHAPTERS.map((c) => {
    const b = document.createElement('button');
    b.className = 'chapter-btn';
    b.type = 'button';
    b.dataset.index = String(c.index);
    b.dataset.testid = `chapter-${c.index + 1}`;
    b.innerHTML = `<span class="num">0${c.index + 1}</span><span>${c.title}</span>`;
    railScroll.appendChild(b);
    return b;
  });

  // 读数卡
  const readouts = root.querySelector('#readouts');
  const metricEls = METRICS.map((m) => {
    const d = document.createElement('div');
    d.className = 'metric';
    d.dataset.key = m.key;
    d.dataset.testid = `readout-${m.key}`;
    d.innerHTML = `<span class="m-label">${m.label}</span><span class="m-value"><span class="v">–</span><span class="m-unit">${m.unit}</span></span>`;
    readouts.appendChild(d);
    return { el: d, v: d.querySelector('.v') };
  });

  // 来源块
  buildSources(root.querySelector('#sources'));

  const refs = {
    root,
    chapterBtns,
    railScroll,
    explainCard: root.querySelector('#explainCard'),
    depthRange: root.querySelector('#depthRange'),
    depthOut: root.querySelector('#depthOut'),
    upliftRange: root.querySelector('#upliftRange'),
    upliftOut: root.querySelector('#upliftOut'),
    startBtn: root.querySelector('#startBtn'),
    playBtn: root.querySelector('#playBtn'),
    prevBtn: root.querySelector('#prevBtn'),
    nextBtn: root.querySelector('#nextBtn'),
    resetCamBtn: root.querySelector('#resetCamBtn'),
    rate1: root.querySelector('#rate1'),
    rate2: root.querySelector('#rate2'),
    phaseTrough: root.querySelector('#phaseTrough'),
    phaseCrest: root.querySelector('#phaseCrest'),
    stageCanvas: root.querySelector('#stageCanvas'),
    stageLabels: root.querySelector('#stageLabels'),
    statusPanel: root.querySelector('#statusPanel'),
    figcaption: root.querySelector('#figcaption'),
    readouts: metricEls,
    sources: root.querySelector('#sources'),
    toast: root.querySelector('#toast'),
    railLeft: root.querySelector('#railLeft'),
    railRight: root.querySelector('#railRight'),
    stageHelp: root.querySelector('#stageHelp'),
  };
  return refs;
}
