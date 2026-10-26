// src/ui/staticFigure.js
// 无 WebGL / 用户取消三维时的静态剖面图：内联 SVG，零外网请求。
// 与三维场景表达同一因果链（水柱、断层、陆架、波峰），但明确标注为静态示意。

const SVG = `
<svg class="static-figure" viewBox="0 0 680 280" role="img"
     aria-label="静态剖面示意：左侧为深海与整根水柱，中部海床沿逆断层抬升，右侧为陆架变浅与海岸；海面波列自左向右传播。">
  <defs>
    <linearGradient id="sf-water" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1B4A5E" stop-opacity="0.85"/>
      <stop offset="100%" stop-color="#0A1E2A" stop-opacity="0.95"/>
    </linearGradient>
    <linearGradient id="sf-crust" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#5A4636"/>
      <stop offset="100%" stop-color="#2B211A"/>
    </linearGradient>
  </defs>

  <rect x="0" y="0" width="680" height="280" fill="#09212F"/>

  <!-- 水体 -->
  <path d="M24 96 L520 96 L620 150 L664 150 L664 236 L24 236 Z" fill="url(#sf-water)"/>
  <!-- 海面波列（波谷先到） -->
  <path d="M24 96 C70 96 96 78 140 78 C184 78 206 112 250 112 C294 112 318 80 362 80 C406 80 428 110 472 110 C504 110 520 96 520 96"
        fill="none" stroke="#53C7E8" stroke-width="2.6" stroke-linecap="round"/>
  <!-- 海床 / 陆坡 -->
  <path d="M24 236 L470 236 L470 214 L520 196 L600 172 L640 168 L664 168 L664 236 Z" fill="url(#sf-crust)"/>
  <!-- 逆断层 -->
  <path d="M470 236 L520 196" stroke="#E0B25A" stroke-width="3" stroke-linecap="round"/>
  <path d="M478 206 L500 192" stroke="#E0B25A" stroke-width="2" stroke-dasharray="4 4"/>
  <!-- 抬升箭头 -->
  <path d="M545 190 L545 150" stroke="#E0B25A" stroke-width="2.4" stroke-linecap="round"/>
  <path d="M539 158 L545 148 L551 158" fill="none" stroke="#E0B25A" stroke-width="2.4" stroke-linecap="round"/>

  <!-- 水柱箭头（整根水柱参与） -->
  <g stroke="#7FD4EA" stroke-width="1.6" stroke-linecap="round" opacity="0.85">
    <path d="M120 100 L120 226"/><path d="M114 218 L120 228 L126 218"/>
    <path d="M300 104 L300 226"/><path d="M294 218 L300 228 L306 218"/>
    <path d="M420 108 L420 226"/><path d="M414 218 L420 228 L426 218"/>
  </g>
  <!-- 陆上建筑轮廓 -->
  <g fill="#7C6A55">
    <rect x="596" y="146" width="12" height="24"/><rect x="614" y="138" width="12" height="32"/>
    <rect x="632" y="150" width="12" height="20"/><rect x="650" y="142" width="12" height="28"/>
  </g>

  <!-- 标注 -->
  <g fill="#C9DDE7" font-size="12" font-family="'Noto Sans SC', system-ui, sans-serif">
    <text x="34" y="88">海面</text>
    <text x="132" y="248">整根水柱一起参与（长波）</text>
    <text x="430" y="262">逆断层：上盘抬升，另一侧可下沉</text>
    <text x="556" y="138" fill="#E0B25A">海底抬升</text>
    <text x="608" y="132">海岸</text>
  </g>
  <text x="24" y="24" fill="#7FA6B8" font-size="11" font-family="'IBM Plex Mono', ui-monospace, monospace">
    STATIC SECTION · 静态剖面 · 非等比示意
  </text>
</svg>`;

/** 把静态剖面图挂到舞台容器（替换 canvas 的可见性由 CSS 控制）。 */
export function ensureStaticFigure(figureEl) {
  let el = figureEl.querySelector('.static-figure');
  if (!el) {
    const holder = document.createElement('div');
    holder.className = 'static-holder';
    holder.innerHTML = SVG;
    figureEl.appendChild(holder);
    el = holder.querySelector('.static-figure');
  }
  return el;
}
