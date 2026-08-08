/* ==========================================================================
   product-ui.js
   Responsibility: painting the *static* product-edit fields (name, price,
   status, images, shipping, SEO, page title/breadcrumb) and the category
   <select> options. Does NOT own variants/specs/gallery — those have their
   own modules. Does NOT fetch data or call the API.
   ========================================================================== */

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[ch]);
}

/** Fill every static form field from a loaded product record. */
export function populateStaticFields(product) {
  const set = (id, value) => { const el = document.getElementById(id); if (el) el.value = value; };
  const check = (id, value) => { const el = document.getElementById(id); if (el) el.checked = !!value; };
  const text = (id, value) => { const el = document.getElementById(id); if (el) el.textContent = value; };

  text('top-title-id', `প্রোডাক্ট সম্পাদনা: ${product.id}`);
  text('page-primary-title', `প্রোডাক্ট তথ্য সম্পাদনা (${product.id})`);

  set('prod-name', product.name || '');
  set('prod-sku', product.sku || '');
  set('prod-model-input', product.model || '');
  set('prod-description', product.description || '');
  set('prod-price', product.price || 0);
  set('prod-sale-price', (product.sale_price !== null && product.sale_price !== undefined) ? product.sale_price : '');
  set('prod-stock', product.stock || 0);
  set('prod-safety-stock', product.safety || 5);
  set('prod-brand', product.brand || '');
  set('prod-category', product.category_id || '');
  set('prod-main-image', product.image || '');
  set('prod-hover-image', product.image_hover || '');
  set('prod-status', product.status || 'Active');

  check('prod-featured', product.featured);
  check('prod-hot', product.is_hot);
  check('shipping-free', product.free_shipping);

  if (product.shipping) {
    set('shipping-weight', product.shipping.weight || '');
    set('shipping-dimensions', product.shipping.dimensions || '');
  }
  if (product.seo) {
    set('seo-meta-title', product.seo.title || '');
    set('seo-meta-description', product.seo.description || '');
  }
}

/** Render the category <select> options from a fetched category list. */
export function renderCategoryOptions(categories) {
  const select = document.getElementById('prod-category');
  if (!select) return;

  if (categories && categories.length) {
    select.innerHTML = '<option value="">ক্যাটাগরি নির্বাচন করুন</option>' +
      categories.map((cat) => `<option value="${cat.id}">${escapeHtml(cat.name)}</option>`).join('');
  } else {
    select.innerHTML = '<option value="">কোনো ক্যাটাগরি পাওয়া যায়নি</option>';
  }
}

export function setCategoriesLoadingFailed() {
  const select = document.getElementById('prod-category');
  if (select) select.innerHTML = '<option value="">ক্যাটাগরি লোড ব্যর্থ হয়েছে</option>';
}

/** Toggle the publish button's loading (spinner) state. */
export function setPublishButtonLoading(isLoading) {
  const btn = document.getElementById('publish-submit-btn');
  if (!btn) return;
  btn.classList.toggle('is-loading', isLoading);
  btn.disabled = isLoading;
  btn.toggleAttribute('aria-busy', isLoading);
}
