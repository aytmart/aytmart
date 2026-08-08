/* ==========================================================================
   product-save.js
   Responsibility: the Save-Draft / Update-Product action — validates,
   builds the payload, calls the API, and reports the result. Owns no DOM
   rendering beyond the publish button's own loading state.
   Depends on globals ApiClient (attached to window by the shared,
   unchanged api-client.js loaded before this module).
   ========================================================================== */

import { getCurrentProductId, getCurrentSession } from './product-loader.js';
import { isFormValid, reportFormValidity, collectPayload } from './product-validation.js';
import { setPublishButtonLoading } from './product-ui.js';
import { toastSuccess, toastError } from './toast.js';

export async function saveProductForm(isDraft = false) {
  const form = document.getElementById('product-edit-form');

  if (!isDraft && !isFormValid(form)) {
    reportFormValidity(form);
    return;
  }

  const session = getCurrentSession();
  const payload = collectPayload(getCurrentProductId(), session && session.email, isDraft);

  setPublishButtonLoading(true);

  try {
    const response = await ApiClient.request('products.update', payload);

    if (response && response.success) {
      toastSuccess('প্রোডাক্ট তথ্য সফলভাবে আপডেট করা হয়েছে!');
      window.location.href = 'products.html';
      return;
    }

    setPublishButtonLoading(false);
    toastError((response && response.message) || 'প্রোডাক্ট আপডেট করা যায়নি।');
  } catch (err) {
    setPublishButtonLoading(false);
    toastError(err.message || 'প্রোডাক্ট আপডেট করা যায়নি।');
  }
}
