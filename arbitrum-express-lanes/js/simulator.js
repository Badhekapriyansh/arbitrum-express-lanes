// Block Simulator — a simplified, real-SHA-256 proof-of-work demo.
// "Valid" = hashing (previousHash + data + nonce) with SHA-256 produces
// a hex digest that starts with "00". Mining just brute-forces nonces
// until that condition is met — the same idea as real PoW, at a much
// easier difficulty so it finishes instantly in a browser tab.

(function () {
  const DIFFICULTY_PREFIX = '00';
  const GENESIS_PREV_HASH = '0'.repeat(64);

  const els = {
    b1data: document.getElementById('block1Data'),
    b1prev: document.getElementById('block1PrevHash'),
    b1nonce: document.getElementById('block1Nonce'),
    b1hash: document.getElementById('block1Hash'),
    b1status: document.getElementById('block1Status'),
    b1card: document.getElementById('block1Card'),
    b1btn: document.getElementById('mineBlock1'),
    b1meta: document.getElementById('block1Meta'),

    b2data: document.getElementById('block2Data'),
    b2prev: document.getElementById('block2PrevHash'),
    b2nonce: document.getElementById('block2Nonce'),
    b2hash: document.getElementById('block2Hash'),
    b2status: document.getElementById('block2Status'),
    b2card: document.getElementById('block2Card'),
    b2btn: document.getElementById('mineBlock2'),
    b2meta: document.getElementById('block2Meta'),
  };

  const block1 = { nonce: 0, hash: null, mined: false };
  const block2 = { nonce: 0, hash: null, mined: false };

  els.b1prev.value = GENESIS_PREV_HASH;

  async function sha256Hex(message) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(message));
    return Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }

  function setStatus(pillEl, cardEl, state, label) {
    pillEl.className = 'status-pill ' + state;
    pillEl.textContent = label;
    cardEl.classList.remove('valid', 'invalid');
    if (state !== 'pending') cardEl.classList.add(state);
  }

  // Mines by brute-forcing nonces until SHA-256(prevHash + data + nonce)
  // starts with the difficulty prefix. Yields to the UI thread periodically
  // so the "Mining…" state actually renders instead of freezing the tab.
  async function mineBlock(prevHash, data, onProgress) {
    let nonce = 0;
    const start = performance.now();
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const hash = await sha256Hex(prevHash + data + nonce);
      if (hash.startsWith(DIFFICULTY_PREFIX)) {
        return { nonce, hash, attempts: nonce + 1, ms: performance.now() - start };
      }
      nonce++;
      if (nonce % 25 === 0) {
        onProgress && onProgress(nonce);
        await new Promise((r) => setTimeout(r, 0));
      }
    }
  }

  // Keeps Block 2's "previous hash" field mirroring Block 1's live hash,
  // exactly like a real chain reading the prior block's header.
  function syncBlock2PrevHash() {
    els.b2prev.value = block1.hash || '—';
    if (block2.mined) revalidateBlock2();
  }

  async function revalidateBlock1() {
    if (!block1.mined) return;
    const liveHash = await sha256Hex(els.b1prev.value + els.b1data.value + block1.nonce);
    els.b1hash.textContent = liveHash;
    const stillValid = liveHash === block1.hash && liveHash.startsWith(DIFFICULTY_PREFIX);
    if (stillValid) {
      setStatus(els.b1status, els.b1card, 'valid', 'Valid');
      els.b1meta.textContent = `Mined in ${block1.attempts} attempt(s).`;
    } else {
      block1.hash = liveHash; // the chain now reflects the tampered data
      setStatus(els.b1status, els.b1card, 'invalid', 'Invalid — data changed');
      els.b1meta.textContent = 'Data no longer matches the mined nonce. Re-mine to fix.';
    }
    syncBlock2PrevHash();
  }

  async function revalidateBlock2() {
    if (!block2.mined) return;
    const liveHash = await sha256Hex(els.b2prev.value + els.b2data.value + block2.nonce);
    els.b2hash.textContent = liveHash;
    const hashOk = liveHash === block2.hash && liveHash.startsWith(DIFFICULTY_PREFIX);
    const linkOk = els.b2prev.value === (block1.hash || '');
    if (hashOk && linkOk) {
      setStatus(els.b2status, els.b2card, 'valid', 'Valid');
      els.b2meta.textContent = `Mined in ${block2.attempts} attempt(s). Chain link intact.`;
    } else {
      block2.hash = liveHash;
      setStatus(els.b2status, els.b2card, 'invalid', 'Invalid — chain broken');
      els.b2meta.textContent = linkOk
        ? 'Data no longer matches the mined nonce. Re-mine to fix.'
        : "Previous hash no longer matches Block 1 — this is chain immutability breaking on purpose.";
    }
  }

  els.b1btn.addEventListener('click', async () => {
    els.b1btn.disabled = true;
    els.b1btn.textContent = 'Mining…';
    setStatus(els.b1status, els.b1card, 'pending', 'Mining…');

    const result = await mineBlock(els.b1prev.value, els.b1data.value, (n) => {
      els.b1meta.textContent = `Mining… ${n} attempts so far`;
    });

    block1.nonce = result.nonce;
    block1.hash = result.hash;
    block1.attempts = result.attempts;
    block1.mined = true;

    els.b1nonce.value = result.nonce;
    els.b1hash.textContent = result.hash;
    setStatus(els.b1status, els.b1card, 'valid', 'Valid');
    els.b1meta.textContent = `Mined in ${result.attempts} attempt(s), ${result.ms.toFixed(0)}ms.`;

    els.b1btn.disabled = false;
    els.b1btn.textContent = '⚡ Re-mine Block 1';

    els.b2btn.disabled = false;
    els.b2meta.textContent = 'Ready to mine — will lock in Block 1\'s current hash as its previous hash.';
    syncBlock2PrevHash();
  });

  els.b2btn.addEventListener('click', async () => {
    if (!block1.hash) return;
    els.b2btn.disabled = true;
    els.b2btn.textContent = 'Mining…';
    setStatus(els.b2status, els.b2card, 'pending', 'Mining…');

    const prevHash = els.b2prev.value;
    const result = await mineBlock(prevHash, els.b2data.value, (n) => {
      els.b2meta.textContent = `Mining… ${n} attempts so far`;
    });

    block2.nonce = result.nonce;
    block2.hash = result.hash;
    block2.attempts = result.attempts;
    block2.mined = true;

    els.b2nonce.value = result.nonce;
    els.b2hash.textContent = result.hash;
    setStatus(els.b2status, els.b2card, 'valid', 'Valid');
    els.b2meta.textContent = `Mined in ${result.attempts} attempt(s), ${result.ms.toFixed(0)}ms. Chain link intact.`;

    els.b2btn.disabled = false;
    els.b2btn.textContent = '⚡ Re-mine Block 2';
  });

  els.b1data.addEventListener('input', revalidateBlock1);
  els.b2data.addEventListener('input', revalidateBlock2);
})();
