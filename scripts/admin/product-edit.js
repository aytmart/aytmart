/* ==========================================================================
   AYT MART CONTROL — PRODUCT EDIT PAGE
   scripts/admin/product-edit.js

   Depends on (loaded before this file, unchanged):
     ../config/environment/env.js   -> window.ENV
     ../utils/storage/storage.js    -> window.StorageHelper
     ../api/shared/api-client.js    -> window.ApiClient

   Backend contract, field IDs, request payload shape, and API endpoint
   names are UNCHANGED from the previous inline implementation.
   ========================================================================== */
(function () {
  'use strict';

  /* ------------------------------------------------------------------ *
   * STATE
   * ------------------------------------------------------------------ */
  const state = {
    localCategories: [],
    colorVariants: new Set(),
    sizeVariants: new Set(),
    currentProductId: null,
    originalProduct: null,
    currentSession: null
  };

  /* ------------------------------------------------------------------ *
   * UTILITIES
   * ------------------------------------------------------------------ */
  const Utils = {
    qs(selector, scope) { return (scope || document).querySelector(selector); },
    qsa(selector, scope) { return Array.from((scope || document).querySelectorAll(selector)); },

    /**
     * Minimal HTML-escape for values interpolated into innerHTML templates
     * (defensive; product data originates from our own backend, but this
     * avoids markup breakage if a name/value ever contains `<`, `&`, `"`).
     */
    escapeHtml(value) {
      return String(value ?? '').replace(/[&<>"']/g, (ch) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
      })[ch]);
    }
  };

  /* ------------------------------------------------------------------ *
   * API — thin wrappers around the shared ApiClient
   * ------------------------------------------------------------------ */
  const Api = {
    listCategories() {
      return ApiClient.request('categories.list', {});
    },
    getProduct(id) {
      return ApiClient.request('products.get', { id }, 'GET');
    },
    updateProduct(payload) {
      return ApiClient.request('products.update', payload);
    }
  };

  /* ------------------------------------------------------------------ *
   * VALIDATION / PAYLOAD BUILDING
   * ------------------------------------------------------------------ */
  const Validation = {
    /** Reads every field currently in the form into the update payload shape. */
    collectPayload(isDraft) {
      const name = Utils.qs('#prod-name').value.trim();
      const sku = Utils.qs('#prod-sku').value.trim();
      const model = Utils.qs('#prod-model-input').value.trim();
      const description = Utils.qs('#prod-description').value.trim();
      const price = parseFloat(Utils.qs('#prod-price').value) || 0;
      const salePriceInput = Utils.qs('#prod-sale-price').value;
      const sale_price = salePriceInput ? parseFloat(salePriceInput) : null;
      const stock = parseInt(Utils.qs('#prod-stock').value, 10) || 0;
      const safety = parseInt(Utils.qs('#prod-safety-stock').value, 10) || 5;
      const brand = Utils.qs('#prod-brand').value.trim();
      const category_id = Utils.qs('#prod-category').value;
      const image = Utils.qs('#prod-main-image').value.trim();
      const image_hover = Utils.qs('#prod-hover-image').value.trim();
      const status = isDraft ? 'Inactive' : Utils.qs('#prod-status').value;
      const featured = Utils.qs('#prod-featured').checked;
      const is_hot = Utils.qs('#prod-hot').checked;
      const free_shipping = Utils.qs('#shipping-free').checked;
      const weight = parseFloat(Utils.qs('#shipping-weight').value) || null;
      const dimensions = Utils.qs('#shipping-dimensions').value.trim();
      const seo_title = Utils.qs('#seo-meta-title').value.trim();
      const seo_description = Utils.qs('#seo-meta-description').value.trim();

      const specs = [];
      Utils.qsa('.spec-row-item').forEach((el) => {
        const k = Utils.qs('.spec-key', el).value.trim();
        const v = Utils.qs('.spec-value', el).value.trim();
        if (k && v) specs.push({ key: k, value: v });
      });

      const galleryUrls = [];
      Utils.qsa('.gallery-url-item').forEach((el) => {
        const val = Utils.qs('.gallery-url-field', el).value.trim();
        if (val) galleryUrls.push(val);
      });

      return {
        id: state.currentProductId,
        name,
        sku,
        model,
        description,
        price,
        sale_price,
        stock,
        safety,
        brand,
        category_id,
        image,
        image_hover: image_hover || undefined,
        status,
        featured,
        is_hot,
        free_shipping,
        shipping: { weight, dimensions },
        seo: { title: seo_title || undefined, description: seo_description || undefined },
        variants: {
          colors: Array.from(state.colorVariants),
          sizes: Array.from(state.sizeVariants)
        },
        specs,
        images: galleryUrls,
        updatedBy: (state.currentSession && state.currentSession.email) || ''
      };
    }
  };

  /* ------------------------------------------------------------------ *
   * RENDERING — DOM creation helpers for dynamic list rows
   * ------------------------------------------------------------------ */
  const Rendering = {
    renderVariantPill(type, value) {
      const container = Utils.qs(`#${type}s-tags-container`);
      const pill = document.createElement('span');
      pill.className = 'variant-pill';
      const safeValue = Utils.escapeHtml(value);
      pill.innerHTML = `${safeValue} <button type="button" class="variant-pill-remove" data-variant-type="${type}" data-variant-value="${safeValue}" aria-label="${safeValue} মুছে ফেলুন">×</button>`;
      container.appendChild(pill);
    },

    addSpecificationRow(key = '', value = '') {
      const container = Utils.qs('#specs-list-container');
      const row = document.createElement('div');
      row.className = 'dynamic-list-row spec-row-item';
      row.innerHTML = `
        <input type="text" class="form-input spec-key flex-grow" placeholder="কী (যেমন: উপাদান)" value="${Utils.escapeHtml(key)}" required aria-label="স্পেসিফিকেশন কী" />
        <input type="text" class="form-input spec-value flex-grow-wide" placeholder="ভ্যালু (যেমন: কটন)" value="${Utils.escapeHtml(value)}" required aria-label="স্পেসিফিকেশন ভ্যালু" />
        <button type="button" class="btn-circle-remove remove-spec-row" aria-label="এই স্পেসিফিকেশন রো মুছে ফেলুন">×</button>
      `;
      container.appendChild(row);
    },

    addGalleryUrlInput(urlValue = '') {
      const container = Utils.qs('#gallery-urls-container');
      const row = document.createElement('div');
      row.className = 'dynamic-list-row gallery-url-item';
      row.innerHTML = `
        <input type="url" class="form-input gallery-url-field flex-grow" placeholder="https://..." value="${Utils.escapeHtml(urlValue)}" required aria-label="গ্যালারি ইমেজ URL" />
        <button type="button" class="btn-circle-remove remove-gallery-row" aria-label="এই গ্যালারি ইমেজ মুছে ফেলুন">×</button>
      `;
      container.appendChild(row);
    },

    populateFormFields() {
      const p = state.originalProduct;
      Utils.qs('#top-title-id').textContent = `প্রোডাক্ট সম্পাদনা: ${p.id}`;
      Utils.qs('#page-primary-title').textContent = `প্রোডাক্ট তথ্য সম্পাদনা (${p.id})`;
      Utils.qs('#prod-name').value = p.name || '';
      Utils.qs('#prod-sku').value = p.sku || '';
      Utils.qs('#prod-model-input').value = p.model || '';
      Utils.qs('#prod-description').value = p.description || '';
      Utils.qs('#prod-price').value = p.price || 0;
      Utils.qs('#prod-sale-price').value = (p.sale_price !== null && p.sale_price !== undefined) ? p.sale_price : '';
      Utils.qs('#prod-stock').value = p.stock || 0;
      Utils.qs('#prod-safety-stock').value = p.safety || 5;
      Utils.qs('#prod-brand').value = p.brand || '';
      Utils.qs('#prod-category').value = p.category_id || '';
      Utils.qs('#prod-main-image').value = p.image || '';
      Utils.qs('#prod-hover-image').value = p.image_hover || '';
      Utils.qs('#prod-status').value = p.status || 'Active';
      Utils.qs('#prod-featured').checked = !!p.featured;
      Utils.qs('#prod-hot').checked = !!p.is_hot;
      Utils.qs('#shipping-free').checked = !!p.free_shipping;

      if (p.shipping) {
        Utils.qs('#shipping-weight').value = p.shipping.weight || '';
        Utils.qs('#shipping-dimensions').value = p.shipping.dimensions || '';
      }
      if (p.seo) {
        Utils.qs('#seo-meta-title').value = p.seo.title || '';
        Utils.qs('#seo-meta-description').value = p.seo.description || '';
      }

      if (p.variants) {
        const colors = p.variants.colors || [];
        colors.forEach((c) => {
          const val = typeof c === 'object' ? (c.name || c.value || '') : c;
          state.colorVariants.add(val);
          Rendering.renderVariantPill('color', val);
        });
        const sizes = p.variants.sizes || [];
        sizes.forEach((s) => {
          state.sizeVariants.add(s);
          Rendering.renderVariantPill('size', s);
        });
      }

      if (p.specs) {
        p.specs.forEach((s) => Rendering.addSpecificationRow(s.key, s.value));
      } else {
        Rendering.addSpecificationRow('উপাদান', '');
        Rendering.addSpecificationRow('প্রস্তুতকারক দেশ', 'বাংলাদেশ');
      }

      if (p.images) {
        p.images.forEach((img) => Rendering.addGalleryUrlInput(img));
      }
    },

    renderCategoryOptions() {
      const select = Utils.qs('#prod-category');
      if (state.localCategories.length) {
        select.innerHTML = '<option value="">ক্যাটাগরি নির্বাচন করুন</option>' +
          state.localCategories.map((cat) => `<option value="${cat.id}">${Utils.escapeHtml(cat.name)}</option>`).join('');
      } else {
        select.innerHTML = '<option value="">কোনো ক্যাটাগরি পাওয়া যায়নি</option>';
      }
    }
  };

  /* ------------------------------------------------------------------ *
   * ACTIONS — variant add/remove, data loading, form submit
   * ------------------------------------------------------------------ */
  const Actions = {
    addVariant(type) {
      const input = Utils.qs(`#${type}-input`);
      const value = input.value.trim();
      if (!value) return;

      const set = type === 'color' ? state.colorVariants : state.sizeVariants;
      if (!set.has(value)) {
        set.add(value);
        Rendering.renderVariantPill(type, value);
      }
      input.value = '';
      input.focus();
    },

    removeVariant(type, value, pillEl) {
      const set = type === 'color' ? state.colorVariants : state.sizeVariants;
      set.delete(value);
      pillEl.remove();
    },

    async loadCategoryList() {
      const select = Utils.qs('#prod-category');
      try {
        const response = await Api.listCategories();
        state.localCategories = (response && response.success && response.data) ? response.data : [];
        Rendering.renderCategoryOptions();
      } catch (err) {
        select.innerHTML = '<option value="">ক্যাটাগরি লোড ব্যর্থ হয়েছে</option>';
        alert(err.message || 'ক্যাটাগরি লোড করা যায়নি।');
      }
    },

    async fetchProductDetails() {
      if (!state.currentProductId) {
        alert('ত্রুটি: কোনো নির্দিষ্ট প্রোডাক্ট আইডি পাওয়া যায়নি!');
        window.location.href = 'products.html';
        return;
      }

      try {
        const response = await Api.getProduct(state.currentProductId);
        if (response && response.success && response.data) {
          state.originalProduct = response.data;
        } else {
          alert((response && response.message) || 'ত্রুটি: ক্যাটালগে এই প্রোডাক্টটির বিবরণী পাওয়া যায়নি!');
          window.location.href = 'products.html';
          return;
        }
      } catch (err) {
        alert(err.message || 'প্রোডাক্টের তথ্য লোড করা যায়নি।');
        window.location.href = 'products.html';
        return;
      }

      Rendering.populateFormFields();
    },

    async saveProductForm(isDraft = false) {
      const form = Utils.qs('#product-edit-form');

      if (!form.checkValidity() && !isDraft) {
        form.reportValidity();
        return;
      }

      const productPayload = Validation.collectPayload(isDraft);
      const btn = Utils.qs('#publish-submit-btn');
      btn.classList.add('is-loading');
      btn.disabled = true;
      btn.setAttribute('aria-busy', 'true');

      try {
        const response = await Api.updateProduct(productPayload);

        if (response && response.success) {
          alert('প্রোডাক্ট তথ্য সফলভাবে আপডেট করা হয়েছে!');
          window.location.href = 'products.html';
          return;
        }

        btn.classList.remove('is-loading');
        btn.disabled = false;
        btn.removeAttribute('aria-busy');
        alert((response && response.message) || 'প্রোডাক্ট আপডেট করা যায়নি।');
      } catch (err) {
        btn.classList.remove('is-loading');
        btn.disabled = false;
        btn.removeAttribute('aria-busy');
        alert(err.message || 'প্রোডাক্ট আপডেট করা যায়নি।');
      }
    },

    performLogout() {
      if (confirm('আপনি কি এডমিন সেশন থেকে লগআউট করতে চান?')) {
        StorageHelper.remove(ENV.STORAGE_KEYS.SESSION);
        window.location.href = 'login.html';
      }
    }
  };

  /* ------------------------------------------------------------------ *
   * EVENTS — all listener bindings (no inline HTML handlers)
   * ------------------------------------------------------------------ */
  function bindEvents() {
    // Sidebar collapse (desktop)
    const layout = Utils.qs('#admin-layout');
    const collapseBtn = Utils.qs('#sidebar-collapse-btn');
    collapseBtn.addEventListener('click', () => {
      const collapsed = layout.classList.toggle('is-collapsed');
      collapseBtn.setAttribute('aria-expanded', String(!collapsed));
    });

    // Sidebar drawer (mobile)
    const sidebar = Utils.qs('#admin-sidebar');
    const mobileBtn = Utils.qs('#mobile-menu-btn');
    mobileBtn.addEventListener('click', () => {
      const open = sidebar.classList.toggle('is-open');
      mobileBtn.setAttribute('aria-expanded', String(open));
    });

    // Profile dropdown
    const profileMenu = Utils.qs('#profile-menu');
    const profileBtn = Utils.qs('#profile-badge-btn');
    profileBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = profileMenu.classList.toggle('is-open');
      profileBtn.setAttribute('aria-expanded', String(open));
    });
    document.addEventListener('click', () => {
      profileMenu.classList.remove('is-open');
      profileBtn.setAttribute('aria-expanded', 'false');
    });

    // Theme toggle
    Utils.qs('#theme-toggle').addEventListener('click', () => {
      const html = document.documentElement;
      html.setAttribute('data-theme', html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
    });

    // Logout
    Utils.qs('#logout-btn').addEventListener('click', Actions.performLogout);

    // Form submit is handled entirely by the Draft / Update buttons
    Utils.qs('#product-edit-form').addEventListener('submit', (e) => e.preventDefault());
    Utils.qs('#save-draft-btn').addEventListener('click', () => Actions.saveProductForm(true));
    Utils.qs('#publish-submit-btn').addEventListener('click', () => Actions.saveProductForm(false));

    // Variant add controls
    Utils.qs('#color-add-btn').addEventListener('click', () => Actions.addVariant('color'));
    Utils.qs('#size-add-btn').addEventListener('click', () => Actions.addVariant('size'));
    Utils.qs('#color-input').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); Actions.addVariant('color'); }
    });
    Utils.qs('#size-input').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); Actions.addVariant('size'); }
    });

    // Variant pill removal (event delegation — pills are created dynamically)
    Utils.qs('#colors-tags-container').addEventListener('click', handleVariantRemoveClick);
    Utils.qs('#sizes-tags-container').addEventListener('click', handleVariantRemoveClick);

    // Add specification row / gallery URL row
    Utils.qs('#add-spec-row-btn').addEventListener('click', () => Rendering.addSpecificationRow());
    Utils.qs('#add-gallery-url-btn').addEventListener('click', () => Rendering.addGalleryUrlInput());

    // Removal of dynamically created spec / gallery rows (event delegation)
    Utils.qs('#specs-list-container').addEventListener('click', (e) => {
      const btn = e.target.closest('.remove-spec-row');
      if (btn) btn.closest('.spec-row-item').remove();
    });
    Utils.qs('#gallery-urls-container').addEventListener('click', (e) => {
      const btn = e.target.closest('.remove-gallery-row');
      if (btn) btn.closest('.gallery-url-item').remove();
    });
  }

  function handleVariantRemoveClick(e) {
    const btn = e.target.closest('.variant-pill-remove');
    if (!btn) return;
    Actions.removeVariant(btn.dataset.variantType, btn.dataset.variantValue, btn.closest('.variant-pill'));
  }

  /* ------------------------------------------------------------------ *
   * INIT
   * ------------------------------------------------------------------ */
  document.addEventListener('DOMContentLoaded', async () => {
    state.currentSession = StorageHelper.get(ENV.STORAGE_KEYS.SESSION, null);
    if (!state.currentSession || state.currentSession.role !== 'Admin') {
      window.location.href = 'login.html';
      return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    state.currentProductId = urlParams.get('id');

    bindEvents();

    await Actions.loadCategoryList();
    await Actions.fetchProductDetails();
  });
})();
