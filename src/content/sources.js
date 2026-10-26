// src/content/sources.js
// 页面「事实与来源」板块的权威机构链接与真实事件卡。
// 仅呈文字/可点击锚；不在网页自动请求远程 API。

export const VERIFIED_DATE = '2026-10-27';

/** 首要机构来源（规划案第 9 节固定链接）。 */
export const SOURCES = [
  {
    name: 'NOAA / NCEI 全球历史海啸数据',
    org: 'National Oceanic and Atmospheric Administration',
    url: 'https://www.ncei.noaa.gov/products/natural-hazards/tsunamis-earthquakes-volcanoes/tsunamis/global-historical-data',
    verifiedDate: VERIFIED_DATE,
    used: '波速、波长、Green 定律与历史事件的背景数据。',
  },
  {
    name: 'NOAA JetStream：海啸传播',
    org: 'NOAA National Weather Service',
    url: 'https://www.noaa.gov/jetstream/tsunamis/tsunami-propagation',
    verifiedDate: VERIFIED_DATE,
    used: '速度随水深改变、波长缩短、波高增加的对照说明。',
  },
  {
    name: 'USGS：海啸的生命周期（Life of a Tsunami）',
    org: 'U.S. Geological Survey',
    url: 'https://www.usgs.gov/centers/pcmsc/life-tsunami',
    verifiedDate: VERIFIED_DATE,
    used: '起始 / 分裂 / 浅化 / 涌岸四联剖面叙事结构。',
  },
  {
    name: 'USGS：2004 年 Mw 9.1 苏门答腊—安达曼地震海啸生成',
    org: 'U.S. Geological Survey',
    url: 'https://www.usgs.gov/centers/pcmsc/science/tsunami-generation-2004-m91-sumatra-andaman-earthquake',
    verifiedDate: VERIFIED_DATE,
    used: '2004 印度洋事件震级与海床垂向形变的事实来源。',
  },
  {
    name: 'UNESCO-IOC：什么是海啸',
    org: 'Intergovernmental Oceanographic Commission',
    url: 'https://tsunami.ioc.unesco.org/en/what-are-tsunamis',
    verifiedDate: VERIFIED_DATE,
    used: '多波列、自然预警信号与全水柱的科学表述。',
  },
  {
    name: '日本气象厅（JMA）：海啸的生成',
    org: 'Japan Meteorological Agency',
    url: 'https://www.jma.go.jp/jma/kishou/know/jishin/tsunami/generation.html',
    verifiedDate: VERIFIED_DATE,
    used: '「先退并非必然」的权威表述。',
  },
  {
    name: 'NOAA / ITIC：Green 定律与日本海啸指引（PDF）',
    org: 'NOAA / International Tsunami Information Center',
    url: 'https://www.weather.gov/media/itic-car/marine_guidance/japan/English%20version%2026_01.pdf',
    verifiedDate: VERIFIED_DATE,
    used: 'Green 定律 H₂/H₁=(h₁/h₂)^(1/4) 的公式来源。',
  },
];

/** 真实历史事件卡（仅展示已核证的事实，不写未核实的伤亡/浪高）。 */
export const EVENTS = [
  {
    year: 2004,
    name: '印度洋大地震与海啸',
    magnitude: 'Mw 9.1（USGS）',
    summary: '苏门答腊—安达曼俯冲带逆断层错动触发，为有记录以来最强地震之一；海啸波及印度洋周边多国。',
    source: SOURCES.find((s) => s.url.includes('2004-m91')) ?? SOURCES[3],
  },
  {
    year: 2011,
    name: '日本东北地方太平洋近海地震',
    magnitude: 'Mw 9.1（USGS）',
    summary: '俯冲带大规模错动生成海啸，影响日本东北沿太平洋海岸；警示近岸预警时间有限。',
    source: { name: 'USGS 事件页', org: 'U.S. Geological Survey', url: 'https://earthquake.usgs.gov/earthquakes/eventpage/usc0001xgp', verifiedDate: VERIFIED_DATE, used: '2011 事件事实来源。' },
  },
];
