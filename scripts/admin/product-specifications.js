/* ==========================================================================
   product-specifications.js
   Responsibility: dynamic technical-specification rows (#specs-list-container)
   only — rendering, add/remove interaction, and payload serialization.
   ========================================================================== */

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[ch]);
}

export function addSpecificationRow(key = '', value = '') {
  const container = document.getElementById('specs-list-container');
  if (!container) return;

  const row = document.createElement('div');
  row.className = 'dynamic-list-row spec-row-item';
  row.innerHTML = `
    <input type="text" class="form-input spec-key flex-grow" placeholder="কী (যেমন: উপাদান)" value="${escapeHtml(key)}" required aria-label="স্পেসিফিকেশন কী" />
    <input type="text" class="form-input spec-value flex-grow-wide" placeholder="ভ্যালু (যেমন: কটন)" value="${escapeHtml(value)}" required aria-label="স্পেসিফিকেশন ভ্যালু" />
    <button type="button" class="btn-circle-remove remove-spec-row" aria-label="এই স্পেসিফিকেশন রো মুছে ফেলুন">×</button>
  `;
  container.appendChild(row);
}

/** Populate initial spec rows from a loaded product, or seed sensible defaults. */
export function initSpecs(specs) {
  const container = document.getElementById('specs-list-container');
  if (container) container.innerHTML = '';

  if (specs && specs.length) {
    specs.forEach((s) => addSpecificationRow(s.key, s.value));
  } else {
    addSpecificationRow('উপাদান', '');
    addSpecificationRow('প্রস্তুতকারক দেশ', 'বাংলাদেশ');
  }
}

export function bindSpecificationEvents() {
  document.getElementById('add-spec-row-btn')?.addEventListener('click', () => addSpecificationRow());

  document.getElementById('specs-list-container')?.addEventListener('click', (e) => {
    const btn = e.target.closest('.remove-spec-row');
    if (btn) btn.closest('.spec-row-item').remove();
  });
}

/** Serialize current spec rows into the API payload shape (skips incomplete rows). */
export function getSpecsPayload() {
  const specs = [];
  document.querySelectorAll('.spec-row-item').forEach((el) => {
    const k = el.querySelector('.spec-key').value.trim();
    const v = el.querySelector('.spec-value').value.trim();
    if (k && v) specs.push({ key: k, value: v });
  });
  return specs;
}
