// src/physics/bathymetry.js
// 海盆几何（解释性模型，非真实某国海岸线）、传播时间表与章节锚点。
// 依赖 tsunami.js 的波速公式；本模块负责把“水深随 x 变化”落成可查表、可插值的纯数据。

import { waveSpeed, waveHeightAtDepth, NEAR_DEPTH_M } from './tsunami.js';

/** 海床分段边界（千米）。 */
export const X_DEEP_END = 620; // 0..620 为均匀深水
export const X_SLOPE_END = 795; // 620..795 平缓过渡
export const X_COAST = 800; // 795..800 维持近岸 10m；x>800 为陆地
export const X_MAX = 800;
export const STEP_KM = 0.5; // 时间表积分步长 / 采样步长
export const SAMPLE_COUNT = Math.floor(X_MAX / STEP_KM) + 1; // 1601

function smoothstep(s) {
  if (s <= 0) return 0;
  if (s >= 1) return 1;
  return s * s * (3 - 2 * s);
}

/**
 * 沿传播方向的水深（米）。x∈[0,800] 有效；x>800 为陆地，返回 0（禁止送入 c=√(gh)）。
 * @param {number} xKm 距外海距离（千米）
 * @param {number} deepDepthM 深海水深（米）
 */
export function depthAt(xKm, deepDepthM) {
  if (!Number.isFinite(xKm) || !Number.isFinite(deepDepthM) || deepDepthM <= 0) {
    throw new RangeError('depthAt 参数非法');
  }
  if (xKm >= X_SLOPE_END) return NEAR_DEPTH_M; // 795..800 维持 10m；x>800 也返回 10（陆地语义由调用方判定）
  if (xKm <= X_DEEP_END) return deepDepthM;
  const s = (xKm - X_DEEP_END) / (X_SLOPE_END - X_DEEP_END);
  const S = smoothstep(s);
  const h = Math.exp((1 - S) * Math.log(deepDepthM) + S * Math.log(NEAR_DEPTH_M));
  return Math.max(NEAR_DEPTH_M, h);
}

/**
 * 构建海盆环境（纯函数工厂）。参数变化时应重建一次（<100ms）。
 * @param {object} params 物理参数（makeParams 产物），需要 deepDepthM 与 initialWaveHeightM
 */
export function makeBathymetry(params) {
  const deepDepthM = params.deepDepthM;
  const initialWaveHeightM = params.initialWaveHeightM;

  // 采样水深表
  const hSamples = new Float64Array(SAMPLE_COUNT);
  for (let i = 0; i < SAMPLE_COUNT; i++) {
    hSamples[i] = depthAt(i * STEP_KM, deepDepthM);
  }

  // 梯形积分时间表 tau（秒）。段长 = 0.5km = 500m；dt = (500/2)(1/c0+1/c1)。
  const tau = new Float64Array(SAMPLE_COUNT);
  tau[0] = 0;
  for (let i = 1; i < SAMPLE_COUNT; i++) {
    const c0 = waveSpeed(hSamples[i - 1]);
    const c1 = waveSpeed(hSamples[i]);
    tau[i] = tau[i - 1] + (STEP_KM * 1000 / 2) * (1 / c0 + 1 / c1);
  }

  function indexOf(xKm) {
    const x = Math.min(Math.max(xKm, 0), X_MAX);
    return x / STEP_KM;
  }

  function hAt(xKm) {
    if (xKm > X_MAX) return 0; // 陆地
    const f = indexOf(xKm);
    const i = Math.floor(f);
    const frac = f - i;
    if (i >= SAMPLE_COUNT - 1) return hSamples[SAMPLE_COUNT - 1];
    return hSamples[i] * (1 - frac) + hSamples[i + 1] * frac;
  }

  function tauAt(xKm) {
    const clamped = Math.min(Math.max(xKm, 0), X_MAX);
    const f = clamped / STEP_KM;
    const i = Math.floor(f);
    const frac = f - i;
    if (i >= SAMPLE_COUNT - 1) return tau[SAMPLE_COUNT - 1];
    return tau[i] * (1 - frac) + tau[i + 1] * frac;
  }

  function H(xKm) {
    const h = hAt(xKm);
    if (h <= 0) return 0;
    return waveHeightAtDepth(initialWaveHeightM, deepDepthM, h);
  }

  /** 章节时间锚点（严格递增）。 */
  function buildCuts(periodSec) {
    const cuts = [
      0,
      90,
      240,
      tauAt(400),
      tauAt(610),
      tauAt(770),
      tauAt(790),
      tauAt(X_MAX) + 2 * periodSec,
    ];
    for (let i = 1; i < cuts.length; i++) {
      if (!(cuts[i] > cuts[i - 1])) {
        throw new RangeError(`章节锚点非严格递增：第 ${i} 项 ${cuts[i]} ≤ ${cuts[i - 1]}`);
      }
    }
    return cuts;
  }

  const cuts = buildCuts(params.periodSec);

  return {
    deepDepthM,
    initialWaveHeightM,
    periodSec: params.periodSec,
    hSamples,
    tau,
    hAt,
    tauAt,
    H,
    depthAt: (xKm) => depthAt(xKm, deepDepthM),
    cuts,
    rebuild(nextParams) {
      return makeBathymetry(nextParams);
    },
    buildCuts,
  };
}

/** 给定时间表与模拟时间，返回当前章节索引（0..6）。 */
export function chapterForTime(cuts, tSec) {
  let idx = 0;
  for (let i = 0; i < cuts.length; i++) {
    if (tSec >= cuts[i]) idx = i;
  }
  return Math.min(idx, 6);
}
