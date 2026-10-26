// src/scene/shore.js
// 第 7 章：沿岸概念淹没遮罩 + 建筑轮廓。
// 只表达"淹没范围是概念示意"，绝不输出真实淹没距离、到达时间或灾损。
import * as THREE from 'three';
import { xKmToX, landToY, Z_HALF } from './coords.js';
import { color } from './palette.js';

const REACH_KM = 55;      // 概念遮罩的最大内陆延伸（教学示意，不是预报）
const RIBBON_COLS = 28;

export function buildShore() {
  const group = new THREE.Group();
  group.name = 'shore-group';
  group.visible = false;

  /* —— 建筑轮廓：真实比例（每栋约 0.15 世界单位 ≈ 6km 的示意体量，仅作地标） —— */
  const bMat = new THREE.MeshStandardMaterial({ color: '#C9BFA6', roughness: 0.85 });
  const buildings = new THREE.Group();
  const SITES = [
    [812, -1.1, 0.20], [821, -0.4, 0.30], [830, 0.5, 0.24],
    [838, -1.2, 0.34], [846, 0.2, 0.22], [855, -0.6, 0.28],
    [863, 1.0, 0.18], [871, -0.9, 0.26],
  ];
  for (const [xKm, z, h] of SITES) {
    const w = 0.15;
    const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, w), bMat);
    b.position.set(xKmToX(xKm), landToY(xKm) + h / 2, z * Z_HALF * 0.7);
    buildings.add(b);
  }
  group.add(buildings);

  /* —— 概念淹没遮罩：贴合陆面的带状面，随波包推进/退回 —— */
  const pos = new Float32Array(RIBBON_COLS * 2 * 3);
  const idx = [];
  for (let i = 0; i < RIBBON_COLS - 1; i++) {
    const a = i * 2;
    idx.push(a, a + 1, a + 2, a + 2, a + 1, a + 3);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setIndex(idx);
  const mat = new THREE.MeshBasicMaterial({
    color: color('hazard'),
    transparent: true,
    opacity: 0.3,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const overlay = new THREE.Mesh(geo, mat);
  overlay.frustumCulled = false;
  overlay.renderOrder = 3;
  group.add(overlay);

  let reachNow = -1;

  function drawRibbon(reachKm) {
    if (Math.abs(reachKm - reachNow) < 0.05) return;
    reachNow = reachKm;
    const arr = geo.attributes.position.array;
    const zNear = Z_HALF * 0.82;
    for (let i = 0; i < RIBBON_COLS; i++) {
      const xKm = 800 + (i / (RIBBON_COLS - 1)) * REACH_KM;
      const shown = xKm <= 800 + reachKm;
      const X = xKmToX(shown ? xKm : 800 + reachKm);
      const Y = landToY(shown ? xKm : 800 + reachKm) + 0.035;
      arr[i * 6] = X; arr[i * 6 + 1] = Y; arr[i * 6 + 2] = zNear;
      arr[i * 6 + 3] = X; arr[i * 6 + 4] = Y; arr[i * 6 + 5] = -zNear;
    }
    geo.attributes.position.needsUpdate = true;
  }

  function update(state) {
    if (!group.visible) return;
    const localT = state.chapterIndex === 6
      ? Math.max(0, state.simTimeSec - state.cuts[6])
      : 0;
    // 三波列：每个波包推进一步再退回，第三个波包走得最远
    const cycle = 300;
    const k = Math.floor(localT / cycle);
    const phase = (localT % cycle) / cycle;
    const surge = Math.max(0, Math.sin(phase * Math.PI));       // 0→1→0
    const amplitude = 0.55 + 0.12 * Math.min(3, k);             // 后续波列更强
    const reachKm = Math.min(REACH_KM, surge * REACH_KM * amplitude);
    drawRibbon(Math.max(0.4, reachKm));
    mat.opacity = 0.16 + 0.2 * surge;
  }

  return { group, update, setVisible(v) { group.visible = v; } };
}
