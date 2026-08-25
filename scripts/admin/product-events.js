/* ==========================================================================
   product-events.js
   Responsibility: the page's single composition root. Wires together every
   other module's bind/init functions and boots the page on DOMContentLoaded.
   This is the only file allowed to know about every other module — it is
   the entry point loaded by product-edit.html.
   ========================================================================== */

import { bindThemeToggle } from './theme.js';
import { bindSidebar } from './sidebar.js';
import { bindProfileMenu } from './profile.js';
import { bindVariantEvents } from './product-variants.js';
import { bindSpecificationEvents } from './product-specifications.js';
import { bindGalleryEvents } from './product-gallery.js';
import { saveProductForm } from './product-save.js';
import {
  requireAdminSession,
  resolveProductIdFromUrl,
  loadCategoryList,
  fetchAndPopulateProduct
} from './product-loader.js';

function bindStaticFormControls() {
  document.getElementById('product-edit-form')?.addEventListener('submit', (e) => e.preventDefault());
  document.getElementById('save-draft-btn')?.addEventListener('click', () => saveProductForm(true));
  document.getElementById('publish-submit-btn')?.addEventListener('click', () => saveProductForm(false));
}

function bindAllUiRegions() {
  bindThemeToggle();
  bindSidebar();
  bindProfileMenu();
  bindVariantEvents();
  bindSpecificationEvents();
  bindGalleryEvents();
  bindStaticFormControls();
}

async function boot() {
  if (!requireAdminSession()) return;

  resolveProductIdFromUrl();
  bindAllUiRegions();

  await loadCategoryList();
  await fetchAndPopulateProduct();
}

document.addEventListener('DOMContentLoaded', boot);
