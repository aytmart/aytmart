/* ==========================================================================
   product-loader.js
   Responsibility: verify the admin session, fetch categories + the product
   being edited, and hand the results to the rendering modules
   (product-ui / product-variants / product-specifications / product-gallery).
   Owns the page's "current product/session" state and exposes it via
   getters so other modules never read it directly.
   Depends on globals ENV / StorageHelper / ApiClient (attached to window
   by the shared, unchanged scripts loaded before this module).
   ========================================================================== */

import { renderCategoryOptions, setCategoriesLoadingFailed, populateStaticFields } from './product-ui.js';
import { initVariants } from './product-variants.js';
import { initSpecs } from './product-specifications.js';
import { initGallery } from './product-gallery.js';
import { toastError } from './toast.js';

let currentProductId = null;
let currentSession = null;
let originalProduct = null;
let localCategories = [];

export function getCurrentProductId() { return currentProductId; }
export function getCurrentSession() { return currentSession; }
export function getOriginalProduct() { return originalProduct; }

/** Reads the session from storage and redirects to login if missing/not Admin. */
export function requireAdminSession() {
  currentSession = StorageHelper.get(ENV.STORAGE_KEYS.SESSION, null);
  if (!currentSession || currentSession.role !== 'Admin') {
    window.location.href = 'login.html';
    return false;
  }
  return true;
}

/** Reads ?id= from the URL. */
export function resolveProductIdFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  currentProductId = urlParams.get('id');
  return currentProductId;
}

export async function loadCategoryList() {
  try {
    const response = await ApiClient.request('categories.list', {});
    localCategories = (response && response.success && response.data) ? response.data : [];
    renderCategoryOptions(localCategories);
  } catch (err) {
    setCategoriesLoadingFailed();
    toastError(err.message || 'ক্যাটাগরি লোড করা যায়নি।');
  }
}

export async function fetchAndPopulateProduct() {
  if (!currentProductId) {
    toastError('ত্রুটি: কোনো নির্দিষ্ট প্রোডাক্ট আইডি পাওয়া যায়নি!');
    window.location.href = 'products.html';
    return;
  }

  let response;
  try {
    response = await ApiClient.request('products.get', { id: currentProductId }, 'GET');
  } catch (err) {
    toastError(err.message || 'প্রোডাক্টের তথ্য লোড করা যায়নি।');
    window.location.href = 'products.html';
    return;
  }

  if (!response || !response.success || !response.data) {
    toastError((response && response.message) || 'ত্রুটি: ক্যাটালগে এই প্রোডাক্টটির বিবরণী পাওয়া যায়নি!');
    window.location.href = 'products.html';
    return;
  }

  originalProduct = response.data;

  populateStaticFields(originalProduct);
  initVariants((originalProduct.variants && originalProduct.variants.colors) || [], (originalProduct.variants && originalProduct.variants.sizes) || []);
  initSpecs(originalProduct.specs);
  initGallery(originalProduct.images || []);
}
