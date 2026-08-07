/* ==========================================================================
   theme.js
   Responsibility: light/dark theme toggle button only.
   No knowledge of product data, forms, or other UI regions.
   ========================================================================== */

export function bindThemeToggle() {
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;

  btn.addEventListener('click', () => {
    const html = document.documentElement;
    const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
  });
}
