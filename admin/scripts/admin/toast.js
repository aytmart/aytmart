/* ==========================================================================
   toast.js
   Responsibility: show/hide non-blocking notification messages.
   Replaces bare alert() calls used previously. Self-contained — injects its
   own scoped styles once, reuses existing --ayt-* design tokens so it
   matches the accepted UI without touching the page's own stylesheets.
   No knowledge of product-edit state, forms, or API calls.
   ========================================================================== */

const STYLE_ID = 'toast-injected-styles';
const CONTAINER_ID = 'toast-container';

function ensureStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    #${CONTAINER_ID} {
      position: fixed; top: 20px; right: 20px; z-index: 1000;
      display: flex; flex-direction: column; gap: 10px;
      max-width: 340px;
    }
    .ayt-toast {
      display: flex; align-items: flex-start; gap: 10px;
      background: var(--ayt-surface, #fff);
      border: 1.5px solid var(--ayt-border, #E5E0D2);
      border-left: 4px solid var(--ayt-primary, #0B4238);
      border-radius: var(--ayt-radius-sm, 6px);
      box-shadow: var(--ayt-shadow-lg, 0 24px 60px rgba(15,35,30,.16));
      padding: 12px 14px; font-size: 13px; color: var(--ayt-ink, #1C2420);
      animation: aytToastIn 220ms ease both;
    }
    .ayt-toast.success { border-left-color: var(--ayt-emerald, #1E7A5F); }
    .ayt-toast.error { border-left-color: var(--ayt-rose, #B23B3B); }
    .ayt-toast.info { border-left-color: var(--ayt-blue, #2563A8); }
    .ayt-toast .msg { flex: 1; }
    .ayt-toast .close-btn { background: none; border: none; cursor: pointer; color: var(--ayt-muted, #756F62); font-size: 14px; line-height: 1; }
    .ayt-toast.is-leaving { animation: aytToastOut 180ms ease both; }
    @keyframes aytToastIn { from { opacity: 0; transform: translateX(16px); } to { opacity: 1; transform: translateX(0); } }
    @keyframes aytToastOut { to { opacity: 0; transform: translateX(16px); } }
    @media (prefers-reduced-motion: reduce) {
      .ayt-toast, .ayt-toast.is-leaving { animation: none; }
    }
  `;
  document.head.appendChild(style);
}

function ensureContainer() {
  let container = document.getElementById(CONTAINER_ID);
  if (!container) {
    container = document.createElement('div');
    container.id = CONTAINER_ID;
    container.setAttribute('aria-live', 'polite');
    container.setAttribute('aria-atomic', 'true');
    document.body.appendChild(container);
  }
  return container;
}

/**
 * Show a toast notification.
 * @param {string} message
 * @param {'info'|'success'|'error'} type
 * @param {number} duration ms before auto-dismiss (0 = persist until closed)
 */
export function showToast(message, type = 'info', duration = 4000) {
  ensureStyles();
  const container = ensureContainer();

  const toast = document.createElement('div');
  toast.className = `ayt-toast ${type}`;
  toast.setAttribute('role', type === 'error' ? 'alert' : 'status');
  toast.innerHTML = `<span class="msg"></span><button type="button" class="close-btn" aria-label="বার্তা বন্ধ করুন">×</button>`;
  toast.querySelector('.msg').textContent = message;

  const remove = () => {
    toast.classList.add('is-leaving');
    setTimeout(() => toast.remove(), 200);
  };

  toast.querySelector('.close-btn').addEventListener('click', remove);
  container.appendChild(toast);

  if (duration > 0) {
    setTimeout(remove, duration);
  }

  return { close: remove };
}

export const toastSuccess = (message, duration) => showToast(message, 'success', duration);
export const toastError = (message, duration) => showToast(message, 'error', duration ?? 6000);
export const toastInfo = (message, duration) => showToast(message, 'info', duration);
