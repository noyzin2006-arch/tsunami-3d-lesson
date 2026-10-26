// src/ui/explainCard.js
// 左栏讲解卡：观察 / 解释 / 记住 三段 + 本章边界说明（note）。
// 文案全部来自 content/chapters.js，不在此处新增或改写科学表述。

import { CHAPTERS } from '../content/chapters.js';

let lastIndex = -1;

/**
 * 渲染讲解卡。章节未变时直接返回，避免无意义重排。
 * @param {object} refs renderShell 引用
 * @param {object} state lesson state
 */
export function renderExplain(refs, state) {
  const ch = CHAPTERS[state.chapterIndex];
  if (!ch) return;
  if (ch.index === lastIndex) return;
  lastIndex = ch.index;

  refs.explainCard.innerHTML = `
    <h2><span class="chapter-num">0${ch.index + 1}</span>${ch.title}</h2>
    <div class="explain-body">
      <div class="explain-block">
        <span class="tag">观察</span>
        <p class="txt">${ch.observe}</p>
      </div>
      <div class="explain-block">
        <span class="tag">解释</span>
        <p class="txt">${ch.explain}</p>
      </div>
      <div class="explain-block">
        <span class="tag">记住</span>
        <p class="txt">${ch.remember}</p>
      </div>
    </div>
    <p class="chapter-note">${ch.note}</p>
  `;
  // 首屏不朗读；此后章节切换由读屏播报。
  if (refs.explainCard.getAttribute('aria-live') !== 'polite') {
    refs.explainCard.setAttribute('aria-live', 'polite');
  }
}

/** 测试用：重置内部缓存（同页多次挂载时）。 */
export function resetExplainCache() {
  lastIndex = -1;
}
