// src/scene/ocean.js
// 海面网格（CPU 顶点更新，与 physics.waveElevation 同源）+ 前后剖切壁 + 波峰亮线 + 示意船。
// 采用规划案 U05 默认 CPU 路径：每帧由纯函数采样顶点高度，保证与数据卡完全一致。
import * as THREE from 'three';
import { waveElevation } from '../physics/tsunami.js';
import { xKmToX, etaToYVisual, Z_HALF, X_KM_MAX } from './coords.js';
import { color } from './palette.js';

const COLS = 129;          // 沿 x
const ROWS = 25;           // 沿 z
const CUT_COLS = 161;      // 剖切壁沿 x 采样
// 仅渲染：最小空间波长（km）。近岸 λ 会掉到 1km 以下，波峰会被压成一根针。
const VIS_MIN_WAVELENGTH_KM = 9;
const VIS_OPTS = { minWavelengthKm: VIS_MIN_WAVELENGTH_KM };
const X_MIN_KM = 0;
const X_MAX_KM = X_KM_MAX;

export function buildOcean() {
  const cols = COLS, rows = ROWS;
  const n = cols * rows;
  const positions = new Float32Array(n * 3);
  const normals = new Float32Array(n * 3);
  const colors = new Float32Array(n * 3);
  const kx = new Float32Array(n);

  const top = color('seaTop');
  const deep = color('seaDeep');

  let p = 0;
  for (let i = 0; i < cols; i++) {
    const xKm = X_MIN_KM + (i / (cols - 1)) * (X_MAX_KM - X_MIN_KM);
    const X = xKmToX(xKm);
    const c = deep.clone().lerp(top, Math.pow(1 - xKm / X_MAX_KM, 0.75)); // 近岸偏亮
    for (let j = 0; j < rows; j++) {
      const z = -Z_HALF + (j / (rows - 1)) * (2 * Z_HALF);
      positions[p] = X; positions[p + 1] = 0; positions[p + 2] = z;
      normals[p] = 0; normals[p + 1] = 1; normals[p + 2] = 0;
      colors[p] = c.r; colors[p + 1] = c.g; colors[p + 2] = c.b;
      kx[p / 3] = xKm;
      p += 3;
    }
  }

  const indices = [];
  for (let i = 0; i < cols - 1; i++) {
    for (let j = 0; j < rows - 1; j++) {
      const a = i * rows + j;
      const b = a + rows;
      const c2 = a + 1;
      const d = b + 1;
      indices.push(a, b, c2, c2, b, d);
    }
  }

  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geom.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
  geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geom.setIndex(indices);

  /* —— 海面网格线：共享同一份 position 属性，随波形一起起伏 —— */
  const gridIdx = [];
  const colStep = 4;
  const rowStep = 3;
  for (let i = 0; i < cols; i += colStep) {
    for (let j = 0; j < rows - 1; j++) {
      const a = i * rows + j;
      gridIdx.push(a, a + 1);
    }
  }
  for (let j = 0; j < rows; j += rowStep) {
    for (let i = 0; i < cols - 1; i++) {
      gridIdx.push(i * rows + j, (i + 1) * rows + j);
    }
  }
  const gridGeom = new THREE.BufferGeometry();
  gridGeom.setAttribute('position', geom.attributes.position);
  gridGeom.setIndex(gridIdx);
  const gridMat = new THREE.LineBasicMaterial({
    color: color('crest'),
    transparent: true,
    opacity: 0.26,
    depthWrite: false,
  });
  const grid = new THREE.LineSegments(gridGeom, gridMat);
  grid.frustumCulled = false;
  grid.renderOrder = 1;
  grid.name = 'ocean-grid';

  const mat = new THREE.MeshStandardMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 0.97,
    roughness: 0.42,
    metalness: 0.06,
    // 自发光压住背光坡面：否则陡波谷会渲成一块"黑洞"，读不出是水
    emissive: new THREE.Color('#0C3346'),
    emissiveIntensity: 0.55,
    side: THREE.DoubleSide,
  });
  const surface = new THREE.Mesh(geom, mat);
  surface.name = 'ocean-surface';
  surface.frustumCulled = false;

  /* —— 前后剖切壁：把水体画成实体块，而不是一张浮着的面 —— */
  const cutCols = CUT_COLS;
  const cutXs = new Float32Array(cutCols);
  for (let i = 0; i < cutCols; i++) cutXs[i] = (i / (cutCols - 1)) * X_MAX_KM;

  // 每采样点 4 个顶点：[0]前上 [1]前下 [2]后上 [3]后下
  const Z_FACE = Z_HALF + 0.02;   // 略前于地壳侧壁，避免共面混合
  const cutPos = new Float32Array(cutCols * 4 * 3);
  const cutCol = new Float32Array(cutCols * 4 * 3);
  const cTop = color('seaSub').clone().lerp(color('seaTop'), 0.45);
  const cBottom = new THREE.Color('#061722');

  for (let i = 0; i < cutCols; i++) {
    const X = xKmToX(cutXs[i]);
    const setV = (k, z, col) => {
      const o = (i * 4 + k) * 3;
      cutPos[o] = X; cutPos[o + 1] = 0; cutPos[o + 2] = z;
      cutCol[o] = col.r; cutCol[o + 1] = col.g; cutCol[o + 2] = col.b;
    };
    setV(0, Z_FACE, cTop);
    setV(1, Z_FACE, cBottom);
    setV(2, -Z_FACE, cTop);
    setV(3, -Z_FACE, cBottom);
    // 下缘用同色（后端按 y 再压暗会更自然，这里保持稳定观感）
  }

  const cutIdx = [];
  for (let i = 0; i < cutCols - 1; i++) {
    const a = i * 4, b = (i + 1) * 4;
    cutIdx.push(a + 0, a + 1, b + 0, b + 0, a + 1, b + 1); // 前壁
    cutIdx.push(a + 2, b + 2, a + 3, a + 3, b + 2, b + 3); // 后壁
  }
  const cutGeom = new THREE.BufferGeometry();
  cutGeom.setAttribute('position', new THREE.BufferAttribute(cutPos, 3));
  cutGeom.setAttribute('color', new THREE.BufferAttribute(cutCol, 3));
  cutGeom.setIndex(cutIdx);
  const cutMat = new THREE.MeshBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 0.42,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const cut = new THREE.Mesh(cutGeom, cutMat);
  cut.frustumCulled = false;
  cut.name = 'ocean-cut';
  cut.renderOrder = 2;

  /* —— 波峰亮线：贴在剖切面前缘，读波形最清楚 —— */
  const linePos = new Float32Array(cutCols * 3);
  for (let i = 0; i < cutCols; i++) {
    linePos[i * 3] = xKmToX(cutXs[i]);
    linePos[i * 3 + 1] = 0;
    linePos[i * 3 + 2] = Z_FACE + 0.02;
  }
  const lineGeom = new THREE.BufferGeometry();
  lineGeom.setAttribute('position', new THREE.BufferAttribute(linePos, 3));
  const lineMat = new THREE.LineBasicMaterial({ color: color('crest'), transparent: true, opacity: 0.95 });
  const crestLine = new THREE.Line(lineGeom, lineMat);
  crestLine.frustumCulled = false;
  crestLine.name = 'crest-line';
  crestLine.renderOrder = 4;

  /* —— 示意船（第 3 章显形，随海面轻轻起伏；放在靠前位置便于观察） —— */
  const ship = new THREE.Group();
  const hull = new THREE.Mesh(
    new THREE.BoxGeometry(1.15, 0.34, 0.46),
    new THREE.MeshStandardMaterial({ color: '#E8E2D0', roughness: 0.7 })
  );
  const cabin = new THREE.Mesh(
    new THREE.BoxGeometry(0.46, 0.28, 0.36),
    new THREE.MeshStandardMaterial({ color: '#C75450', roughness: 0.7 })
  );
  cabin.position.y = 0.29;
  ship.add(hull, cabin);
  const shipXKm = 330;
  const shipZ = Z_HALF - 1.0;
  ship.position.set(xKmToX(shipXKm), 0, shipZ);
  ship.visible = false;

  const group = new THREE.Group();
  group.add(surface, grid, cut, crestLine, ship);

  let bedYs = new Float32Array(cutCols).fill(-6.4);
  let targetOpacity = 0.97;

  function update(state) {
    const t = state.simTimeSec;
    const params = state.params;
    const env = { hAt: state.bathy.hAt, tauAt: state.bathy.tauAt, H: state.bathy.H };
    const h0 = params.initialWaveHeightM;
    const pos = geom.attributes.position;
    const nrm = geom.attributes.normal;

    // 第 1/2 章需要看见海底：水面变透明；其余章节恢复不透明
    mat.opacity += (targetOpacity - mat.opacity) * 0.18;
    mat.depthWrite = mat.opacity > 0.9;

    // 海面：逐顶点由纯函数求位移，再按当地波高做归一化夸张
    for (let v = 0; v < n; v++) {
      const k = kx[v];
      let eta = 0;
      try {
        eta = waveElevation(k, t, params, env, VIS_OPTS);
      } catch (e) {
        eta = 0;
      }
      pos.array[v * 3 + 1] = etaToYVisual(eta, state.bathy.H(k), h0);
    }

    const colW = 18 / (cols - 1);
    const rowW = (2 * Z_HALF) / (rows - 1);
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const v = i * rows + j;
        const il = i > 0 ? i - 1 : i;
        const ir = i < cols - 1 ? i + 1 : i;
        const jd = j > 0 ? j - 1 : j;
        const ju = j < rows - 1 ? j + 1 : j;
        const yl = pos.array[(il * rows + j) * 3 + 1];
        const yr = pos.array[(ir * rows + j) * 3 + 1];
        const yd = pos.array[(i * rows + jd) * 3 + 1];
        const yu = pos.array[(i * rows + ju) * 3 + 1];
        const dydx = (yr - yl) / ((ir - il) * colW);
        const dydz = (yu - yd) / ((ju - jd) * rowW);
        const nx = -dydx, ny = 1, nz = -dydz;
        const len = Math.hypot(nx, ny, nz) || 1;
        nrm.array[v * 3] = nx / len;
        nrm.array[v * 3 + 1] = ny / len;
        nrm.array[v * 3 + 2] = nz / len;
      }
    }
    pos.needsUpdate = true;
    nrm.needsUpdate = true;

    // 剖切壁：上缘随波形，下缘为海床
    const cpos = cutGeom.attributes.position;
    const lpos = lineGeom.attributes.position;
    for (let i = 0; i < cutCols; i++) {
      let eta = 0;
      try {
        eta = waveElevation(cutXs[i], t, params, env, VIS_OPTS);
      } catch (e) {
        eta = 0;
      }
      const y = etaToYVisual(eta, state.bathy.H(cutXs[i]), h0);
      cpos.array[i * 12 + 1] = y;      // 前上
      cpos.array[i * 12 + 4] = bedYs[i]; // 前下
      cpos.array[i * 12 + 7] = y;      // 后上
      cpos.array[i * 12 + 10] = bedYs[i]; // 后下
      lpos.array[i * 3 + 1] = y;
    }
    cpos.needsUpdate = true;
    lpos.needsUpdate = true;
    lineGeom.computeBoundingSphere();

    if (ship.visible) {
      let eta = 0;
      try {
        eta = waveElevation(shipXKm, t, params, env, VIS_OPTS);
      } catch (e) {
        eta = 0;
      }
      const y = etaToYVisual(eta, state.bathy.H(shipXKm), h0);
      ship.position.y = y + 0.16;
      ship.rotation.z = Math.max(-0.12, Math.min(0.12, -eta * 6));
    }
  }

  function setShipVisible(v) { ship.visible = v; }
  function setCutVisible(v) { cut.visible = v; crestLine.visible = v; }
  function setCutOpacity(v) { cutMat.opacity = v; }
  function setBedProfile(bedYsArr) { bedYs = bedYsArr; }
  function setSurfaceOpacity(v) { targetOpacity = v; }

  return { group, update, setShipVisible, setCutVisible, setCutOpacity, setBedProfile, setSurfaceOpacity, shipXKm };
}
