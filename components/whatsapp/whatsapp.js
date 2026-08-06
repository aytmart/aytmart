/**
 * ==========================================================================
 * File: /components/whatsapp/whatsapp.js
 * Description: Floating Responsive WhatsApp Engagement Widget with Premium SVG
 * Compatibility: preserves key names, WhatsAppWidget, and injectButton(parentElement)
 *
 * Fix in this revision:
 *   - Removed inline style.cssText + mouseenter/mouseleave JS handlers.
 *     styles/layout/layout.css already defines .float-btn / .float-whatsapp
 *     with the same visual result via CSS + :hover. The inline styles were
 *     silently overriding the CSS custom properties (--shadow-lg,
 *     --transition-fast), so this button never responded to theme or
 *     dark-mode changes even though every other themed element did.
 *     Letting CSS own the presentation also removes two event listeners
 *     per page load with zero behavior change for the user.
 * ==========================================================================
 */

class WhatsAppWidget {
  constructor() {
    this.init();
  }

  init() {
    // Prevent rendering duplicates if another call runs
    const existing = document.querySelector('.floating-actions');
    if (existing) {
      this.injectButton(existing);
    } else {
      const actionsContainer = document.createElement('div');
      actionsContainer.className = 'floating-actions';
      document.body.appendChild(actionsContainer);
      this.injectButton(actionsContainer);
    }
  }

  /**
   * Appends the button to the action container.
   * @param {HTMLElement} parentElement
   */
  injectButton(parentElement) {
    if (parentElement.querySelector('.float-whatsapp')) return; // idempotent

    const cleanPhone = ENV.CONTACT_WHATSAPP.replace(/\+/g, ''); // Cloud API format (numeric only)
    const encodedMessage = encodeURIComponent('আসসালামু আলাইকুম, আমি AYT Mart থেকে একটি প্রোডাক্ট সম্পর্কে জানতে চাচ্ছি।');
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;

    const waBtn = document.createElement('a');
    waBtn.href = waUrl;
    waBtn.target = '_blank';
    waBtn.rel = 'noopener';
    waBtn.className = 'float-btn float-whatsapp';
    waBtn.setAttribute('aria-label', 'Contact on WhatsApp');

    // High fidelity WhatsApp brand SVG icon
    waBtn.innerHTML = `
      <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor" style="display: block;" aria-hidden="true">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.717-1.458L0 24zm12.035-1.921c1.802 0 3.567-.481 5.116-1.393l.367-.218c1.558.924 3.447.458 4.793.42l-.11-.531c-.426-1.55-.262-3.131.424-4.577l.235-.395c.957-1.603 1.46-3.44 1.458-5.328.003-5.597-4.502-10.15-10.034-10.15-2.7 0-5.238 1.053-7.147 2.966-1.908 1.913-2.955 4.456-2.957 7.16 0 1.942.508 3.834 1.471 5.485l.24.41c-.694 1.488-.517 3.097-.075 4.646l-.105.496c1.378-.035 3.197.433 4.761-.418l.385.228a10.04 10.04 0 0 0 5.18 1.427zm5.556-7.58c-.305-.153-1.805-.89-2.083-.99-.279-.101-.482-.153-.684.153-.203.305-.783.99-.96 1.19-.177.203-.355.228-.66.076-.305-.153-1.287-.475-2.451-1.514-.906-.808-1.517-1.807-1.694-2.112-.178-.305-.019-.47.133-.622.137-.137.305-.355.457-.533.153-.178.203-.305.305-.508.102-.203.051-.381-.025-.533-.076-.153-.684-1.65-.938-2.261-.247-.595-.501-.513-.684-.521-.177-.008-.38-.01-.583-.01-.203 0-.533.076-.813.381-.279.305-1.066 1.042-1.066 2.54 0 1.498 1.091 2.946 1.243 3.149.153.203 2.148 1.64 5.204 2.962 1.583.684 2.215.795 3.01.621.49-.107 1.497-.611 1.7-1.201.203-.59.203-1.092.143-1.193-.06-.101-.238-.153-.543-.305z"/>
      </svg>
    `;

    parentElement.appendChild(waBtn);
  }
}

// Initialize when DOM is available
document.addEventListener('DOMContentLoaded', () => {
  new WhatsAppWidget();
});
