/* ==========================================================================
   DP HOSTING & DOMAINS - CORE APPLICATION LOGIC
   Theme switcher, Billing Toggle, Ping Simulator, Modals, Support Chat
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Domain Search Engine
  DomainSearchEngine.init();

  // Initialize Cart
  CartEngine.renderCart();
  CartEngine.updateAllPricesOnPage();

  // Initialize Components
  initThemeToggle();
  initCurrencySelector();
  initBillingCycleSwitcher();
  initLatencySimulator();
  initCartDrawerControls();
  initModals();
  initSupportChat();
  initMobileNav();
  initCouponForm();
});

/* --- THEME TOGGLE (Dark / Light) --- */
function initThemeToggle() {
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const themeIcon = document.getElementById('theme-toggle-icon');

  // Stored preference or default dark
  const savedTheme = localStorage.getItem('dp_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'dark';
      const nextTheme = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', nextTheme);
      localStorage.setItem('dp_theme', nextTheme);
      updateThemeIcon(nextTheme);
      CartEngine.showToast(`Switched to ${nextTheme} mode`, 'info');
    });
  }

  function updateThemeIcon(theme) {
    if (!themeIcon) return;
    if (theme === 'light') {
      themeIcon.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="5"></circle>
          <line x1="12" y1="1" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="12" x2="23" y2="12"></line>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </svg>
      `;
    } else {
      themeIcon.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        </svg>
      `;
    }
  }
}

/* --- CURRENCY SELECTOR --- */
function initCurrencySelector() {
  const currencySelects = document.querySelectorAll('.currency-select');
  currencySelects.forEach(select => {
    select.value = CartEngine.getCurrency();
    select.addEventListener('change', (e) => {
      CartEngine.setCurrency(e.target.value);
      CartEngine.showToast(`Currency changed to ${e.target.value}`, 'info');
    });
  });
}

/* --- BILLING CYCLE SWITCHER (Monthly vs Annually) --- */
let activeBillingCycle = 'annual'; // 'monthly' | 'annual'

const PLAN_PRICES = {
  starter: { monthly: 3.99, annual: 2.99, name: 'Starter Cloud' },
  business: { monthly: 9.99, annual: 6.99, name: 'Business Cloud Pro' },
  vps: { monthly: 24.99, annual: 18.99, name: 'Turbo VPS Cloud' },
  enterprise: { monthly: 79.99, annual: 59.99, name: 'Enterprise Cluster' }
};

function initBillingCycleSwitcher() {
  const options = document.querySelectorAll('.billing-option');
  options.forEach(opt => {
    opt.addEventListener('click', () => {
      options.forEach(o => o.classList.remove('active'));
      opt.classList.add('active');
      activeBillingCycle = opt.getAttribute('data-cycle');
      updatePlanPricesUI();
    });
  });
  updatePlanPricesUI();
}

function updatePlanPricesUI() {
  Object.keys(PLAN_PRICES).forEach(key => {
    const el = document.getElementById(`price-${key}`);
    const badgeEl = document.getElementById(`badge-${key}`);
    const cycleEl = document.getElementById(`cycle-${key}`);
    const priceData = PLAN_PRICES[key];
    const amount = activeBillingCycle === 'annual' ? priceData.annual : priceData.monthly;

    if (el) {
      el.setAttribute('data-usd', amount);
      el.textContent = CartEngine.formatPrice(amount);
    }
    if (cycleEl) {
      cycleEl.textContent = activeBillingCycle === 'annual' ? '/mo (billed annually)' : '/mo (billed monthly)';
    }
    if (badgeEl) {
      badgeEl.textContent = activeBillingCycle === 'annual' ? 'Save 25% + Free Domain' : 'Monthly Flexible';
    }
  });
}

function selectHostingPlan(planKey) {
  const plan = PLAN_PRICES[planKey];
  if (!plan) return;

  const isAnnual = activeBillingCycle === 'annual';
  const monthlyRate = isAnnual ? plan.annual : plan.monthly;
  const totalChargeUSD = isAnnual ? monthlyRate * 12 : monthlyRate;

  CartEngine.addItem({
    type: 'hosting',
    name: `${plan.name} Hosting`,
    billing: isAnnual ? 'Annual Subscription (12 Mos)' : '1 Month Subscription',
    basePriceUSD: parseFloat(totalChargeUSD.toFixed(2)),
    includesDomain: isAnnual
  });

  if (isAnnual) {
    CartEngine.showToast('Annual plan includes 1 Year Free .com Domain! Add your domain to claim.', 'success');
  }
}

/* --- INFRASTRUCTURE & LATENCY SIMULATOR --- */
const DATACENTERS = {
  nyc: { name: 'New York, USA', region: 'US East', basePing: 12, ip: '198.51.100.12', uptime: '99.998%', tier: 'Tier IV Certified' },
  sfo: { name: 'Silicon Valley, USA', region: 'US West', basePing: 18, ip: '198.51.100.45', uptime: '99.999%', tier: 'Tier IV Certified' },
  fra: { name: 'Frankfurt, Germany', region: 'EU Central', basePing: 22, ip: '185.199.108.15', uptime: '99.999%', tier: 'Tier IV Certified' },
  lon: { name: 'London, UK', region: 'EU West', basePing: 24, ip: '185.199.109.80', uptime: '99.997%', tier: 'Tier IV Certified' },
  sin: { name: 'Singapore', region: 'APAC Central', basePing: 34, ip: '103.21.244.0', uptime: '99.999%', tier: 'Tier IV Certified' },
  tky: { name: 'Tokyo, Japan', region: 'Asia East', basePing: 39, ip: '103.22.200.11', uptime: '99.998%', tier: 'Tier IV Certified' }
};

let pingInterval = null;

function initLatencySimulator() {
  const locationBtns = document.querySelectorAll('.location-btn');
  const activeDcName = document.getElementById('active-dc-name');
  const activeDcRegion = document.getElementById('active-dc-region');
  const activeDcIp = document.getElementById('active-dc-ip');
  const activeDcTier = document.getElementById('active-dc-tier');
  const activeDcUptime = document.getElementById('active-dc-uptime');
  const livePingVal = document.getElementById('live-ping-val');

  locationBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      locationBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const dcKey = btn.getAttribute('data-dc');
      const dc = DATACENTERS[dcKey];

      if (dc) {
        if (activeDcName) activeDcName.textContent = dc.name;
        if (activeDcRegion) activeDcRegion.textContent = dc.region;
        if (activeDcIp) activeDcIp.textContent = dc.ip;
        if (activeDcTier) activeDcTier.textContent = dc.tier;
        if (activeDcUptime) activeDcUptime.textContent = dc.uptime;

        simulateLivePing(dc.basePing, livePingVal);
      }
    });
  });

  // Start with default NYC
  simulateLivePing(12, livePingVal);
}

function simulateLivePing(basePing, el) {
  if (pingInterval) clearInterval(pingInterval);
  updatePing();

  function updatePing() {
    if (!el) return;
    // Jitter of -2 to +3 ms
    const jitter = Math.floor(Math.random() * 5) - 2;
    const current = Math.max(8, basePing + jitter);
    el.textContent = `${current} ms`;
  }

  pingInterval = setInterval(updatePing, 2000);
}

/* --- CART DRAWER CONTROLS --- */
function initCartDrawerControls() {
  const openCartBtn = document.getElementById('open-cart-btn');
  const closeCartBtn = document.getElementById('close-cart-btn');
  const overlay = document.getElementById('cart-overlay');
  const checkoutBtn = document.getElementById('cart-checkout-btn');

  if (openCartBtn) {
    openCartBtn.addEventListener('click', () => CartEngine.openDrawer());
  }

  if (closeCartBtn) {
    closeCartBtn.addEventListener('click', () => CartEngine.closeDrawer());
  }

  if (overlay) {
    overlay.addEventListener('click', () => CartEngine.closeDrawer());
  }

  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      CartEngine.closeDrawer();
      openCheckoutModal();
    });
  }
}

/* --- COUPON FORM --- */
function initCouponForm() {
  const couponForm = document.getElementById('cart-coupon-form');
  const couponInput = document.getElementById('coupon-input');

  if (couponForm && couponInput) {
    couponForm.addEventListener('submit', (e) => {
      e.preventDefault();
      CartEngine.applyCoupon(couponInput.value);
    });
  }
}

/* --- NATIVE MODAL DIALOGS --- */
function initModals() {
  const loginModal = document.getElementById('login-modal');
  const openLoginBtn = document.getElementById('open-login-btn');
  const closeLoginBtn = document.getElementById('close-login-btn');

  if (openLoginBtn && loginModal) {
    openLoginBtn.addEventListener('click', () => loginModal.showModal());
  }

  if (closeLoginBtn && loginModal) {
    closeLoginBtn.addEventListener('click', () => loginModal.close());
  }

  const checkoutModal = document.getElementById('checkout-modal');
  const closeCheckoutBtn = document.getElementById('close-checkout-btn');

  if (closeCheckoutBtn && checkoutModal) {
    closeCheckoutBtn.addEventListener('click', () => checkoutModal.close());
  }

  // Handle checkout submit
  const checkoutForm = document.getElementById('checkout-form');
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handleCheckoutSubmission();
    });
  }
}

function openCheckoutModal() {
  const checkoutModal = document.getElementById('checkout-modal');
  const summaryBox = document.getElementById('checkout-modal-summary');
  if (!checkoutModal) return;

  const totals = CartEngine.getCartTotals();
  if (totals.count === 0) {
    CartEngine.showToast('Your cart is empty. Please add a domain or hosting plan.', 'warning');
    return;
  }

  if (summaryBox) {
    summaryBox.innerHTML = `
      <div style="background:var(--bg-input); padding:1rem; border-radius:var(--radius-sm); border:1px solid var(--border-subtle); margin-bottom:1.5rem;">
        <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
          <span>Items in Order:</span>
          <strong>${totals.count}</strong>
        </div>
        <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
          <span>Subtotal:</span>
          <strong>${CartEngine.formatPrice(totals.subtotalUSD)}</strong>
        </div>
        ${totals.discountUSD > 0 ? `
          <div style="display:flex; justify-content:space-between; color:var(--color-emerald); margin-bottom:4px;">
            <span>Discount:</span>
            <strong>-${CartEngine.formatPrice(totals.discountUSD)}</strong>
          </div>
        ` : ''}
        <div style="display:flex; justify-content:space-between; font-size:1.15rem; font-weight:800; border-top:1px solid var(--border-subtle); padding-top:6px; margin-top:6px;">
          <span>Total Due:</span>
          <span style="color:var(--color-primary);">${CartEngine.formatPrice(totals.totalUSD)}</span>
        </div>
      </div>
    `;
  }

  checkoutModal.showModal();
}

function handleCheckoutSubmission() {
  const submitBtn = document.getElementById('checkout-pay-btn');
  const checkoutModal = document.getElementById('checkout-modal');

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <svg class="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10" stroke-dasharray="32" stroke-linecap="round"></circle>
      </svg>
      Processing Payment...
    `;
  }

  setTimeout(() => {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = 'Complete Order & Provision Services';
    }

    if (checkoutModal) checkoutModal.close();

    const orderId = 'DP-' + Math.floor(100000 + Math.random() * 900000);
    showSuccessOrderModal(orderId);
    CartEngine.clearCart();
  }, 1600);
}

function showSuccessOrderModal(orderId) {
  let modal = document.getElementById('order-success-modal');
  if (!modal) {
    modal = document.createElement('dialog');
    modal.id = 'order-success-modal';
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div style="text-align:center; padding:1rem 0;">
      <div style="font-size:3.5rem; margin-bottom:1rem;">🎉</div>
      <h2 style="font-size:1.8rem; margin-bottom:0.5rem;">Order Successfully Placed!</h2>
      <p style="color:var(--text-secondary); margin-bottom:1.5rem;">
        Your high-performance services have been automatically provisioned on DP Cloud.
      </p>
      <div style="background:var(--bg-input); padding:1rem; border-radius:var(--radius-sm); border:1px solid var(--border-subtle); margin-bottom:1.5rem; text-align:left; font-size:0.9rem;">
        <div><strong>Order Reference:</strong> #${orderId}</div>
        <div><strong>Status:</strong> <span style="color:var(--color-emerald); font-weight:700;">Active & Provisioned</span></div>
        <div><strong>Nameservers:</strong> ns1.dphost.com / ns2.dphost.com</div>
        <div><strong>cPanel / Client URL:</strong> https://cpanel.dphost.com</div>
      </div>
      <button class="btn btn-primary" onclick="document.getElementById('order-success-modal').close()">
        Access Client Dashboard
      </button>
    </div>
  `;

  modal.showModal();
}

/* --- FLOATING LIVE SUPPORT CHAT ENGINE --- */
function initSupportChat() {
  const fab = document.getElementById('chat-fab');
  const chatWindow = document.getElementById('chat-window');
  const closeBtn = document.getElementById('chat-close');
  const form = document.getElementById('chat-form');
  const input = document.getElementById('chat-input');
  const messagesBox = document.getElementById('chat-messages');

  if (fab && chatWindow) {
    fab.addEventListener('click', () => {
      chatWindow.classList.toggle('active');
      if (chatWindow.classList.contains('active') && input) {
        input.focus();
      }
    });
  }

  if (closeBtn && chatWindow) {
    closeBtn.addEventListener('click', () => chatWindow.classList.remove('active'));
  }

  if (form && input && messagesBox) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = input.value.trim();
      if (!text) return;

      appendChatMessage(text, 'user');
      input.value = '';

      // Simulated Bot typing
      setTimeout(() => {
        const reply = generateSupportBotReply(text);
        appendChatMessage(reply, 'bot');
      }, 700);
    });
  }

  function appendChatMessage(text, sender) {
    const msg = document.createElement('div');
    msg.className = `chat-msg ${sender}`;
    msg.textContent = text;
    messagesBox.appendChild(msg);
    messagesBox.scrollTop = messagesBox.scrollHeight;
  }

  function generateSupportBotReply(userMsg) {
    const q = userMsg.toLowerCase();
    if (q.includes('domain') || q.includes('tld')) {
      return "You can instantly register popular TLDs like .com ($9.99), .ai ($49.99), or .io with free WHOIS privacy! Use our search bar at the top.";
    }
    if (q.includes('wordpress') || q.includes('wp')) {
      return "Yes! All DP Hosting plans come with 1-click WordPress installation, automatic updates, and LiteSpeed Cache for sub-second speeds.";
    }
    if (q.includes('transfer') || q.includes('migrate')) {
      return "We offer 100% free website migration with zero downtime! Just provide your current cPanel or server credentials and our team handles it within 2 hours.";
    }
    if (q.includes('refund') || q.includes('money')) {
      return "All our web hosting plans are covered by our unconditional 30-day money-back guarantee. Zero risk!";
    }
    if (q.includes('speed') || q.includes('litespeed') || q.includes('server')) {
      return "Our servers run AMD EPYC NVMe drives, LiteSpeed Enterprise web servers, and Anycast DNS across 6 global data centers.";
    }
    return "Thanks for asking! DP Host provides 24/7/365 priority engineer support. Would you like to select a hosting plan or search for a domain?";
  }
}

/* --- MOBILE NAVIGATION --- */
function initMobileNav() {
  const toggleBtn = document.getElementById('mobile-menu-toggle');
  const navLinks = document.getElementById('nav-links');

  if (toggleBtn && navLinks) {
    toggleBtn.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });

    // Close menu when link is clicked
    const links = navLinks.querySelectorAll('a');
    links.forEach(l => {
      l.addEventListener('click', () => navLinks.classList.remove('active'));
    });
  }
}
