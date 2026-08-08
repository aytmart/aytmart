/**
 * ==========================================================================
 * File: /components/header/header.js
 * Description: Global Responsive Premium Header with Live Badge Synchronization
 * Compatibility: preserves #global-header mount point, class name DynamicHeader,
 * public method names (render, initThemeToggle, initMobileDrawer, syncBadges,
 * listenToCartChanges), badge IDs (#cart-badge, #mobile-cart-badge,
 * #wishlist-badge), theme storage key, and the cart-updated / wishlist-updated
 * global events.
 * ==========================================================================
 */

class DynamicHeader {
  constructor() {
    this.container = document.querySelector('#global-header');
    if (!this.container) return;
    this.render();
    this.initThemeToggle();
    this.initMobileDrawer();
    this.initMobileSearchOverlay();
    this.initScrollEffects();
    this.initMegaMenu();
    this.initCategoryMegaMenu();
    this.initActiveNav();
    this.initLanguageSwitcher();
    this.initNotifications();
    this.initUserAccount();
    this.initSearchSuggestions();
    this.syncBadges();
    this.listenToCartChanges();
    this.reserveHeaderSpace();
  }

  /**
   * #global-header is now `position: fixed` (see layout.css) so it stays
   * visible through scroll. Fixed elements are removed from normal document
   * flow, so without this the page content would render underneath it.
   * A ResizeObserver keeps <body> padding-top exactly in sync with the
   * header's real rendered height — including the shrink that happens when
   * `.is-scrolled` kicks in — so there's never a gap or an overlap.
   */
  reserveHeaderSpace() {
    const applyOffset = () => {
      document.body.style.paddingTop = `${this.container.offsetHeight}px`;
    };
    applyOffset();

    if ('ResizeObserver' in window) {
      new ResizeObserver(applyOffset).observe(this.container);
    } else {
      // Fallback for very old browsers without ResizeObserver
      window.addEventListener('resize', applyOffset);
      window.addEventListener('scroll', applyOffset, { passive: true });
    }
  }

  render() {
    this.container.className = '';
    this.container.innerHTML = `

      <div class="header-main" id="header-shell">
        <div class="header-container">
          <!-- Animated hamburger (mobile) -->
          <button class="hamburger-btn" id="drawer-trigger" aria-label="Open Menu" aria-expanded="false">
            <span class="hamburger-line"></span>
            <span class="hamburger-line"></span>
            <span class="hamburger-line"></span>
          </button>

          <!-- Logo -->
          <a href="index.html" class="logo">
            <img src="https://lh3.googleusercontent.com/d/1NthL-M3Rg-oBiR5GQYwiWuZBKPJ-gr3q=w120"
                 alt="${ENV.STORE_NAME}" class="logo-img" width="40" height="40"
                 onerror="this.style.display='none'; this.nextElementSibling.style.display='inline';" />
            <span class="logo-icon" style="display:none;">🛒</span>
            <span>${ENV.STORE_NAME}</span>
          </a>

          <!-- Desktop mega navigation -->
          <nav class="main-nav desktop-only" id="main-nav">
            <div class="nav-item has-mega">
              <a href="products.html" class="nav-link" data-nav="products.html">সকল প্রোডাক্ট</a>
              <div class="mega-menu">
                <div class="mega-col">
                  <div class="mega-col-title">জনপ্রিয়</div>
                  <a href="products.html">সকল প্রোডাক্ট</a>
                  <a href="products.html?sort=best-selling">বেস্ট সেলার</a>
                  <a href="products.html?sort=newest">নতুন এসেছে</a>
                  <a href="products.html?sale=1">অফার প্রোডাক্ট</a>
                </div>
                <div class="mega-col">
                  <div class="mega-col-title">সহায়তা</div>
                  <a href="track-order.html">অর্ডার ট্র্যাক করুন</a>
                  <a href="contact.html">যোগাযোগ করুন</a>
                  <a href="faq.html">সচরাচর জিজ্ঞাসা</a>
                </div>
              </div>
            </div>
            <div class="nav-item has-mega" id="category-nav-item">
              <a href="categories.html" class="nav-link" data-nav="categories.html">ক্যাটাগরি</a>
              <div class="mega-menu mega-menu-categories" id="category-mega-menu">
                <div class="mega-col"><div class="mega-col-title">লোড হচ্ছে...</div></div>
              </div>
            </div>
            <a href="products.html?sale=1" class="nav-link nav-link-offer" data-nav="offers">🔥 অফার</a>
            <a href="track-order.html" class="nav-link" data-nav="track-order.html">অর্ডার ট্র্যাক</a>
          </nav>

          <!-- Search -->
          <div class="header-search" id="header-search">
            <form class="search-form" action="products.html" method="GET" id="search-form" autocomplete="off">
              <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
              <input type="text" name="q" id="search-input" placeholder="পণ্য খুঁজুন..." class="search-input" required />
              <button type="submit" class="search-btn">খুঁজুন</button>
            </form>
            <div class="search-suggestions" id="search-suggestions"></div>
          </div>

          <!-- Utility actions -->
          <div class="header-actions">
            <button class="action-item lang-item desktop-only" id="lang-toggler" aria-label="ভাষা পরিবর্তন করুন">
              🌐 <span id="lang-label">বাং</span>
            </button>

            <button class="action-item" id="theme-toggler" aria-label="Toggle Theme">
              <span class="toggler-icon">🌙</span>
            </button>

            <div class="dropdown desktop-only" id="notif-dropdown">
              <button class="action-item" id="notif-toggler" aria-label="Notifications">
                🔔
                <span class="badge-count" id="notif-badge">0</span>
              </button>
              <div class="notif-panel" id="notif-panel">
                <div class="notif-title">নোটিফিকেশন</div>
                <div id="notif-list">
                  <div class="notif-row">🎁 <span>আপনার জন্য বিশেষ অফার অপেক্ষা করছে!</span></div>
                  <div class="notif-row">📦 <span>আজকের চমৎকার ডিলগুলো দেখতে ভুলবেন না।</span></div>
                </div>
              </div>
            </div>

            <div class="dropdown" id="user-dropdown">
              <button class="action-item" id="user-toggler" aria-label="User Account">
                👤
              </button>
              <div class="user-panel" id="user-panel" style="position: absolute; top: calc(100% + 10px); right: 0; width: 220px; background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--border-radius-md); box-shadow: var(--shadow-lg); padding: var(--space-2); opacity: 0; visibility: hidden; transform: translateY(6px); transition: opacity var(--transition-fast), transform var(--transition-fast), visibility var(--transition-fast); z-index: var(--z-dropdown);">
                <div class="user-info" style="padding: var(--space-2) var(--space-3); border-bottom: 1px solid var(--border-color); font-size: var(--font-xs); color: var(--text-muted);">
                  স্বাগতম গ্রাহক!
                </div>
                <a href="cart.html" style="display: flex; align-items: center; gap: var(--space-2); padding: var(--space-2) var(--space-3); font-size: 13px; color: var(--text-color); border-radius: var(--border-radius-sm); transition: background var(--transition-fast);">
                  🛒 আমার কার্ট
                </a>
                <a href="wishlist.html" style="display: flex; align-items: center; gap: var(--space-2); padding: var(--space-2) var(--space-3); font-size: 13px; color: var(--text-color); border-radius: var(--border-radius-sm); transition: background var(--transition-fast);">
                  ❤️ আমার উইশলিস্ট
                </a>
                <a href="track-order.html" style="display: flex; align-items: center; gap: var(--space-2); padding: var(--space-2) var(--space-3); font-size: 13px; color: var(--text-color); border-radius: var(--border-radius-sm); transition: background var(--transition-fast);">
                  📦 অর্ডার ট্র্যাক করুন
                </a>
              </div>
            </div>

            <a href="wishlist.html" class="action-item" aria-label="Wishlist">
              <span>❤️</span>
              <span class="badge-count" id="wishlist-badge">0</span>
            </a>

            <a href="cart.html" class="action-item" aria-label="Shopping Cart">
              <span>🛒</span>
              <span class="badge-count" id="cart-badge">0</span>
            </a>

            <button class="action-item" id="mobile-search-trigger" aria-label="Search">🔍</button>
          </div>
        </div>
      </div>

      <!-- Mobile search overlay -->
      <div class="mobile-search-overlay" id="mobile-search-overlay">
        <div class="mobile-search-header">
          <form class="search-form" action="products.html" method="GET" id="mobile-search-form" autocomplete="off">
            <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
            <input type="text" name="q" id="mobile-search-input" placeholder="পণ্য খুঁজুন..." class="search-input" required />
            <button type="submit" class="search-btn">খুঁজুন</button>
          </form>
          <button class="mobile-search-close" id="mobile-search-close" aria-label="Close Search">×</button>
        </div>
        <div class="search-suggestions" id="mobile-search-suggestions" style="position:static;"></div>
      </div>

      <!-- Slide out Mobile Menu Overlay & Drawer -->
      <div class="drawer-overlay" id="nav-overlay"></div>
      <div class="mobile-nav-drawer" id="nav-drawer">
        <div class="drawer-header">
          <span class="logo" style="font-size: var(--font-lg)">${ENV.STORE_NAME}</span>
          <button class="drawer-close" id="drawer-close" aria-label="Close Menu">×</button>
        </div>
        <nav class="drawer-menu">
          <a href="index.html" class="drawer-link">🏠 হোম (Home)</a>
          <a href="products.html" class="drawer-link">🛍️ সকল প্রোডাক্ট (Products)</a>
          <a href="categories.html" class="drawer-link">📂 ক্যাটাগরি (Categories)</a>
          <div id="drawer-category-list" class="drawer-subcat-list"></div>
          <a href="products.html?sale=1" class="drawer-link drawer-link-offer">🔥 অফার (Offers)</a>
          <a href="track-order.html" class="drawer-link">📦 অর্ডার ট্র্যাক (Track Order)</a>
          <div class="drawer-divider"></div>
          <a href="contact.html" class="drawer-link">✉️ যোগাযোগ (Contact)</a>
        </nav>
        <div class="drawer-footer">
          <button class="action-item" id="drawer-lang-toggler" style="width:auto;padding:6px 12px;gap:6px;">
            🌐 <span id="drawer-lang-label">বাংলা</span>
          </button>
          <span>© ${new Date().getFullYear()} ${ENV.STORE_NAME}</span>
        </div>
      </div>

      <!-- Mobile Sticky Bottom Nav Bar -->
      <div class="mobile-sticky-bar">
        <div class="mobile-sticky-bar-container">
          <a href="index.html" class="mobile-bar-item active">
            <span style="font-size: 1.25rem;">🏠</span>
            <span>হোম</span>
          </a>
          <a href="products.html" class="mobile-bar-item">
            <span style="font-size: 1.25rem;">🛍️</span>
            <span>প্রোডাক্ট</span>
          </a>
          <a href="cart.html" class="mobile-bar-item" style="position: relative;">
            <span style="font-size: 1.25rem;">🛒</span>
            <span class="badge-count" id="mobile-cart-badge" style="top: -4px; right: -4px;">0</span>
            <span>কার্ট</span>
          </a>
          <a href="wishlist.html" class="mobile-bar-item">
            <span style="font-size: 1.25rem;">❤️</span>
            <span>উইশলিস্ট</span>
          </a>
        </div>
      </div>
    `;
  }

  initThemeToggle() {
    const toggler = document.querySelector('#theme-toggler');
    if (!toggler) return;

    const savedTheme = StorageHelper.get(ENV.STORAGE_KEYS.THEME, 'light');
    document.documentElement.setAttribute('data-theme', savedTheme);
    toggler.innerHTML = `<span class="toggler-icon">${savedTheme === 'dark' ? '☀️' : '🌙'}</span>`;

    toggler.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', nextTheme);
      StorageHelper.set(ENV.STORAGE_KEYS.THEME, nextTheme);
      toggler.innerHTML = `<span class="toggler-icon">${nextTheme === 'dark' ? '☀️' : '🌙'}</span>`;
    });
  }

  initMobileDrawer() {
    const trigger = document.querySelector('#drawer-trigger');
    const closeBtn = document.querySelector('#drawer-close');
    const overlay = document.querySelector('#nav-overlay');
    const drawer = document.querySelector('#nav-drawer');

    if (!trigger || !drawer) return;

    const toggleDrawer = () => {
      const isActive = drawer.classList.toggle('active');
      overlay.classList.toggle('active');
      trigger.setAttribute('aria-expanded', String(isActive));
      document.body.style.overflow = isActive ? 'hidden' : '';
    };

    trigger.addEventListener('click', toggleDrawer);
    closeBtn.addEventListener('click', toggleDrawer);
    overlay.addEventListener('click', toggleDrawer);
  }

  initMobileSearchOverlay() {
    const trigger = document.querySelector('#mobile-search-trigger');
    const closeBtn = document.querySelector('#mobile-search-close');
    const overlay = document.querySelector('#mobile-search-overlay');
    if (!trigger || !overlay) return;

    trigger.addEventListener('click', () => {
      overlay.classList.add('active');
      const input = document.querySelector('#mobile-search-input');
      if (input) setTimeout(() => input.focus(), 200);
    });
    closeBtn.addEventListener('click', () => overlay.classList.remove('active'));
  }

  initScrollEffects() {
    const shell = document.querySelector('#header-shell');
    if (!shell) return;
    const onScroll = () => {
      shell.classList.toggle('is-scrolled', window.scrollY > 24);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  initMegaMenu() {
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      document.querySelectorAll('.nav-item.has-mega').forEach((item) => {
        if (item.contains(document.activeElement)) item.querySelector('.nav-link')?.focus();
      });
    });
  }

  /**
   * Populates the desktop "ক্যাটাগরি" mega-menu and the mobile drawer's
   * category list with real Category -> Subcategory data from the backend.
   * Runs after render() so the placeholder markup already exists in the DOM.
   */
  async initCategoryMegaMenu() {
    const megaMenu = document.querySelector('#category-mega-menu');
    const drawerList = document.querySelector('#drawer-category-list');
    if (!megaMenu && !drawerList) return;

    let categories = [];
    try {
      categories = (window.ProductService && typeof ProductService.getCategories === 'function')
        ? await ProductService.getCategories()
        : [];
    } catch (e) {
      categories = [];
    }

    if (!categories || !categories.length) {
      if (megaMenu) {
        megaMenu.innerHTML = `<div class="mega-col"><a href="categories.html">সব ক্যাটাগরি দেখুন</a></div>`;
      }
      return;
    }

    // Fetch each category's subcategories in parallel.
    const withSubs = await Promise.all(categories.map(async (cat) => {
      let subs = [];
      try {
        subs = (window.ProductService && typeof ProductService.getSubcategories === 'function')
          ? await ProductService.getSubcategories(cat.id)
          : [];
      } catch (e) {
        subs = [];
      }
      return { ...cat, subcategories: subs || [] };
    }));

    if (megaMenu) {
      megaMenu.innerHTML = withSubs.map((cat) => {
        const subLinks = cat.subcategories.length
          ? cat.subcategories.map((sub) => `
              <a href="products.html?category=${encodeURIComponent(cat.id)}&subcategory=${encodeURIComponent(sub.id)}">${sub.name}</a>
            `).join('')
          : `<a href="products.html?category=${encodeURIComponent(cat.id)}" class="mega-col-empty">কোনো সাবক্যাটাগরি নেই</a>`;

        return `
          <div class="mega-col">
            <div class="mega-col-title">
              <a href="products.html?category=${encodeURIComponent(cat.id)}">${cat.icon || ''} ${cat.name}</a>
            </div>
            ${subLinks}
          </div>
        `;
      }).join('');
    }

    if (drawerList) {
      drawerList.innerHTML = withSubs.map((cat) => {
        const subLinks = cat.subcategories.length
          ? `<div class="drawer-subcat-group">${cat.subcategories.map((sub) => `
              <a href="products.html?category=${encodeURIComponent(cat.id)}&subcategory=${encodeURIComponent(sub.id)}" class="drawer-link drawer-sublink">${sub.name}</a>
            `).join('')}</div>`
          : '';

        return `
          <a href="products.html?category=${encodeURIComponent(cat.id)}" class="drawer-link drawer-sublink">${cat.icon || ''} ${cat.name}</a>
          ${subLinks}
        `;
      }).join('');
    }
  }


  initActiveNav() {
    const current = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
    document.querySelectorAll('.nav-link[data-nav]').forEach((link) => {
      const target = link.dataset.nav;
      if (target && current === target.toLowerCase()) {
        link.classList.add('active-nav');
      }
    });

    const bottomItems = document.querySelectorAll('.mobile-bar-item');
    bottomItems.forEach((item) => {
      const href = item.getAttribute('href');
      if (href && current === href.toLowerCase()) {
        bottomItems.forEach((el) => el.classList.remove('active'));
        item.classList.add('active');
      }
    });
  }

  initLanguageSwitcher() {
    const btn = document.querySelector('#lang-toggler');
    const label = document.querySelector('#lang-label');
    const drawerBtn = document.querySelector('#drawer-lang-toggler');
    const drawerLabel = document.querySelector('#drawer-lang-label');
    const key = (ENV.STORAGE_KEYS && ENV.STORAGE_KEYS.LANG) || 'ayt_lang';

    const apply = (lang) => {
      if (label) label.textContent = lang === 'en' ? 'EN' : 'বাং';
      if (drawerLabel) drawerLabel.textContent = lang === 'en' ? 'English' : 'বাংলা';
      window.dispatchEvent(new CustomEvent('lang-changed', { detail: { lang } }));
    };

    const current = StorageHelper.get(key, 'bn');
    apply(current);

    const toggle = () => {
      const next = StorageHelper.get(key, 'bn') === 'bn' ? 'en' : 'bn';
      StorageHelper.set(key, next);
      apply(next);
    };

    btn?.addEventListener('click', toggle);
    drawerBtn?.addEventListener('click', toggle);
  }

  initNotifications() {
    const toggler = document.querySelector('#notif-toggler');
    const panel = document.querySelector('#notif-panel');
    const badge = document.querySelector('#notif-badge');
    if (!toggler || !panel) return;

    if (badge) {
      badge.textContent = '2';
    }

    toggler.addEventListener('click', (e) => {
      e.stopPropagation();
      panel.classList.toggle('is-open');
    });

    document.addEventListener('click', (e) => {
      if (!panel.contains(e.target) && e.target !== toggler) {
        panel.classList.remove('is-open');
      }
    });
  }

  initUserAccount() {
    const toggler = document.querySelector('#user-toggler');
    const panel = document.querySelector('#user-panel');
    if (!toggler || !panel) return;

    toggler.addEventListener('click', (e) => {
      e.stopPropagation();
      const isActive = panel.style.opacity === '1';
      panel.style.opacity = isActive ? '0' : '1';
      panel.style.visibility = isActive ? 'hidden' : 'visible';
      panel.style.transform = isActive ? 'translateY(6px)' : 'translateY(0)';
    });

    document.addEventListener('click', (e) => {
      if (!panel.contains(e.target) && e.target !== toggler) {
        panel.style.opacity = '0';
        panel.style.visibility = 'hidden';
        panel.style.transform = 'translateY(6px)';
      }
    });
  }

  initSearchSuggestions() {
    const bindSuggestions = (inputSel, boxSel) => {
      const input = document.querySelector(inputSel);
      const box = document.querySelector(boxSel);
      if (!input || !box) return;

      let debounceTimer;
      let highlightedIndex = -1;

      const render = (items) => {
        if (!items || !items.length) {
          box.innerHTML = `<div class="suggestion-empty">কোনো ফলাফল পাওয়া যায়নি</div>`;
        } else {
          box.innerHTML = items.map((p) => `
            <a class="suggestion-item" href="product.html?id=${p.id}">
              ${p.image ? `<img src="${p.image}" alt="">` : ''}
              <span>${p.name}</span>
            </a>
          `).join('');
        }
        box.classList.add('is-open');
        highlightedIndex = -1;
      };

      input.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        const query = input.value.trim();
        if (!query) { box.classList.remove('is-open'); box.innerHTML = ''; return; }

        debounceTimer = setTimeout(() => {
          if (window.ProductService && typeof ProductService.search === 'function') {
            Promise.resolve(ProductService.search(query))
              .then((results) => render((results || []).slice(0, 6)))
              .catch(() => render([]));
          } else {
            box.classList.remove('is-open');
          }
        }, 220);
      });

      input.addEventListener('keydown', (e) => {
        const items = Array.from(box.querySelectorAll('.suggestion-item'));
        if (!items.length) return;
        if (e.key === 'ArrowDown') { e.preventDefault(); highlightedIndex = (highlightedIndex + 1) % items.length; }
        else if (e.key === 'ArrowUp') { e.preventDefault(); highlightedIndex = (highlightedIndex - 1 + items.length) % items.length; }
        else if (e.key === 'Enter' && highlightedIndex >= 0) { e.preventDefault(); items[highlightedIndex].click(); return; }
        else return;
        items.forEach((el, i) => el.classList.toggle('is-highlighted', i === highlightedIndex));
      });

      document.addEventListener('click', (e) => {
        if (!box.contains(e.target) && e.target !== input) box.classList.remove('is-open');
      });
    };

    bindSuggestions('#search-input', '#search-suggestions');
    bindSuggestions('#mobile-search-input', '#mobile-search-suggestions');
  }

  syncBadges() {
    const cart = StorageHelper.get(ENV.STORAGE_KEYS.CART, { items: [] });
    const wishlist = StorageHelper.get(ENV.STORAGE_KEYS.WISHLIST, []);

    const totalCartQty = (cart.items || []).reduce((acc, item) => acc + (parseInt(item.Quantity, 10) || 0), 0);
    const totalWishlistQty = (Array.isArray(wishlist) ? wishlist : []).length;

    const cartBadge = document.querySelector('#cart-badge');
    const mobileCartBadge = document.querySelector('#mobile-cart-badge');
    const wishlistBadge = document.querySelector('#wishlist-badge');

    [cartBadge, mobileCartBadge].forEach((el) => {
      if (!el) return;
      if (el.innerText !== String(totalCartQty)) {
        el.innerText = totalCartQty;
        el.classList.remove('is-bumped');
        void el.offsetWidth;
        el.classList.add('is-bumped');
      }
    });
    if (wishlistBadge) {
      wishlistBadge.innerText = totalWishlistQty;
    }
  }

  listenToCartChanges() {
    window.addEventListener('cart-updated', () => this.syncBadges());
    window.addEventListener('wishlist-updated', () => this.syncBadges());
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.AytHeaderInstance = new DynamicHeader();
});