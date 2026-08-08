/* ==========================================================================
   sidebar.js
   Responsibility: left navigation rail — desktop collapse + mobile drawer.
   No knowledge of product data, forms, or other UI regions.
   ========================================================================== */

export function bindSidebar() {
  const layout = document.getElementById('admin-layout');
  const sidebar = document.getElementById('admin-sidebar');
  const collapseBtn = document.getElementById('sidebar-collapse-btn');
  const mobileBtn = document.getElementById('mobile-menu-btn');

  if (collapseBtn && layout) {
    collapseBtn.addEventListener('click', () => {
      const collapsed = layout.classList.toggle('is-collapsed');
      collapseBtn.setAttribute('aria-expanded', String(!collapsed));
    });
  }

  if (mobileBtn && sidebar) {
    mobileBtn.addEventListener('click', () => {
      const open = sidebar.classList.toggle('is-open');
      mobileBtn.setAttribute('aria-expanded', String(open));
    });
  }
}
