/* ==========================================================================
   product-variants.js
   Responsibility: color/size variant tag pills — state, rendering, and
   add/remove interaction, for #color-input / #size-input and their tag
   containers only. Owns its own state; exposes it via getVariantsPayload().
   ========================================================================== */

const colorVariants = new Set();
const sizeVariants = new Set();

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[ch]);
}

function renderPill(type, value) {
  const container = document.getElementById(`${type}s-tags-container`);
  if (!container) return;
  const safeValue = escapeHtml(value);
  const pill = document.createElement('span');
  pill.className = 'variant-pill';
  pill.innerHTML = `${safeValue} <button type="button" class="variant-pill-remove" data-variant-type="${type}" data-variant-value="${safeValue}" aria-label="${safeValue} মুছে ফেলুন">×</button>`;
  container.appendChild(pill);
}

function setFor(type) {
  return type === 'color' ? colorVariants : sizeVariants;
}

function addVariant(type) {
  const input = document.getElementById(`${type}-input`);
  if (!input) return;
  const value = input.value.trim();
  if (!value) return;

  const set = setFor(type);
  if (!set.has(value)) {
    set.add(value);
    renderPill(type, value);
  }
  input.value = '';
  input.focus();
}

function removeVariant(type, value, pillEl) {
  setFor(type).delete(value);
  pillEl.remove();
}

/** Populate initial variant pills from a loaded product (colors may be objects or strings). */
export function initVariants(colors = [], sizes = []) {
  colorVariants.clear();
  sizeVariants.clear();
  document.getElementById('colors-tags-container').innerHTML = '';
  document.getElementById('sizes-tags-container').innerHTML = '';

  colors.forEach((c) => {
    const val = typeof c === 'object' ? (c.name || c.value || '') : c;
    if (!val) return;
    colorVariants.add(val);
    renderPill('color', val);
  });
  sizes.forEach((s) => {
    if (!s) return;
    sizeVariants.add(s);
    renderPill('size', s);
  });
}

export function bindVariantEvents() {
  const colorAddBtn = document.getElementById('color-add-btn');
  const sizeAddBtn = document.getElementById('size-add-btn');
  const colorInput = document.getElementById('color-input');
  const sizeInput = document.getElementById('size-input');

  colorAddBtn?.addEventListener('click', () => addVariant('color'));
  sizeAddBtn?.addEventListener('click', () => addVariant('size'));

  colorInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); addVariant('color'); }
  });
  sizeInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); addVariant('size'); }
  });

  ['colors-tags-container', 'sizes-tags-container'].forEach((id) => {
    document.getElementById(id)?.addEventListener('click', (e) => {
      const btn = e.target.closest('.variant-pill-remove');
      if (!btn) return;
      removeVariant(btn.dataset.variantType, btn.dataset.variantValue, btn.closest('.variant-pill'));
    });
  });
}

/** Serialize current variant state into the API payload shape. */
export function getVariantsPayload() {
  return {
    colors: Array.from(colorVariants),
    sizes: Array.from(sizeVariants)
  };
}
