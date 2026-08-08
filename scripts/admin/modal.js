/* ==========================================================================
   modal.js
   Responsibility: a single reusable confirm/alert modal dialog.
   Replaces bare confirm() calls used previously. Self-contained — injects
   its own scoped styles once. No knowledge of product-edit state or API.
   ========================================================================== */

const STYLE_ID = 'modal-injected-styles';
const OVERLAY_ID = 'ayt-modal-overlay';

function ensureStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    #${OVERLAY_ID} {
      position: fixed; inset: 0; z-index: 1100;
      background: rgba(7, 39, 34, .45);
      display: flex; align-items: center; justify-content: center;
      padding: 20px;
      animation: aytModalFade 160ms ease both;
    }
    .ayt-modal {
      width: 100%; max-width: 380px;
      background: var(--ayt-surface, #fff);
      border-radius: var(--ayt-radius-md, 12px);
      border: 1px solid var(--ayt-border, #E5E0D2);
      box-shadow: var(--ayt-shadow-lg, 0 24px 60px rgba(15,35,30,.16));
      padding: 22px; display: flex; flex-direction: column; gap: 14px;
    }
    .ayt-modal h2 { font-size: 16px; font-weight: 700; color: var(--ayt-primary-dark, #072722); }
    .ayt-modal p { font-size: 13.5px; color: var(--ayt-muted, #756F62); line-height: 1.5; }
    .ayt-modal .actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 4px; }
    .ayt-modal button { font-size: 13px; font-weight: 700; padding: 9px 18px; border-radius: var(--ayt-radius-sm, 6px); border: none; cursor: pointer; }
    .ayt-modal .btn-cancel { background: var(--ayt-surface-alt, #F5F2E9); border: 1.5px solid var(--ayt-border, #E5E0D2); color: var(--ayt-ink, #1C2420); }
    .ayt-modal .btn-confirm { background: var(--ayt-primary, #0B4238); color: #fff; }
    .ayt-modal .btn-confirm.danger { background: var(--ayt-rose, #B23B3B); }
    @keyframes aytModalFade { from { opacity: 0; } to { opacity: 1; } }
    @media (prefers-reduced-motion: reduce) { #${OVERLAY_ID} { animation: none; } }
  `;
  document.head.appendChild(style);
}

/**
 * Show a confirm dialog. Resolves true/false.
 * @param {{title?:string, message:string, confirmLabel?:string, cancelLabel?:string, danger?:boolean}} opts
 * @returns {Promise<boolean>}
 */
export function showConfirmModal(opts) {
  ensureStyles();
  const {
    title = 'নিশ্চিত করুন',
    message,
    confirmLabel = 'নিশ্চিত করুন',
    cancelLabel = 'বাতিল',
    danger = false
  } = opts;

  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.id = OVERLAY_ID;
    overlay.setAttribute('role', 'presentation');

    overlay.innerHTML = `
      <div class="ayt-modal" role="alertdialog" aria-modal="true" aria-labelledby="ayt-modal-title" aria-describedby="ayt-modal-desc">
        <h2 id="ayt-modal-title"></h2>
        <p id="ayt-modal-desc"></p>
        <div class="actions">
          <button type="button" class="btn-cancel"></button>
          <button type="button" class="btn-confirm${danger ? ' danger' : ''}"></button>
        </div>
      </div>
    `;
    overlay.querySelector('#ayt-modal-title').textContent = title;
    overlay.querySelector('#ayt-modal-desc').textContent = message;
    overlay.querySelector('.btn-cancel').textContent = cancelLabel;
    overlay.querySelector('.btn-confirm').textContent = confirmLabel;

    const close = (result) => {
      document.removeEventListener('keydown', onKeydown);
      overlay.remove();
      resolve(result);
    };

    const onKeydown = (e) => {
      if (e.key === 'Escape') close(false);
    };

    overlay.querySelector('.btn-cancel').addEventListener('click', () => close(false));
    overlay.querySelector('.btn-confirm').addEventListener('click', () => close(true));
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(false); });
    document.addEventListener('keydown', onKeydown);

    document.body.appendChild(overlay);
    overlay.querySelector('.btn-confirm').focus();
  });
}
