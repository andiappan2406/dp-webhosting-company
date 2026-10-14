/* ==========================================================================
   DP HOSTING & DOMAINS - SHOPPING CART & COMMERCE ENGINE
   Handles Cart state, currency conversion, checkout modal, coupons
   ========================================================================== */

const CartEngine = (() => {
  // Exchange rates baseline (USD 1.0)
  const CURRENCIES = {
    USD: { symbol: '$', rate: 1.0, format: (val) => `$${val.toFixed(2)}` },
    EUR: { symbol: '€', rate: 0.92, format: (val) => `€${(val * 0.92).toFixed(2)}` },
    GBP: { symbol: '£', rate: 0.79, format: (val) => `£${(val * 0.79).toFixed(2)}` },
    INR: { symbol: '₹', rate: 83.5, format: (val) => `₹${Math.round(val * 83.5)}` }
  };

  let currentCurrency = localStorage.getItem('dp_currency') || 'USD';
  let cartItems = JSON.parse(localStorage.getItem('dp_cart') || '[]');
  let appliedCoupon = null;

  // Initial cart with a nice sample if empty or fresh
  if (cartItems.length === 0 && !localStorage.getItem('dp_cart_initialized')) {
    cartItems = [
      {
        id: 'domain-dpcloud-com',
        type: 'domain',
        name: 'myfirststartup.com',
        billing: '1 Year Registration',
        basePriceUSD: 9.99,
        originalUSD: 14.99,
        whoisPrivacy: true
      }
    ];
    localStorage.setItem('dp_cart_initialized', 'true');
    saveCart();
  }

  function saveCart() {
    localStorage.setItem('dp_cart', JSON.stringify(cartItems));
  }

  function formatPrice(usdAmount) {
    const cur = CURRENCIES[currentCurrency] || CURRENCIES.USD;
    return cur.format(usdAmount);
  }

  function setCurrency(code) {
    if (CURRENCIES[code]) {
      currentCurrency = code;
      localStorage.setItem('dp_currency', code);
      renderCart();
      updateAllPricesOnPage();
    }
  }

  function getCurrency() {
    return currentCurrency;
  }

  function addItem(item) {
    // Check if already in cart
    const existing = cartItems.find(i => i.name.toLowerCase() === item.name.toLowerCase());
    if (existing) {
      showToast(`"${item.name}" is already in your cart.`, 'info');
      openDrawer();
      return;
    }

    item.id = 'item-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4);
    cartItems.push(item);
    saveCart();
    renderCart();
    updateCartBadge();
    openDrawer();
    showToast(`Added "${item.name}" to cart!`, 'success');
  }

  function removeItem(id) {
    cartItems = cartItems.filter(i => i.id !== id);
    saveCart();
    renderCart();
    updateCartBadge();
    showToast('Item removed from cart', 'info');
  }

  function clearCart() {
    cartItems = [];
    appliedCoupon = null;
    saveCart();
    renderCart();
    updateCartBadge();
  }

  function applyCoupon(code) {
    code = code.trim().toUpperCase();
    if (code === 'FREEDOMAIN') {
      appliedCoupon = { code: 'FREEDOMAIN', discountPercent: 0, fixedOffUSD: 9.99, label: 'Free .com Domain Discount (-$9.99)' };
      renderCart();
      showToast('Coupon FREEDOMAIN applied! ($9.99 off)', 'success');
      return true;
    } else if (code === 'DP50' || code === 'LAUNCH2026') {
      appliedCoupon = { code: code, discountPercent: 20, fixedOffUSD: 0, label: 'Special Launch Promo (20% OFF)' };
      renderCart();
      showToast('Promo code applied: 20% discount!', 'success');
      return true;
    } else {
      showToast('Invalid promo code. Try "LAUNCH2026" or "FREEDOMAIN"', 'warning');
      return false;
    }
  }

  function calculateTotals() {
    let subtotalUSD = cartItems.reduce((acc, item) => acc + item.basePriceUSD, 0);
    let discountUSD = 0;

    if (appliedCoupon) {
      if (appliedCoupon.fixedOffUSD) {
        discountUSD = Math.min(subtotalUSD, appliedCoupon.fixedOffUSD);
      } else if (appliedCoupon.discountPercent) {
        discountUSD = (subtotalUSD * appliedCoupon.discountPercent) / 100;
      }
    }

    const taxableUSD = Math.max(0, subtotalUSD - discountUSD);
    const taxUSD = taxableUSD * 0.05; // 5% cloud regulatory tax
    const totalUSD = taxableUSD + taxUSD;

    return {
      subtotalUSD,
      discountUSD,
      taxUSD,
      totalUSD,
      count: cartItems.length
    };
  }

  function updateCartBadge() {
    const badges = document.querySelectorAll('.cart-badge');
    badges.forEach(b => {
      b.textContent = cartItems.length;
      b.style.display = cartItems.length > 0 ? 'flex' : 'none';
    });
  }

  function renderCart() {
    const cartList = document.getElementById('cart-items-list');
    const emptyState = document.getElementById('cart-empty-state');
    const footer = document.getElementById('cart-footer-section');
    const subtotalEl = document.getElementById('cart-subtotal');
    const discountRow = document.getElementById('cart-discount-row');
    const discountEl = document.getElementById('cart-discount');
    const taxEl = document.getElementById('cart-tax');
    const totalEl = document.getElementById('cart-total');

    if (!cartList) return;

    if (cartItems.length === 0) {
      cartList.innerHTML = '';
      if (emptyState) emptyState.style.display = 'block';
      if (footer) footer.style.display = 'none';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';
    if (footer) footer.style.display = 'block';

    cartList.innerHTML = cartItems.map(item => `
      <div class="cart-item" data-id="${item.id}">
        <div class="cart-item-info">
          <h4>${item.type === 'domain' ? '🌐 ' : '⚡ '}${item.name}</h4>
          <span class="cart-item-cycle">${item.billing}</span>
          ${item.type === 'domain' ? '<div style="font-size:0.75rem; color:var(--color-emerald); margin-top:2px;">✓ Free WHOIS Privacy Guard included</div>' : ''}
          ${item.type === 'hosting' ? '<div style="font-size:0.75rem; color:var(--color-primary); margin-top:2px;">✓ LiteSpeed LSCache & Anycast DNS</div>' : ''}
        </div>
        <div class="cart-item-price">
          <div class="cart-item-cost">${formatPrice(item.basePriceUSD)}</div>
          <button class="cart-item-remove" onclick="CartEngine.removeItem('${item.id}')">Remove</button>
        </div>
      </div>
    `).join('');

    const totals = calculateTotals();
    if (subtotalEl) subtotalEl.textContent = formatPrice(totals.subtotalUSD);
    if (taxEl) taxEl.textContent = formatPrice(totals.taxUSD);
    if (totalEl) totalEl.textContent = formatPrice(totals.totalUSD);

    if (discountRow && discountEl) {
      if (totals.discountUSD > 0) {
        discountRow.style.display = 'flex';
        discountEl.textContent = `-${formatPrice(totals.discountUSD)}`;
      } else {
        discountRow.style.display = 'none';
      }
    }

    updateCartBadge();
  }

  function updateAllPricesOnPage() {
    const priceElements = document.querySelectorAll('[data-usd]');
    priceElements.forEach(el => {
      const usd = parseFloat(el.getAttribute('data-usd'));
      if (!isNaN(usd)) {
        el.textContent = formatPrice(usd);
      }
    });

    const currSelects = document.querySelectorAll('.currency-select');
    currSelects.forEach(sel => {
      sel.value = currentCurrency;
    });
  }

  function openDrawer() {
    const drawer = document.getElementById('cart-drawer');
    const overlay = document.getElementById('cart-overlay');
    if (drawer && overlay) {
      drawer.classList.add('active');
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeDrawer() {
    const drawer = document.getElementById('cart-drawer');
    const overlay = document.getElementById('cart-overlay');
    if (drawer && overlay) {
      drawer.classList.remove('active');
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  // Toast Helper
  function showToast(message, type = 'info') {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const icon = type === 'success' ? '✅' : type === 'warning' ? '⚠️' : 'ℹ️';
    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  return {
    addItem,
    removeItem,
    clearCart,
    applyCoupon,
    getCartTotals: calculateTotals,
    formatPrice,
    setCurrency,
    getCurrency,
    renderCart,
    updateAllPricesOnPage,
    openDrawer,
    closeDrawer,
    showToast
  };
})();
