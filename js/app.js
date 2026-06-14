'use strict';

/* =============================================================
   Android Strings Builder — app logic
   Depends on: data.js (LANGUAGES), JSZip, FileSaver (window.saveAs)
   ============================================================= */

// ----- Templates ------------------------------------------------

/** Blank, valid Android strings.xml dropped into each locale folder. */
function stringsXml(lang) {
  return `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <!-- ${lang.name} · values-${lang.id} — add translated <string> entries here -->
</resources>
`;
}

/** Loaded from the embedded <script type="text/markdown"> template in index.html. */
let TRANSLATION_RULE_MD = '';

/** Build the copy-paste AI prompt from the selected locales + source xml.
 *  With no source pasted, the prompt targets the project's default strings.xml. */
function buildPrompt(locales, source) {
  const list = locales
    .map((l) => `- res/values-${l.id}/strings.xml — ${l.name} (${l.code}-${l.region})`)
    .join('\n');

  const hasSource = source.trim().length > 0;
  const intro = hasSource
    ? 'Translate the source Android `strings.xml` below into each target locale.'
    : "Translate every string in this project's default `res/values/strings.xml` into each target locale.";
  const sourceBlock = hasSource
    ? `\n## Source — res/values/strings.xml\n\`\`\`xml\n${source.trim()}\n\`\`\`\n`
    : '';

  return `You are a senior Android localization specialist.

${intro} Output one complete, valid \`strings.xml\` per locale.

## Target locales (${locales.length})
${list}

## Output format
For each locale, print its path as a heading (e.g. \`res/values-es-rES/strings.xml\`)
followed by the full file in an \`\`\`xml code block.
${sourceBlock}
## Required
Before translating, you MUST read @TRANSLATION_RULE.md and strictly follow every rule it defines.`;
}

/** ASCII tree of what the downloaded ZIP will contain. */
function buildTree(locales) {
  const lines = ['android-strings.zip'];
  const entries = [{ label: 'TRANSLATION_RULE.md', child: null }];
  locales.forEach((l) => entries.push({ label: `values-${l.id}/`, child: 'strings.xml' }));
  entries.forEach((e, i) => {
    const last = i === entries.length - 1;
    lines.push((last ? '└─ ' : '├─ ') + e.label);
    if (e.child) lines.push((last ? '   ' : '│  ') + '└─ ' + e.child);
  });
  return lines.join('\n');
}

// ----- Column resize -------------------------------------------

const COL_DEFAULTS = { c1: 360, c3: 360 };
const COL_MIN      = { c1: 220, c3: 200 };
const COL_MAX      = { c1: 580, c3: 540 };
let colWidths = { c1: 360, c3: 360 };

function applyColWidths() {
  const grid = document.getElementById('workspace-grid');
  if (!grid) return;
  grid.style.setProperty('--c1', colWidths.c1 + 'px');
  grid.style.setProperty('--c3', colWidths.c3 + 'px');
}

function onHandleMouseDown(e) {
  e.preventDefault();
  const handle = e.currentTarget;
  const col    = handle.dataset.col;           // 'c1' or 'c3'
  const sign   = col === 'c1' ? 1 : -1;        // c1: drag right → wider; c3: drag right → narrower
  const startX = e.clientX;
  const startW = colWidths[col];

  handle.classList.add('is-dragging');
  document.body.style.cursor    = 'col-resize';
  document.body.style.userSelect = 'none';

  const onMove = (ev) => {
    const newW = Math.round(
      Math.max(COL_MIN[col], Math.min(COL_MAX[col], startW + sign * (ev.clientX - startX)))
    );
    colWidths[col] = newW;
    applyColWidths();
  };
  const onUp = () => {
    handle.classList.remove('is-dragging');
    document.body.style.cursor    = '';
    document.body.style.userSelect = '';
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup',   onUp);
  };
  document.addEventListener('mousemove', onMove);
  document.addEventListener('mouseup',   onUp);
}

function initResizeHandles() {
  document.querySelectorAll('.col-handle').forEach((handle) => {
    handle.addEventListener('mousedown', onHandleMouseDown);
    handle.addEventListener('dblclick', () => {
      colWidths = { ...COL_DEFAULTS };
      applyColWidths();
    });
  });
}

// ----- State ----------------------------------------------------

const selected = new Set(); // selected locale ids
let currentFilter = '';
const els = {};

// ----- Rendering: language list --------------------------------

function matchLang(lang, q) {
  if (!q) return true;
  return (
    lang.name.toLowerCase().includes(q) ||
    lang.code.includes(q) ||
    lang.region.toLowerCase().includes(q) ||
    `values-${lang.id}`.toLowerCase().includes(q)
  );
}

function rowHtml(lang) {
  const checked = selected.has(lang.id) ? 'checked' : '';
  const cc = lang.region.toLowerCase();
  return `
    <label class="lang-row flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2">
      <input type="checkbox" value="${lang.id}" ${checked} />
      <span class="checkbox">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
      </span>
      <span class="lang-flag fi fi-${cc}"></span>
      <span class="min-w-0 flex-1 truncate text-[15px] text-ink">${lang.name}</span>
      <code class="whitespace-nowrap font-mono text-[12px] text-muted">values-${lang.id}</code>
    </label>`;
}

function renderLanguages() {
  const q = currentFilter.trim().toLowerCase();
  const rows = LANGUAGES.filter((l) => matchLang(l, q));
  els.list.innerHTML = rows.map(rowHtml).join('');
  els.listEmpty.classList.toggle('hidden', rows.length > 0);
}

function visibleLocales() {
  const q = currentFilter.trim().toLowerCase();
  return LANGUAGES.filter((l) => matchLang(l, q));
}

// ----- Rendering: outputs --------------------------------------

function selectedLocales() {
  // keep catalogue order
  return LANGUAGES.filter((l) => selected.has(l.id));
}

function refreshCount() {
  const n = selected.size;
  els.countPill.textContent = n ? `${n} selected` : 'None selected';
}

function refreshFolders() {
  const locales = selectedLocales();
  const n = locales.length;
  els.folderCount.textContent = String(n);
  els.downloadBtn.disabled = n === 0;
  els.previewBtn.disabled = n === 0;
  els.generateBtn.disabled = n === 0;

  if (n === 0) {
    els.folderPreview.innerHTML = '';
    els.folderEmpty.classList.remove('hidden');
    return;
  }
  els.folderEmpty.classList.add('hidden');
  els.folderPreview.innerHTML = locales
    .map(
      (l) => `
      <span class="folder-chip inline-flex items-center gap-2 rounded-lg border border-hairline bg-canvas px-2.5 py-1.5">
        <span class="lang-flag fi fi-${l.region.toLowerCase()}"></span>
        <code class="font-mono text-[12.5px] text-body-strong">values-${l.id}</code>
      </span>`
    )
    .join('');
}

// ----- Prompt: built on demand via the Generate button --------

let promptBuilt = false;

function generatePrompt() {
  const locales = selectedLocales();
  if (locales.length === 0) return;
  els.prompt.textContent = buildPrompt(locales, els.strings.value);
  els.prompt.classList.remove('hidden');
  els.promptEmpty.classList.add('hidden');
  els.promptStale.classList.add('hidden');
  els.copyBtn.disabled = false;
  promptBuilt = true;
}

function resetPrompt() {
  els.prompt.textContent = '';
  els.prompt.classList.add('hidden');
  els.promptEmpty.classList.remove('hidden');
  els.promptStale.classList.add('hidden');
  els.copyBtn.disabled = true;
  promptBuilt = false;
}

/** Flag a shown prompt as out of date when its inputs change. */
function markPromptStale() {
  if (promptBuilt) els.promptStale.classList.remove('hidden');
}

function onSelectionChange() {
  refreshCount();
  refreshFolders();
  if (selected.size === 0) resetPrompt();
  else markPromptStale();
}

// ----- Clipboard (works on file:// too) ------------------------

async function copyText(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (_) {
    /* fall through to legacy path */
  }
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.top = '-1000px';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch (_) {
    return false;
  }
}

// ----- ZIP build -----------------------------------------------

async function downloadZip() {
  const locales = selectedLocales();
  if (locales.length === 0) return;

  els.downloadBtn.disabled = true;
  els.downloadLabel.textContent = 'Building ZIP…';
  try {
    const zip = new JSZip();
    locales.forEach((l) => {
      zip.file(`values-${l.id}/strings.xml`, stringsXml(l));
    });
    const rules = els.rules.value.trim() ? els.rules.value : TRANSLATION_RULE_MD;
    zip.file('TRANSLATION_RULE.md', rules);

    const blob = await zip.generateAsync({ type: 'blob' });
    saveAs(blob, 'android-strings.zip');
  } catch (err) {
    alert('Could not build the ZIP: ' + (err && err.message ? err.message : err));
  } finally {
    els.downloadLabel.textContent = 'Download ZIP';
    els.downloadBtn.disabled = selected.size === 0;
  }
}

// ----- Folder-structure preview --------------------------------

function openPreview() {
  const locales = selectedLocales();
  if (locales.length === 0) return;
  els.previewTree.textContent = buildTree(locales);
  els.previewCaption.textContent =
    `${locales.length} locale folder(s) · ${locales.length + 1} files — each strings.xml is a blank <resources> template.`;
  els.previewModal.style.display = 'flex';
}

function closePreview() {
  els.previewModal.style.display = 'none';
}

// ----- Rules live preview (marked.js) -------------------------

function renderRulesPreview() {
  if (!els.rulesPreview || typeof marked === 'undefined') return;
  els.rulesPreview.innerHTML = marked.parse(els.rules.value || '');
}

// ----- Wiring --------------------------------------------------

function cacheEls() {
  els.list = document.getElementById('language-list');
  els.listEmpty = document.getElementById('list-empty');
  els.search = document.getElementById('search');
  els.selectAll = document.getElementById('select-all');
  els.clearAll = document.getElementById('clear-all');
  els.countPill = document.getElementById('count-pill');
  els.strings = document.getElementById('strings-input');
  els.prompt = document.getElementById('prompt-output');
  els.promptEmpty = document.getElementById('prompt-empty');
  els.copyBtn = document.getElementById('copy-btn');
  els.copyLabel = document.getElementById('copy-label');
  els.folderPreview = document.getElementById('folder-preview');
  els.folderEmpty = document.getElementById('folder-empty');
  els.folderCount = document.getElementById('folder-count');
  els.downloadBtn = document.getElementById('download-btn');
  els.downloadLabel = document.getElementById('download-label');
  els.previewBtn = document.getElementById('preview-btn');
  els.previewModal = document.getElementById('preview-modal');
  els.previewBackdrop = document.getElementById('preview-backdrop');
  els.previewClose = document.getElementById('preview-close');
  els.previewTree = document.getElementById('preview-tree');
  els.previewCaption = document.getElementById('preview-caption');
  els.generateBtn = document.getElementById('generate-btn');
  els.promptStale = document.getElementById('prompt-stale');
  els.rules = document.getElementById('rules-input');
  els.rulesReset = document.getElementById('rules-reset');
  els.rulesPreview = document.getElementById('rules-preview');
}

function wireEvents() {
  // toggle a checkbox (event delegation survives re-renders)
  els.list.addEventListener('change', (e) => {
    const cb = e.target;
    if (!(cb instanceof HTMLInputElement) || cb.type !== 'checkbox') return;
    if (cb.checked) selected.add(cb.value);
    else selected.delete(cb.value);
    onSelectionChange();
  });

  // live search
  els.search.addEventListener('input', (e) => {
    currentFilter = e.target.value;
    renderLanguages();
  });

  // select all currently-visible / clear all
  els.selectAll.addEventListener('click', () => {
    visibleLocales().forEach((l) => selected.add(l.id));
    renderLanguages();
    onSelectionChange();
  });
  els.clearAll.addEventListener('click', () => {
    selected.clear();
    renderLanguages();
    onSelectionChange();
  });

  // editing the source marks an already-generated prompt as stale
  els.strings.addEventListener('input', markPromptStale);

  // generate the prompt on demand
  els.generateBtn.addEventListener('click', generatePrompt);

  // live preview while editing
  els.rules.addEventListener('input', renderRulesPreview);

  // reset the custom rules back to the default template
  els.rulesReset.addEventListener('click', () => {
    els.rules.value = TRANSLATION_RULE_MD;
    renderRulesPreview();
  });

  // copy prompt
  els.copyBtn.addEventListener('click', async () => {
    if (els.copyBtn.disabled) return;
    const ok = await copyText(els.prompt.textContent);
    els.copyBtn.classList.add('copied');
    els.copyLabel.textContent = ok ? 'Copied!' : 'Press Ctrl+C';
    setTimeout(() => {
      els.copyBtn.classList.remove('copied');
      els.copyLabel.textContent = 'Copy';
    }, 1400);
  });

  // download
  els.downloadBtn.addEventListener('click', downloadZip);

  // folder-structure preview modal
  els.previewBtn.addEventListener('click', openPreview);
  els.previewClose.addEventListener('click', closePreview);
  els.previewBackdrop.addEventListener('click', closePreview);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && els.previewModal.style.display === 'flex') closePreview();
  });
}

/** Fetch TRANSLATION_RULE.md from the server (works on GitHub Pages / any HTTP origin).
 *  Falls back to the embedded <script type="text/markdown"> template for file:// use. */
async function loadDefaultRules() {
  if (location.protocol !== 'file:') {
    try {
      const res = await fetch('./TRANSLATION_RULE.md');
      if (res.ok) return (await res.text()).trim();
    } catch (_) {}
  }
  const tpl = document.getElementById('translation-rule-template');
  return tpl ? tpl.textContent.trim() : '';
}

document.addEventListener('DOMContentLoaded', async () => {
  cacheEls();
  TRANSLATION_RULE_MD = await loadDefaultRules();
  els.rules.value = TRANSLATION_RULE_MD;
  if (typeof marked !== 'undefined') marked.use({ gfm: true, breaks: false });
  renderRulesPreview();
  renderLanguages();
  onSelectionChange();
  wireEvents();
  initResizeHandles();
});
