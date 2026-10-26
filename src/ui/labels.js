// src/ui/labels.js
// 三维场景内的锚定标签：DOM 胶囊随相机投影移动（避免 canvas 内文字模糊）。
// 每章只保留 2–3 个必要标签，数值标签与物理函数同源。

import { CHAPTERS } from '../content/chapters.js';
import { depthToY, landToY, Z_HALF } from '../scene/coords.js';

const Z_FRONT = Z_HALF + 0.25; // 标签贴在剖切面前缘
import { depthAt } from '../physics/bathymetry.js';
import { waveSpeed, waveLength } from '../physics/tsunami.js';
import { int, fixed } from './format.js';

/**
 * 每章的标签锚点（xKm, 世界 Y, 世界 Z）。y 用世界坐标而非米，便于贴住几何体。
 * @param {object} state
 */
export function labelSpecs(state) {
  const i = state.chapterIndex;
  const deep = state.params.deepDepthM;
  const c = waveSpeed(deep);

  if (i === 0) {
    const bedAt = (km) => depthToY(depthAt(km, deep));
    return [
      { text: '俯冲板片', xKm: 624, y: bedAt(624) - 0.25, z: Z_FRONT },
      { text: '逆断层', xKm: 690, y: bedAt(690) + 0.75, z: Z_FRONT },
      { text: `海底抬升 ${fixed(state.params.upliftM, 2)} m（教学参数）`, xKm: 752, y: bedAt(752) + 1.15, z: 1.0, accent: true },
    ];
  }
  if (i === 1) {
    return [
      { text: '整根水柱一起参与', xKm: 560, y: -1.7, z: 0.6, accent: true },
      { text: '海面', xKm: 300, y: 0.32, z: Z_FRONT },
    ];
  }
  if (i === 2) {
    return [
      { text: `深海 h = ${int(deep)} m`, xKm: 200, y: 0.5, z: Z_FRONT },
      { text: `c = ${fixed(c * 3.6, 0)} km/h`, xKm: 430, y: 0.5, z: 1.1, accent: true },
      { text: `λ = ${fixed(waveLength(deep, state.params.periodSec) / 1000, 0)} km`, xKm: 660, y: 0.5, z: Z_FRONT },
    ];
  }
  if (i === 3) {
    return [
      { text: '地震波：先到', xKm: 300, y: 0.9, z: 1.2, accent: true },
      { text: '海啸波：随后', xKm: 640, y: 0.5, z: Z_FRONT },
      { text: '300 km 同程假设', xKm: 470, y: -0.65, z: Z_FRONT },
    ];
  }
  if (i === 4) {
    return [
      { text: `深 ${int(deep)} m`, xKm: 640, y: 0.55, z: Z_FRONT },
      { text: '浅 10 m', xKm: 790, y: 0.4, z: 1.1, accent: true },
    ];
  }
  if (i === 5) {
    return [
      { text: '可能先退 ≠ 必定先退', xKm: 786, y: 0.75, z: 1.0, accent: true },
    ];
  }
  if (i === 6) {
    return [
      { text: '第 1 / 3 波', xKm: 826, y: landToY(826) + 1.5, z: 0.8, accent: true },
      { text: '淹没范围：概念示意', xKm: 852, y: landToY(852) + 0.9, z: Z_FRONT },
    ];
  }
  return [];
}

let mountedChapter = -1;
let mountedVisible = null;
let pills = [];

/** 章节或可见性变化时重建胶囊。 */
function rebuild(refs, state) {
  const host = refs.stageLabels;
  host.innerHTML = '';
  pills = [];
  if (!state.labelsVisible) return;
  for (const spec of labelSpecs(state)) {
    const el = document.createElement('span');
    el.className = 'label-pill' + (spec.accent ? ' accent' : '');
    el.textContent = spec.text;
    host.appendChild(el);
    pills.push({ el, spec });
  }
}

/**
 * 每帧更新投影位置。控制器不可用时清空。
 * @param {object} refs
 * @param {object|null} controller
 * @param {object} state
 */
export function updateLabels(refs, controller, state) {
  if (!controller || !controller.ok) {
    if (pills.length) {
      refs.stageLabels.innerHTML = '';
      pills = [];
    }
    mountedChapter = -1;
    return;
  }
  if (state.chapterIndex !== mountedChapter || state.labelsVisible !== mountedVisible) {
    mountedChapter = state.chapterIndex;
    mountedVisible = state.labelsVisible;
    rebuild(refs, state);
  }
  const w = refs.stageLabels.clientWidth;
  const h = refs.stageLabels.clientHeight;
  for (const { el, spec } of pills) {
    const p = controller.project(spec.xKm, spec.y, spec.z);
    if (!p.visible || p.x < -80 || p.x > w + 80) {
      el.style.opacity = '0';
      continue;
    }
    el.style.opacity = '1';
    const x = Math.min(Math.max(p.x, 64), Math.max(64, w - 64));
    const y = Math.min(Math.max(p.y, 46), Math.max(46, h - 46));
    el.style.transform = `translate(-50%, -120%) translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
  }
}

/** 强制下次重建（章节目录变化或重试场景时）。 */
export function invalidateLabels() {
  mountedChapter = -1;
  mountedVisible = null;
}

/** 当前章节是否有标签（供测试）。 */
export function chapterHasLabels(index) {
  return Boolean(CHAPTERS[index] && CHAPTERS[index].labels.length);
}
