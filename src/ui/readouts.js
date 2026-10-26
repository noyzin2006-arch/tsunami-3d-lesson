// src/ui/readouts.js
// 六项读数：全部由 physics 纯函数现算，绝不硬编码页面数字。
// 只在数值真正变化时写 DOM（避免每帧重排）。

import { waveSpeed, waveLength, greenFactor, NEAR_DEPTH_M } from '../physics/tsunami.js';
import { CHAPTERS } from '../content/chapters.js';
import { int, fixed } from './format.js';

/**
 * 由状态推导六项读数。
 * @param {object} state lesson state
 * @returns {{depth:number,speed:number,height:number,wavelength:number,period:number,green:number}}
 */
export function computeMetrics(state) {
  const { deepDepthM, periodSec } = state.params;
  const c = waveSpeed(deepDepthM); // m/s
  return {
    depth: deepDepthM,
    speed: c * 3.6, // km/h
    height: state.bathy.H(795), // 近岸 h=10m 处波高（米），Green 定律推得
    wavelength: waveLength(deepDepthM, periodSec) / 1000, // km
    period: periodSec / 60, // min
    green: greenFactor(deepDepthM, NEAR_DEPTH_M),
  };
}

/** 每个读数卡的显示文本（含单位）。 */
export function formatMetric(key, m) {
  switch (key) {
    case 'depth':
      return int(m.depth);
    case 'speed':
      return fixed(m.speed, 1);
    case 'height':
      return fixed(m.height, 2);
    case 'wavelength':
      return fixed(m.wavelength, 1);
    case 'period':
      return int(m.period);
    case 'green':
      return fixed(m.green, 2);
    default:
      return '–';
  }
}

/**
 * 渲染读数。返回是否发生了写入（供测试/调试）。
 * @param {object} refs renderShell 的引用
 * @param {object} state lesson state
 */
export function renderReadouts(refs, state) {
  const m = computeMetrics(state);
  const focus = CHAPTERS[state.chapterIndex]?.readoutFocus ?? null;
  let wrote = false;
  for (const { el, v } of refs.readouts) {
    const key = el.dataset.key;
    const text = formatMetric(key, m);
    if (v.textContent !== text) {
      v.textContent = text;
      wrote = true;
    }
    const wantFocus = key === focus;
    if (el.classList.contains('focus') !== wantFocus) {
      el.classList.toggle('focus', wantFocus);
    }
  }
  return wrote;
}
