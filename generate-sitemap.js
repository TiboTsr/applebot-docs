const fs = require('fs');
const path = require('path');

// Configuration
const DOMAIN = 'https://pallasradar.tibotsr.dev';
const OUTPUT_FILE = 'sitemap.xml';

const pages = [
  { url: '/', priority: '1.0', changefreq: 'daily' },
  { url: '/releases.html', priority: '0.9', changefreq: 'daily' },
  { url: '/devices.html', priority: '0.9', changefreq: 'weekly' },
  { url: '/status_public.html', priority: '0.9', changefreq: 'hourly' },
  { url: '/help.html', priority: '0.9', changefreq: 'weekly' },
  { url: '/privacy.html', priority: '0.6', changefreq: 'monthly' },
  { url: '/terms.html', priority: '0.6', changefreq: 'monthly' }
];

// Date du jour au format ISO
const today = new Date().toISOString().split('T')[0];

// Génération du XML
let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

pages.forEach(page => {
  xml += `  <url>
    <loc>${DOMAIN}${page.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`;
});

xml += `</urlset>`;

// Écriture du fichier
fs.writeFileSync(OUTPUT_FILE, xml);
console.log(`✅ Sitemap généré avec succès : ${OUTPUT_FILE}`);
