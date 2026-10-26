// tests/content.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CHAPTERS, CHAPTER_COUNT, SAFETY_NOTICE, MODEL_DISCLAIMER } from '../src/content/chapters.js';
import { SOURCES, EVENTS, VERIFIED_DATE } from '../src/content/sources.js';
import { LIMITATIONS, SAFETY_BODY, DISCLAIMER_SHORT } from '../src/content/limitations.js';

test('七章齐备且唯一 ID', () => {
  assert.equal(CHAPTERS.length, 7);
  assert.equal(CHAPTER_COUNT, 7);
  const ids = CHAPTERS.map((c) => c.id);
  assert.equal(new Set(ids).size, 7);
  ids.forEach((id, i) => assert.equal(id, `chapter-${i + 1}`));
});

test('每章四段说明与镜头锚点齐全', () => {
  for (const c of CHAPTERS) {
    assert.ok(c.title && c.observe && c.explain && c.remember, `章 ${c.index} 缺四段`);
    assert.ok(Array.isArray(c.labels) && c.labels.length >= 1, `章 ${c.index} 缺标签`);
    assert.ok(/^K[1-7]$/.test(c.cameraKey), `章 ${c.index} 镜头 ${c.cameraKey} 非法`);
  }
});

test('章 4 明确「非实际预警窗口」', () => {
  const c4 = CHAPTERS[3];
  assert.ok(/非实际预警时长|不等于实际可预警/.test(c4.explain + c4.note));
});

test('章 6 明确「先退并非必然」', () => {
  const c6 = CHAPTERS[5];
  const text = c6.observe + c6.explain + c6.remember + c6.note + c6.labels.join('');
  assert.ok(/并非必然|不是海啸必经|不一定/.test(text), '章6 须声明先退非必然');
});

test('安全提示与模型声明存在', () => {
  assert.ok(/高处|内陆|官方预警/.test(SAFETY_NOTICE));
  assert.ok(/非等比|非实时预警|淹没预测/.test(MODEL_DISCLAIMER));
  assert.ok(SAFETY_BODY.length > 20);
  assert.ok(DISCLAIMER_SHORT.length > 5);
});

test('来源均为 https 且无占位符', () => {
  assert.ok(SOURCES.length >= 5);
  for (const s of SOURCES) {
    assert.ok(s.url.startsWith('https://'), `来源 ${s.name} 非 https`);
    assert.ok(!/TODO|PLACEHOLDER|xxx/i.test(s.url + s.name));
    assert.ok(s.org && s.verifiedDate);
  }
  assert.equal(VERIFIED_DATE, '2026-10-27');
});

test('事件卡引用来源且不含未核实的具体浪高/伤亡数', () => {
  assert.equal(EVENTS.length, 2);
  for (const e of EVENTS) {
    assert.ok(e.source && e.source.url.startsWith('https://'));
    assert.ok(e.magnitude && e.summary);
    assert.ok(!/米高|万人|死亡|m 高| fatalities/i.test(e.summary), '事件卡不得含未核实伤亡/浪高数');
  }
});

test('模型局限至少 5 条', () => {
  assert.ok(LIMITATIONS.length >= 5);
});

test('禁止误导性术语：不使用「潮汐波」', () => {
  const all = CHAPTERS.map((c) => `${c.title}${c.observe}${c.explain}${c.remember}`).join('');
  assert.ok(!/潮汐波/.test(all), '不得出现「潮汐波」');
});
