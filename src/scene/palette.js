// src/scene/palette.js
// 三维场景配色唯一来源。与 tokens.css 的海洋令牌保持一致，避免散落裸 hex。
import * as THREE from 'three';

export const PALETTE = {
  seaTop: '#2E93AD',
  seaDeep: '#0E3548',
  seaSub: '#14465C',
  seabed: '#616B77',
  rock: '#4A4640',
  land: '#B9A57F',
  crest: '#7FE9F5',
  hazard: '#FFC870',
  accent: '#28C7D9',
  accentMuted: '#103F4A',
  text1: '#F4FBFF',
  warning: '#FFC870',
  danger: '#FF8B86',
  success: '#7CE3B6',
};

export function color(name) {
  return new THREE.Color(PALETTE[name] ?? PALETTE.seaTop);
}
