// Live Prices page — fetches real-time data from CoinGecko's free public API.
// No API key required: https://www.coingecko.com/en/api/documentation

(function () {
  const API_BASE = 'https://api.coingecko.com/api/v3/simple/price';

  // Default coins shown on load. ETH + BTC are required by the brief;
  // SOL and ARB are the "add more coins" optional enhancement.
  const DEFAULT_COINS = [
    { id: 'bitcoin', symbol: 'BTC', color: '#F7931A' },
    { id: 'ethereum', symbol: 'ETH', color: '#627EEA' },
    { id: 'solana', symbol: 'SOL', color: '#14F195' },
    { id: 'arbitrum', symbol: 'ARB', color: '#28A0F0' },
  ];

  let coins = [...DEFAULT_COINS];

  const grid = document.getElementById('priceGrid');
  const lastUpdated = document.getElementById('lastUpdated');
  const errorBox = document.getElementById('priceError');
  const refreshBtn = document.getElementById('refreshBtn');
  const searchInput = document.getElementById('coinSearch');
  const addCoinBtn = document.getElementById('addCoinBtn');

  function palette(seed) {
    // Deterministic fallback color for user-added coins.
    const colors = ['#5B8DEF', '#FFB454', '#4ADE80', '#F87171', '#C084FC', '#38BDF8'];
    let hash = 0;
    for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) % colors.length;
    return colors[hash];
  }

  function renderSkeleton() {
    grid.innerHTML = coins
      .map(
        (c) => `
      <div class="price-card skeleton" data-id="${c.id}">
        <div class="coin-row">
          <div class="coin-dot" style="background:${c.color}">${c.symbol.slice(0, 2)}</div>
          <div>
            <div class="coin-symbol">${c.symbol}</div>
            <div class="coin-name">${c.id}</div>
          </div>
        </div>
        <div class="price-value">$0.00</div>
        <div class="price-change up">+0.00%</div>
      </div>`
      )
      .join('');
  }

  function renderCards(data) {
    errorBox.style.display = 'none';
    grid.innerHTML = coins
      .map((c) => {
        const entry = data[c.id];
        if (!entry) {
          return `
          <div class="price-card" data-id="${c.id}">
            <div class="coin-row">
              <div class="coin-dot" style="background:${c.color}">${c.symbol.slice(0, 2)}</div>
              <div>
                <div class="coin-symbol">${c.symbol}</div>
                <div class="coin-name">${c.id}</div>
              </div>
            </div>
            <p style="font-size:13px; color:var(--danger); margin:0;">No data found for "${c.id}"</p>
          </div>`;
        }
        const price = entry.usd;
        const change = entry.usd_24h_change ?? 0;
        const isUp = change >= 0;
        const priceStr =
          price >= 1
            ? price.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
            : '$' + price.toPrecision(4);
        return `
        <div class="price-card" data-id="${c.id}">
          <div class="coin-row">
            <div class="coin-dot" style="background:${c.color}">${c.symbol.slice(0, 2)}</div>
            <div>
              <div class="coin-symbol">${c.symbol}</div>
              <div class="coin-name">${c.id}</div>
            </div>
          </div>
          <div class="price-value">${priceStr}</div>
          <span class="price-change ${isUp ? 'up' : 'down'}">
            ${isUp ? '&#9650;' : '&#9660;'} ${Math.abs(change).toFixed(2)}%
          </span>
        </div>`;
      })
      .join('');
  }

  async function fetchPrices() {
    renderSkeleton();
    lastUpdated.textContent = 'Fetching latest prices…';
    refreshBtn.disabled = true;

    const ids = coins.map((c) => c.id).join(',');
    const url = `${API_BASE}?ids=${encodeURIComponent(ids)}&vs_currencies=usd&include_24hr_change=true`;

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`CoinGecko responded ${res.status}`);
      const data = await res.json();
      renderCards(data);
      lastUpdated.textContent = 'Updated ' + new Date().toLocaleTimeString();
    } catch (err) {
      console.error(err);
      errorBox.style.display = 'block';
      lastUpdated.textContent = 'Last attempt failed';
    } finally {
      refreshBtn.disabled = false;
    }
  }

  refreshBtn.addEventListener('click', fetchPrices);

  addCoinBtn.addEventListener('click', () => {
    const id = searchInput.value.trim().toLowerCase();
    if (!id) return;
    if (coins.some((c) => c.id === id)) {
      searchInput.value = '';
      return;
    }
    coins.push({ id, symbol: id.slice(0, 3).toUpperCase(), color: palette(id) });
    searchInput.value = '';
    fetchPrices();
  });

  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addCoinBtn.click();
  });

  fetchPrices();
  // Auto-refresh every 60s so the dashboard stays live without spamming the API.
  setInterval(fetchPrices, 60000);
})();
