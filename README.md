# Express Lanes — Arbitrum & Layer 2 Primer

A four-page website built for the **Arbitrum Builder Pods Assignment (LamprosDAO)**. The site uses a "highway" metaphor throughout: Ethereum mainnet is one shared lane, and Arbitrum (Layer 2) opens extra lanes on the same road — faster and cheaper, without leaving Ethereum's security behind.

Built with plain **HTML / CSS / JavaScript** — no build step, no framework, no dependencies. Just open the files in a browser.

## Pages

| Page | File | What it does |
|---|---|---|
| **Home** | `index.html` | Landing page with hero, an animated "lane" visual, 3 key benefits of Layer 2, and a dedicated Arbitrum explainer (why L2 was needed, how Arbitrum helps, one real-world benefit). |
| **Concepts** | `concepts.html` | Four side-by-side comparison cards: Web2 vs Web3, Ethereum vs Bitcoin, Public Key vs Private Key, Blockchain vs Traditional Databases. |
| **Live Prices** | `prices.html` | Live price dashboard pulling ETH, BTC, SOL, and ARB from the free [CoinGecko API](https://www.coingecko.com/en/api/documentation) (no key required). Shows price, 24h % change with up/down arrows, a Refresh button, and a search box to add any other coin by its CoinGecko id. Auto-refreshes every 60 seconds. |
| **Block Simulator** | `simulator.html` | An interactive two-block proof-of-work simulator using the browser's real Web Crypto `SHA-256`. Mine Block 1, then Block 2 (which reads Block 1's hash as its "previous hash"). Edit Block 1's data afterward and watch Block 2 flip to **Invalid** in real time — that's chain immutability made tangible. |

All four pages share one nav bar (with the current page highlighted), the same fonts and color palette, and the same footer.

## How to run it locally

No install, no server required:

1. Clone the repo:
   ```bash
   git clone https://github.com/[your-github-username]/[your-repo-name].git
   cd [your-repo-name]
   ```
2. Open `index.html` directly in a browser, **or** serve it locally so the CoinGecko fetch behaves exactly like it will on a real host:
   ```bash
   # Python 3
   python3 -m http.server 8000
   # then visit http://localhost:8000
   ```
3. Navigate between pages using the nav bar at the top.

## Tech notes

- **Fonts:** Space Grotesk (display), Inter (body), IBM Plex Mono (data/hashes) — loaded from Google Fonts.
- **Live Prices** calls `GET https://api.coingecko.com/api/v3/simple/price?ids=...&vs_currencies=usd&include_24hr_change=true` directly from the browser. If the API is temporarily unreachable (rate limits, offline), the page shows an inline error and lets you retry with Refresh.
- **Block Simulator** difficulty is a hash starting with `00` (not Bitcoin's real difficulty) so mining finishes instantly in-browser while still being genuine SHA-256 proof-of-work.
- Fully responsive: the nav collapses to a menu button and the block chain stacks vertically below ~860px width.

## Known issues / things to improve

- The CoinGecko free tier is rate-limited; rapid refresh-spamming or adding many coins at once can occasionally return a 429. A short retry-with-backoff would smooth that out.
- User-added coins on the Live Prices page aren't validated against a full CoinGecko coin list, so a typo'd id just shows "No data found" instead of offering suggestions.
- The Block Simulator's mining loop is single-threaded JS; a real implementation would move it to a Web Worker so the UI never has a chance of jank at higher difficulty.
- Replace the `[Your Name]`, `[your-github-username]`, and `[Your Batch]` placeholders in the footer before submitting.
- Add the four required screenshots (one per page) to this repo as noted in the assignment.

---

Built for LamprosDAO's Arbitrum Builder Pods program.
