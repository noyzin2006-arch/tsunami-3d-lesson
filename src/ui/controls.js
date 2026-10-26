// src/ui/controls.js
// 全部交互绑定与控件同步。reducer 是唯一状态入口，这里只 dispatch。
// 键盘约定：Space 播放/暂停；←/→ 换章；Home/End 首末章；1–7 直达。
// 焦点在滑杆/输入框时不劫持方向键（A06）。

import { CHAPTERS } from '../content/chapters.js';
import { PARAM_RANGES } from '../state/lessonMachine.js';
import { icon } from './icons.js';
import { fixed } from './format.js';

let speaking = false;

function readAloudText(ch) {
  return `第${ch.index + 1}章，${ch.title}。观察：${ch.observe} 解释：${ch.explain} 记住：${ch.remember} 注意：${ch.note}`;
}

function stopSpeaking() {
  if (typeof speechSynthesis === 'undefined') return;
  speechSynthesis.cancel();
  speaking = false;
}

/**
 * 绑定控件。
 * @param {object} ctx
 * @param {object} ctx.refs
 * @param {(action:object)=>void} ctx.dispatch
 * @param {()=>object} ctx.getState
 * @param {(action:string)=>void} ctx.onStatusAction
 * @param {(msg:string)=>void} ctx.toast
 */
export function bindControls({ refs, dispatch, getState, onStatusAction, toast }) {
  const { root } = refs;

  refs.startBtn.addEventListener('click', () => {
    dispatch({ type: 'PLAY' });
    dispatch({ type: 'CHAPTER_SET', index: 0 });
    root.querySelector('#lesson')?.scrollIntoView({
      behavior: getState().reducedMotion ? 'auto' : 'smooth',
      block: 'start',
    });
    refs.playBtn.focus({ preventScroll: true });
  });

  refs.playBtn.addEventListener('click', () => dispatch({ type: 'TOGGLE' }));
  refs.prevBtn.addEventListener('click', () => dispatch({ type: 'CHAPTER_PREV' }));
  refs.nextBtn.addEventListener('click', () => dispatch({ type: 'CHAPTER_NEXT' }));
  refs.resetCamBtn.addEventListener('click', () => dispatch({ type: 'CAMERA_RESET' }));

  refs.rate1.addEventListener('click', () => dispatch({ type: 'RATE_SET', rate: 1 }));
  refs.rate2.addEventListener('click', () => dispatch({ type: 'RATE_SET', rate: 2 }));
  refs.phaseTrough.addEventListener('click', () => dispatch({ type: 'PHASE_SET', mode: 'trough-first' }));
  refs.phaseCrest.addEventListener('click', () => dispatch({ type: 'PHASE_SET', mode: 'crest-first' }));

  refs.depthRange.addEventListener('input', (e) => {
    dispatch({ type: 'PARAM_DEPTH', value: Number(e.target.value) });
  });
  refs.upliftRange.addEventListener('input', (e) => {
    dispatch({ type: 'PARAM_UPLIFT', value: Number(e.target.value) });
  });

  for (const b of refs.chapterBtns) {
    b.addEventListener('click', () => {
      dispatch({ type: 'CHAPTER_SET', index: Number(b.dataset.index) });
    });
  }

  refs.railLeft.addEventListener('click', () => {
    refs.railScroll.scrollBy({ left: -240, behavior: getState().reducedMotion ? 'auto' : 'smooth' });
  });
  refs.railRight.addEventListener('click', () => {
    refs.railScroll.scrollBy({ left: 240, behavior: getState().reducedMotion ? 'auto' : 'smooth' });
  });

  // 状态面板按钮（事件委托）
  refs.statusPanel.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    onStatusAction(btn.dataset.action);
  });

  // 朗读
  refs.readAloudBtn = root.querySelector('#readAloud');
  refs.readAloudBtn.addEventListener('click', () => {
    const ch = CHAPTERS[getState().chapterIndex];
    if (typeof speechSynthesis === 'undefined' || typeof SpeechSynthesisUtterance === 'undefined') {
      toast('当前浏览器不支持语音朗读，讲解文字已在左侧完整显示。');
      return;
    }
    if (speaking) {
      stopSpeaking();
      refs.readAloudBtn.setAttribute('aria-pressed', 'false');
      refs.readAloudBtn.innerHTML = `${icon('eye')} 朗读本章说明`;
      return;
    }
    const u = new SpeechSynthesisUtterance(readAloudText(ch));
    u.lang = 'zh-CN';
    u.rate = 1;
    u.onend = () => {
      speaking = false;
      refs.readAloudBtn.setAttribute('aria-pressed', 'false');
      refs.readAloudBtn.innerHTML = `${icon('eye')} 朗读本章说明`;
    };
    u.onerror = () => {
      speaking = false;
      refs.readAloudBtn.setAttribute('aria-pressed', 'false');
    };
    speaking = true;
    refs.readAloudBtn.setAttribute('aria-pressed', 'true');
    refs.readAloudBtn.innerHTML = `${icon('pause')} 停止朗读`;
    speechSynthesis.speak(u);
  });

  // 键盘
  function isFormField(el) {
    return Boolean(el && el.closest('input, textarea, select, [contenteditable="true"]'));
  }
  function isActivator(el) {
    return Boolean(el && el.closest('button, a, input, textarea, select, summary, [role="button"]'));
  }

  window.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const t = e.target;
    const state = getState();

    if (e.code === 'Space' || e.key === ' ') {
      if (isActivator(t)) return; // 交给原生按钮
      e.preventDefault();
      dispatch({ type: 'TOGGLE' });
      return;
    }
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      if (isFormField(t)) return; // 滑杆/输入框自己处理
      e.preventDefault();
      dispatch({ type: e.key === 'ArrowRight' ? 'CHAPTER_NEXT' : 'CHAPTER_PREV' });
      return;
    }
    if (e.key === 'Home' || e.key === 'End') {
      if (isFormField(t)) return;
      e.preventDefault();
      dispatch({ type: 'CHAPTER_SET', index: e.key === 'Home' ? 0 : CHAPTERS.length - 1 });
      return;
    }
    if (/^[1-7]$/.test(e.key)) {
      if (isFormField(t)) return;
      dispatch({ type: 'CHAPTER_SET', index: Number(e.key) - 1 });
      return;
    }
    if (e.key === 'Escape' && speaking) {
      stopSpeaking();
      refs.readAloudBtn.setAttribute('aria-pressed', 'false');
      refs.readAloudBtn.innerHTML = `${icon('eye')} 朗读本章说明`;
      return;
    }
    if (e.key.toLowerCase() === 'l' && !isFormField(t)) {
      dispatch({ type: 'SET_LABELS', visible: !getState().labelsVisible });
      toast(getState().labelsVisible ? '已显示场景标注' : '已隐藏场景标注');
      return;
    }
    if (e.key.toLowerCase() === 'r' && !isFormField(t)) {
      dispatch({ type: 'CAMERA_RESET' });
      toast('视角已复位');
    }
    // 保持引用，避免未使用告警
    void state;
  });

  window.addEventListener('beforeunload', stopSpeaking);
}

/** 把状态同步到控件外观与读数输出（不含六项读数卡，后者见 readouts.js）。 */
export function syncControls(refs, state) {
  const ch = CHAPTERS[state.chapterIndex];
  const end = state.cuts[state.cuts.length - 1];

  // 播放按钮文案
  let label = '开始演示';
  let glyph = icon('play');
  if (state.playing) {
    label = '暂停';
    glyph = icon('pause');
  } else if (state.simTimeSec >= end - 1e-6) {
    label = '重新播放';
  } else if (state.simTimeSec > state.cuts[0] + 1e-6) {
    label = '继续';
  }
  const playHtml = `${glyph} ${label}`;
  if (refs.playBtn.innerHTML !== playHtml) {
    refs.playBtn.innerHTML = playHtml;
    refs.playBtn.setAttribute('aria-label', state.playing ? '暂停演示' : `${label}`);
  }

  // 章节按钮
  for (const b of refs.chapterBtns) {
    const active = Number(b.dataset.index) === state.chapterIndex;
    if (active) {
      b.setAttribute('aria-current', 'step');
    } else {
      b.removeAttribute('aria-current');
    }
  }
  const activeBtn = refs.chapterBtns[state.chapterIndex];
  if (activeBtn && !refs.railScroll.dataset.scrolledFor?.endsWith(`:${state.chapterIndex}`)) {
    refs.railScroll.dataset.scrolledFor = `c:${state.chapterIndex}`;
    const left = activeBtn.offsetLeft - refs.railScroll.clientWidth / 2 + activeBtn.clientWidth / 2;
    refs.railScroll.scrollTo({ left: Math.max(0, left), behavior: state.reducedMotion ? 'auto' : 'smooth' });
  }

  // 倍速 / 相位
  refs.rate1.setAttribute('aria-pressed', String(state.rate === 1));
  refs.rate2.setAttribute('aria-pressed', String(state.rate === 2));
  refs.phaseTrough.setAttribute('aria-pressed', String(state.params.phaseMode === 'trough-first'));
  refs.phaseCrest.setAttribute('aria-pressed', String(state.params.phaseMode === 'crest-first'));

  // 滑杆值与 aria-valuenow
  const d = state.params.deepDepthM;
  const u = state.params.upliftM;
  if (Number(refs.depthRange.value) !== d) refs.depthRange.value = String(d);
  refs.depthRange.setAttribute('aria-valuenow', String(d));
  refs.depthRange.setAttribute('aria-valuetext', `${d} 米`);
  if (Number(refs.upliftRange.value) !== u) refs.upliftRange.value = String(u);
  refs.upliftRange.setAttribute('aria-valuenow', u.toFixed(2));
  refs.upliftRange.setAttribute('aria-valuetext', `${u.toFixed(2)} 米`);

  const dText = `${d} m`;
  if (refs.depthOut.textContent !== dText) refs.depthOut.textContent = dText;
  const uText = `${fixed(u, 2)} m`;
  if (refs.upliftOut.textContent !== uText) refs.upliftOut.textContent = uText;

  // 边界禁用（不是隐藏，保持可达性）
  refs.prevBtn.disabled = state.chapterIndex === 0 && state.simTimeSec <= state.cuts[0];
  refs.nextBtn.disabled = state.chapterIndex === CHAPTERS.length - 1;

  // 图注：说明当前章 + 非等比声明
  const cap = `第 ${state.chapterIndex + 1} 章 · ${ch.title}（三维示意图，水平与垂直均非等比）`;
  if (refs.figcaption.textContent !== cap) refs.figcaption.textContent = cap;

  // 参数提示（钳制后可能不等于请求值）
  refs.depthRange.min = String(PARAM_RANGES.deepDepthM.min);
  refs.depthRange.max = String(PARAM_RANGES.deepDepthM.max);
  refs.upliftRange.min = String(PARAM_RANGES.upliftM.min);
  refs.upliftRange.max = String(PARAM_RANGES.upliftM.max);
}
