// src/scene/terrain.js
// 海床 / 陆地顶面 + 层理侧壁 + 两端封口，合成单一几何体。
//
// 设计要点（决定了这块模型能不能被"读懂"）：
//  - 地壳不是一面从海床垂到底的墙，而是**随地形起伏的板块**：洋壳薄（1.5）、陆壳厚（3.2）。
//    这样侧壁不会被读成一堵墙，而是"被切开的一块地"。
//  - 侧壁按当地厚度分 4 条层理着色，层理与顶面平行（整合接触），读起来像地质剖面。
//  - 两端封口让方块从 3/4 视角看仍是实体。
import * as THREE from 'three';
import { depthAt } from '../physics/bathymetry.js';
import {
  xKmToX, depthToY, landToY, Z_HALF, X_KM_MAX, X_KM_LAND, slabBottomY,
} from './coords.js';
import { color } from './palette.js';
import { liftBell } from './fault.js';

const STEP_KM = 4;
const COLS = Math.floor(X_KM_LAND / STEP_KM) + 1;
const ROWS = 13;
const BANDS = 4;              // 侧壁层理条数

// 层理色（自上而下）：海底沉积 → 砂岩 → 玄武岩 → 深部
const BAND_COLORS = ['#6E5B47', '#544739', '#3A322B', '#241F1B'];

export function buildTerrainMesh(deepDepthM) {
  const verts = [];
  const cols = [];
  const tpar = [];   // 0=顶面 1=底板

  const topYOf = (xKm) => (xKm <= X_KM_MAX ? depthToY(depthAt(xKm, deepDepthM)) : landToY(xKm));
  const botYOf = (xKm) => slabBottomY(topYOf(xKm));

  /* —— 1. 顶面（海床 / 陆地） —— */
  const surfStart = 0;
  const seabed = color('seabed');
  const rock = color('rock');
  const land = color('land');
  const wet = new THREE.Color('#1B3B4A');

  for (let i = 0; i < COLS; i++) {
    const xKm = i * STEP_KM;
    const y = topYOf(xKm);
    const X = xKmToX(xKm);
    const underwater = xKm <= X_KM_MAX;
    let c;
    if (!underwater) {
      // 陆面：靠岸潮湿、向内陆偏干
      const inland = Math.min(1, (xKm - X_KM_MAX) / 60);
      c = land.clone().lerp(new THREE.Color('#8A7C5E'), inland);
    } else if (xKm < 620) {
      c = rock.clone().lerp(seabed, Math.min(1, xKm / 620) * 0.45);
    } else {
      c = seabed.clone();
    }
    if (underwater) c.lerp(wet, 0.3);

    for (let j = 0; j < ROWS; j++) {
      const z = -Z_HALF + (j / (ROWS - 1)) * (2 * Z_HALF);
      verts.push(X, y, z);
      cols.push(c.r, c.g, c.b);
      tpar.push(0);
    }
  }
  const surfCount = COLS * ROWS;

  /* —— 2. 前后侧壁（带层理） —— */
  const wallStart = surfCount;
  for (const zSign of [1, -1]) {
    const z = zSign * (Z_HALF - 0.001);
    for (let i = 0; i < COLS; i++) {
      const xKm = i * STEP_KM;
      const X = xKmToX(xKm);
      const yTop = topYOf(xKm);
      const yBot = botYOf(xKm);
      for (let b = 0; b <= BANDS; b++) {
        const t = b / BANDS;
        verts.push(X, yTop + (yBot - yTop) * t, z);
        // 最上一条略微提亮，读作沉积层
        const base = new THREE.Color(BAND_COLORS[Math.min(BANDS - 1, b)]);
        const cc = b === 0 ? base.clone().lerp(new THREE.Color('#7C6A52'), 0.5) : base;
        cols.push(cc.r, cc.g, cc.b);
        tpar.push(t);
      }
    }
  }

  /* —— 3. 两端封口 —— */
  const capStart = verts.length / 3;
  for (const iEnd of [0, COLS - 1]) {
    const xKm = iEnd * STEP_KM;
    const X = xKmToX(xKm);
    const yTop = topYOf(xKm);
    const yBot = botYOf(xKm);
    for (let j = 0; j < ROWS; j++) {
      const z = -Z_HALF + (j / (ROWS - 1)) * (2 * Z_HALF);
      for (let b = 0; b <= BANDS; b++) {
        const t = b / BANDS;
        verts.push(X, yTop + (yBot - yTop) * t, z);
        const base = new THREE.Color(BAND_COLORS[Math.min(BANDS - 1, b)]);
        cols.push(base.r * 0.9, base.g * 0.9, base.b * 0.9);
        tpar.push(t);
      }
    }
  }

  const positions = new Float32Array(verts);
  const colors = new Float32Array(cols);
  const ts = new Float32Array(tpar);

  /* —— 4. 索引 —— */
  const indices = [];
  for (let i = 0; i < COLS - 1; i++) {
    for (let j = 0; j < ROWS - 1; j++) {
      const a = i * ROWS + j;
      const b = a + ROWS;
      indices.push(a, b, a + 1, a + 1, b, b + 1);
    }
  }
  const rowSpan = BANDS + 1;
  for (let side = 0; side < 2; side++) {
    const base = wallStart + side * COLS * rowSpan;
    for (let i = 0; i < COLS - 1; i++) {
      for (let b = 0; b < BANDS; b++) {
        const a = base + i * rowSpan + b;
        const c2 = base + (i + 1) * rowSpan + b;
        indices.push(a, a + 1, c2, c2, a + 1, c2 + 1);
      }
    }
  }
  for (let e = 0; e < 2; e++) {
    const base = capStart + e * ROWS * rowSpan;
    for (let j = 0; j < ROWS - 1; j++) {
      for (let b = 0; b < BANDS; b++) {
        const a = base + j * rowSpan + b;
        const c2 = base + (j + 1) * rowSpan + b;
        indices.push(a, a + 1, c2, c2, a + 1, c2 + 1);
      }
    }
  }

  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geom.setIndex(indices);
  geom.computeVertexNormals();

  const mat = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.9,
    metalness: 0.02,
    side: THREE.DoubleSide,
    flatShading: false,
  });
  const mesh = new THREE.Mesh(geom, mat);
  mesh.name = 'terrain';
  mesh.frustumCulled = false;

  /* —— 5. 第 1 章：让破裂区海床真的抬起来（只改渲染顶点） —— */
  const total = positions.length / 3;
  const baseY = new Float32Array(total);
  const xKmOf = new Float32Array(total);
  for (let v = 0; v < total; v++) {
    baseY[v] = positions[v * 3 + 1];
  }
  for (let i = 0; i < COLS; i++) {
    const xKm = i * STEP_KM;
    for (let j = 0; j < ROWS; j++) xKmOf[i * ROWS + j] = xKm;
  }
  for (let side = 0; side < 2; side++) {
    const base = wallStart + side * COLS * rowSpan;
    for (let i = 0; i < COLS; i++) {
      for (let b = 0; b <= BANDS; b++) xKmOf[base + i * rowSpan + b] = i * STEP_KM;
    }
  }
  for (let e = 0; e < 2; e++) {
    const base = capStart + e * ROWS * rowSpan;
    const xKm = (e === 0 ? 0 : COLS - 1) * STEP_KM;
    for (let j = 0; j < ROWS; j++) {
      for (let b = 0; b <= BANDS; b++) xKmOf[base + j * rowSpan + b] = xKm;
    }
  }

  let liftNow = -1;
  mesh.userData.setLift = (l) => {
    const l01 = Math.max(0, Math.min(1, l));
    if (Math.abs(l01 - liftNow) < 1e-4) return;
    liftNow = l01;
    for (let v = 0; v < total; v++) {
      const b = liftBell(xKmOf[v]);
      const t = ts[v];
      // 顶面整幅抬升，越深抬得越少 → 读作"上盘被顶起"，而不是整块平移
      positions[v * 3 + 1] = baseY[v] + l01 * 0.62 * b * (1 - 0.55 * t);
    }
    geom.attributes.position.needsUpdate = true;
    geom.computeVertexNormals();
  };
  mesh.userData.setLift(0);

  return mesh;
}
