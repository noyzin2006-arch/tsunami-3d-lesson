// src/ui/statusPanel.js
// 舞台四态：loading / success / error / cancelled（空态即未开始）。
// 错误态必须给出可操作出路（重试或看文字），不把用户卡死。

import { icon } from './icons.js';
import { ensureStaticFigure } from './staticFigure.js';

/** 渲染状态面板。status: idle|loading|ready|error|cancelled */
export function renderStatus(refs, status, detail = '') {
  const panel = refs.statusPanel;
  const figure = refs.root.querySelector('#stageFigure');

  if (status === 'idle') {
    panel.className = 'status-panel';
    panel.innerHTML = '';
    return;
  }

  const inTextMode = status === 'error' || status === 'cancelled';
  if (inTextMode) ensureStaticFigure(figure);
  figure.classList.toggle('text-mode', inTextMode);

  if (status === 'loading') {
    panel.className = 'status-panel show loading';
    panel.setAttribute('role', 'status');
    panel.innerHTML = `
      <span class="status-icon spin">${icon('loader')}</span>
      <p class="status-msg">正在准备三维场景</p>
      <p class="status-sub">三维库从本站加载，不请求任何外域资源。</p>
      <button class="status-action" type="button" data-action="cancel">先看文字讲解</button>
    `;
    return;
  }

  if (status === 'ready') {
    panel.className = 'status-panel show success';
    panel.setAttribute('role', 'status');
    panel.innerHTML = `
      <span class="status-icon">${icon('check')}</span>
      <p class="status-msg">三维场景已就绪</p>
    `;
    return;
  }

  if (status === 'error') {
    panel.className = 'status-panel show error';
    panel.setAttribute('role', 'alert');
    panel.innerHTML = `
      <span class="status-icon">${icon('alert')}</span>
      <p class="status-msg">三维场景无法启动</p>
      <p class="status-sub">${detail || '当前浏览器或显卡不支持 WebGL2'}。下方静态剖面与完整七章讲解仍可阅读。</p>
      <div class="status-actions">
        <button class="status-action" type="button" data-action="retry">重试</button>
        <button class="status-action ghost" type="button" data-action="cancel">只看文字</button>
      </div>
    `;
    return;
  }

  // cancelled
  panel.className = 'status-panel show';
  panel.setAttribute('role', 'status');
  panel.innerHTML = `
    <span class="status-icon">${icon('info')}</span>
    <p class="status-msg">已切换到文字讲解</p>
    <p class="status-sub">静态剖面与全部章节文字仍然完整；随时可重新加载三维场景。</p>
    <button class="status-action" type="button" data-action="load">重新加载三维场景</button>
  `;
}

/** 成功态自动收起（避免遮挡舞台）。 */
export function scheduleSuccessHide(refs, ms = 1800) {
  window.setTimeout(() => {
    if (refs.statusPanel.classList.contains('success')) {
      refs.statusPanel.classList.remove('show');
    }
  }, ms);
}
