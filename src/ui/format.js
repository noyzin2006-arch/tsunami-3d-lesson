// src/ui/format.js
// 统一的数值格式化。所有读数只在此处决定小数字位，避免各卡片口径不一致。

/** 千分位整数。 */
export function int(n) {
  if (!Number.isFinite(n)) return '–';
  return Math.round(n).toLocaleString('zh-CN');
}

/** 固定小数位。 */
export function fixed(n, digits = 1) {
  if (!Number.isFinite(n)) return '–';
  return n.toFixed(digits);
}

/** 秒 → 分:秒（用于模拟时刻，非真实预警倒计时）。 */
export function clock(totalSec) {
  if (!Number.isFinite(totalSec)) return '–';
  const s = Math.max(0, Math.round(totalSec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, '0')}`;
}
