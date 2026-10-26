// src/scene/createScene.js
// 创建 WebGL2 渲染器、场景、相机、灯光、resize 与上下文丢失处理。
// 返回控制器；若不支持 WebGL2，createRenderer 抛错，由上层切到文字降级。
import * as THREE from 'three';
import { PALETTE } from './palette.js';

export function isWebGL2Available() {
  try {
    const canvas = document.createElement('canvas');
    return !!(window.WebGL2RenderingContext && canvas.getContext('webgl2'));
  } catch (e) {
    return false;
  }
}

/** 生成竖向渐变天幕纹理（canvas，2×256，零外部请求）。 */
function makeBackdrop() {
  const c = document.createElement('canvas');
  c.width = 2;
  c.height = 256;
  const g = c.getContext('2d');
  const grad = g.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0, '#0E3244');
  grad.addColorStop(0.55, '#092231');
  grad.addColorStop(1, '#04121B');
  g.fillStyle = grad;
  g.fillRect(0, 0, 2, 256);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  return tex;
}

export function createScene(canvas) {
  if (!isWebGL2Available()) {
    throw new Error('WebGL2 不可用');
  }

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance',
  });
  renderer.setClearColor(new THREE.Color(PALETTE.seaDeep).multiplyScalar(0.18), 1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  // 垂直渐变天幕：只生成一次的小纹理，无外部资源
  scene.background = makeBackdrop();
  scene.fog = new THREE.Fog('#061420', 26, 62);

  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 260);
  camera.position.set(9.9, 0.0, 14.2);
  camera.lookAt(6.95, -3.1, 0);

  // 灯光：一盏主光压出体积，一盏侧逆光勾轮廓，环境光保证暗部仍可读
  const ambient = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambient);
  const hemi = new THREE.HemisphereLight(0xbfe9ff, 0x18323d, 0.9);
  scene.add(hemi);
  const dir = new THREE.DirectionalLight(0xfff4e2, 1.75);
  dir.position.set(4, 16, 10);
  scene.add(dir);
  const rim = new THREE.DirectionalLight(0x64d8f0, 0.8);
  rim.position.set(-12, 6, -8);
  scene.add(rim);

  function dpr() {
    const w = canvas.clientWidth || 1;
    const base = Math.min(window.devicePixelRatio || 1, 1.75);
    // 手机 / 窄屏降低 DPR 预算
    return w <= 480 ? Math.min(base, 1.25) : base;
  }

  function onResize() {
    const w = canvas.clientWidth || canvas.parentElement?.clientWidth || 1;
    const h = canvas.clientHeight || canvas.parentElement?.clientHeight || 1;
    renderer.setPixelRatio(dpr());
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  // 上下文丢失/恢复
  const onLost = (e) => { e.preventDefault(); };
  canvas.addEventListener('webglcontextlost', onLost, false);

  function dispose() {
    canvas.removeEventListener('webglcontextlost', onLost);
    renderer.dispose();
  }

  return { renderer, scene, camera, lights: { ambient, hemi, dir, rim }, onResize, dispose };
}
