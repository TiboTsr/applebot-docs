const fs = require('fs');
const path = require('path');

// Configuration
const DOMAIN = 'https://docs.applebot.fr';
const OUTPUT_FILE = 'sitemap.xml';

// Pages à inclure avec leurs priorités et fréquences de mise à jour
const pages = [
  { url: '/', priority: '1.0', changefreq: 'daily' },
  { url: '/help.html', priority: '0.9', changefreq: 'weekly' },
  { url: '/privacy.html', priority: '0.5', changefreq: 'monthly' },
  { url: '/terms.html', priority: '0.5', changefreq: 'monthly' }
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
