/* ==========================================================================
   profile.js
   Responsibility: header profile dropdown open/close + logout action.
   Depends on: modal.js (confirm dialog). Depends on globals ENV /
   StorageHelper which are attached to window by the shared, unchanged
   scripts (env.js, storage.js) loaded before this module.
   ========================================================================== */

import { showConfirmModal } from './modal.js';

async function handleLogout() {
  const confirmed = await showConfirmModal({
    title: 'লগআউট নিশ্চিত করুন',
    message: 'আপনি কি এডমিন সেশন থেকে লগআউট করতে চান?',
    confirmLabel: 'লগআউট',
    cancelLabel: 'বাতিল',
    danger: true
  });
  if (!confirmed) return;

  StorageHelper.remove(ENV.STORAGE_KEYS.SESSION);
  window.location.href = 'login.html';
}

export function bindProfileMenu() {
  const menu = document.getElementById('profile-menu');
  const badgeBtn = document.getElementById('profile-badge-btn');
  const logoutBtn = document.getElementById('logout-btn');
  if (!menu || !badgeBtn) return;

  badgeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const open = menu.classList.toggle('is-open');
    badgeBtn.setAttribute('aria-expanded', String(open));
  });

  document.addEventListener('click', () => {
    menu.classList.remove('is-open');
    badgeBtn.setAttribute('aria-expanded', 'false');
  });

  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      handleLogout();
    });
  }
}
