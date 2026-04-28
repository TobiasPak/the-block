# The Block — Car Auction Platform

## How to Run

### Prerequisites

- **Node.js** v18 or higher — [Download here](https://nodejs.org/)
- **npm** v9 or higher (comes with Node.js)
- A modern browser — Chrome, Firefox, or Safari

Verify your versions:

```bash
node --version   # should be v18+
npm --version    # should be v9+
```

### Steps

**1. Clone the repository**

```bash
git clone https://github.com/YOUR_USERNAME/the-block.git
cd the-block
```

**2. Install dependencies**

```bash
npm install
```

**3. Start the development server**

```bash
npm run dev
```

**4. Open the app**

```
http://localhost:5173
```

No backend, no environment variables, no database setup required. The app runs entirely in the browser.

---

### Testing the Bidding System

Open browser DevTools (`F12` or `Cmd+Option+I`), paste the contents of `scripts/dev-console.js` into the console, and press Enter.

```js
help()                        // Show all commands
search("Toyota")              // Find vehicles by make, model, lot, or year
bids()                        // List all your active bids

placeBid("A-0009", 50000)     // Place a bid on a vehicle
outbid("A-0009")              // Simulate being outbid by one increment
endAuction("A-0009")          // End the auction — resolves to Won or Reserve Not Met
resetBid("A-0009")            // Reset bid state for one vehicle
resetAll()                    // Wipe all bids and start fresh
```

**Quick test flows:**

```js
// Test winning an auction
placeBid("A-0009", 999000)
endAuction("A-0009")          // → status: won

// Test reserve not met
placeBid("A-0009", 5000)      // bid below reserve price
endAuction("A-0009")          // → status: reserve not met

// Test outbid notification
placeBid("A-0009", 50000)
outbid("A-0009")              // → triggers outbid notification + toast
```

---

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `1` | While hovering a vehicle card or notification — stages a minimum quick bid |
| `2` | Confirms the staged quick bid (cursor must still be on the same vehicle) |
| `Escape` | Closes the vehicle drawer, notification sidebar, or any open dropdown |

---

### Viewing on Mobile

**1.** Ensure `vite.config.ts` has `server: { host: true }` — already configured in this repo.

**2.** Start the dev server. The terminal will show:

```
Local:   http://localhost:5173
Network: http://192.168.x.x:5173
```

**3.** Connect your phone to the same WiFi network and open the Network URL in your mobile browser.

---

## Time Spent

Approximately 10 hours total, broken down roughly as:

- **10%** — Brainstorming how each element of the app would connect, and identifying stretch features worth pursuing
- **20%** — Wireframing and designing the structure, layout, and feature set
- **50%** — Core implementation. After every new feature: bug testing, then UI/UX refinement
- **20%** — Stretch features: notification system, keyboard shortcuts, quick-bid flow, dev console

---

## Assumptions and Scope

**Assumptions:**
- The user is a buyer — no seller workflows needed
- Authentication and user accounts are out of scope
- Auction timestamps are synthetic; normalized relative to `Date.now()` to simulate live countdowns
- Reserve prices are hidden from buyers, matching real auction conventions
- Auction resolution (won/reserve not met) is triggered manually via the dev console — no real auction clock
- The target buyer is a professional within the automotive industry, not a casual consumer

**Scope:**
- Frontend-only implementation — no backend, no auth, no payments
- Browse and search the vehicle inventory with filters, sort, and live search
- Vehicle detail views with full specs, condition report, damage notes, dealership info, and photo gallery
- A complete bidding flow: place bid, review, confirm, Buy Now, reserve outcome
- Dedicated views for active bids, won vehicles, and liked/watchlist vehicles
- A real-time notification system for auction milestones, outbid events, and auction outcomes
- Keyboard shortcuts for staged and confirmed quick bidding
- Responsive layout for desktop and mobile

---

## Stack

- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS v3 with semantic CSS custom properties for theming
- **Icons:** Lucide React
- **State:** React Context + useReducer — no external state library
- **AI Tooling:** Claude (chat for Claude Code prompts, Claude Code for implementation)

---

## What I Built

A buyer-facing vehicle auction platform built on top of the provided 200-vehicle dataset. The goal was to design a fast-paced bidding experience where professional buyers can efficiently scan inventory, monitor active bids, and act quickly when auctions are closing.

The core experience covers inventory browsing, vehicle detail inspection, and a full bidding flow. Beyond the minimum bar, I focused on building a workflow that rewards fast, informed decision-making.

**Key features:**
- Inventory grid with live search, multi-filter dropdowns (make, body style, fuel type, title status, province, price, year), and sort
- Vehicle detail drawer — slides in from the right and pushes the grid left, keeping the inventory interactive behind it. Includes photo gallery, full specs, condition report, damage notes, and dealership info
- Complete bidding flow: place bid → review → confirm, with minimum bid increments, Buy Now confirmation, and reserve price resolution
- Four inventory views: All Inventory, My Bids, Won, and Liked — same grid format, no new UI to learn
- Notification system with real-time alerts for outbid events,  wins, and reserve outcomes. Urgent events trigger toast popups
- Quick bid keyboard shortcuts: hover a card or notification, press `1` to stage a minimum bid, press `2` to confirm
- Fully responsive on desktop and mobile

---

## Notable Decisions

**1. OpenLane colour theme.** Staying on-brand felt right for a submission going to OpenLane.

**2. Infinite scroll over pagination.** I originally built pagination (~20 vehicles per page). Infinite scroll with lazy loading is faster to browse, reduces the friction of clicking between pages, and fits the fast-paced bidding goal. Social media has taught us that scrolling is natural — I think that lesson applies here.

**3. Colour coding for speed.** To let buyers scan inventory quickly, I colour coded key states: a dark blue badge on the vehicle image signals Buy Now availability, green indicates good condition or a clean title, orange signals rebuilt/average condition, and red signals salvage/low condition. Auction countdowns shift from grey → orange → red as time runs out. The tradeoff is visual density, but for a professional buyer who uses the platform regularly, I think it pays off.

**4. Drawer over separate page for vehicle details.** Clicking a vehicle card opens a detail drawer on the right side instead of navigating away. This keeps the full inventory visible so buyers can compare vehicles side by side. The drawer pushes the grid left — it doesn't overlay it — so the grid stays fully interactive. I chose the right side because most users are right-handed.

**5. Top bar for filters, not a sidebar.** I started with a left sidebar for filters. It cluttered the grid and required scrolling to find the right filter. Moving filters to dropdown pills at the top keeps them accessible without eating into inventory space, and removes the left-right eye travel that a sidebar creates.

**6. Four inventory views that share the same grid UI.** Active Bids, Won, and Liked are not separate pages — they filter the same inventory grid. Buyers don't need to relearn a new layout. The tradeoff is that the distinction between views is subtle, but the nav icons and view labels make the current state clear.

**7. Notification sidebar as a push layout.** Notifications slide in from the right alongside the vehicle drawer — same push pattern, no backdrop overlay. The right side of the screen is reserved for important contextual information (vehicle detail, notifications). This is intentional: top = filters/navigation, right = detail and alerts.

**8. Quick bid requires a two-step confirm.** Press `1` to stage a bid, press `2` to confirm — `2` only works if the cursor is still on the same vehicle or notification. A single keypress placing a bid with no confirm would risk accidental bids, especially in a notification-heavy environment. The two-step flow is fast but deliberate.

**9. Dev console for auction testing.** Rather than building a fake auction clock or admin panel, I exposed a paste-into-console script that lets testers manually end auctions, trigger outbids, and simulate reserve outcomes. This keeps the production UI clean while making the full bidding lifecycle testable.

---

## Testing

For every new feature, UI element, or UX change I followed this sequence:

**1. Functional testing** — verifying each interaction produces the expected behaviour.
- Example: the "Clear All" button was not clearing the search bar — found and fixed
- Example: using `dev-console.js` to verify that `outbid()` triggered an outbid notification in the notification drawer

**2. UI behaviour testing** — checking for layout shifts, overlapping elements, spacing problems, and broken states.
- Example: the "Place Bid" panel was covering the entire vehicle drawer with excess white space — required multiple iterations to fix dynamic height
- Example: the `$49,500 · WINNING` label was colliding with the bid count when the drawer was open and the grid was narrow

**3. Responsiveness testing** — repeating checks on mobile screen sizes using Chrome DevTools device emulation (iPhone 14 Pro, Pixel 7) and on a physical iPhone via local network.

---

## What I'd Do With More Time

1. **More complex keyboard shortcuts** — the current `1`/`2` flow is intentionally simple, but there's room for shortcuts to open the notification sidebar, switch views, navigate between vehicles in the drawer, and close panels — reducing mouse time significantly
2. **Larger tap targets and icon labels** — the top bar icons are small; adding hover tooltips and slightly larger touch targets would help new users and mobile users identify functions faster
3. **Real auction clock** — replace the dev console `endAuction()` with a background timer that automatically closes lots and triggers win/reserve resolution; started to develop timer-based notifications but didn't get around to testing
4. **Lot number visibility** — the lot number badge currently blends into the vehicle photo at a glance; I'd increase contrast or move it
5. **Close button repositioning** — the X button on the vehicle drawer sits at the top-right corner of the drawer; it feels slightly out of place and I'd explore moving it to the top-left and changing the icon to a back arrow
6. **Bid history per vehicle** — a collapsible timeline of all bids on a lot, not just the current high bid
7. **Seller workflow research** — understanding what information sellers surface would help validate and refine what buyers actually need to see
