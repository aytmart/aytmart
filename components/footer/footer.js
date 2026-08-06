/**
 * ==========================================================================
 * File: /components/footer/footer.js
 * Description: Dynamic Global Premium Footer with Environment Configurations
 * Compatibility: preserves #global-footer mount point, class name DynamicFooter,
 * public method name (render), and all ENV.* / StorageHelper usage contracts.
 * ==========================================================================
 */

class DynamicFooter {
  constructor() {
    this.container = document.querySelector('#global-footer');
    if (!this.container) return;
    this.render();
    this.initNewsletter();
    this.initBackToTop();
  }

  render() {
    this.container.className = 'footer-main';
    this.container.innerHTML = `
      <div class="footer-container">

        <!-- Newsletter -->
        <div class="footer-newsletter">
          <div class="footer-newsletter-copy">
            <h4>বিশেষ অফার সবার আগে পান</h4>
            <p>নতুন প্রোডাক্ট ও এক্সক্লুসিভ ছাড়ের খবর সরাসরি আপনার ইনবক্সে পেতে সাবস্ক্রাইব করুন।</p>
          </div>
          <form class="footer-newsletter-form" id="footer-newsletter-form">
            <input type="email" id="footer-newsletter-email" placeholder="আপনার ইমেইল ঠিকানা" required />
            <button type="submit">সাবস্ক্রাইব করুন</button>
          </form>
        </div>

        <div class="footer-top">
          <!-- Brand -->
          <div class="footer-col">
            <h3 class="footer-title">${ENV.STORE_NAME}</h3>
            <p class="footer-brand-desc">
              প্রিমিয়াম কোয়ালিটির ইসলামিক পণ্য, গ্যাজেট ও দেশীয় সামগ্রীর নির্ভরযোগ্য অনলাইন ই-কমার্স শপ। আমরা সারাদেশে দ্রুততম ও নিরাপদ ক্যাশ অন ডেলিভারি নিশ্চিত করি।
            </p>
            <div class="footer-social">
              <a href="${ENV.FACEBOOK_PAGE}" target="_blank" rel="noopener" aria-label="Facebook">f</a>
              <a href="${ENV.TIKTOK}" target="_blank" rel="noopener" aria-label="TikTok">t</a>
              <a href="${ENV.YOUTUBE}" target="_blank" rel="noopener" aria-label="YouTube">▶</a>
            </div>
          </div>

          <!-- Quick links -->
          <div class="footer-col">
            <h4 class="footer-title">কুইক লিংক</h4>
            <div class="footer-links">
              <a href="index.html" class="footer-link">হোম (Home)</a>
              <a href="products.html" class="footer-link">সকল প্রোডাক্ট (Products)</a>
              <a href="categories.html" class="footer-link">ক্যাটাগরি (Categories)</a>
              <a href="products.html?sale=1" class="footer-link">অফার (Offers)</a>
            </div>
          </div>

          <!-- Support & policies -->
          <div class="footer-col">
            <h4 class="footer-title">সহযোগিতা ও তথ্য</h4>
            <div class="footer-links">
              <a href="about.html" class="footer-link">আমাদের সম্পর্কে (About Us)</a>
              <a href="contact.html" class="footer-link">যোগাযোগ (Contact Us)</a>
              <a href="track-order.html" class="footer-link">অর্ডার ট্র্যাক (Track Order)</a>
              <a href="faq.html" class="footer-link">জিজ্ঞাসিত প্রশ্নাবলী (FAQs)</a>
            </div>
          </div>

          <!-- Contact -->
          <div class="footer-col">
            <h4 class="footer-title">যোগাযোগ করুন</h4>
            <div class="footer-links">
              <div class="footer-contact-row">💬 <span>হোয়াটসঅ্যাপ: <strong>${ENV.CONTACT_WHATSAPP}</strong></span></div>
              <div class="footer-contact-row">📧 <span>info@aytmart.com</span></div>
              <div class="footer-contact-row">🏠 <span>ঢাকা, বাংলাদেশ (অনলাইন-ভিত্তিক কার্যক্রম)</span></div>
            </div>
          </div>
        </div>

        <!-- Payment / delivery / security -->
        <div class="footer-strip">
          <div class="footer-strip-group">
            <span class="footer-strip-label">পেমেন্ট মেথড</span>
            <div class="footer-badge-row">
              <span class="footer-badge">বিকাশ</span>
              <span class="footer-badge">নগদ</span>
              <span class="footer-badge">রকেট</span>
              <span class="footer-badge">Visa</span>
              <span class="footer-badge">Mastercard</span>
              <span class="footer-badge">ক্যাশ অন ডেলিভারি</span>
            </div>
          </div>
          <div class="footer-strip-group">
            <span class="footer-strip-label">ডেলিভারি পার্টনার</span>
            <div class="footer-badge-row">
              <span class="footer-badge">পাঠাও</span>
              <span class="footer-badge">সুন্দরবন কুরিয়ার</span>
              <span class="footer-badge">রেডএক্স</span>
            </div>
          </div>
          <div class="footer-strip-group">
            <span class="footer-strip-label">নিরাপত্তা ও ট্রাস্ট</span>
            <div class="footer-badge-row">
              <span class="footer-badge">🔒 SSL সুরক্ষিত</span>
              <span class="footer-badge">✔️ যাচাইকৃত শপ</span>
            </div>
          </div>
        </div>

        <div class="footer-strip" style="border-top:none; padding-top:0;">
          <div class="footer-strip-group">
            <span class="footer-strip-label">মোবাইল অ্যাপ</span>
            <div class="footer-app-row">
              <a href="#" class="footer-app-btn">📱 Google Play</a>
              <a href="#" class="footer-app-btn">🍎 App Store</a>
            </div>
          </div>
        </div>
      </div>

      <!-- Copyright Sub Bar -->
      <div class="footer-container footer-bottom">
        <p>© ${new Date().getFullYear()} ${ENV.STORE_NAME}. সর্বস্বত্ব সংরক্ষিত।</p>
        <p>Design by <a href="https://engineeringvisuallab.github.io/evlab/" target="_blank" rel="noopener">EVLab</a></p>
      </div>
    `;
  }

  initNewsletter() {
    const form = document.querySelector('#footer-newsletter-form');
    if (!form) return;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = document.querySelector('#footer-newsletter-email');
      const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((input?.value || '').trim());
      if (!valid) return;
      input.value = '';
      if (typeof window.showToast === 'function') {
        window.showToast('সাবস্ক্রাইব করার জন্য ধন্যবাদ!');
      }
    });
  }

  initBackToTop() {
    const btn = document.createElement('button');
    btn.className = 'float-btn';
    btn.id = 'back-to-top-btn';
    btn.setAttribute('aria-label', 'Back to top');
    btn.style.background = 'var(--color-primary)';
    btn.style.display = 'none';
    btn.innerHTML = '↑';

    let wrap = document.querySelector('.floating-actions');
    if (!wrap) {
      wrap = document.createElement('div');
      wrap.className = 'floating-actions';
      document.body.appendChild(wrap);
    }
    wrap.appendChild(btn);

    window.addEventListener('scroll', () => {
      btn.style.display = window.scrollY > 500 ? 'flex' : 'none';
    }, { passive: true });
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }
}

// Initialize when DOM is available
document.addEventListener('DOMContentLoaded', () => {
  new DynamicFooter();
});