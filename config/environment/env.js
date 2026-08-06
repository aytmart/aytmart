/**
 * ==========================================================================
 * File: /config/environment/env.js
 * Description: Global Store Environment Variables and Operational Parameters
 * ==========================================================================
 */

const ENV = {
  // Production Apps Script API Deployment Target
  API_URL: 'https://script.google.com/macros/s/AKfycby-XSlyF8TGkTfjHz1GSbceKQTHHoBEwVrUw0LnNzrOeerNW37N3N68kbt4QV8W9dex/exec',
  
  // API settings
  API_VERSION: 'v1',
  
  // Business Metadata
  STORE_NAME: 'AYT Mart',
  CURRENCY: 'BDT',
  CURRENCY_SYMBOL: '৳',
  
  // High-priority Social and Contact Links
  CONTACT_WHATSAPP: '+8801786840952',
  FACEBOOK_PAGE: 'https://www.facebook.com/aytmartbd',
  FACEBOOK_GROUP: 'https://www.facebook.com/groups/ayt.mart.seller.community',
  TIKTOK: 'https://www.tiktok.com/@aytmartbd',
  YOUTUBE: 'https://www.youtube.com/@aytmart',
  
  // Storage keys to keep standard throughout modular system
  STORAGE_KEYS: {
    THEME: 'ayt_theme',
    SESSION: 'ayt_session',
    CART: 'ayt_cart',
    WISHLIST: 'ayt_wishlist',
    LANG: 'ayt_lang'
  }
};

// Freeze the object to protect configurations from accidental modifications
Object.freeze(ENV);