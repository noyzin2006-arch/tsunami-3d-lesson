// src/scene/cameraRig.js
// 七章相机关键帧 + 有限拖拽运镜 + 复位。
//
// 关键帧用"目标点 + 距离 + 仰角 + 方位角"表达，而不是直接写世界坐标：
// 前者能保证每一章都是同一个立体剖面视角下的不同取景，不会因为手调坐标把俯角弄丢。
import * as THREE from 'three';
import { xKmToX } from './coords.js';

const D2R = Math.PI / 180;

/** target: [xKm, yWorld]；dist 世界单位；elev/azim 角度（仰角=离水平面）。*/
const KEYS = [
  { target: [716, -2.0], dist: 16.2, elev: 14, azim: -11 },  // 1 断层错动
  { target: [700, -1.9], dist: 13.2, elev: 11, azim: -10 },  // 2 整根水柱
  { target: [430, -1.9], dist: 17.4, elev: 14, azim: -9 },   // 3 深海快而低
  { target: [520, -1.8], dist: 19.0, elev: 17, azim: -8 },   // 4 地震波 vs 海啸波
  { target: [752, -2.0], dist: 11.8, elev: 16, azim: -11 },  // 5 陆架浅化
  { target: [786, -1.4], dist: 11.2, elev: 19, azim: -12 },  // 6 岸线先退
  { target: [790, -1.2], dist: 10.8, elev: 23, azim: -12 },  // 7 多波上岸
];
const DUR = 0.9;

const AZIM_LIMIT = 26 * D2R;
const ELEV_MIN = 5 * D2R;
const ELEV_MAX = 46 * D2R;

function ease(t) {
  return t * t * (3 - 2 * t);
}

/** 由 {target, dist, elev, azim} 生成相机位姿。窄画布时按宽高比自动后退，保证横向内容不丢。 */
function poseOf(k, dAzim = 0, dElev = 0, aspect = 1.95) {
  const target = new THREE.Vector3(xKmToX(k.target[0]), k.target[1], 0);
  const elev = THREE.MathUtils.clamp(k.elev * D2R + dElev, ELEV_MIN, ELEV_MAX);
  const azim = THREE.MathUtils.clamp(k.azim * D2R + dAzim, -AZIM_LIMIT, AZIM_LIMIT);
  // 竖屏（如 390×844）视野变窄，机位后退，避免只看到剖面的一小块
  const backoff = Math.max(1, 1.2 / Math.max(0.45, aspect));
  const dist = k.dist * backoff;
  const h = dist * Math.cos(elev);
  const pos = new THREE.Vector3(
    target.x + h * Math.sin(azim),
    target.y + dist * Math.sin(elev),
    h * Math.cos(azim)
  );
  return { pos, target };
}

export function createCameraRig(camera) {
  const from = { pos: new THREE.Vector3(), target: new THREE.Vector3() };
  const to = { pos: new THREE.Vector3(), target: new THREE.Vector3() };
  const cur = { pos: new THREE.Vector3(), target: new THREE.Vector3() };
  let animT = 1;
  let lastChapter = -1;
  let dAzim = 0;
  let dElev = 0;
  let lastReset = 0;
  let inited = false;

  function setKey(i) {
    const k = KEYS[Math.max(0, Math.min(KEYS.length - 1, i))];
    const p = poseOf(k, 0, 0, camera.aspect);
    to.pos.copy(p.pos);
    to.target.copy(p.target);
    if (!inited) {
      cur.pos.copy(p.pos);
      cur.target.copy(p.target);
      from.pos.copy(p.pos);
      from.target.copy(p.target);
      inited = true;
      animT = 1;
      return;
    }
    from.pos.copy(cur.pos);
    from.target.copy(cur.target);
    animT = 0;
  }

  function update(state, dt) {
    const i = state.chapterIndex;
    if (state.cameraResetNonce !== lastReset) {
      dAzim = 0; dElev = 0;
      lastReset = state.cameraResetNonce;
    }
    if (i !== lastChapter) {
      // 章节切换时才重设关键帧；拖拽偏移保留，避免切章后视角突然跳回
      setKey(i);
      lastChapter = i;
    }
    if (!inited) setKey(i);

    const reduced = state.reducedMotion;
    if (reduced) {
      animT = 1;
    } else {
      animT = Math.min(1, animT + dt / DUR);
    }
    const e = ease(animT);

    const k = KEYS[Math.max(0, Math.min(KEYS.length - 1, i))];
    const dest = poseOf(k, dAzim, dElev, camera.aspect);

    cur.pos.lerpVectors(from.pos, dest.pos, e);
    cur.target.lerpVectors(from.target, dest.target, e);

    camera.position.copy(cur.pos);
    camera.lookAt(cur.target);
  }

  function applyDrag(dx, dy) {
    dAzim = THREE.MathUtils.clamp(dAzim - dx * 0.004, -AZIM_LIMIT, AZIM_LIMIT);
    dElev = THREE.MathUtils.clamp(dElev - dy * 0.003, -6 * D2R, 30 * D2R);
  }
  function reset() { dAzim = 0; dElev = 0; }

  return { update, applyDrag, reset };
}
