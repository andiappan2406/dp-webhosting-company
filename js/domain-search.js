/* ==========================================================================
   DP HOSTING & DOMAINS - DOMAIN SEARCH & REGISTRATION ENGINE
   Interactive search, simulated DNS lookups, smart suggestions & TLD table
   ========================================================================== */

const DomainSearchEngine = (() => {
  // TLD Database with competitive registrar pricing
  const TLD_DATA = {
    '.com': { reg: 9.99, renew: 14.99, tag: 'Most Popular', category: 'popular' },
    '.ai': { reg: 49.99, renew: 59.99, tag: 'Hot Trend', category: 'tech' },
    '.io': { reg: 29.99, renew: 34.99, tag: 'Developer Pick', category: 'tech' },
    '.net': { reg: 11.99, renew: 15.99, tag: 'Established', category: 'popular' },
    '.org': { reg: 12.99, renew: 16.99, tag: 'Trusted Org', category: 'popular' },
    '.cloud': { reg: 4.99, renew: 16.99, tag: '70% OFF Promo', category: 'tech' },
    '.tech': { reg: 3.99, renew: 19.99, tag: '80% OFF', category: 'tech' },
    '.store': { reg: 2.99, renew: 24.99, tag: 'Best for Retail', category: 'ecommerce' },
    '.shop': { reg: 3.49, renew: 26.99, tag: 'Sale Promo', category: 'ecommerce' },
    '.co': { reg: 8.99, renew: 24.99, tag: 'Startups', category: 'business' },
    '.xyz': { reg: 1.99, renew: 12.99, tag: 'Super Deal', category: 'popular' },
    '.dev': { reg: 14.99, renew: 18.99, tag: 'Google SSL Built-in', category: 'tech' }
  };

  // Known high-profile reserved/taken domains for realistic test results
  const RESERVED_NAMES = [
    'google', 'apple', 'facebook', 'amazon', 'microsoft', 'netflix', 'twitter', 
    'meta', 'uber', 'airbnb', 'stripe', 'openai', 'github', 'dp', 'dphost', 'hosting'
  ];

  function init() {
    const searchForm = document.getElementById('domain-search-form');
    const searchInput = document.getElementById('domain-input');
    const tldSelect = document.getElementById('domain-tld-select');
    const quickTldPills = document.querySelectorAll('.tld-pill');

    if (searchForm) {
      searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        performSearch();
      });
    }

    if (quickTldPills) {
      quickTldPills.forEach(pill => {
        pill.addEventListener('click', () => {
          const tld = pill.getAttribute('data-tld');
          if (tldSelect) tldSelect.value = tld;
          quickTldPills.forEach(p => p.classList.remove('active'));
          pill.classList.add('active');
          if (searchInput && searchInput.value.trim()) {
            performSearch();
          } else if (searchInput) {
            searchInput.focus();
          }
        });
      });
    }

    // Render TLD Table
    renderTldTable('all');

    // Filter tabs for TLD table
    const tldFilterBtns = document.querySelectorAll('.tld-filter-btn');
    tldFilterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        tldFilterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderTldTable(btn.getAttribute('data-category'));
      });
    });

    // Domain Transfer Checker
    const transferForm = document.getElementById('transfer-check-form');
    if (transferForm) {
      transferForm.addEventListener('submit', (e) => {
        e.preventDefault();
        handleTransferCheck();
      });
    }
  }

  function cleanDomainInput(raw) {
    let clean = raw.trim().toLowerCase();
    // remove http, https, www, spaces
    clean = clean.replace(/^(https?:\/\/)?(www\.)?/, '');
    clean = clean.replace(/[^a-z0-9\-\.]/g, '');
    return clean;
  }

  function performSearch() {
    const input = document.getElementById('domain-input');
    const tldSelect = document.getElementById('domain-tld-select');
    const resultsPanel = document.getElementById('domain-results-panel');
    const submitBtn = document.querySelector('.search-submit-btn');

    if (!input || !input.value.trim()) {
      CartEngine.showToast('Please enter a domain name to search', 'warning');
      if (input) input.focus();
      return;
    }

    let query = cleanDomainInput(input.value);
    let selectedTld = tldSelect ? tldSelect.value : '.com';

    // If user already typed an extension like 'mysite.io'
    let namePart = query;
    let extPart = selectedTld;

    if (query.includes('.')) {
      const parts = query.split('.');
      namePart = parts[0];
      const parsedExt = '.' + parts.slice(1).join('.');
      if (TLD_DATA[parsedExt]) {
        extPart = parsedExt;
        if (tldSelect) tldSelect.value = extPart;
      }
    }

    if (!namePart) {
      CartEngine.showToast('Invalid domain name query', 'warning');
      return;
    }

    // Show loading spinner on button
    if (submitBtn) {
      submitBtn.innerHTML = `
        <svg class="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10" stroke-dasharray="32" stroke-linecap="round"></circle>
        </svg>
        <span>Checking...</span>
      `;
      submitBtn.disabled = true;
    }

    // Simulated DNS Lookup delay (350ms)
    setTimeout(() => {
      if (submitBtn) {
        submitBtn.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <span>Search</span>
        `;
        submitBtn.disabled = false;
      }

      displaySearchResults(namePart, extPart);
      if (resultsPanel) {
        resultsPanel.classList.add('active');
        resultsPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 380);
  }

  function displaySearchResults(namePart, extPart) {
    const fullDomain = namePart + extPart;
    const isTaken = RESERVED_NAMES.includes(namePart) && (extPart === '.com' || extPart === '.net' || extPart === '.org');
    const tldInfo = TLD_DATA[extPart] || { reg: 12.99, renew: 16.99 };

    const mainResultEl = document.getElementById('main-search-result');
    const suggestionsGrid = document.getElementById('suggestions-grid');

    if (!mainResultEl) return;

    if (isTaken) {
      mainResultEl.className = 'main-result-card taken';
      mainResultEl.innerHTML = `
        <div>
          <div class="result-domain-name">
            <span>❌</span> <span>${fullDomain}</span>
            <span class="badge badge-hot">Already Registered</span>
          </div>
          <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 4px;">
            This domain is currently taken by another entity. Browse smart alternatives below or request our domain broker.
          </p>
        </div>
        <div class="result-pricing-box">
          <button class="btn btn-secondary btn-sm" onclick="DomainSearchEngine.openBrokerInquiry('${fullDomain}')">
            Broker Inquiry
          </button>
        </div>
      `;
    } else {
      mainResultEl.className = 'main-result-card';
      mainResultEl.innerHTML = `
        <div>
          <div class="result-domain-name">
            <span>🎉</span> <span>${fullDomain}</span>
            <span class="badge badge-success">Available for Instant Registration</span>
          </div>
          <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 4px;">
            Includes Free WHOIS Privacy Guard, Anycast DNS management, and 24/7 propagation lock.
          </p>
        </div>
        <div class="result-pricing-box">
          <div>
            <span class="price-strike">${CartEngine.formatPrice(tldInfo.renew)}</span>
            <span class="price-regular">${CartEngine.formatPrice(tldInfo.reg)}</span>
            <span style="font-size:0.8rem; color:var(--text-muted);">/1st yr</span>
          </div>
          <button class="btn btn-primary" onclick="DomainSearchEngine.addDomainToCart('${fullDomain}', ${tldInfo.reg}, this)">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            Add to Cart
          </button>
        </div>
      `;
    }

    // Generate intelligent alternatives
    if (suggestionsGrid) {
      const alternatives = [
        { name: `${namePart}.ai`, tld: '.ai', tag: 'AI Pick' },
        { name: `${namePart}.io`, tld: '.io', tag: 'Tech' },
        { name: `get${namePart}.com`, tld: '.com', tag: 'Alternative' },
        { name: `${namePart}.cloud`, tld: '.cloud', tag: '70% OFF' },
        { name: `${namePart}.tech`, tld: '.tech', tag: 'Super Saver' },
        { name: `${namePart}hq.com`, tld: '.com', tag: 'Brandable' }
      ].filter(item => item.name !== fullDomain);

      suggestionsGrid.innerHTML = alternatives.map(alt => {
        const info = TLD_DATA[alt.tld] || { reg: 9.99, renew: 14.99 };
        return `
          <div class="suggestion-card">
            <div>
              <div class="sugg-domain">${alt.name}</div>
              <span class="badge badge-primary" style="font-size:0.68rem; margin-top:2px;">${alt.tag}</span>
            </div>
            <div style="display:flex; align-items:center; gap:0.75rem;">
              <span class="sugg-price">${CartEngine.formatPrice(info.reg)}</span>
              <button class="btn btn-secondary btn-sm" onclick="DomainSearchEngine.addDomainToCart('${alt.name}', ${info.reg}, this)">
                + Add
              </button>
            </div>
          </div>
        `;
      }).join('');
    }
  }

  function addDomainToCart(domainName, priceUSD, buttonEl) {
    CartEngine.addItem({
      type: 'domain',
      name: domainName,
      billing: '1 Year Registration',
      basePriceUSD: priceUSD,
      whoisPrivacy: true
    });

    if (buttonEl) {
      const originalText = buttonEl.innerHTML;
      buttonEl.innerHTML = '✓ Added!';
      buttonEl.classList.add('btn-success');
      setTimeout(() => {
        buttonEl.innerHTML = originalText;
        buttonEl.classList.remove('btn-success');
      }, 1500);
    }
  }

  function openBrokerInquiry(domain) {
    CartEngine.showToast(`Broker inquiry initiated for ${domain}. Our VIP team will contact you.`, 'info');
  }

  function renderTldTable(category = 'all') {
    const tableBody = document.getElementById('tld-table-body');
    if (!tableBody) return;

    let entries = Object.entries(TLD_DATA);
    if (category !== 'all') {
      entries = entries.filter(([_, data]) => data.category === category);
    }

    tableBody.innerHTML = entries.map(([tld, data]) => `
      <tr>
        <td>
          <div class="tld-ext-badge">${tld}</div>
          <div style="font-size:0.8rem; color:var(--text-muted);">${data.tag}</div>
        </td>
        <td>
          <span style="font-weight:700; color:var(--text-primary);" data-usd="${data.reg}">
            ${CartEngine.formatPrice(data.reg)}
          </span>
          <span style="font-size:0.75rem; color:var(--text-muted);">/yr</span>
        </td>
        <td>
          <span style="color:var(--text-secondary);" data-usd="${data.renew}">
            ${CartEngine.formatPrice(data.renew)}
          </span>
          <span style="font-size:0.75rem; color:var(--text-muted);">/yr</span>
        </td>
        <td>
          <span class="badge badge-success">Free Included</span>
        </td>
        <td>
          <button class="btn btn-primary btn-sm" onclick="DomainSearchEngine.quickRegisterTld('${tld}', ${data.reg})">
            Register ${tld}
          </button>
        </td>
      </tr>
    `).join('');
  }

  function quickRegisterTld(tld, regPrice) {
    const searchInput = document.getElementById('domain-input');
    const tldSelect = document.getElementById('domain-tld-select');

    if (tldSelect) tldSelect.value = tld;
    if (searchInput && !searchInput.value) {
      searchInput.value = 'mybrand';
    }
    performSearch();
    window.scrollTo({ top: 120, behavior: 'smooth' });
  }

  function handleTransferCheck() {
    const transferInput = document.getElementById('transfer-domain-input');
    const statusBox = document.getElementById('transfer-status-result');

    if (!transferInput || !transferInput.value.trim()) {
      CartEngine.showToast('Please enter domain to transfer', 'warning');
      return;
    }

    const domain = cleanDomainInput(transferInput.value);
    if (statusBox) {
      statusBox.style.display = 'block';
      statusBox.innerHTML = `
        <div style="padding:1rem; background:rgba(0,210,255,0.08); border:1px solid var(--border-glow); border-radius:var(--radius-sm); margin-top:1rem;">
          <div style="font-weight:700; color:var(--color-primary); margin-bottom:4px;">
            ✓ ${domain} is eligible for instant transfer to DP Host!
          </div>
          <p style="font-size:0.85rem; color:var(--text-secondary); margin-bottom:10px;">
            Transfer includes +1 free year renewal, zero downtime seamless migration, and free WHOIS privacy.
          </p>
          <div style="display:flex; gap:0.5rem; align-items:center;">
            <input type="text" class="form-control" placeholder="Enter EPP / Auth Code" style="max-width:220px; font-size:0.85rem; padding:0.5rem 0.75rem;">
            <button class="btn btn-primary btn-sm" onclick="DomainSearchEngine.addTransferToCart('${domain}')">
              Transfer for $9.99
            </button>
          </div>
        </div>
      `;
    }
  }

  function addTransferToCart(domain) {
    CartEngine.addItem({
      type: 'domain',
      name: `${domain} (Transfer)`,
      billing: 'Transfer + 1 Year Extension',
      basePriceUSD: 9.99,
      whoisPrivacy: true
    });
  }

  return {
    init,
    performSearch,
    addDomainToCart,
    quickRegisterTld,
    openBrokerInquiry,
    renderTldTable,
    addTransferToCart
  };
})();
