// src/scene/wavefronts.js
// 第 4 章：地震波前（快）与海啸波前（慢）对比示意。3D 为独立时间缩放的示意，
// 真实到达时间由 compareArrival 计算并在读数/标签展示，严禁冒充真实预警倒计时。
import * as THREE from 'three';
import { xKmToX } from './coords.js';
import { color } from './palette.js';

export function buildWavefronts() {
  const group = new THREE.Group();
  group.name = 'wavefront-group';
  group.visible = false;

  function makeRing(col) {
    const g = new THREE.RingGeometry(0.7, 0.95, 40);
    const m = new THREE.MeshBasicMaterial({ color: color(col), transparent: true, opacity: 0.85, side: THREE.DoubleSide, depthWrite: false });
    const ring = new THREE.Mesh(g, m);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.05;
    return ring;
  }
  const seismic = makeRing('accent');      // 地震波前（快）
  const tsunami = makeRing('warning');     // 海啸波前（慢）
  group.add(seismic, tsunami);

  // 线性标注：从震源（x=0）的竖直发光带
  const srcMat = new THREE.MeshBasicMaterial({ color: color('accent'), transparent: true, opacity: 0.5 });
  const src = new THREE.Mesh(new THREE.BoxGeometry(0.12, 4, 0.12), srcMat);
  src.position.set(xKmToX(0), -1.6, 0);
  group.add(src);

  function update(state) {
    if (!group.visible) return;
    const p = state.chapterIndex === 3
      ? Math.min(1, Math.max(0, (state.simTimeSec - state.cuts[3]) / (state.cuts[4] - state.cuts[3])))
      : (state.chapterIndex < 3 ? 0 : 1);
    const seis = Math.min(p / 0.45, 1);
    const tsu = Math.min(p / 0.9, 1);
    seismic.position.x = THREE.MathUtils.lerp(xKmToX(0), xKmToX(800), seis);
    tsunami.position.x = THREE.MathUtils.lerp(xKmToX(0), xKmToX(800), tsu);
    seismic.material.opacity = 0.85 * (1 - seis * 0.3);
    tsunami.material.opacity = 0.85 * (1 - tsu * 0.3);
  }

  return { group, update, setVisible(v) { group.visible = v; } };
}
