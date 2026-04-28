// ============================================================
// THE BLOCK — Dev Console
// Paste this entire script into the browser DevTools console
// while the dev server is running (localhost:5173)
// ============================================================

const store = window.__bidStore;
const allVehicles = window.__vehicles;

if (!store || !allVehicles) {
  console.error('❌ Dev store not found. Make sure the app is running in dev mode.');
} else {
  console.log('%c✅ The Block Dev Console loaded', 'color: #1d6fef; font-weight: bold; font-size: 14px');
  console.log('Type help() to see available commands');
}

// ─── Helpers ──────────────────────────────────────────────

function getVehicle(lotOrId) {
  return allVehicles.find(v =>
    v.lot === lotOrId ||
    v.id === lotOrId ||
    `${v.year} ${v.make} ${v.model}`.toLowerCase().includes(String(lotOrId).toLowerCase())
  );
}

function getActiveBids() {
  const bids = store.getState().bids;
  return Object.entries(bids)
    .filter(([, e]) => e.status !== 'idle')
    .map(([id, entry]) => {
      const v = allVehicles.find(v => v.id === id);
      return { vehicle: v, entry, id };
    })
    .filter(r => r.vehicle);
}

function fmt(n) {
  return n != null ? `$${Number(n).toLocaleString()}` : 'N/A';
}

// ─── Commands ─────────────────────────────────────────────

/**
 * List all vehicles you currently have bids on.
 */
function bids() {
  const active = getActiveBids();
  if (active.length === 0) {
    console.log('No active bids found.');
    return;
  }
  console.table(active.map(({ vehicle: v, entry: e }) => ({
    Lot:            v.lot,
    Vehicle:        `${v.year} ${v.make} ${v.model}`,
    'Your Bid':     fmt(e.myBid),
    'Current Bid':  fmt(e.currentBid),
    Reserve:        fmt(v.reserve_price),
    'Meets Reserve': v.reserve_price == null || (e.myBid ?? 0) >= v.reserve_price ? '✅ Yes' : '❌ No',
    Status:         e.status,
  })));
}

/**
 * Search vehicles by lot, make, model, or year.
 * @param {string} query
 * @example search('Tesla')
 * @example search('A-00')
 */
function search(query) {
  const q = String(query).toLowerCase();
  const results = allVehicles
    .filter(v =>
      v.lot.toLowerCase().includes(q) ||
      v.make.toLowerCase().includes(q) ||
      v.model.toLowerCase().includes(q) ||
      String(v.year).includes(q)
    )
    .slice(0, 20);

  if (results.length === 0) {
    console.log(`No vehicles matching "${query}"`);
    return;
  }

  console.table(results.map(v => ({
    Lot:            v.lot,
    Vehicle:        `${v.year} ${v.make} ${v.model} ${v.trim}`,
    'Starting Bid': fmt(v.starting_bid),
    Reserve:        fmt(v.reserve_price),
    'Buy Now':      fmt(v.buy_now_price),
    'Current Bid':  fmt(v.current_bid),
  })));
}

/**
 * Place a bid on any vehicle and immediately end the auction (bypasses UI flow).
 * @param {string} lotOrId  Lot number, vehicle ID, or partial name
 * @param {number} amount   Bid amount in dollars
 * @example placeBid('A-0009', 50000)
 */
function placeBid(lotOrId, amount) {
  const v = getVehicle(lotOrId);
  if (!v) { console.error(`❌ Vehicle not found: ${lotOrId}`); return; }
  if (!amount || isNaN(amount)) { console.error('❌ Invalid amount. Usage: placeBid("A-0009", 25000)'); return; }

  store.dispatch({ type: 'PLACE_BID', vehicleId: v.id, amount });
  store.dispatch({ type: 'AUCTION_END', vehicleId: v.id, reservePrice: v.reserve_price });

  const meetsReserve = v.reserve_price == null || amount >= v.reserve_price;
  if (meetsReserve) {
    console.log(`%c🏆 WON: ${v.year} ${v.make} ${v.model} for ${fmt(amount)}`, 'color: #22c55e; font-weight: bold');
  } else {
    console.log(
      `%c⚠️ RESERVE NOT MET: ${v.year} ${v.make} ${v.model} — bid ${fmt(amount)} < reserve ${fmt(v.reserve_price)}`,
      'color: #f59e0b; font-weight: bold'
    );
  }
}

/**
 * End the auction for a vehicle you're currently winning.
 * Resolves to WON or RESERVE NOT MET based on reserve price.
 * @param {string} lotOrId  Lot number, vehicle ID, or partial name
 * @example endAuction('A-0009')
 */
function endAuction(lotOrId) {
  const v = getVehicle(lotOrId);
  if (!v) { console.error(`❌ Vehicle not found: ${lotOrId}`); return; }

  const entry = store.getState().bids[v.id];
  if (!entry || entry.status !== 'winning') {
    console.warn(`⚠️ No active winning bid on ${v.year} ${v.make} ${v.model}. Status: ${entry?.status ?? 'idle'}`);
    return;
  }

  store.dispatch({ type: 'AUCTION_END', vehicleId: v.id, reservePrice: v.reserve_price });

  const meetsReserve = v.reserve_price == null || (entry.myBid ?? 0) >= v.reserve_price;
  if (meetsReserve) {
    console.log(`%c🏆 WON: ${v.year} ${v.make} ${v.model} for ${fmt(entry.myBid)}`, 'color: #22c55e; font-weight: bold');
  } else {
    console.log(
      `%c⚠️ RESERVE NOT MET: ${v.year} ${v.make} ${v.model} — bid ${fmt(entry.myBid)} < reserve ${fmt(v.reserve_price)}`,
      'color: #f59e0b; font-weight: bold'
    );
  }
}

/**
 * Simulate another buyer outbidding you by one increment.
 * @param {string} lotOrId  Lot number, vehicle ID, or partial name
 * @example outbid('A-0009')
 */
function outbid(lotOrId) {
  const v = getVehicle(lotOrId);
  if (!v) { console.error(`❌ Vehicle not found: ${lotOrId}`); return; }

  const entry = store.getState().bids[v.id];
  if (!entry || !entry.myBid) {
    console.error(`❌ No bid found on ${v.year} ${v.make} ${v.model}`);
    return;
  }

  const bid = entry.myBid;
  const increment = bid < 5000 ? 250 : bid < 10000 ? 500 : bid < 25000 ? 1000 : bid < 50000 ? 2500 : 5000;
  const newBid = bid + increment;

  store.dispatch({ type: 'OUTBID', vehicleId: v.id, newCurrentBid: newBid });
  console.log(
    `%c📣 Outbid! ${v.year} ${v.make} ${v.model} — new current bid: ${fmt(newBid)}`,
    'color: #f59e0b'
  );
}

/**
 * Reset bid state for a single vehicle.
 * @param {string} lotOrId  Lot number, vehicle ID, or partial name
 * @example resetBid('A-0009')
 */
function resetBid(lotOrId) {
  const v = getVehicle(lotOrId);
  if (!v) { console.error(`❌ Vehicle not found: ${lotOrId}`); return; }

  store.dispatch({ type: 'RESET_VEHICLE', vehicleId: v.id });
  console.log(`🔄 Reset bid on ${v.year} ${v.make} ${v.model}`);
}

/**
 * Wipe all bid state and clear localStorage. Refreshing the page will start clean.
 * @example resetAll()
 */
function resetAll() {
  store.dispatch({ type: 'RESET_ALL' });
  localStorage.removeItem('the-block:bids');
  console.log('%c🔄 All bids reset', 'color: #ef4444; font-weight: bold');
}

/**
 * Show all available commands.
 */
function help() {
  console.log(`%cThe Block — Dev Console Commands
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

bids()
  List all vehicles with active bid state

search("query")
  Find vehicles by lot, make, model, or year
  e.g. search("Tesla"), search("A-0009"), search("2022")

placeBid("lot", amount)
  Bid on a vehicle and immediately end the auction
  e.g. placeBid("A-0009", 50000)

endAuction("lot")
  End the auction for a vehicle you're currently winning
  → resolves to WON or RESERVE NOT MET
  e.g. endAuction("A-0009")

outbid("lot")
  Simulate another buyer outbidding you by one increment
  e.g. outbid("A-0009")

resetBid("lot")
  Remove all bid state for one vehicle
  e.g. resetBid("A-0009")

resetAll()
  Wipe all bid state + localStorage

help()
  Show this message
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Quick test flows:

  // Reserve not met:
  search("Toyota")
  placeBid("X-0001", 5000)     // bid below reserve

  // Won:
  placeBid("X-0001", 999000)   // bid above reserve

  // Outbid flow:
  placeBid("X-0001", 50000)    // place bid (winning state)
  outbid("X-0001")             // simulate competitor

  // Clean slate:
  resetAll()
`, 'color: #1d6fef; font-weight: bold');
}

// Show help automatically on load
help();
