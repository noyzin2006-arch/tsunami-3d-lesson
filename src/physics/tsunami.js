// src/physics/tsunami.js
// 海啸教学物理纯函数（零 DOM 依赖，可在 node --test 与浏览器共用）。
// 所有数值均由公式推导，页面读数必须与这些函数同源。
//
// 重要边界（教学模型，非真实海啸数值预报）：
//  - 这是 1D 缓变介质中的长波教学波列，不含折射/反射/方向性/非线性破碎/摩擦/真实海岸地形。
//  - c = √(g·h) 是波形传播的相速度，不是水粒子的流速。
//  - 初始波高 H0 是人为设置的教学比例（0.25 × uplift/1.5），不是从实际断层位错反演的震源解。
//  - Green 定律只在 h≥10m 使用，绝不延伸到 h→0（发散）。

export const GRAVITY = 9.81; // m/s²

/** 默认海盆近岸（最浅可见）水深，单位 m。 */
export const NEAR_DEPTH_M = 10;

/** 默认物理参数。upliftM 改变时 initialWaveHeightM 随之按比例映射。 */
export function makeParams(overrides = {}) {
  const upliftM = overrides.upliftM ?? 1.5;
  const deepDepthM = overrides.deepDepthM ?? 4000;
  const periodSec = overrides.periodSec ?? 600;
  const phaseMode = overrides.phaseMode ?? 'trough-first';
  const packetCount = overrides.packetCount ?? 3;
  const initialWaveHeightM = overrides.initialWaveHeightM ?? 0.25 * (upliftM / 1.5);
  return {
    deepDepthM,
    upliftM,
    initialWaveHeightM,
    periodSec,
    phaseMode, // 'trough-first' | 'crest-first'
    packetCount,
  };
}

/** 断言数值有限且为正；否则抛 RangeError（UI 捕获后钳制恢复默认值）。 */
function assertPositive(value, name) {
  if (!Number.isFinite(value) || value <= 0) {
    throw new RangeError(`${name} 必须为有限正数，收到：${value}`);
  }
  return value;
}

/**
 * 长波相速度 c = √(g·h)，单位 m/s。
 * @param {number} depthM 水深（米），必须 > 0。
 */
export function waveSpeed(depthM) {
  assertPositive(depthM, 'depthM');
  return Math.sqrt(GRAVITY * depthM);
}

/**
 * 波长 λ = c·T，单位 m。
 * @param {number} depthM 水深（米）
 * @param {number} periodSec 周期（秒）
 */
export function waveLength(depthM, periodSec) {
  assertPositive(depthM, 'depthM');
  assertPositive(periodSec, 'periodSec');
  return waveSpeed(depthM) * periodSec;
}

/**
 * Green 定律波高比 H(h1)/H(h0) = (h0/h1)^(1/4)。
 * @param {number} h0 参考水深（米）
 * @param {number} h1 目标水深（米）
 */
export function greenFactor(h0, h1) {
  assertPositive(h0, 'h0');
  assertPositive(h1, 'h1');
  return Math.pow(h0 / h1, 0.25);
}

/**
 * 由 Green 定律求目标水深处的波高。
 * H(h1) = H0 · (h0/h1)^(1/4)。
 * @param {number} initialHeightM H0（米），必须 ≥ 0
 * @param {number} h0 参考水深（米）
 * @param {number} h1 目标水深（米）
 */
export function waveHeightAtDepth(initialHeightM, h0, h1) {
  if (!Number.isFinite(initialHeightM) || initialHeightM < 0) {
    throw new RangeError(`initialHeightM 必须为有限非负数，收到：${initialHeightM}`);
  }
  assertPositive(h0, 'h0');
  assertPositive(h1, 'h1');
  return initialHeightM * Math.pow(h0 / h1, 0.25);
}

/**
 * 沿距离的数值积分传播时间（梯形法），单位秒。
 * 时间 = Σ segmentM · (1/c0 + 1/c1)/2 ；segmentM = stepKm·1000，c 由水深换算 c=√(g·h)，单位 m/s。
 * @param {number} startKm 起点（千米）
 * @param {number} endKm 终点（千米）
 * @param {(xKm:number)=>number} lookup 由 xKm 返回水深（米）的函数
 * @param {number} stepKm 积分步长（千米），默认 0.5
 */
export function travelTimeKm(startKm, endKm, lookup, stepKm = 0.5) {
  if (!Number.isFinite(startKm) || !Number.isFinite(endKm)) {
    throw new RangeError('startKm / endKm 必须为有限数');
  }
  if (!Number.isFinite(stepKm) || stepKm <= 0) {
    throw new RangeError('stepKm 必须为有限正数');
  }
  if (typeof lookup !== 'function') {
    throw new RangeError('lookup 必须是函数');
  }
  const dir = endKm >= startKm ? 1 : -1;
  const total = Math.abs(endKm - startKm);
  const n = Math.max(1, Math.round(total / stepKm));
  const realStep = total / n; // 实际步长（千米），保证正好抵达 endKm
  let t = 0;
  let x = startKm;
  for (let i = 0; i < n; i++) {
    const x0 = x;
    const x1 = x + dir * realStep;
    const h0 = lookup(x0);
    const h1 = lookup(x1);
    if (!Number.isFinite(h0) || !Number.isFinite(h1) || h0 <= 0 || h1 <= 0) {
      throw new RangeError(`lookup 在 ${x0}..${x1} km 返回了非正/非有限水深`);
    }
    const c0 = waveSpeed(h0);
    const c1 = waveSpeed(h1);
    const segmentM = realStep * 1000;
    t += (segmentM / 2) * (1 / c0 + 1 / c1);
    x = x1;
  }
  return t;
}

/**
 * 地震波与海啸波到达同一 300km 假设距离的时间对比（纯理想化教学对比，非真实预警窗口）。
 * @param {number} depthM 均匀深水水深（米）
 * @param {number} distanceKm 假设同程距离，默认 300
 * @param {number} seismicSpeedKmSec 假设地震波（P 波）速度，默认 6 km/s
 * @returns {{seismicSec:number, tsunamiSec:number, gapSec:number}}
 */
export function compareArrival(depthM, distanceKm = 300, seismicSpeedKmSec = 6) {
  assertPositive(depthM, 'depthM');
  assertPositive(distanceKm, 'distanceKm');
  assertPositive(seismicSpeedKmSec, 'seismicSpeedKmSec');
  const seismicSec = distanceKm / seismicSpeedKmSec;
  const c = waveSpeed(depthM); // m/s
  const tsunamiSec = (distanceKm * 1000) / c;
  return {
    seismicSec,
    tsunamiSec,
    gapSec: tsunamiSec - seismicSec,
  };
}

// —— 教学波列（仅用于海面顶点位移与读数；不是 N-S 求解，不是真实预报）——

const SIGMA_FACTOR = 1 / 6; // sigma = T/6

function gaussian(a, sigma) {
  return Math.exp(-0.5 * (a / sigma) * (a / sigma));
}

/**
 * 海面垂向位移 η(x, t)（米），教学长波波列。
 *
 * @param {number} xKm 沿传播方向距离（千米，0=外海，800=海岸）
 * @param {number} tSec 模拟时间（秒）
 * @param {object} params 物理参数（makeParams 产物）
 * @param {object} env 海盆环境：{ hAt(xKm)->m, tauAt(xKm)->s, H(xKm)->m }
 *   hAt 不得在 x>800（陆地）调用；env 由 bathymetry 提供。
 * @returns {number} 位移（米），显示幅度已钳制到 ±A（仅视觉，数据卡仍用 H）
 */
export function waveElevation(xKm, tSec, params, env, opts = {}) {
  if (typeof env !== 'object' || env === null) {
    throw new RangeError('waveElevation 需要 env（hAt/tauAt/H）');
  }
  const { hAt, tauAt, H } = env;
  if (typeof hAt !== 'function' || typeof tauAt !== 'function' || typeof H !== 'function') {
    throw new RangeError('env 必须提供 hAt/tauAt/H 函数');
  }
  const T = assertPositive(params.periodSec, 'periodSec');
  const sigma = T * SIGMA_FACTOR;
  const h = hAt(xKm);
  if (!Number.isFinite(h) || h <= 0) {
    throw new RangeError(`x=${xKm} 处水深非法（陆地或无效）`);
  }
  // 仅渲染用：给空间波长设下限，避免近岸 λ→0 时波峰被压成一根针。
  // 物理读数（H、λ、c）不受影响，仍由各自函数按真实水深给出。
  let sig = sigma;
  const minL = opts.minWavelengthKm ?? 0;
  if (minL > 0) {
    const sigFloor = (minL * 1000) / waveSpeed(h);
    if (sigFloor > sig) sig = sigFloor;
  }
  const A = H(xKm) / 2; // 振幅
  const tau = tauAt(xKm);
  const r = tSec - tau;
  // 波列尚未抵达
  if (r < -3 * sig) return 0;

  const weights = [0.78, 1, 0.66];
  let sum = 0;
  for (let j = 0; j < weights.length; j++) {
    const aj = r - (60 + j * T);
    // 先到波谷：中心为负高斯（波谷），半周期后为正高斯（波峰）
    sum += weights[j] * (-gaussian(aj, sig) + gaussian(aj - T / 2, sig));
  }
  let eta = A * sum;
  if (params.phaseMode === 'crest-first') eta = -eta;

  // 仅视觉钳制；数据卡理论波高仍用 H(x)
  if (eta > A) eta = A;
  if (eta < -A) eta = -A;
  return eta;
}
