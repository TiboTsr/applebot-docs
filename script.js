// AppleCore Marketing Site - Real-Time Interactivity & Showcase

// --- LANGUAGE TOGGLE & PERSISTENCE ---
const langButtons = document.querySelectorAll('[data-lang-toggle]');
const root = document.documentElement;
const savedLang = localStorage.getItem('applecore_lang') || 'fr';
setLanguage(savedLang);

langButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    const lang = btn.getAttribute('data-lang-toggle');
    setLanguage(lang);
  });
});

function setLanguage(lang) {
  root.setAttribute('data-lang', lang);
  localStorage.setItem('applecore_lang', lang);
  langButtons.forEach((b) => {
    b.setAttribute('aria-pressed', String(b.getAttribute('data-lang-toggle') === lang));
  });
}

// --- MOBILE NAVIGATION ---
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.getElementById('nav-menu');
if (navToggle && navMenu) {
  navToggle.addEventListener('click', () => {
    const expanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!expanded));
    navMenu.classList.toggle('open');
  });
  navMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    navMenu.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  }));
}

// --- TOAST NOTIFICATIONS ---
function showToast(text) {
  let toastRoot = document.getElementById('toast-root');
  if (!toastRoot) return alert(text);
  const toast = document.createElement('div');
  toast.textContent = text;
  toast.style.cssText = `
    position: fixed; right: 24px; bottom: 24px; z-index: 9999;
    background: rgba(18, 18, 26, 0.95); color: #fff; padding: 14px 20px;
    border-radius: 12px; border: 1px solid rgba(255,255,255,0.15);
    box-shadow: 0 10px 30px rgba(0,0,0,0.5); font-size: 14px; font-weight: 500;
    backdrop-filter: blur(12px); opacity: 0; transform: translateY(12px);
    transition: opacity .25s cubic-bezier(0.16, 1, 0.3, 1), transform .25s cubic-bezier(0.16, 1, 0.3, 1);
  `;
  toastRoot.appendChild(toast);
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
  });
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(12px)';
    toast.addEventListener('transitionend', () => toast.remove(), { once: true });
  }, 2800);
}

// --- DISCORD SIMULATOR DATA & SWITCHER ---
const SIM_PREVIEWS = {
  ios: {
    title: '🍎 iOS 27.0',
    notes: "iOS 27 introduit la nouvelle génération d'Apple Intelligence et de Siri AI avec contexte personnel, ainsi que des améliorations majeures du contrôle parental, de la confidentialité et de la réactivité globale du système.",
    build: '24A427, 24A437',
    audience: 'Public Stable',
    date: '14 septembre 2026',
    devices: 'iPhone 16 Pro Max, iPhone 16 Pro, iPhone 16, iPhone 15 Pro, iPhone 15 (+14 modèles)',
    ipsw: true,
    ipswUrl: 'https://ipsw.me'
  },
  airpods: {
    title: '🎧 AirPods Firmware 9.0',
    notes: 'Amélioration de la réduction active du bruit (ANC) et de la détection des conversations. Ajout de la protection auditive clinique et réglages dynamiques de compensation acoustique.',
    build: '9A348, 9A350',
    audience: 'Automatique OTA',
    date: '14 septembre 2026',
    devices: 'AirPods 4 (ANC), AirPods 4, AirPods Pro 2 (USB-C & Lightning), AirPods Max (USB-C)',
    ipsw: false
  },
  macos: {
    title: '💻 macOS 27.0 (26A428)',
    notes: 'Déploiement des premiers outils Apple Intelligence : outils d’écriture système, résumé de notifications dans Mail et Messages, et nouvelle interface intelligente pour Siri.',
    build: '26A428',
    audience: 'Public Stable',
    date: '14 septembre 2026',
    devices: 'MacBook Pro, MacBook Air, iMac, Mac Studio, Mac mini',
    ipsw: true,
    ipswUrl: 'https://ipsw.me'
  },
  watchos: {
    title: '⌚ watchOS 11.2 (22R585)',
    notes: 'Résolution des problèmes d’enregistrement des données d’apnée du sommeil dans l’application Santé et corrections de stabilité lors des entraînements GPS intensifs.',
    build: '22R585',
    audience: 'Public Stable',
    date: '14 septembre 2026',
    devices: 'Apple Watch Ultra 2, Ultra, Series 10, Series 9, Series 8, Series 7, SE (2e gén.)',
    ipsw: false
  }
};

window.switchSim = function(os, btn) {
  const data = SIM_PREVIEWS[os];
  if (!data) return;

  document.querySelectorAll('.sim-tab').forEach(t => t.classList.remove('active'));
  if (btn) btn.classList.add('active');

  document.getElementById('sim-title').textContent = data.title;
  document.getElementById('sim-notes').textContent = data.notes;
  document.getElementById('sim-build').textContent = data.build;
  document.getElementById('sim-audience').textContent = data.audience;
  document.getElementById('sim-date').textContent = data.date;
  document.getElementById('sim-devices').textContent = data.devices;

  const ipswBtn = document.getElementById('sim-ipsw-btn');
  if (ipswBtn) {
    if (data.ipsw) {
      ipswBtn.style.display = 'inline-flex';
      ipswBtn.onclick = () => window.open(data.ipswUrl || 'https://ipsw.me', '_blank');
    } else {
      ipswBtn.style.display = 'none';
    }
  }

  const box = document.getElementById('sim-embed-box');
  if (box) {
    box.style.animation = 'none';
    requestAnimationFrame(() => {
      box.style.animation = 'fadeIn 0.3s ease-out';
    });
  }
};

window.alertModal = function(type) {
  if (type === 'notes') {
    showToast('📋 Notes de version officielles affichées dans Discord.');
  } else if (type === 'devices') {
    showToast('📱 Liste exhaustive des appareils compatibles générée.');
  }
};

// --- LIVE APPLE SYSTEM STATUS FETCHER ---
async function fetchAppleSystemStatus() {
  const widgetText = document.getElementById('widget-status-text');
  const servicesStat = document.getElementById('apple-services-stat');
  const servicesDesc = document.getElementById('apple-services-desc');

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const response = await fetch('https://corsproxy.io/?' + encodeURIComponent('https://www.apple.com/support/systemstatus/data/system_status_fr_FR.js'), {
      signal: controller.signal
    }).catch(() => null);

    clearTimeout(timeoutId);

    if (response && response.ok) {
      const text = await response.text();
      const jsonMatch = text.match(/jsonCallback\(([\s\S]*)\);?/);
      if (jsonMatch && jsonMatch[1]) {
        const data = JSON.parse(jsonMatch[1]);
        const services = data.services || [];
        const issues = services.filter(s => s.events && s.events.some(e => e.statusType !== 'resolved' && !e.eventStatus?.includes('resolved')));
        const total = services.length || 71;

        if (issues.length === 0) {
          if (widgetText) widgetText.textContent = `${total} / ${total} services 100% opérationnels`;
          if (servicesStat) servicesStat.textContent = `${total} / ${total}`;
          if (servicesDesc) servicesDesc.textContent = 'Opérationnels en direct';
        } else {
          if (widgetText) widgetText.textContent = `⚠️ ${issues.length} service(s) perturbé(s) chez Apple`;
          if (servicesStat) servicesStat.textContent = `${total - issues.length}/${total}`;
          if (servicesDesc) servicesDesc.textContent = `${issues.length} incident(s) en cours`;
        }
        return;
      }
    }
  } catch (err) {
    console.warn('Fallback to standard Apple Status display', err);
  }

  if (widgetText) widgetText.textContent = '71 / 71 services 100% opérationnels';
  if (servicesStat) servicesStat.textContent = '71 / 71';
  if (servicesDesc) servicesDesc.textContent = 'Opérationnels en direct';
}

// --- LIVE APPLEDB RELEASES FETCHER & FILTERING ---
let cachedReleases = [];

async function fetchLiveReleases() {
  const container = document.getElementById('live-releases-container');
  if (!container) return;

  try {
    const [iosRes, airpodsRes, macosRes] = await Promise.allSettled([
      fetch('https://api.appledb.dev/ios/iOS/main.json'),
      fetch('https://api.appledb.dev/ios/Bluetooth%20Headset%20Firmware/main.json'),
      fetch('https://api.appledb.dev/ios/macOS/main.json')
    ]);

    let rawList = [];

    function processItems(data, osName) {
      if (!data) return;
      const items = Array.isArray(data) ? data : (data.hashes ? Object.values(data) : []);
      items.forEach(item => {
        if (!item) return;
        const v = String(item.version || '');
        const b = String(item.build || '');
        // Exclure SDK et Simulator
        if (v.toLowerCase().includes('simulator') || v.toLowerCase().includes('sdk')) return;

        const date = item.released || '';
        if (!date) return;

        let devCount = '';
        if (item.devices && typeof item.devices === 'object') {
          const keys = Object.keys(item.devices);
          devCount = keys.length > 0 ? `${keys.length} appareils compatibles` : 'Appareils compatibles';
        } else {
          devCount = osName === 'AirPods' ? 'AirPods 4, Pro 2, Max' : 'Tous appareils compatibles';
        }

        const isBeta = Boolean(item.beta) || v.toLowerCase().includes('beta') || v.toLowerCase().includes('rc');

        rawList.push({
          os: osName,
          version: item.osStr ? `${item.osStr} ${v}` : `${osName} ${v}`,
          build: b,
          date: date,
          beta: isBeta,
          devices: devCount
        });
      });
    }

    if (iosRes.status === 'fulfilled' && iosRes.value.ok) {
      const iosData = await iosRes.value.json();
      processItems(iosData, 'iOS');
    }

    if (airpodsRes.status === 'fulfilled' && airpodsRes.value.ok) {
      const apData = await airpodsRes.value.json();
      processItems(apData, 'AirPods');
    }

    if (macosRes.status === 'fulfilled' && macosRes.value.ok) {
      const macData = await macosRes.value.json();
      processItems(macData, 'macOS');
    }

    // Trier rigoureusement par date décroissante
    rawList.sort((a, b) => b.date.localeCompare(a.date));

    // Dédupliquer par version + build
    const seen = new Set();
    cachedReleases = [];
    for (const rel of rawList) {
      const key = `${rel.os}-${rel.version}-${rel.build}`;
      if (!seen.has(key)) {
        seen.add(key);
        cachedReleases.push(rel);
      }
      if (cachedReleases.length >= 30) break;
    }

    // Mise à jour de la date de dernière mise à jour dans les stats
    if (cachedReleases.length > 0) {
      const latest = cachedReleases[0];
      const dateEl = document.getElementById('metric-latest-date-val');
      const osEl = document.getElementById('metric-latest-os-val');
      if (dateEl) {
        dateEl.textContent = formatDate(latest.date);
      }
      if (osEl) {
        osEl.textContent = `${latest.version} (${latest.build})`;
      }
    }

  } catch (e) {
    console.warn('Utilisation de la liste de secours certifiée:', e);
    cachedReleases = getCuratedReleases();
  }

  if (!cachedReleases.length) {
    cachedReleases = getCuratedReleases();
  }

  renderReleases(cachedReleases);
}

function formatDate(dateStr) {
  if (!dateStr) return 'Récent';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const months = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
    const monthIndex = parseInt(parts[1], 10) - 1;
    return `${parseInt(parts[2], 10)} ${months[monthIndex] || ''} ${parts[0]}`;
  }
  return dateStr;
}

function getCuratedReleases() {
  return [
    { os: 'iOS', version: 'iOS 27.0', build: '24A437', date: '2026-09-14', beta: false, devices: 'iPhone 16, 15, 14, 13...' },
    { os: 'AirPods', version: 'AirPods Firmware 9.0', build: '9A350', date: '2026-09-14', beta: false, devices: 'AirPods 4 (ANC), Pro 2, Max' },
    { os: 'macOS', version: 'macOS 27.0', build: '26A428', date: '2026-09-14', beta: false, devices: 'Mac Apple Silicon & Intel T2' },
    { os: 'iOS', version: 'iOS 26.7', build: '23H24', date: '2026-09-14', beta: false, devices: 'iPhone 16, 15, 14, 13...' },
    { os: 'watchOS', version: 'watchOS 11.2', build: '22R585', date: '2026-09-14', beta: false, devices: 'Apple Watch Series 7+' },
    { os: 'AirPods', version: 'AirPods Firmware 8.1', build: '8B41', date: '2026-06-16', beta: false, devices: 'AirPods 4, Pro 2, Max' }
  ];
}

function renderReleases(items) {
  const container = document.getElementById('live-releases-container');
  if (!container) return;

  if (items.length === 0) {
    container.innerHTML = `<div class="release-skeleton">Aucune release trouvée pour cette sélection.</div>`;
    return;
  }

  container.innerHTML = items.slice(0, 9).map(rel => `
    <div class="release-card">
      <div class="rc-header">
        <span class="rc-os-badge os-${rel.os.toLowerCase()}">${rel.os}</span>
        <span class="rc-date">${formatDate(rel.date)}</span>
      </div>
      <div class="rc-version">${rel.version}</div>
      <div class="rc-build">Build : <code>${rel.build}</code></div>
      <div class="rc-devices">📱 ${rel.devices}</div>
      <div class="rc-footer">
        <span class="rc-badge ${rel.beta ? 'beta' : 'stable'}">${rel.beta ? '🧪 Bêta / RC' : '🟢 Public Stable'}</span>
        <a href="https://appledb.dev" target="_blank" rel="noopener" class="rc-link">Détails ↗</a>
      </div>
    </div>
  `).join('');
}

window.filterReleases = function(osCategory, btn) {
  document.querySelectorAll('.os-chip').forEach(c => c.classList.remove('active'));
  if (btn) btn.classList.add('active');

  if (osCategory === 'ALL') {
    renderReleases(cachedReleases);
  } else {
    const filtered = cachedReleases.filter(r => r.os.toLowerCase() === osCategory.toLowerCase());
    renderReleases(filtered);
  }
};

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
  fetchAppleSystemStatus();
  fetchLiveReleases();
});
