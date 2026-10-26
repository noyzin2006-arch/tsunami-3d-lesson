// src/scene/waterColumn.js
// 全水柱示意粒子（8 列 × 8 层 = 64 实例）。第 2 章显形，演示整根水柱同步向岸水平运动。
// 这是教学示意（非质点流速数值），幅度已限制并标注放大。
import * as THREE from 'three';
import { waveElevation } from '../physics/tsunami.js';
import { xKmToX, etaToY, depthToY, X_KM_MAX } from './coords.js';
import { color } from './palette.js';

const NX = 8, NZ = 8;

export function buildWaterColumn() {
  const total = NX * NZ;
  const geo = new THREE.SphereGeometry(0.07, 10, 8);
  const mat = new THREE.MeshStandardMaterial({
    color: color('accent'), emissive: color('accent'), emissiveIntensity: 0.25, roughness: 0.4,
  });
  const mesh = new THREE.InstancedMesh(geo, mat, total);
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  mesh.visible = false;
  mesh.name = 'water-column';

  // 预存每个粒子的 (xKm, 深度比例)
  const info = [];
  for (let i = 0; i < NX; i++) {
    const xKm = 120 + (i / (NX - 1)) * (720 - 120);
    for (let j = 0; j < NZ; j++) {
      const depthFrac = j / (NZ - 1); // 0 表层 → 1 近床
      info.push({ xKm, depthFrac });
    }
  }

  const dummy = new THREE.Object3D();

  function update(state) {
    if (!mesh.visible) return;
    const t = state.simTimeSec;
    const params = state.params;
    const env = { hAt: state.bathy.hAt, tauAt: state.bathy.tauAt, H: state.bathy.H };
    for (let k = 0; k < total; k++) {
      const { xKm, depthFrac } = info[k];
      const h = env.hAt(xKm);
      const bedY = depthToY(h);
      let eta = 0;
      try { eta = waveElevation(xKm, t, params, env, { minWavelengthKm: 9 }); } catch (e) { eta = 0; }
      // 表层跟随海面，深层略小
      const y = etaToY(eta) * (1 - 0.25 * depthFrac) + bedY * 0.92 * depthFrac;
      // 教学水平摆动：整根水柱大致同步，幅度受限
      const sway = Math.max(-0.4, Math.min(0.4, 0.14 * eta * (1 - 0.3 * depthFrac)));
      dummy.position.set(xKmToX(xKm) + sway, y, 0);
      dummy.scale.setScalar(1);
      dummy.updateMatrix();
      mesh.setMatrixAt(k, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }

  return { mesh, update, setVisible(v) { mesh.visible = v; } };
}
