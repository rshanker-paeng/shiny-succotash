// Production build for the BWG advisory site.
//   npm install
//   npm run build   -> compiles src/index.html into ./index.html (the page GitHub Pages serves)
//
// For each page it:
//   1. compiles Tailwind with the pinned v3 CLI, using the tailwind.config object
//      already inside the page, and inlines the CSS (no cdn.tailwindcss.com);
//   2. replaces every <i data-lucide="..."> with inline SVG and ships a tiny
//      offline `lucide.createIcons()` for icons added later (no unpkg.com);
//   3. embeds Libre Baskerville (SIL OFL) so no Google Fonts request is needed.
// src/index.html keeps the CDN scripts so it still opens directly while editing.

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const ROOT = path.dirname(new URL(import.meta.url).pathname);
const TW_BIN = path.join(ROOT, 'node_modules', '.bin', 'tailwindcss');
const INPUT_CSS = path.join(ROOT, 'src', 'input.css');
const FONT_DIR = path.join(ROOT, 'node_modules', '@fontsource', 'libre-baskerville', 'files');
const lucide = require('lucide');
const LUCIDE_VERSION = require('lucide/package.json').version;
const TW_VERSION = require('tailwindcss/package.json').version;

const args = process.argv.slice(2);
const outDir = ROOT;
const inputs = args.length ? args : [path.join(ROOT, 'src', 'index.html')];
fs.mkdirSync(outDir, { recursive: true });

const pascal = name => name.split('-').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('');
const escAttr = v => String(v).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

function iconNode(name) {
  const node = lucide.icons[pascal(name)];
  if (!node) throw new Error(`Unknown Lucide icon "${name}" (lucide ${LUCIDE_VERSION})`);
  return node;
}
function svgFor(name, attrs) {
  const node = iconNode(name);
  const cls = ['lucide', 'lucide-' + name, attrs.class || ''].join(' ').trim();
  const base = { xmlns: 'http://www.w3.org/2000/svg', width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' };
  const extra = { ...attrs }; delete extra.class; delete extra['data-lucide'];
  if (!('aria-label' in extra) && !('aria-hidden' in extra)) extra['aria-hidden'] = 'true';
  const all = { ...base, ...extra, class: cls };
  const open = '<svg ' + Object.entries(all).map(([k, v]) => `${k}="${escAttr(v)}"`).join(' ') + '>';
  const kids = node.map(([tag, a]) => '<' + tag + ' ' + Object.entries(a).map(([k, v]) => `${k}="${escAttr(v)}"`).join(' ') + '/>').join('');
  return open + kids + '</svg>';
}
function parseAttrs(s) {
  const out = {}; const re = /([:\w-]+)(?:\s*=\s*"([^"]*)")?/g; let m;
  while ((m = re.exec(s))) out[m[1]] = m[2] === undefined ? '' : m[2];
  return out;
}

function buildPage(file) {
  let html = fs.readFileSync(file, 'utf8');
  const name = path.basename(file);
  const notes = [];

  // ---- 1. Tailwind: pull the config out of the page, compile with the CLI, inline ----
  const cfgRe = /<script>\s*tailwind\.config\s*=\s*(\{[\s\S]*?\})\s*;?\s*<\/script>\s*/;
  const cfgMatch = html.match(cfgRe);
  if (!cfgMatch) throw new Error(`${name}: no tailwind.config block found`);
  const config = new Function('return (' + cfgMatch[1] + ')')();
  html = html.replace(cfgRe, '').replace(/<script src="https:\/\/cdn\.tailwindcss\.com[^"]*"><\/script>\s*/, '');

  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'bwg-tw-'));
  const scan = path.join(tmp, 'page.html');
  fs.writeFileSync(scan, html);
  const cfgFile = path.join(tmp, 'tailwind.config.cjs');
  fs.writeFileSync(cfgFile, 'module.exports = ' + JSON.stringify({ ...config, content: [scan] }, null, 2) + ';\n');
  const cssOut = path.join(tmp, 'out.css');
  const r = spawnSync(TW_BIN, ['-c', cfgFile, '-i', INPUT_CSS, '-o', cssOut, '--minify'], { encoding: 'utf8' });
  if (r.status !== 0) throw new Error(`${name}: Tailwind CLI failed\n${r.stderr}`);
  const css = fs.readFileSync(cssOut, 'utf8');
  fs.rmSync(tmp, { recursive: true, force: true });
  // Same position the CDN used (end of <head>), so the cascade is unchanged.
  html = html.replace('</head>', `    <style data-built-with="tailwindcss ${TW_VERSION}">${css}</style>\n</head>`);
  notes.push(`tailwind ${(css.length / 1024).toFixed(1)} KB`);

  // ---- 2. Lucide: static SVG + offline shim ----
  const used = new Set([...html.matchAll(/data-lucide=["']([a-z0-9-]+)["']/g)].map(m => m[1]));
  let replaced = 0;
  html = html.replace(/<i\s+([^>]*\bdata-lucide="([a-z0-9-]+)"[^>]*)>\s*<\/i>/g, (_, attrs, icon) => { replaced++; return svgFor(icon, parseAttrs(attrs)); });
  const iconData = Object.fromEntries([...used].map(n => [n, iconNode(n)]));
  const shim = `<script>
    /* Lucide ${LUCIDE_VERSION} (ISC licence), only the icons this page uses. Offline drop-in for lucide.createIcons(). */
    window.lucide = window.lucide || (function () {
        var icons = ${JSON.stringify(iconData)};
        var NS = 'http://www.w3.org/2000/svg';
        function createIcons() {
            document.querySelectorAll('[data-lucide]').forEach(function (el) {
                var name = el.getAttribute('data-lucide'), node = icons[name];
                if (!node || el.tagName.toLowerCase() === 'svg') return;
                var svg = document.createElementNS(NS, 'svg');
                var base = { xmlns: NS, width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' };
                Object.keys(base).forEach(function (k) { svg.setAttribute(k, base[k]); });
                Array.prototype.forEach.call(el.attributes, function (a) { if (a.name !== 'data-lucide' && a.name !== 'class') svg.setAttribute(a.name, a.value); });
                svg.setAttribute('class', ('lucide lucide-' + name + ' ' + (el.getAttribute('class') || '')).trim());
                if (!svg.hasAttribute('aria-label') && !svg.hasAttribute('aria-hidden')) svg.setAttribute('aria-hidden', 'true');
                node.forEach(function (c) { var e = document.createElementNS(NS, c[0]); Object.keys(c[1]).forEach(function (k) { e.setAttribute(k, c[1][k]); }); svg.appendChild(e); });
                el.parentNode.replaceChild(svg, el);
            });
        }
        return { icons: icons, createIcons: createIcons };
    })();
    </script>`;
  const lucideTag = /<script src="https:\/\/(?:unpkg\.com|cdn\.jsdelivr\.net\/npm)\/lucide[^"]*"><\/script>/;
  if (lucideTag.test(html)) html = html.replace(lucideTag, shim);
  else html = html.replace('</head>', shim + '\n</head>');
  html = html.replace(/(^|[^.\w])lucide\.createIcons\(\)/g, '$1(window.lucide && lucide.createIcons())');
  notes.push(`lucide ${used.size} icons, ${replaced} inlined`);

  // ---- 3. Fonts: embed Libre Baskerville instead of Google Fonts ----
  if (/fonts\.googleapis\.com\/css2\?family=Libre\+Baskerville/.test(html)) {
    html = html.replace(/\s*<link rel="preconnect" href="https:\/\/fonts\.(?:googleapis|gstatic)\.com"[^>]*>/g, '');
    html = html.replace(/\s*<link href="https:\/\/fonts\.googleapis\.com\/css2\?family=Libre\+Baskerville[^"]*" rel="stylesheet">/, '');
    const face = (file, weight, style) => {
      const b64 = fs.readFileSync(path.join(FONT_DIR, file)).toString('base64');
      return `@font-face{font-family:'Libre Baskerville';font-style:${style};font-weight:${weight};font-display:swap;src:url(data:font/woff2;base64,${b64}) format('woff2');unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}`;
    };
    const fonts = face('libre-baskerville-latin-400-normal.woff2', 400, 'normal') + face('libre-baskerville-latin-400-italic.woff2', 400, 'italic') + face('libre-baskerville-latin-700-normal.woff2', 700, 'normal') + face('libre-baskerville-latin-700-italic.woff2', 700, 'italic');
    html = html.replace('<style>', `<style data-font="Libre Baskerville, SIL Open Font License">${fonts}</style>\n    <style>`);
    notes.push('font embedded');
  }

  const leftovers = [...html.matchAll(/<script[^>]+src="(https?:\/\/[^"]+)"|<link(?=[^>]*rel="(?:stylesheet|preload|preconnect|modulepreload)")[^>]+href="(https?:\/\/[^"]+)"/g)].map(m => m[1] || m[2]);
  const dest = path.join(outDir, name);
  fs.writeFileSync(dest, html);
  console.log(`${name}: ${(html.length / 1024).toFixed(0)} KB | ${notes.join(' | ')} | external scripts/styles left: ${leftovers.length ? leftovers.join(', ') : 'none'}`);
}

let failed = 0;
for (const f of inputs) { try { buildPage(path.resolve(f)); } catch (e) { failed++; console.error(String(e.message || e)); } }
process.exit(failed ? 1 : 0);
