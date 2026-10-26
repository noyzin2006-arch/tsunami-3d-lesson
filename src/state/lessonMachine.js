// src/state/lessonMachine.js
// 课程状态机：纯 reducer，所有时间更新只经 dispatch。
// 不依赖 DOM / Three；可在 node --test 单独验证。

import { makeParams } from '../physics/tsunami.js';
import { makeBathymetry, chapterForTime } from '../physics/bathymetry.js';

export const SIM_SECONDS_PER_WALL = 80; // 1× 倍速：80 模拟秒 / 现实秒
export const CHAPTER_COUNT = 7;

/** 参数合法范围（UI 钳制边界）。 */
export const PARAM_RANGES = {
  deepDepthM: { min: 2000, max: 6000, step: 500 },
  upliftM: { min: 0.5, max: 3.0, step: 0.25 },
};

/** 钳制到合法范围并修正 initialWaveHeightM（随 uplift 比例）。 */
export function clampParams(partial) {
  const p = { ...makeParams(), ...partial };
  p.deepDepthM = Math.min(PARAM_RANGES.deepDepthM.max, Math.max(PARAM_RANGES.deepDepthM.min, p.deepDepthM));
  p.upliftM = Math.min(PARAM_RANGES.upliftM.max, Math.max(PARAM_RANGES.upliftM.min, p.upliftM));
  p.initialWaveHeightM = 0.25 * (p.upliftM / 1.5);
  p.periodSec = p.periodSec || 600;
  if (p.phaseMode !== 'crest-first') p.phaseMode = 'trough-first';
  return p;
}

export function createInitialState(partialParams = {}) {
  const params = clampParams(partialParams);
  const bathy = makeBathymetry(params);
  return {
    chapterIndex: 0,
    playing: false,
    rate: 1,
    simTimeSec: 0, // = cuts[0]
    params,
    bathy,
    cuts: bathy.cuts,
    webglStatus: 'idle', // idle|loading|ready|error|cancelled
    phaseOverlay: false,
    labelsVisible: true,
    reducedMotion: false,
    activeToast: null,
    dragActive: false,
    cameraResetNonce: 0,
  };
}

/** 在保留章内归一化进度的前提下，用新 cuts 重定位 simTimeSec。 */
function remapTime(oldCuts, newCuts, oldTime, chapterIndex) {
  const i = Math.min(chapterIndex, newCuts.length - 2);
  const lo = oldCuts[i];
  const hi = oldCuts[i + 1];
  const span = hi - lo;
  const f = span > 0 ? (oldTime - lo) / span : 0;
  const nf = Math.min(1, Math.max(0, f));
  return newCuts[i] + nf * (newCuts[i + 1] - newCuts[i]);
}

/** 纯 reducer。不修改入参，返回新状态。 */
export function reducer(state, action) {
  switch (action.type) {
    case 'PLAY':
      // 已到末尾则从头播放
      if (state.simTimeSec >= state.cuts[state.cuts.length - 1]) {
        return { ...state, playing: true, simTimeSec: state.cuts[0], chapterIndex: 0 };
      }
      return { ...state, playing: true, activeToast: null };

    case 'PAUSE':
      return { ...state, playing: false };

    case 'TOGGLE':
      return reducer(state, { type: state.playing ? 'PAUSE' : 'PLAY' });

    case 'CHAPTER_SET': {
      const i = Math.min(Math.max(0, action.index | 0), CHAPTER_COUNT - 1);
      return { ...state, chapterIndex: i, simTimeSec: state.cuts[i], playing: state.playing };
    }

    case 'CHAPTER_NEXT': {
      const i = Math.min(state.chapterIndex + 1, CHAPTER_COUNT - 1);
      return { ...state, chapterIndex: i, simTimeSec: state.cuts[i] };
    }

    case 'CHAPTER_PREV': {
      const i = Math.max(state.chapterIndex - 1, 0);
      return { ...state, chapterIndex: i, simTimeSec: state.cuts[i] };
    }

    case 'PARAM_DEPTH':
    case 'PARAM_UPLIFT': {
      const key = action.type === 'PARAM_DEPTH' ? 'deepDepthM' : 'upliftM';
      const nextParams = clampParams({ ...state.params, [key]: action.value });
      if (nextParams[key] === state.params[key] && nextParams.initialWaveHeightM === state.params.initialWaveHeightM) {
        // 无变化（被钳制到原值）
        return state;
      }
      const oldCuts = state.cuts;
      const oldTime = state.simTimeSec;
      const oldChapter = state.chapterIndex;
      const bathy = makeBathymetry(nextParams);
      const newTime = remapTime(oldCuts, bathy.cuts, oldTime, oldChapter);
      return {
        ...state,
        params: nextParams,
        bathy,
        cuts: bathy.cuts,
        simTimeSec: newTime,
        chapterIndex: chapterForTime(bathy.cuts, newTime),
      };
    }

    case 'PHASE_SET': {
      const phaseMode = action.mode === 'crest-first' ? 'crest-first' : 'trough-first';
      if (phaseMode === state.params.phaseMode) return state;
      return { ...state, params: { ...state.params, phaseMode } };
    }

    case 'RATE_SET': {
      const rate = action.rate === 2 ? 2 : 1;
      return { ...state, rate };
    }

    case 'CAMERA_RESET':
      return { ...state, cameraResetNonce: state.cameraResetNonce + 1 };

    case 'TICK': {
      if (!state.playing) return state;
      const dtWall = Math.min(action.dtSec, 0.05); // 失焦瞬间钳制，避免时间突进
      const newTime = state.simTimeSec + dtWall * state.rate * SIM_SECONDS_PER_WALL;
      const end = state.cuts[state.cuts.length - 1];
      if (newTime >= end) {
        return { ...state, simTimeSec: end, chapterIndex: CHAPTER_COUNT - 1, playing: false };
      }
      const chapterIndex = chapterForTime(state.cuts, newTime);
      return { ...state, simTimeSec: newTime, chapterIndex };
    }

    case 'WEBGL_READY':
      return { ...state, webglStatus: 'ready', activeToast: null };

    case 'WEBGL_ERROR':
      return { ...state, webglStatus: 'error' };

    case 'RETRY':
      return { ...state, webglStatus: 'loading' };

    case 'CANCEL':
      return { ...state, webglStatus: 'cancelled', playing: false };

    case 'SET_LABELS':
      return { ...state, labelsVisible: action.visible };

    case 'MOTION_SET':
      return { ...state, reducedMotion: Boolean(action.reduced) };

    default:
      return state;
  }
}
