// src/main.js
// 页面编排：状态 → DOM → 三维 → 循环。reducer 是唯一状态入口。
// 三维库按需动态加载：首屏先出文字与布局，不因等待 WebGL 而空白。

import './styles/tokens.css';
import './styles/base.css';
import './styles/layout.css';
import './styles/components.css';

import { renderShell } from './ui/renderShell.js';
import { reducer, createInitialState } from './state/lessonMachine.js';
import { renderExplain } from './ui/explainCard.js';
import { renderReadouts, computeMetrics } from './ui/readouts.js';
import { updateLabels, invalidateLabels } from './ui/labels.js';
import { bindControls, syncControls } from './ui/controls.js';
import { renderStatus, scheduleSuccessHide } from './ui/statusPanel.js';
import { CHAPTERS } from './content/chapters.js';

const app = document.querySelector('#app');
const refs = renderShell(app);

const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
let state = createInitialState();
state = reducer(state, { type: 'MOTION_SET', reduced: motionQuery.matches });
document.documentElement.classList.toggle('reduced-motion', motionQuery.matches);

let controller = null;
let webglError = '';
let statusShown = 'idle';
let toastTimer = 0;

/* —— 状态 —— */

function dispatch(action) {
  const next = reducer(state, action);
  if (next === state) return;
  state = next;
  render();
}

const STATUS_OF = {
  idle: 'idle',
  loading: 'loading',
  ready: 'ready',
  error: 'error',
  cancelled: 'cancelled',
};

function syncStatus() {
  const want = STATUS_OF[state.webglStatus] || 'idle';
  if (want === statusShown) return;
  statusShown = want;
  renderStatus(refs, want, webglError);
  if (want === 'ready') scheduleSuccessHide(refs, 1600);
}

let lastUiSig = '';

function uiSignature(s) {
  const end = s.cuts[s.cuts.length - 1];
  return [
    s.chapterIndex,
    s.params.deepDepthM,
    s.params.upliftM,
    s.params.phaseMode,
    s.rate,
    s.playing ? 1 : 0,
    s.simTimeSec >= end - 1e-6 ? 1 : 0,
    s.simTimeSec > s.cuts[0] + 1e-6 ? 1 : 0,
  ].join('|');
}

function render() {
  renderExplain(refs, state);
  renderReadouts(refs, state);
  const sig = uiSignature(state);
  if (sig !== lastUiSig) {
    lastUiSig = sig;
    syncControls(refs, state);
  }
  syncStatus();
}

/* —— 轻提示 —— */

function toast(msg, ms = 2600) {
  const el = refs.toast;
  el.textContent = msg;
  el.hidden = false;
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    el.hidden = true;
  }, ms);
}

/* —— 三维加载 —— */

async function loadScene() {
  if (state.webglStatus === 'loading') return;
  webglError = '';
  dispatch({ type: 'RETRY' });
  // 先让 loading 态完成一次绘制，再加载三维库（避免空白首屏）
  await new Promise((resolve) => requestAnimationFrame(() => setTimeout(resolve, 0)));

  let mod;
  try {
    mod = await import('./scene/sceneController.js');
  } catch (e) {
    webglError = `三维模块加载失败：${e?.message || e}`;
    dispatch({ type: 'WEBGL_ERROR' });
    return;
  }

  try {
    if (controller && controller.ok) controller.dispose();
    controller = mod.createController(refs.stageCanvas);
  } catch (e) {
    webglError = `场景初始化异常：${e?.message || e}`;
    dispatch({ type: 'WEBGL_ERROR' });
    return;
  }

  if (!controller || !controller.ok) {
    webglError = controller?.error || '未知原因';
    dispatch({ type: 'WEBGL_ERROR' });
    return;
  }

  try {
    controller.handleResize();
  } catch {
    /* 尺寸未就绪时下一次 resize 再补 */
  }
  invalidateLabels();
  dispatch({ type: 'WEBGL_READY' });
  refs.stageCanvas.focus?.({ preventScroll: true });
}

function handleStatusAction(action) {
  if (action === 'retry' || action === 'load') {
    loadScene();
    return;
  }
  if (action === 'cancel') {
    if (controller && controller.ok) {
      controller.dispose();
      controller = null;
    }
    dispatch({ type: 'CANCEL' });
    invalidateLabels();
    toast('已切换到文字讲解，七章内容与静态剖面完整可用。');
  }
}

/* —— 交互 —— */

bindControls({
  refs,
  dispatch,
  getState: () => state,
  onStatusAction: handleStatusAction,
  toast,
});

/* —— 渲染循环 —— */

let last = performance.now();
let frameNo = 0;

function frame(now) {
  const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
  last = now;
  frameNo += 1;

  if (state.playing) {
    dispatch({ type: 'TICK', dtSec: dt });
  }
  if (controller && controller.ok) {
    try {
      controller.update(state, dt);
      updateLabels(refs, controller, state);
    } catch (e) {
      webglError = `渲染异常：${e?.message || e}`;
      dispatch({ type: 'WEBGL_ERROR' });
      controller = null;
    }
  }
  requestAnimationFrame(frame);
}

/* —— 尺寸与系统偏好 —— */

let resizeRaf = 0;
const stageFigure = app.querySelector('#stageFigure');
const ro = new ResizeObserver(() => {
  if (resizeRaf) return;
  resizeRaf = requestAnimationFrame(() => {
    resizeRaf = 0;
    if (controller && controller.ok) controller.handleResize();
    updateLabels(refs, controller, state);
  });
});
ro.observe(stageFigure);

window.addEventListener('resize', () => {
  if (controller && controller.ok) controller.handleResize();
});

document.addEventListener('visibilitychange', () => {
  // 回到前台时重置时基，避免一次巨大的 dt
  last = performance.now();
});

motionQuery.addEventListener?.('change', (e) => {
  document.documentElement.classList.toggle('reduced-motion', e.matches);
  dispatch({ type: 'MOTION_SET', reduced: e.matches });
});

refs.stageCanvas.addEventListener('webglcontextlost', (e) => {
  e.preventDefault();
  webglError = '图形上下文丢失（可能是显存或驱动问题）';
  controller = null;
  dispatch({ type: 'WEBGL_ERROR' });
});

/* —— 启动 —— */

render();
requestAnimationFrame(frame);
loadScene();

// 供自动审计与调试读取真实内部状态（不参与页面渲染）
window.__tsunami = {
  getState: () => state,
  dispatch,
  metrics: () => computeMetrics(state),
  chapters: CHAPTERS.map((c) => ({ index: c.index, title: c.title })),
  get frameNo() {
    return frameNo;
  },
  get webglStatus() {
    return state.webglStatus;
  },
  get controller() {
    return controller;
  },
};
