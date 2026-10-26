// src/ui/sourcePanel.js
// 页尾「事实与来源」：模型局限、安全提示、真实事件卡、权威来源链接。
import { LIMITATIONS, SAFETY_HEADING, SAFETY_BODY } from '../content/limitations.js';
import { SOURCES, EVENTS, VERIFIED_DATE } from '../content/sources.js';
import { MODEL_DISCLAIMER } from '../content/chapters.js';
import { icon } from './icons.js';

export function buildSources(root) {
  const limHtml = LIMITATIONS.map((l) =>
    `<div class="limitation"><h3>${l.title}</h3><p>${l.body}</p></div>`
  ).join('');

  const eventsHtml = EVENTS.map((e) =>
    `<div class="event">
       <div class="ev-year">${e.year}</div>
       <div class="ev-name">${e.name}</div>
       <div class="ev-mag">${e.magnitude}</div>
       <div class="ev-sum">${e.summary}</div>
     </div>`
  ).join('');

  const srcHtml = SOURCES.map((s) =>
    `<div class="source-item">
       <a href="${s.url}" target="_blank" rel="noopener noreferrer">${s.name}</a>
       <span class="src-org">${s.org} · 核证 ${s.verifiedDate}</span>
       <span class="src-used">${s.used}</span>
     </div>`
  ).join('');

  root.innerHTML = `
    <h2>事实与来源</h2>
    <div class="limitations">${limHtml}</div>
    <div class="safety">
      <h3>${icon('alert')} ${SAFETY_HEADING}</h3>
      <p>${SAFETY_BODY}</p>
    </div>
    <h2 style="margin-top:var(--space-8)">真实历史事件（仅已核证事实）</h2>
    <div class="events">${eventsHtml}</div>
    <h2 style="margin-top:var(--space-8)">权威来源</h2>
    <div class="source-list">${srcHtml}</div>
    <div class="disclaimer-bar">${MODEL_DISCLAIMER} · 来源核证日 ${VERIFIED_DATE}</div>
  `;
}
