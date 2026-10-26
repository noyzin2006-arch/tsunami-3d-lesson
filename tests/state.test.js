// tests/state.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  createInitialState, reducer, clampParams, PARAM_RANGES, CHAPTER_COUNT,
} from '../src/state/lessonMachine.js';

test('初始状态：暂停、第 0 章、simTime=0', () => {
  const s = createInitialState();
  assert.equal(s.playing, false);
  assert.equal(s.chapterIndex, 0);
  assert.equal(s.simTimeSec, 0);
  assert.equal(s.rate, 1);
  assert.equal(s.cuts.length, 8);
});

test('PLAY 开始；到达末尾再 PLAY 则回到起点', () => {
  let s = createInitialState();
  s = reducer(s, { type: 'PLAY' });
  assert.equal(s.playing, true);
  // 跳到末尾
  s = { ...s, simTimeSec: s.cuts[7], chapterIndex: 6 };
  s = reducer(s, { type: 'PLAY' });
  assert.equal(s.playing, true);
  assert.equal(s.simTimeSec, s.cuts[0]);
  assert.equal(s.chapterIndex, 0);
});

test('PAUSE / TOGGLE', () => {
  let s = createInitialState();
  s = reducer(s, { type: 'PLAY' });
  s = reducer(s, { type: 'TOGGLE' });
  assert.equal(s.playing, false);
  s = reducer(s, { type: 'TOGGLE' });
  assert.equal(s.playing, true);
});

test('CHAPTER_SET / NEXT / PREV 同步时间到锚点', () => {
  let s = createInitialState();
  s = reducer(s, { type: 'CHAPTER_SET', index: 4 });
  assert.equal(s.chapterIndex, 4);
  assert.equal(s.simTimeSec, s.cuts[4]);
  s = reducer(s, { type: 'CHAPTER_NEXT' });
  assert.equal(s.chapterIndex, 5);
  s = reducer(s, { type: 'CHAPTER_PREV' });
  assert.equal(s.chapterIndex, 4);
  // 下界边界：从第 1 章连续后退两次应停在 0
  s = reducer(s, { type: 'CHAPTER_SET', index: 1 });
  assert.equal(s.chapterIndex, 1);
  s = reducer(s, { type: 'CHAPTER_PREV' });
  assert.equal(s.chapterIndex, 0);
  s = reducer(s, { type: 'CHAPTER_PREV' });
  assert.equal(s.chapterIndex, 0);
  // 上界边界：超过最大章被钳制
  s = reducer(s, { type: 'CHAPTER_SET', index: 99 });
  assert.equal(s.chapterIndex, CHAPTER_COUNT - 1);
});

test('TICK 推进时间并自动跨章；到末尾停止', () => {
  let s = createInitialState();
  s = reducer(s, { type: 'PLAY' });
  // 推进足够多 tick 越过 cuts[1]
  for (let i = 0; i < 200; i++) s = reducer(s, { type: 'TICK', dtSec: 0.05 });
  assert.ok(s.simTimeSec > s.cuts[1], `simTime=${s.simTimeSec} cuts1=${s.cuts[1]}`);
  assert.ok(s.chapterIndex >= 1);
  // 推进到末尾
  for (let i = 0; i < 5000; i++) s = reducer(s, { type: 'TICK', dtSec: 0.05 });
  assert.equal(s.playing, false);
  assert.equal(s.chapterIndex, CHAPTER_COUNT - 1);
  assert.equal(s.simTimeSec, s.cuts[7]);
});

test('TICK 在暂停时不推进', () => {
  let s = createInitialState();
  const before = s.simTimeSec;
  s = reducer(s, { type: 'TICK', dtSec: 0.05 });
  assert.equal(s.simTimeSec, before);
});

test('PARAM_DEPTH 改变参数并保留章内归一化进度', () => {
  let s = createInitialState();
  s = reducer(s, { type: 'CHAPTER_SET', index: 3 });
  // 置于章内 50% 处
  const i = 3;
  const mid = (s.cuts[i] + s.cuts[i + 1]) / 2;
  s = { ...s, simTimeSec: mid };
  const oldChapter = s.chapterIndex;
  s = reducer(s, { type: 'PARAM_DEPTH', value: 6000 });
  assert.equal(s.params.deepDepthM, 6000);
  assert.equal(s.chapterIndex, oldChapter);
  // 新时间应落在新的 cuts[3..4]
  assert.ok(s.simTimeSec >= s.cuts[3] && s.simTimeSec <= s.cuts[4]);
  // 归一化进度应约为 0.5（容差因端点 clamp）
  const f = (s.simTimeSec - s.cuts[3]) / (s.cuts[4] - s.cuts[3]);
  assert.ok(Math.abs(f - 0.5) < 0.05, `f=${f}`);
});

test('PARAM_DEPTH 越界被钳制', () => {
  let s = createInitialState();
  s = reducer(s, { type: 'PARAM_DEPTH', value: 99999 });
  assert.equal(s.params.deepDepthM, PARAM_RANGES.deepDepthM.max);
  s = reducer(s, { type: 'PARAM_DEPTH', value: -100 });
  assert.equal(s.params.deepDepthM, PARAM_RANGES.deepDepthM.min);
});

test('PARAM_UPLIFT 改变抬升并同步 initialWaveHeightM', () => {
  let s = createInitialState();
  s = reducer(s, { type: 'PARAM_UPLIFT', value: 3.0 });
  assert.equal(s.params.upliftM, 3.0);
  assert.equal(s.params.initialWaveHeightM, 0.25 * (3.0 / 1.5));
});

test('PHASE_SET 切换相位且不重建时间表', () => {
  let s = createInitialState();
  const cutsBefore = s.cuts;
  s = reducer(s, { type: 'PHASE_SET', mode: 'crest-first' });
  assert.equal(s.params.phaseMode, 'crest-first');
  assert.equal(s.cuts, cutsBefore);
  s = reducer(s, { type: 'PHASE_SET', mode: 'trough-first' });
  assert.equal(s.params.phaseMode, 'trough-first');
});

test('RATE_SET 只接受 1 或 2', () => {
  let s = createInitialState();
  s = reducer(s, { type: 'RATE_SET', rate: 2 });
  assert.equal(s.rate, 2);
  s = reducer(s, { type: 'RATE_SET', rate: 9 });
  assert.equal(s.rate, 1);
});

test('CAMERA_RESET 递增 nonce', () => {
  let s = createInitialState();
  const n = s.cameraResetNonce;
  s = reducer(s, { type: 'CAMERA_RESET' });
  assert.equal(s.cameraResetNonce, n + 1);
});

test('WEBGL 状态转换', () => {
  let s = createInitialState();
  s = reducer(s, { type: 'WEBGL_ERROR' });
  assert.equal(s.webglStatus, 'error');
  s = reducer(s, { type: 'RETRY' });
  assert.equal(s.webglStatus, 'loading');
  s = reducer(s, { type: 'WEBGL_READY' });
  assert.equal(s.webglStatus, 'ready');
});

test('clampParams 始终在合法范围', () => {
  const p = clampParams({ deepDepthM: 12345, upliftM: -7 });
  assert.ok(p.deepDepthM >= PARAM_RANGES.deepDepthM.min && p.deepDepthM <= PARAM_RANGES.deepDepthM.max);
  assert.ok(p.upliftM >= PARAM_RANGES.upliftM.min && p.upliftM <= PARAM_RANGES.upliftM.max);
  assert.equal(p.initialWaveHeightM, 0.25 * (p.upliftM / 1.5));
});
