/*! AppleCore — config.js
 *  Socle commun à toutes les pages : API_BASE, requêtes résilientes, i18n FR/EN,
 *  icônes SVG inline, rendu des embeds Discord, header/footer, données d'exemple.
 *
 *  Surcharger l'API en dev :  ?api=http://localhost:8080   (mémorisé)
 *                             ?api=default                  (réinitialise)
 */
(() => {
  'use strict';

  /* ------------------------------------------------------------------ Liens */
  const LINKS = {
    invite: 'https://discord.com/oauth2/authorize?client_id=1434945148789456896&permissions=277025778752&scope=bot%20applications.commands',
    github: 'https://github.com/TiboTsr/AppleBot',
    support: '', // Invite support discord quand il sera crée 
    appleStatus: 'https://www.apple.com/fr/support/systemstatus/',
    appledb: 'https://appledb.dev'
  };

  /* --------------------------------------------------------------- Stockage */
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch { /* navigation privée */ } },
    del(k) { try { localStorage.removeItem(k); } catch { /* idem */ } }
  };

  /* --------------------------------------------------------------- API_BASE */
  const qs = new URLSearchParams(location.search);
  if (qs.has('api')) { qs.get('api') === 'default' ? store.del('ac_api') : store.set('ac_api', qs.get('api')); }
  const isLocal = ['localhost', '127.0.0.1', '[::1]', ''].includes(location.hostname);
  window.API_BASE = String(
    window.API_BASE || store.get('ac_api') || (isLocal ? 'http://localhost:8080' : 'https://api-applecore.tibotsr.dev')
  ).replace(/\/+$/, '');

  /* ---------------------------------------------------------------- Helpers */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const pick = (o, ...keys) => { for (const k of keys) { if (o && o[k] !== undefined && o[k] !== null && o[k] !== '') return o[k]; } return undefined; };
  const debounce = (fn, ms = 120) => { let id; return (...a) => { clearTimeout(id); id = setTimeout(() => fn(...a), ms); }; };
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ready = fn => (document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', fn) : fn());

  /* ------------------------------------------------------------------- i18n */
  let lang = document.documentElement.dataset.lang === 'en' ? 'en' : 'fr';
  const t = (fr, en) => (lang === 'fr' ? fr : en);
  const bi = (fr, en) => `<span lang="fr">${fr}</span><span lang="en">${en}</span>`;
  const loc = () => (lang === 'fr' ? 'fr-FR' : 'en-GB');

  function applyLang() {
    document.documentElement.lang = lang;
    document.documentElement.dataset.lang = lang;
    $$('[data-ph-fr]').forEach(e => { e.placeholder = lang === 'fr' ? e.dataset.phFr : e.dataset.phEn; });
    $$('[data-aria-fr]').forEach(e => e.setAttribute('aria-label', lang === 'fr' ? e.dataset.ariaFr : e.dataset.ariaEn));
    $$('.lang-switch button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
    const ti = $('title[data-fr]');
    if (ti) ti.textContent = lang === 'fr' ? ti.dataset.fr : ti.dataset.en;
  }
  function setLang(l) {
    if (l === lang) return;
    lang = l; store.set('ac_lang', l); applyLang();
    document.dispatchEvent(new CustomEvent('langchange', { detail: l }));
  }

  /* ---------------------------------------------------------------- Formats */
  const fmtDate = (d, opts = { day: 'numeric', month: 'short', year: 'numeric' }) => {
    const x = new Date(d); return isNaN(x) ? '—' : x.toLocaleDateString(loc(), opts);
  };
  const fmtNum = n => (Number.isFinite(+n) ? (+n).toLocaleString(loc()) : '—');
  const fmtUptime = s => {
    s = Math.floor(+s); if (!Number.isFinite(s)) return '—';
    const d = Math.floor(s / 86400), h = Math.floor(s % 86400 / 3600), m = Math.floor(s % 3600 / 60);
    return d ? `${d} ${t('j', 'd')} ${h} h` : h ? `${h} h ${m} min` : `${m} min`;
  };
  const relTime = d => {
    const diff = (Date.now() - new Date(d)) / 1000; if (!Number.isFinite(diff)) return '';
    const rtf = new Intl.RelativeTimeFormat(loc(), { numeric: 'auto' });
    for (const [u, s] of [['year', 31536000], ['month', 2592000], ['day', 86400], ['hour', 3600], ['minute', 60]]) {
      if (Math.abs(diff) >= s) return rtf.format(-Math.round(diff / s), u);
    }
    return t("à l'instant", 'just now');
  };

  /* ----------------------------------------------------------------- Icônes */
  const ICONS = {
    bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18"/>',
    shield: '<path d="M12 3 4.5 6v5.5c0 4.5 3.2 8 7.5 9.5 4.3-1.5 7.5-5 7.5-9.5V6z"/><path d="m9 12 2 2 4-4"/>',
    cpu: '<rect x="6" y="6" width="12" height="12" rx="2"/><rect x="9.5" y="9.5" width="5" height="5"/><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    download: '<path d="M12 4v11M7.5 11 12 15.5 16.5 11M5 20h14"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    chevron: '<path d="m9 6 6 6-6 6"/>',
    chevdown: '<path d="m6 9 6 6 6-6"/>',
    activity: '<path d="M3 12h4l3-8 4 16 3-8h4"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    server: '<rect x="3" y="4" width="18" height="7" rx="2"/><rect x="3" y="13" width="18" height="7" rx="2"/><path d="M7 7.5h.01M7 16.5h.01"/>',
    sparkle: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 17v4M17 19h4"/>',
    external: '<path d="M14 4h6v6M20 4 10 14M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
    lock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
    translate: '<path d="M4 6h9M8.5 4v2M6 6c0 4 3 7 6 8M12 6c-1 4-3.5 6.5-7 8M14 20l4-9 4 9M15.5 17h5"/>',
    trend: '<path d="M4 20V4M4 20h16"/><path d="m8 15 3.5-4 3 2.5L20 7"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    terminal: '<path d="m5 8 4 4-4 4M12 17h7"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.5-3.5 3-5.5 6.5-5.5s6 2 6.5 5.5M16 4.5a3.5 3.5 0 0 1 0 7M18 14.8c2 .6 3.2 2.4 3.5 5.2"/>',
    tag: '<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1"/>',
    refresh: '<path d="M20 11a8 8 0 0 0-14-4L4 9M4 4v5h5M4 13a8 8 0 0 0 14 4l2-2M20 20v-5h-5"/>',
    database: '<ellipse cx="12" cy="6" rx="8" ry="3"/><path d="M4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/>',
    iphone: '<rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M11 18.5h2"/>',
    ipad: '<rect x="4" y="3" width="16" height="18" rx="2.5"/><path d="M11 18h2"/>',
    mac: '<rect x="5" y="5" width="14" height="10" rx="1.5"/><path d="M3 19h18"/>',
    watch: '<rect x="7" y="6" width="10" height="12" rx="3"/><path d="m9 6 .6-3h4.8L15 6M9 18l.6 3h4.8l.6-3"/>',
    tv: '<rect x="3" y="5" width="18" height="12" rx="2"/><path d="M8 21h8"/>',
    vision: '<path d="M3 9.5C3 8 4 7 5.5 7h13C20 7 21 8 21 9.5v4c0 1.5-1 2.5-2.5 2.5-1.5 0-2.3-.8-3-1.8-.5-.7-1.2-1-2.5-1s-2 .3-2.5 1c-.7 1-1.5 1.8-3 1.8C4 16 3 15 3 13.5z"/>',
    airpods: '<path d="M4 15v-3a8 8 0 0 1 16 0v3"/><rect x="3" y="14" width="4" height="6" rx="2"/><rect x="17" y="14" width="4" height="6" rx="2"/>'
  };
  const icon = (name, size = 20, cls = '') =>
    `<svg class="ico ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ''}</svg>`;

  let logoN = 0;
  const logoMark = (s = 28) => {
    const id = 'lg' + (++logoN);
    return `<svg class="logo-mark" width="${s}" height="${s}" viewBox="0 0 32 32" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2997ff"/><stop offset="1" stop-color="#0058b8"/></linearGradient></defs><rect width="32" height="32" rx="8" fill="url(#${id})"/><circle cx="16" cy="16" r="7.2" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-dasharray="36 9" transform="rotate(-60 16 16)"/><circle cx="16" cy="16" r="2.4" fill="#fff"/></svg>`;
  };

  /* ------------------------------------------------- Métadonnées OS / types */
  const OS_LIST = ['iOS', 'iPadOS', 'macOS', 'watchOS', 'tvOS', 'visionOS', 'AirPods'];
  const OS_ICON = { iOS: 'iphone', iPadOS: 'ipad', macOS: 'mac', watchOS: 'watch', tvOS: 'tv', visionOS: 'vision', AirPods: 'airpods' };
  const osKey = raw => {
    const s = String(raw || '').toLowerCase();
    if (s.includes('ipados')) return 'iPadOS';
    if (s.includes('ios') || s.includes('iphone')) return 'iOS';
    if (s.includes('mac')) return 'macOS';
    if (s.includes('watch')) return 'watchOS';
    if (s.includes('tv')) return 'tvOS';
    if (s.includes('vision')) return 'visionOS';
    if (s.includes('airpod') || s.includes('audio') || s.includes('beats')) return 'AirPods';
    return String(raw || 'iOS');
  };
  const TYPES = {
    release: { fr: 'Release finale', en: 'Final release', cls: 'green' },
    rc: { fr: 'Release Candidate', en: 'Release Candidate', cls: 'orange' },
    'dev-beta': { fr: 'Bêta développeur', en: 'Developer beta', cls: 'purple' },
    'public-beta': { fr: 'Bêta publique', en: 'Public beta', cls: 'blue' }
  };
  const osIcon = (os, size = 22) => `<span class="os-ico" data-os="${esc(os)}">${icon(OS_ICON[os] || 'iphone', size)}</span>`;
  const typeBadge = k => { const m = TYPES[k] || TYPES.release; return `<span class="badge ${m.cls}">${bi(m.fr, m.en)}</span>`; };

  /* ------------------------------------------------------------ Normaliseurs */
  function normType(raw) {
    const s = String(raw || '').toLowerCase();
    if (/\brc\b|candidate/.test(s)) return 'rc';
    if (/public/.test(s) && /beta|bêta/.test(s)) return 'public-beta';
    if (/beta|bêta|dev/.test(s)) return 'dev-beta';
    return 'release';
  }
  function normRelease(r) {
    const flag = pick(r, 'signed', 'is_signed');
    return {
      os: osKey(pick(r, 'os', 'platform', 'os_name', 'osStr') || 'iOS'),
      version: String(pick(r, 'version', 'osVersion', 'name') ?? ''),
      build: String(pick(r, 'build', 'build_number', 'buildId') ?? ''),
      date: pick(r, 'date', 'released', 'release_date', 'published_at', 'created_at'),
      type: normType(pick(r, 'type', 'audience', 'channel', 'kind')),
      signed: typeof flag === 'boolean' ? flag : undefined,
      url: pick(r, 'ipsw_url', 'ipsw', 'download_url', 'download', 'url'),
      compat: pick(r, 'compatible_count', 'devices_count'),
      sample: !!r.sample
    };
  }
  const truthy = x => {
    if (typeof x === 'boolean') return x;
    if (typeof x === 'string') return /^(ok|up|healthy|connected|operational|true|online)$/i.test(x.trim());
    if (x && typeof x === 'object') return truthy(pick(x, 'status', 'ok', 'connected'));
    return undefined;
  };
  function normService(s) {
    const raw = String(pick(s, 'status', 'state', 'level') ?? 'ok').toLowerCase();
    const status = /outage|down|unavailable|major|red|critical/.test(raw) ? 'down'
      : /issue|degrad|partial|slow|warn|orange|minor|maintenance/.test(raw) ? 'warn' : 'ok';
    return { name: String(pick(s, 'name', 'service', 'title') ?? '?'), status, detail: pick(s, 'message', 'detail', 'description') };
  }
  function vintageOf(date) {
    const d = new Date(date); if (isNaN(d)) return null;
    const years = (Date.now() - d) / 31557600000;
    return { years, key: years < 5 ? 'supported' : years <= 7 ? 'vintage' : 'obsolete' };
  }
  function normDevice(d) {
    const name = String(pick(d, 'name', 'model', 'device') ?? '?');
    const soc = String(pick(d, 'soc', 'chip', 'processor', 'cpu') ?? '—');
    let cat = pick(d, 'category', 'family', 'type');
    cat = cat ? osKey2cat(cat) : osKey2cat(name);
    const ramRaw = pick(d, 'ram', 'memory', 'ram_gb');
    const aiRaw = pick(d, 'apple_intelligence', 'appleIntelligence', 'ai');
    let supported = pick(d, 'supported', 'ai_supported');
    let reason = pick(d, 'reason', 'ai_reason');
    if (aiRaw && typeof aiRaw === 'object') { supported = pick(aiRaw, 'supported'); reason = pick(aiRaw, 'reason', 'details') ?? reason; }
    else if (typeof aiRaw === 'boolean') supported = aiRaw;
    return {
      id: String(pick(d, 'identifier', 'id', 'device_id', 'key') ?? name),
      name, soc, cat,
      arch: String(pick(d, 'arch', 'architecture') ?? (/intel|core i|xeon/i.test(soc) ? 'x86_64' : '—')),
      ram: ramRaw === undefined ? null : (typeof ramRaw === 'number' ? ramRaw : String(ramRaw)),
      released: pick(d, 'released', 'release_date', 'date', 'introduced'),
      ai: typeof supported === 'boolean' ? supported : null,
      reason: reason || null
    };
  }
  function osKey2cat(raw) {
    const s = String(raw).toLowerCase();
    if (/ipad/.test(s)) return 'iPad';
    if (/iphone/.test(s)) return 'iPhone';
    if (/watch/.test(s)) return 'Watch';
    if (/airpod|beats/.test(s)) return 'AirPods';
    if (/mac|imac|studio|mini|book/.test(s)) return 'Mac';
    return String(raw);
  }
  const CAT_ICON = { iPhone: 'iphone', iPad: 'ipad', Mac: 'mac', Watch: 'watch', AirPods: 'airpods' };
  const fmtRam = r => (r === null ? '—' : typeof r === 'number' ? `${r} ${t('Go', 'GB')}` : String(r));
  const reasonText = r => (!r ? '' : typeof r === 'string' ? r : (lang === 'fr' ? r.fr : r.en));

  function normAnalytics(d) {
    const n = (...k) => { const v = Number(pick(d, ...k)); return Number.isFinite(v) ? v : undefined; };
    let top = pick(d, 'top_commands', 'commands_top', 'popular_commands');
    if (top && !Array.isArray(top) && typeof top === 'object') top = Object.entries(top).map(([name, count]) => ({ name, count }));
    top = (top || []).map(x => ({ name: String(pick(x, 'name', 'command', 'cmd') ?? '?'), count: Number(pick(x, 'count', 'uses', 'total', 'value') ?? 0) })).sort((a, b) => b.count - a.count);
    let daily = pick(d, 'daily', 'requests_by_day', 'commands_by_day', 'history');
    daily = Array.isArray(daily) ? daily.map((x, i) => (typeof x === 'number'
      ? { label: `J-${daily.length - 1 - i}`, value: x }
      : { label: String(pick(x, 'date', 'day', 'label') ?? i), value: Number(pick(x, 'count', 'value', 'total', 'commands') ?? 0) })) : null;
    let delays = pick(d, 'detection_delays', 'detection_delay', 'delays');
    if (Array.isArray(delays)) delays = delays.map(x => ({ name: String(pick(x, 'name', 'os', 'label') ?? '?'), value: Number(pick(x, 'seconds', 'value', 'avg', 'delay') ?? 0) }));
    else if (delays && typeof delays === 'object') delays = Object.entries(delays).map(([name, value]) => ({ name, value: Number(value) }));
    else delays = null;
    return {
      commands: n('commands_executed', 'total_commands', 'commands_total'),
      servers: n('active_servers', 'servers', 'guilds', 'guild_count'),
      avgResponse: n('avg_response_ms', 'avg_response_time_ms', 'avg_latency_ms', 'average_response_ms'),
      avgDetect: n('avg_notification_seconds', 'avg_detection_seconds', 'avg_detection_s', 'avg_notification_s'),
      releases: n('releases_indexed', 'indexed_releases', 'firmwares', 'releases'),
      top, daily, delays
    };
  }

  /* ---------------------------------------------------- Données d'exemple
   *  Affichées uniquement si l'API est injoignable (bandeau d'avertissement). */
  const SERVICES = ['App Store', 'App Store Connect', 'Apple Account', 'Apple Arcade', 'Apple Business Connect', 'Apple Business Essentials', 'Apple Business Manager', 'Apple Card', 'Apple Cash', 'Apple Developer', 'Apple Fitness+', 'Apple Music', 'Apple Music Radio', 'Apple News', 'Apple Online Store', 'Apple Pay', 'Apple School Manager', 'Apple TV', 'Apple TV Channels', 'AppleCare on Device', 'Books', 'Dictation', 'FaceTime', 'Find My', 'Game Center', 'Health Sharing', 'iCloud Backup', 'iCloud Bookmarks & Tabs', 'iCloud Calendar', 'iCloud Contacts', 'iCloud Drive', 'iCloud Keychain', 'iCloud Mail', 'iCloud Notes', 'iCloud Private Relay', 'iCloud Reminders', 'iCloud Storage Upgrades', 'iCloud Web Apps', 'iMessage', 'iOS Device Activation', 'iTunes Match', 'iTunes Store', 'iWork for iCloud', 'Mac App Store', 'macOS Software Update', 'Mail Drop', 'Maps Display', 'Maps Routing & Navigation', 'Maps Search', 'Maps Traffic', 'Notarization', 'Photos', 'Podcasts', 'Radio', 'Schoolwork', 'Screen Time', 'Sign in with Apple', 'Siri', 'Spotlight Suggestions', 'Stocks', 'TestFlight', 'Volume Purchase Program', 'Walkie-Talkie', 'Weather', 'Wallet', 'Apple Messages for Business', 'Global Service Exchange', 'Managed Apple Accounts', 'Apple Developer Forums', 'Apple Intelligence', 'Private Cloud Compute']; // 71

  const rel = (os, version, build, date, type, signed) => normRelease({ os, version, build, date, type, signed, sample: true });
  const sampleReleases = () => [
    rel('iOS', '27.0', '24A427', '2026-09-14', 'release', true),
    rel('iPadOS', '27.0', '24A427', '2026-09-14', 'release', true),
    rel('macOS', '27.0', '25A354', '2026-09-14', 'release', true),
    rel('watchOS', '27.0', '24R364', '2026-09-14', 'release', true),
    rel('visionOS', '27.0', '24N330', '2026-09-14', 'release', true),
    rel('iOS', '27.1 beta 2', '24B5059e', '2026-10-01', 'dev-beta'),
    rel('iOS', '27.1 beta 1', '24B5043d', '2026-09-23', 'public-beta'),
    rel('macOS', '27.1 RC', '25B77', '2026-10-02', 'rc'),
    rel('AirPods', 'Pro 2 (7E93)', '7E93', '2026-09-08', 'release', true),
    rel('iOS', '18.1', '22B83', '2024-10-28', 'release', false),
    rel('iOS', '18.0.1', '22A3370', '2024-10-03', 'release', false),
    rel('iOS', '18.0', '22A3354', '2024-09-16', 'release', false)
  ];

  const dev = (name, cat, soc, ram, released, ai, why) => normDevice({
    name, category: cat, soc, ram, released,
    apple_intelligence: { supported: ai, reason: why }
  });
  const R = {
    ok: { fr: 'Neural Engine 16 cœurs et au moins 8 Go de mémoire unifiée : les modèles Apple Foundation tournent en local.', en: '16-core Neural Engine and at least 8 GB of unified memory: Apple Foundation models run on device.' },
    ram: { fr: 'Moins de 8 Go de mémoire : sous le minimum requis pour les modèles locaux.', en: 'Less than 8 GB of memory: below the minimum for on-device models.' },
    npu: { fr: 'Puce trop ancienne : le Neural Engine ne suffit pas pour exécuter les modèles locaux.', en: 'Chip too old: its Neural Engine cannot run the on-device models.' },
    intel: { fr: 'Architecture Intel : pas de Neural Engine, donc pas d’exécution locale.', en: 'Intel architecture: no Neural Engine, so no on-device execution.' }
  };
  const sampleDevices = () => [
    dev('iPhone 16 Pro', 'iPhone', 'A18 Pro', 8, '2024-09-20', true, R.ok),
    dev('iPhone 15 Pro', 'iPhone', 'A17 Pro', 8, '2023-09-22', true, R.ok),
    dev('iPhone 15', 'iPhone', 'A16 Bionic', 6, '2023-09-22', false, R.ram),
    dev('iPhone 12', 'iPhone', 'A14 Bionic', 4, '2020-10-23', false, R.npu),
    dev('iPhone 8', 'iPhone', 'A11 Bionic', 2, '2017-09-22', false, R.npu),
    dev('iPad Pro 13" (M4)', 'iPad', 'M4', 8, '2024-05-15', true, R.ok),
    dev('iPad Air (M2)', 'iPad', 'M2', 8, '2024-05-15', true, R.ok),
    dev('iPad (10e génération)', 'iPad', 'A14 Bionic', 4, '2022-10-26', false, R.ram),
    dev('MacBook Air (M3)', 'Mac', 'M3', 8, '2024-03-08', true, R.ok),
    dev('Mac mini (M4)', 'Mac', 'M4', 16, '2024-11-08', true, R.ok),
    dev('MacBook Pro 15" (2015)', 'Mac', 'Intel Core i7', 16, '2015-05-19', false, R.intel),
    dev('Apple Watch Series 10', 'Watch', 'S10', 1, '2024-09-20', null, null),
    dev('AirPods Pro 2', 'AirPods', 'H2', null, '2022-09-23', null, null),
    dev('AirPods Max', 'AirPods', 'H1', null, '2020-12-15', null, null)
  ];
  const sampleAnalytics = () => ({
    commands: 128430, servers: 312, avgResponse: 184, avgDetect: 12, releases: 3842,
    top: [['/info', 41200], ['/latest', 27800], ['/ipsw', 19600], ['/compat', 15900], ['/apple_status', 9800], ['/prediction', 7400], ['/vintage', 4300], ['/roles', 2430]].map(([name, count]) => ({ name, count })),
    daily: [8200, 9100, 8700, 9600, 10400, 9900, 11800, 12600, 10200, 9800, 10700, 11500, 12900, 13400].map((value, i, a) => ({ label: `J-${a.length - 1 - i}`, value })),
    delays: [['iOS', 9], ['iPadOS', 11], ['macOS', 14], ['watchOS', 17], ['visionOS', 16], ['AirPods', 31]].map(([name, value]) => ({ name, value }))
  });

  /* ------------------------------------------------------------------ Réseau */
  async function api(path, { timeout = 6500 } = {}) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeout);
    try {
      const res = await fetch(window.API_BASE + path, { signal: ctrl.signal, headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return await res.json();
    } finally { clearTimeout(timer); }
  }
  async function apiOr(path, fallback, opts) {
    try { return { data: await api(path, opts), live: true }; }
    catch (error) { return { data: typeof fallback === 'function' ? fallback() : fallback, live: false, error }; }
  }

  async function health() {
    const r = await apiOr('/health', null, { timeout: 5000 });
    if (!r.live || !r.data) return { live: false, ok: false };
    const d = r.data;
    const status = d.status;
    const ok = truthy(status) ?? (String(status).toLowerCase() === 'healthy');
    const ping = Number(pick(d, 'gateway_ping_ms', 'ping_ms', 'latency_ms'));
    const up = Number(pick(d, 'uptime_seconds', 'uptime'));
    return {
      live: true,
      ok: ok !== false,
      ping: Number.isFinite(ping) ? ping : null,
      uptime: Number.isFinite(up) ? up : null,
      db: truthy(pick(d, 'database', 'database_connected', 'db')),
      pallas: truthy(pick(d, 'pallas', 'pallas_running', 'pallas_loop_ok'))
    };
  }
  const healthState = h => (!h.live ? 'down' : (h.ok && h.db !== false && h.pallas !== false) ? 'ok' : 'warn');
  const HEALTH_TXT = {
    ok: ['Systèmes opérationnels', 'All systems operational'],
    warn: ['Fonctionnement dégradé', 'Degraded performance'],
    down: ['Statut indisponible', 'Status unavailable'],
    load: ['Vérification en cours…', 'Checking…']
  };
  const setPill = (el, state) => {
    el.dataset.state = state;
    el.innerHTML = `<i class="dot"></i><span>${bi(...HEALTH_TXT[state])}</span>`;
  };
  async function healthPill(el) {
    setPill(el, 'load');
    const h = await health();
    setPill(el, healthState(h));
    return h;
  }

  async function loadServices() {
    const r = await apiOr('/api/public/status', null);
    const d = r.data;
    let list = null;
    if (d && typeof d === 'object') {
      const raw = d.apple_services || d.services || d.apple_status;
      if (Array.isArray(raw)) list = raw.map(normService);
      else if (raw && typeof raw === 'object') list = Object.entries(raw).map(([name, v]) => normService(typeof v === 'object' ? { name, ...v } : { name, status: v }));
    }
    if (list && list.length) return { list, live: true, pub: d, apiLive: true };
    return { list: SERVICES.map(name => ({ name, status: 'unknown' })), live: false, pub: d, apiLive: r.live };
  }
  async function loadReleases({ page = 1, limit = 60 } = {}) {
    const r = await apiOr(`/api/releases?page=${page}&limit=${limit}`, null);
    if (!r.live || !r.data) return { items: sampleReleases(), live: false, more: false };
    const d = r.data;
    const arr = Array.isArray(d) ? d : (d.items || d.releases || d.results || d.data || []);
    const items = arr.map(normRelease);
    const more = !!(d.next || d.has_more || (d.pages && page < d.pages) || (!Array.isArray(d) && d.total && page * limit < d.total) || items.length >= limit);
    return { items, live: true, more, total: d.total };
  }
  async function loadDevices() {
    const r = await apiOr('/api/devices', null, { timeout: 9000 });
    if (!r.live || !r.data) return { items: sampleDevices(), live: false };
    const d = r.data;
    const arr = Array.isArray(d) ? d : (d.items || d.devices || d.results || d.data || []);
    return { items: arr.map(normDevice), live: true };
  }
  async function loadAnalytics() {
    const r = await apiOr('/api/analytics', null);
    const base = sampleAnalytics();
    if (!r.live || !r.data) return { ...base, live: false };
    const n = normAnalytics(r.data);
    const out = { live: true };
    for (const k of Object.keys(base)) {
      const v = n[k];
      out[k] = (v === undefined || v === null || (Array.isArray(v) && !v.length)) ? base[k] : v;
    }
    return out;
  }

  /* ----------------------------------------------------------- UI utilitaires */
  const skeleton = (n, cls = 'sk-row') => Array.from({ length: n }, () => `<div class="sk ${cls}"></div>`).join('');
  function notice(host, live, retry) {
    let n = host.querySelector(':scope > .notice');
    if (live) { n?.remove(); return; }
    if (!n) { n = document.createElement('div'); n.className = 'notice'; n.setAttribute('role', 'status'); host.prepend(n); }
    n.innerHTML = `${icon('activity', 18)}<p>${bi('L’API ne répond pas pour l’instant : des données d’exemple sont affichées.', 'The API is not responding right now: sample data is shown.')}</p>` +
      (retry ? `<button class="btn btn-ghost btn-sm" type="button" data-retry>${icon('refresh', 15)}${bi('Réessayer', 'Retry')}</button>` : '');
    n.querySelector('[data-retry]')?.addEventListener('click', retry);
  }
  function countUp(el, to, { dec = 0, dur = 1100, suffix = '' } = {}) {
    const fmt = v => v.toLocaleString(loc(), { minimumFractionDigits: dec, maximumFractionDigits: dec }) + suffix;
    if (reduced || !('IntersectionObserver' in window)) { el.textContent = fmt(to); return; }
    el.textContent = fmt(0);
    const io = new IntersectionObserver(es => {
      if (!es[0].isIntersecting) return;
      io.disconnect();
      const t0 = performance.now();
      const step = now => {
        const p = Math.min(1, (now - t0) / dur);
        el.textContent = fmt(to * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
    io.observe(el);
  }

  /* Graphique en courbe : Chart.js si chargé, sinon SVG de secours */
  function lineChart(canvas, labels, values, { color = '#2997ff', unit = 'ms' } = {}) {
    if (window.Chart) {
      if (canvas._chart) {
        canvas._chart.data.labels = labels; canvas._chart.data.datasets[0].data = values; canvas._chart.update('none'); return;
      }
      Chart.defaults.color = '#a1a1a6';
      Chart.defaults.font.family = getComputedStyle(document.body).fontFamily;
      const ctx = canvas.getContext('2d');
      const g = ctx.createLinearGradient(0, 0, 0, 250);
      g.addColorStop(0, color + '55'); g.addColorStop(1, color + '00');
      canvas._chart = new Chart(ctx, {
        type: 'line',
        data: { labels, datasets: [{ data: values, borderColor: color, backgroundColor: g, fill: true, tension: .35, pointRadius: 0, pointHoverRadius: 4, borderWidth: 2 }] },
        options: {
          responsive: true, maintainAspectRatio: false, animation: { duration: 500 },
          interaction: { intersect: false, mode: 'index' },
          plugins: { legend: { display: false }, tooltip: { displayColors: false, callbacks: { label: c => `${c.parsed.y.toLocaleString(loc())} ${unit}` } } },
          scales: {
            x: { grid: { display: false }, ticks: { maxTicksLimit: 6 } },
            y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,.06)' }, border: { display: false }, ticks: { maxTicksLimit: 5 } }
          }
        }
      });
      return;
    }
    canvas.style.display = 'none';
    let fb = canvas.parentElement.querySelector('.fb-chart');
    if (!fb) { fb = document.createElement('div'); fb.className = 'fb-chart'; canvas.parentElement.append(fb); }
    const W = 600, H = 250, max = Math.max(1, ...values) * 1.15;
    const pts = values.map((v, i) => [values.length > 1 ? i / (values.length - 1) * W : 0, H - 20 - (v / max) * (H - 40)]);
    const line = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
    fb.innerHTML = `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="${esc(unit)}"><defs><linearGradient id="fbg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${color}" stop-opacity=".3"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></linearGradient></defs><path d="${line} L${W} ${H} L0 ${H}Z" fill="url(#fbg)"/><path d="${line}" fill="none" stroke="${color}" stroke-width="2" vector-effect="non-scaling-stroke"/></svg>`;
  }

  /* ------------------------------------------------------------ Rendu Discord */
  const md = s => esc(s).replace(/`([^`]+)`/g, '<code class="dc-code">$1</code>').replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
  function dcMessage({ cmd, embed, buttons = [], select } = {}) {
    const time = new Date().toLocaleTimeString(loc(), { hour: '2-digit', minute: '2-digit' });
    let h = '<div class="dc">';
    if (cmd) h += `<div class="dc-cmd"><b>${esc(t('Vous', 'You'))}</b> ${esc(t('avez utilisé', 'used'))} <span class="dc-slash">${esc(cmd)}</span></div>`;
    h += `<div class="dc-msg"><div class="dc-avatar">${logoMark(40)}</div><div class="dc-body"><div class="dc-head"><span class="dc-name">AppleCore</span><span class="dc-tag">BOT</span><span class="dc-time">${esc(t('Aujourd’hui à ', 'Today at ') + time)}</span></div>`;
    if (embed) {
      h += `<div class="dc-embed${embed.enter ? ' enter' : ''}" style="--c:${esc(embed.color || '#0a84ff')}">`;
      if (embed.title) h += `<div class="dc-title">${md(embed.title)}</div>`;
      if (embed.desc) h += `<div class="dc-desc" style="--i:0">${md(embed.desc)}</div>`;
      if (embed.fields?.length) {
        h += '<div class="dc-fields">' + embed.fields.map((f, i) =>
          `<div class="dc-field${f.inline ? ' inline' : ''}" style="--i:${i + 1}"><div class="dc-fname">${md(f.name)}</div><div class="dc-fval">${md(f.value)}</div></div>`).join('') + '</div>';
      }
      if (embed.footer) h += `<div class="dc-foot">${logoMark(16)}<span>${esc(embed.footer)}</span></div>`;
      h += '</div>';
    }
    if (select) {
      h += `<div class="dc-select"><div class="dc-select-head"><span>${esc(select.placeholder)}</span>${icon('chevdown', 16)}</div>` +
        (select.options || []).map(o => `<div class="dc-select-opt"><i class="${o.on ? 'on' : ''}"></i><span>${esc(o.label)}</span></div>`).join('') + '</div>';
    }
    if (buttons.length) h += '<div class="dc-btns">' + buttons.map(b => `<span class="dc-btn${b.primary ? ' primary' : ''}">${esc(b.label)}</span>`).join('') + '</div>';
    return h + '</div></div></div>';
  }

  /* ------------------------------------------------------- Header & footer */
  const NAV = [
    ['index', 'index.html', 'Accueil', 'Home'],
    ['releases', 'releases.html', 'Firmwares', 'Releases'],
    ['devices', 'devices.html', 'Appareils', 'Devices'],
    ['status', 'status_public.html', 'Statut', 'Status'],
    ['help', 'help.html', 'Documentation', 'Docs']
  ];
  function mountChrome(active) {
    const header = $('#site-header'), footer = $('#site-footer');
    if (header) {
      header.className = 'site-header';
      header.innerHTML = `<div class="wrap hdr">
        <a class="brand" href="index.html" aria-label="AppleCore">${logoMark(28)}<span>AppleCore</span></a>
        <nav class="nav" id="nav" aria-label="Navigation principale">
          ${NAV.map(([k, href, fr, en]) => `<a href="${href}"${k === active ? ' aria-current="page"' : ''}>${bi(fr, en)}</a>`).join('')}
          <a class="nav-invite" href="${LINKS.invite}" target="_blank" rel="noopener">${bi('Inviter le bot', 'Add to Discord')}</a>
        </nav>
        <div class="hdr-actions">
          <div class="lang-switch" role="group" aria-label="Langue / Language"><button type="button" data-lang="fr">FR</button><button type="button" data-lang="en">EN</button></div>
          <a class="btn btn-primary btn-sm" href="${LINKS.invite}" target="_blank" rel="noopener">${bi('Inviter le bot', 'Add to Discord')}</a>
          <button class="menu-btn" type="button" aria-expanded="false" aria-controls="nav" data-aria-fr="Ouvrir le menu" data-aria-en="Open menu">${icon('menu', 20)}</button>
        </div></div>`;
      const nav = $('#nav', header), btn = $('.menu-btn', header);
      btn.addEventListener('click', () => { const open = nav.classList.toggle('open'); btn.setAttribute('aria-expanded', String(open)); });
      nav.addEventListener('click', e => { if (e.target.closest('a')) { nav.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); } });
      $$('.lang-switch button', header).forEach(b => b.addEventListener('click', () => setLang(b.dataset.lang)));
      const onScroll = () => header.classList.toggle('scrolled', scrollY > 8);
      addEventListener('scroll', onScroll, { passive: true }); onScroll();
    }
    if (footer) {
      footer.className = 'site-footer';
      footer.innerHTML = `<div class="wrap">
        <div class="ftr">
          <div><a class="brand" href="index.html">${logoMark(26)}<span>AppleCore</span></a>
            <p>${bi('La sentinelle des mises à jour Apple pour Discord : firmwares, signatures et statut des services, en temps réel.', 'The Apple update sentinel for Discord: firmwares, signing status and service health, in real time.')}</p></div>
          <div><h4>${bi('Explorer', 'Explore')}</h4>
            <a href="releases.html">${bi('Firmwares Apple', 'Apple firmwares')}</a>
            <a href="devices.html">${bi('Appareils & Apple Intelligence', 'Devices & Apple Intelligence')}</a>
            <a href="status_public.html">${bi('Statut du système', 'System status')}</a>
            <a href="analytics_dashboard.html">${bi('Statistiques publiques', 'Public analytics')}</a></div>
          <div><h4>${bi('Ressources', 'Resources')}</h4>
            <a href="help.html">${bi('Documentation & commandes', 'Docs & commands')}</a>
            <a href="privacy.html">${bi('Confidentialité', 'Privacy')}</a>
            <a href="terms.html">${bi('Conditions', 'Terms')}</a>
            <a href="${LINKS.github}" target="_blank" rel="noopener">GitHub</a>
            ${LINKS.support ? `<a href="${LINKS.support}" target="_blank" rel="noopener">${bi('Support Discord', 'Discord support')}</a>` : ''}</div>
        </div>
        <p class="legal">© ${new Date().getFullYear()} AppleCore — ${bi('Développé par TiboTsr. Non affilié à Apple Inc. Apple, iOS, iPadOS, macOS, watchOS, visionOS et AirPods sont des marques déposées d’Apple Inc.', 'Built by TiboTsr. Not affiliated with Apple Inc. Apple, iOS, iPadOS, macOS, watchOS, visionOS and AirPods are trademarks of Apple Inc.')}</p></div>`;
    }
    applyLang();
  }

  /* -------------------------------------------------------------------- API */
  window.AC = {
    LINKS, store, $, $$, esc, pick, debounce, reduced, ready, bi, t, loc, applyLang, setLang,
    get lang() { return lang; },
    fmtDate, fmtNum, fmtUptime, relTime, icon, logoMark,
    OS_LIST, OS_ICON, osKey, TYPES, osIcon, typeBadge, CAT_ICON, fmtRam, reasonText, vintageOf,
    SERVICES, sampleReleases, sampleDevices, sampleAnalytics,
    api, apiOr, health, healthState, healthPill, setPill, loadServices, loadReleases, loadDevices, loadAnalytics,
    skeleton, notice, countUp, lineChart, dcMessage, mountChrome
  };
})();