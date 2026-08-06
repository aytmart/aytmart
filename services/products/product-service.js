/**
 * ==========================================================================
 * File: /services/products/product-service.js
 * Description: Catalog Service with Single Product Lookups and Fallbacks
 * ==========================================================================
 */

const ProductService = {
  // Offline/Resilient database matching authentic catalog groups [1, 2]
  MOCK_CATEGORIES: [
    { id: 'CAT-00001', name: 'ইসলামিক সামগ্রী (Islamic)', icon: '🕌' },
    { id: 'CAT-00002', name: 'ইলেকট্রনিক্স (Electronics)', icon: '🔌' },
    { id: 'CAT-00003', name: 'মুদি সামগ্রী (Grocery)', icon: '🌾' },
    { id: 'CAT-00004', name: 'ফ্যাশন (Fashion)', icon: '👔' },
    { id: 'CAT-00005', name: 'বই ও স্টেশনারি (Books)', icon: '📚' }
  ],

  MOCK_PRODUCTS: [
    {
      id: 'PRD-00001',
      name: 'প্রিমিয়াম কাঠের রেহাল (Premium Wooden Rehal)',
      price: 1200,
      sale_price: 950,
      category_id: 'CAT-00001',
      image: 'https://www.pinterest.com/pin/1125759238150214364',
      is_featured: true,
      stock: 45,
      sku: 'AYT-ISL-REH-1092',
      description: 'শতভাগ মেহগনি কাঠের তৈরি এই রেহালটি অত্যন্ত মজবুত ও টেকসই। দৃষ্টিনন্দন যা পড়া ও লেখার চমৎকার আভিজাত্য এনে দেবে। ভাঁজ করে সহজে বহনযোগ্য।',
      specs: [
        { key: 'উপাদান (Material)', value: 'মেহগনি কাঠ (Mahogany Wood)' },
        { key: 'মাপ (Dimensions)', value: '১৪ x ৯ ইঞ্চি উচ্চতা 11 ইঞ্চি' },
        { key: 'উৎপাদনকারী (Origin)', value: 'বাংলাদেশ (Handcrafted in BD)' }
      ]
    },
    {
      id: 'PRD-00002',
      name: 'ডিজিটাল তাসবীহ কাউন্টার (Smart Digital Tasbih)',
      price: 350,
      sale_price: null,
      category_id: 'CAT-00001',
      image: 'https://images.unsplash.com/photo-1609599006353-e629f1d40741?w=400&q=80',
      is_featured: true,
      stock: 120,
      sku: 'AYT-ISL-TAS-5021',
      description: 'স্মার্ট এলইডি স্ক্রিন সমৃদ্ধ এই ডিজিটাল তাসবীহ কাউন্টারটি জিকির গণনার জন্য চমৎকার সহায়ক। এতে রয়েছে দীর্ঘস্থায়ী ব্যাটারি ব্যাকআপ ও আরামদায়ক সিলিকন বেল্ট গ্রিপ।',
      specs: [
        { key: 'টাইপ (Type)', value: 'ডিজিটাল রিচার্জেবল' },
        { key: 'উপাদান', value: 'প্রিমিয়াম সিলিকন ও এবিএস প্লাস্টিক' },
        { key: 'রঙ', value: 'কালো, নেভি ব্লু' }
      ]
    },
    {
      id: 'PRD-00003',
      name: 'প্রিমিয়াম সুগন্ধি আতর (Luxury Attar Perfume)',
      price: 850,
      sale_price: 680,
      category_id: 'CAT-00001',
      image: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=400&q=80',
      is_featured: false,
      stock: 30,
      sku: 'AYT-ISL-ATR-8812',
      description: 'দীর্ঘস্থায়ী মিষ্টি ও ফ্রেশ সুবাস ছড়াতে আমাদের এই প্রিমিয়াম অ্যালকোহল-মুক্ত আতর অত্যন্ত চমৎকার। রাজকীয় আভিজাত্য প্রকাশে ১০০% খাঁটি উপাদানের ব্লেন্ড।',
      specs: [
        { key: 'পরিমাণ (Volume)', value: '১২ মিলি (12ml)' },
        { key: 'অ্যালকোহল', value: '১০০% অ্যালকোহল মুক্ত (Halal)' }
      ]
    },
    {
      id: 'PRD-00004',
      name: 'ব্লুটুথ ওয়্যারলেস এয়ারবাডস (Wireless ANC Earbuds)',
      price: 2500,
      sale_price: 1850,
      category_id: 'CAT-00002',
      image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&q=80',
      is_featured: true,
      stock: 15,
      sku: 'AYT-ELC-ERB-9021',
      description: 'অসাধারণ হাই-ডেফিনিশন সাউন্ড ও অ্যাক্টিভ নয়েজ ক্যান্সেলেশন সমৃদ্ধ আধুনিক ব্লুটুথ এয়ারবাডস। দীর্ঘ সময়ের ব্যাটারি লাইফ ও গেমিং লেটেন্সি মোড ফিচারযুক্ত।',
      specs: [
        { key: 'কানেক্টিভিটি', value: 'ব্লুটুথ ৫.৩ (Bluetooth 5.3)' },
        { key: 'ব্যাটারি লাইফ', value: 'টানা ৩০ ঘণ্টা প্লেব্যাক টাইম' }
      ]
    },
    {
      id: 'PRD-00005',
      name: 'অর্গানিক বাসমতি চাল (Premium Basmati Rice 5kg)',
      price: 980,
      sale_price: null,
      category_id: 'CAT-00003',
      image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&q=80',
      is_featured: false,
      stock: 80,
      sku: 'AYT-GRO-RIC-0044',
      description: 'এক্সট্রা লং গ্রেইন সমৃদ্ধ প্রিমিয়াম বাসমতি চাল। রান্নার পর ভাত হবে ঝরঝরে ও সুগন্ধযুক্ত। বিরিয়ানি ও পোলাও তৈরির জন্য আদর্শ পছন্দ।',
      specs: [
        { key: 'ওজন', value: '৫ কেজি (5kg)' },
        { key: 'গ্রেড', value: 'রপ্তানিযোগ্য প্রিমিয়াম কোয়ালিটি' }
      ]
    }
  ],

  /**
   * Retrieves active product category lists.
   */
  async getCategories() {
    try {
      const response = await ApiClient.request('categories.list', { includeInactive: false }, 'GET');
      if (response && response.success && response.data && response.data.items) {
        return response.data.items.map(item => ({
          id: item['Category ID'],
          name: item['Category Name'],
          icon: item['Icon']
        }));
      }
      return this.MOCK_CATEGORIES;
    } catch (e) {
      console.warn('Backend API Categories query bypassed. Activating local resiliency configurations.', e);
      return this.MOCK_CATEGORIES;
    }
  },

  /**
   * Retrieves product catalog with optional query filters.
   */
  async getAll(filters = {}) {
    try {
      const apiPayload = { includeInactive: false };
      if (filters.category) {
        apiPayload.categoryId = filters.category;
      }

      const response = await ApiClient.request('products.list', apiPayload, 'GET');
      if (response && response.success && response.data && Array.isArray(response.data.items)) {
        // A real, well-formed response — including a legitimately empty array —
        // is returned as-is and must NOT fall through to mock data.
        return response.data.items.map(item => this.mapProductSchema_(item));
      }
      // The backend responded but the shape wasn't what we expected (missing
      // `data.items`, or `success:false`). This is different from a network
      // failure, so it's flagged distinctly to avoid masking a real backend bug.
      console.warn('Products backend responded but payload shape was unexpected. Falling back to local catalog.', response);
      return this.getLocalFilteredProducts_(filters);
    } catch (e) {
      console.warn('Products backend unreachable (network/timeout). Falling back to local catalog.', e);
      return this.getLocalFilteredProducts_(filters);
    }
  },

  /**
   * Retrieves featured promotional catalog entries.
   */
  async getFeatured() {
    const products = await this.getAll();
    return products.filter(p => p.is_featured);
  },

  /**
   * Retrieves single product details by Unique Product ID.
   * 
   * @param {string} productId 
   */
  async getById(productId) {
    try {
      // Tries dot-notation action dispatcher inside Routes.gs
      const response = await ApiClient.request('products.get', { id: productId }, 'GET');
      if (response && response.success && response.data) {
        return this.mapProductSchema_(response.data);
      }
      return this.MOCK_PRODUCTS.find(p => p.id === productId) || null;
    } catch (e) {
      console.warn(`Single Product lookup [ID: ${productId}] failed. Activating local fallback.`, e);
      return this.MOCK_PRODUCTS.find(p => p.id === productId) || null;
    }
  },

  /**
   * Searches the catalog by product name (and SKU) for the header's live
   * autocomplete widget. header.js already calls ProductService.search(query)
   * behind a `typeof` guard, so without this method the suggestions box
   * silently never opens.
   *
   * @param {string} query
   * @returns {Promise<Array>} Up to 8 matching products, cheapest-relevance-first.
   */
  async search(query) {
    const term = (query || '').trim().toLowerCase();
    if (!term) return [];

    try {
      const all = await this.getAll();
      return all
        .filter((p) => {
          const name = (p.name || '').toLowerCase();
          const sku = (p.sku || '').toLowerCase();
          return name.includes(term) || sku.includes(term);
        })
        .sort((a, b) => {
          // Names that *start with* the term rank above names that merely contain it.
          const aStarts = (a.name || '').toLowerCase().startsWith(term) ? 0 : 1;
          const bStarts = (b.name || '').toLowerCase().startsWith(term) ? 0 : 1;
          return aStarts - bStarts;
        })
        .slice(0, 8);
    } catch (e) {
      console.warn(`ProductService.search failed for query "${query}".`, e);
      return [];
    }
  },

  /**
   * Filters mock lists locally based on selection parameters.
   * @private
   */
  getLocalFilteredProducts_(filters) {
    let result = [...this.MOCK_PRODUCTS];
    if (filters.category) {
      result = result.filter(p => p.category_id === filters.category);
    }
    return result;
  },

  /**
   * Maps backend sheet schema keys to standardized frontend object keys [1, 2].
   * @private
   */
  mapProductSchema_(item) {
    return {
      id: item['Product ID'],
      sku: item['SKU'] || item['sku'] || 'AYT-GEN-SKU',
      name: item['Product Name'],
      slug: item['Slug'],
      price: parseFloat(item['Selling Price'] || 0),
      sale_price: item['Discount Price'] ? parseFloat(item['Discount Price']) : null,
      image: item['cover.webp'] || item['image'] || 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&q=80',
      is_featured: !!item['Featured'] || !!item['is_featured'],
      stock: parseInt(item['Stock'] || item['stock'] || 0, 10),
      description: item['Description'] || item['description'] || 'কোনো বিবরণী পাওয়া যায়নি।',
      specs: item['Specs'] || item['specs'] || []
    };
  }
};