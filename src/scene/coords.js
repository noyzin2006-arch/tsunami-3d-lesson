// src/scene/coords.js
// 物理坐标(xKm) ↔ 三维世界坐标(X) 的统一映射；海床/陆地/海面的垂直标尺（刻意非等比）。
//
// 垂直标尺说明（必须与页面声明一致）：
//  - 海床深度用幂函数压缩，使 2000–6000m 的水深差异在画面里可辨；
//  - 海面波高不用“米 × 固定系数”，而按当地波高做归一化夸张：
//    深海 0.25m 的隆起仍可见，近岸 1.1m 的波高再放大到约 0.45 世界单位。
//    这只影响观感，读数与判定始终用 physics 的真实米值。

export const X_KM_MAX = 800;      // 海岸（教学）位于 800km
export const X_KM_LAND = 1010;    // 陆地延展至 1010km（让陆面读成平原，而不是一堵窄墙）
export const X_WORLD_MIN = -9;    // x=0km 对应 X
export const X_WORLD_MAX = 13.72; // x=1010km 对应 X
export const Z_HALF = 2.1;        // 海盆横向半宽（收成剖面沙盘，但保留立体厚度）
export const SEABED_REF = 4000;   // 海床 Y 公式参考水深

/** 剖切块底界：地壳有统一基底，避免陆块与深海之间露出一条悬空的缝。 */
export const SLAB_FLOOR = -5.65;

/** 地壳底界（世界 Y）：至少留 1.15 的厚度，且不高于统一基底。 */
export function slabBottomY(topY) {
  return Math.min(topY - 1.15, SLAB_FLOOR);
}

/** 深海波高为参考值时的可视振幅（世界单位）。 */
export const VIS_AMP_DEEP = 0.26;

export function xKmToX(xKm) {
  return (xKm / X_KM_MAX) * 18 - 9;
}
export function xWorldToKm(x) {
  return ((x + 9) / 18) * X_KM_MAX;
}

function smoothstep(s) {
  if (s <= 0) return 0;
  if (s >= 1) return 1;
  return s * s * (3 - 2 * s);
}

/** 海床世界 Y（垂直标尺，非真实高程）。h=4000m → -6.45；h=10m → -1.58。 */
export function depthToY(h) {
  const t = Math.max(h, 1) / SEABED_REF;
  // 0.4 次幂：4000m → -4.50，200m → -1.65，10m → -0.92。
  // 比 0.34 更平缓，使陆坡在 14 倍垂直夸张下仍是"坡"而不是"崖"。
  return -(0.6 + 3.9 * Math.pow(t, 0.4));
}

/** 陆地世界 Y（右侧，x>800km）。海岸低平，向内陆缓升。 */
export function landToY(xKm) {
  if (xKm <= X_KM_MAX) return 0;
  return 0.03 + 0.68 * smoothstep((xKm - X_KM_MAX) / 100);
}

/**
 * 海面垂向位移 → 世界 Y。
 * 归一化夸张：形状与物理同源（eta/A 的无量纲形状不变），振幅按当地波高的 0.62 次幂放大。
 * @param {number} etaM 位移（米）
 * @param {number} hLocalM 当地波高 H(x)（米），不是水深
 * @param {number} h0M 深海参考波高 H0（米）
 */
export function etaToYVisual(etaM, hLocalM, h0M) {
  const Hl = Math.max(hLocalM, 0.02);
  const ratio = Hl / Math.max(h0M, 1e-6);
  // 上限 0.44：近岸水深只有约 0.9 世界单位，再高就会把水面顶穿成一座山
  const ampWorld = Math.min(0.44, VIS_AMP_DEEP * Math.pow(ratio, 0.5));
  const A = Hl / 2;
  return (etaM / A) * ampWorld;
}

/** 兼容旧调用的线性映射（仅用于非波高的示意高度，如淹没遮罩）。 */
export function etaToY(etaM) {
  return etaM * 0.7;
}
