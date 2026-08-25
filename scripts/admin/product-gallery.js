/* ==========================================================================
   product-gallery.js
   Responsibility: dynamic gallery-image URL rows (#gallery-urls-container)
   only — rendering, add/remove interaction, and payload serialization.
   ========================================================================== */

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[ch]);
}

export function addGalleryUrlInput(urlValue = '') {
  const container = document.getElementById('gallery-urls-container');
  if (!container) return;

  const row = document.createElement('div');
  row.className = 'dynamic-list-row gallery-url-item';
  row.innerHTML = `
    <input type="url" class="form-input gallery-url-field flex-grow" placeholder="https://..." value="${escapeHtml(urlValue)}" required aria-label="গ্যালারি ইমেজ URL" />
    <button type="button" class="btn-circle-remove remove-gallery-row" aria-label="এই গ্যালারি ইমেজ মুছে ফেলুন">×</button>
  `;
  container.appendChild(row);
}

/** Populate initial gallery rows from a loaded product. */
export function initGallery(images = []) {
  const container = document.getElementById('gallery-urls-container');
  if (container) container.innerHTML = '';
  images.forEach((img) => addGalleryUrlInput(img));
}

export function bindGalleryEvents() {
  document.getElementById('add-gallery-url-btn')?.addEventListener('click', () => addGalleryUrlInput());

  document.getElementById('gallery-urls-container')?.addEventListener('click', (e) => {
    const btn = e.target.closest('.remove-gallery-row');
    if (btn) btn.closest('.gallery-url-item').remove();
  });
}

/** Serialize current gallery rows into the API payload shape (skips blanks). */
export function getGalleryPayload() {
  const urls = [];
  document.querySelectorAll('.gallery-url-item').forEach((el) => {
    const val = el.querySelector('.gallery-url-field').value.trim();
    if (val) urls.push(val);
  });
  return urls;
}
