// src/scene/fault.js
// 俯冲带逆断层示意（第 1 章）：贴着海床画的上/下盘条带 + 断层面 + 抬升箭头。
// 几何随水深参数重算；抬升量与地形抬升同源，避免"模型浮在海床上面"。
import * as THREE from 'three';
import { depthAt } from '../physics/bathymetry.js';
import { xKmToX, depthToY, Z_HALF } from './coords.js';
import { color } from './palette.js';

const SAMPLES = 56;
const FAULT_KM = 690;      // 断层出露位置
const UPPER_KM = [690, 805];
const LOWER_KM = [585, 690];

/** 破裂区抬升包络（与 terrain.js 的 bell 同形，保证海床与条带一起动）。 */
export function liftBell(xKm) {
  if (xKm < 590 || xKm > 780) return 0;
  const s = (xKm - 590) / 190;
  return Math.sin(Math.PI * s) ** 2;
}

function makeStrip(x0, x1, baseColor, opacity) {
  const pos = new Float32Array(SAMPLES * 2 * 3);
  const idx = [];
  for (let i = 0; i < SAMPLES - 1; i++) {
    const a = i * 2;
    idx.push(a, a + 1, a + 2, a + 2, a + 1, a + 3);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setIndex(idx);
  const mat = new THREE.MeshBasicMaterial({
    color: baseColor,
    transparent: true,
    opacity,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.renderOrder = 3;
  return { mesh, geo, pos, x0, x1 };
}

export function buildFaultGroup() {
  const group = new THREE.Group();
  group.name = 'fault-group';

  // 断层面：一条亮色窄带，从海床向下倾斜
  const fpGeo = new THREE.BufferGeometry();
  fpGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(4 * 3), 3));
  fpGeo.setIndex([0, 1, 2, 2, 1, 3]);
  const fpMat = new THREE.MeshBasicMaterial({
    color: color('accent'),
    transparent: true,
    opacity: 0.85,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const faultPlane = new THREE.Mesh(fpGeo, fpMat);
  faultPlane.renderOrder = 5;
  group.add(faultPlane);

  // 抬升箭头
  const arrow = new THREE.Group();
  const matA = new THREE.MeshStandardMaterial({
    color: color('accent'),
    emissive: color('accent'),
    emissiveIntensity: 0.5,
    roughness: 0.5,
  });
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 1.0, 10), matA);
  shaft.position.y = 0.5;
  const head = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.32, 14), matA);
  head.position.y = 1.12;
  arrow.add(shaft, head);
  arrow.renderOrder = 6;
  group.add(arrow);

  let lastKey = '';

  function bedY(xKm, deepDepthM) {
    return depthToY(depthAt(xKm, deepDepthM));
  }

  /**
   * @param {number} lift01 0→1 的错动进度
   * @param {{deepDepthM:number}} opts
   */
  function update(lift01, opts = { deepDepthM: 4000 }) {
    const l = Math.max(0, Math.min(1, lift01));
    const d = opts.deepDepthM;
    const key = `${l.toFixed(3)}|${d}`;
    if (key === lastKey) return;
    lastKey = key;

    // 断层面
    const fx = xKmToX(FAULT_KM);
    const fyTop = bedY(FAULT_KM, d) + 0.08 + l * 0.58 * liftBell(FAULT_KM);
    const fyBot = bedY(FAULT_KM, d) - 0.85;
    const lean = 0.75;
    const fp = fpGeo.attributes.position.array;
    fp[0] = fx - 0.06; fp[1] = fyTop; fp[2] = Z_HALF;
    fp[3] = fx - 0.06; fp[4] = fyTop; fp[5] = -Z_HALF;
    fp[6] = fx + lean; fp[7] = fyBot; fp[8] = Z_HALF;
    fp[9] = fx + lean; fp[10] = fyBot; fp[11] = -Z_HALF;
    fpGeo.attributes.position.needsUpdate = true;
    fpGeo.computeBoundingSphere();

    // 箭头：站在上盘破裂区上方
    const axKm = 748;
    arrow.position.set(xKmToX(axKm), bedY(axKm, d) + 0.08 + l * 0.58 * liftBell(axKm), 0);
    arrow.visible = l < 0.999;
  }

  update(0, { deepDepthM: 4000 });

  return { group, update, setVisible(v) { group.visible = v; } };
}
