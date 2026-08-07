/* ==========================================================================
   product-validation.js
   Responsibility: (1) check native form validity, (2) assemble the
   products.update API payload from current field values. Delegates
   variant/spec/gallery serialization to their own modules — this module
   never reaches into their DOM directly.
   ========================================================================== */

import { getVariantsPayload } from './product-variants.js';
import { getSpecsPayload } from './product-specifications.js';
import { getGalleryPayload } from './product-gallery.js';

/** Native HTML5 validity check + focuses the first invalid field via the browser UI. */
export function isFormValid(formEl) {
  return formEl.checkValidity();
}

export function reportFormValidity(formEl) {
  formEl.reportValidity();
}

/**
 * Build the update payload in the exact shape the backend expects.
 * @param {string} productId
 * @param {string} updatedByEmail
 * @param {boolean} isDraft
 */
export function collectPayload(productId, updatedByEmail, isDraft) {
  const val = (id) => document.getElementById(id).value;
  const checked = (id) => document.getElementById(id).checked;

  const name = val('prod-name').trim();
  const sku = val('prod-sku').trim();
  const model = val('prod-model-input').trim();
  const description = val('prod-description').trim();
  const price = parseFloat(val('prod-price')) || 0;
  const salePriceRaw = val('prod-sale-price');
  const sale_price = salePriceRaw ? parseFloat(salePriceRaw) : null;
  const stock = parseInt(val('prod-stock'), 10) || 0;
  const safety = parseInt(val('prod-safety-stock'), 10) || 5;
  const brand = val('prod-brand').trim();
  const category_id = val('prod-category');
  const image = val('prod-main-image').trim();
  const image_hover = val('prod-hover-image').trim();
  const status = isDraft ? 'Inactive' : val('prod-status');
  const featured = checked('prod-featured');
  const is_hot = checked('prod-hot');
  const free_shipping = checked('shipping-free');
  const weight = parseFloat(val('shipping-weight')) || null;
  const dimensions = val('shipping-dimensions').trim();
  const seo_title = val('seo-meta-title').trim();
  const seo_description = val('seo-meta-description').trim();

  return {
    id: productId,
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
    variants: getVariantsPayload(),
    specs: getSpecsPayload(),
    images: getGalleryPayload(),
    updatedBy: updatedByEmail || ''
  };
}
