// src/scene/sceneController.js
// 场景总控：组合地形/断层/海面/水柱/波前/淹没/相机，统一 update(state, dt)。
import * as THREE from 'three';
import { createScene, isWebGL2Available } from './createScene.js';
import { buildTerrainMesh } from './terrain.js';
import { buildFaultGroup } from './fault.js';
import { buildOcean } from './ocean.js';
import { buildWaterColumn } from './waterColumn.js';
import { buildWavefronts } from './wavefronts.js';
import { buildShore } from './shore.js';
import { createCameraRig } from './cameraRig.js';
import { depthAt } from '../physics/bathymetry.js';
import { xKmToX, depthToY, X_KM_MAX } from './coords.js';

export function createController(canvas) {
  if (!isWebGL2Available()) {
    return { ok: false, error: 'WebGL2 不可用' };
  }
  let core;
  try {
    core = createScene(canvas);
  } catch (e) {
    return { ok: false, error: e.message };
  }
  const { renderer, scene, camera, onResize, dispose } = core;

  let deepDepthM = null;
  let terrainMesh = null;
  const fault = buildFaultGroup();
  const ocean = buildOcean();
  const waterColumn = buildWaterColumn();
  const wavefronts = buildWavefronts();
  const shore = buildShore();
  const rig = createCameraRig(camera);

  scene.add(fault.group, ocean.group, waterColumn.mesh, wavefronts.group, shore.group);

  function rebuildTerrain(d) {
    if (terrainMesh) {
      scene.remove(terrainMesh);
      terrainMesh.geometry.dispose();
      terrainMesh.material.dispose();
    }
    terrainMesh = buildTerrainMesh(d);
    scene.add(terrainMesh);
    // 为剖切壁下缘提供海床剖面
    const cutCols = 161;
    const bedYs = new Float32Array(cutCols);
    for (let i = 0; i < cutCols; i++) {
      const xKm = (i / (cutCols - 1)) * X_KM_MAX;
      const h = xKm <= 800 ? depthAt(xKm, d) : 10;
      bedYs[i] = xKm <= 800 ? depthToY(h) : 0.04;
    }
    ocean.setBedProfile(bedYs);
    deepDepthM = d;
  }
  rebuildTerrain(4000);

  // 指针拖拽（有限运镜）
  let dragging = false, lastX = 0, lastY = 0;
  function onDown(e) { dragging = true; lastX = e.clientX; lastY = e.clientY; }
  function onMove(e) {
    if (!dragging) return;
    rig.applyDrag(e.clientX - lastX, e.clientY - lastY);
    lastX = e.clientX; lastY = e.clientY;
  }
  function onUp() { dragging = false; }
  canvas.addEventListener('pointerdown', onDown);
  window.addEventListener('pointermove', onMove);
  window.addEventListener('pointerup', onUp);

  const tmp = new THREE.Vector3();

  function update(state, dt) {
    if (state.params.deepDepthM !== deepDepthM) rebuildTerrain(state.params.deepDepthM);

    ocean.update(state);
    waterColumn.update(state);
    wavefronts.update(state);
    shore.update(state);

    // 断层抬升（第 1 章内 0→1，之后保持）
    const lift = state.chapterIndex === 0
      ? Math.min(1, Math.max(0, (state.simTimeSec - state.cuts[0]) / (state.cuts[1] - state.cuts[0])))
      : 1;
    fault.update(lift, { deepDepthM: state.params.deepDepthM });
    if (terrainMesh?.userData.setLift) terrainMesh.userData.setLift(lift);
    fault.setVisible(state.chapterIndex <= 1);

    // 章节相关可见性
    waterColumn.setVisible(state.chapterIndex === 1);
    ocean.setShipVisible(state.chapterIndex === 2 || state.chapterIndex === 3);
    wavefronts.setVisible(state.chapterIndex === 3);
    shore.setVisible(state.chapterIndex === 6);
    // 前两章需要看见海底构造：水体半透明；第 3 章起恢复接近不透明的水体。
    // 剖切壁始终保留——它是"水体是一块实体"的唯一线索，关掉就会读成悬空的海床。
    ocean.setCutVisible(true);
    ocean.setCutOpacity(state.chapterIndex === 0 ? 0.3 : state.chapterIndex === 1 ? 0.4 : 0.55);
    ocean.setSurfaceOpacity(state.chapterIndex === 0 ? 0.32 : state.chapterIndex === 1 ? 0.45 : 0.97);

    rig.update(state, dt);
    renderer.render(scene, camera);
  }

  function handleResize() { onResize(); }

  function project(xKm, y, z) {
    tmp.set(xKmToX(xKm), y, z);
    tmp.project(camera);
    const rect = canvas.getBoundingClientRect();
    return {
      x: (tmp.x * 0.5 + 0.5) * rect.width,
      y: (-tmp.y * 0.5 + 0.5) * rect.height,
      visible: tmp.z < 1,
    };
  }

  function disposeAll() {
    canvas.removeEventListener('pointerdown', onDown);
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onUp);
    dispose();
  }

  return { ok: true, update, handleResize, project, dispose: disposeAll, renderer, scene, camera, parts: { ocean, terrain: () => terrainMesh, fault, waterColumn, wavefronts, shore } };
}
