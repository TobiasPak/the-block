# Submission Template

Use this as a starting point for your repo's README in your fork of this challenge.

When you're finished, send the link to your repo to your contact at **OPENLANE**.

Delete what you don't need, add what you want.

---

# [Your Project Name]

## How to Run

### Prerequisites

Make sure you have the following installed before you begin:

- **Node.js** v18 or higher — [Download here](https://nodejs.org/)
- **npm** v9 or higher (comes with Node.js)
- A modern browser — Chrome, Firefox, or Safari

To verify your versions:
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

    The terminal will show a local URL. Open it in your browser:
    http://localhost:5173

    ---

    ### Testing the Bidding System

    To simulate auction events (placing bids, ending auctions, triggering outbids), open your browser's DevTools console (`F12` or `Cmd+Option+I`), paste the contents of `scripts/dev-console.js`, and press Enter.

    Available commands:

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

    - **`1`** — While hovering over a vehicle card or notification, stages a minimum quick bid
    - **`2`** — Confirms the staged quick bid (cursor must still be on the same vehicle/notification)
    - **`Escape`** — Closes the vehicle drawer, notification sidebar, or any open dropdown

    ---

    ### Viewing on Mobile

    To test on your phone while the dev server is running:

    **1.** Update `vite.config.ts` to expose the server on your network (server: {host: true} is currently commented out):
    ```ts
    export default defineConfig({
        server: { host: true },
        // ...
    })
    ```

    **2.** Restart the dev server. It will show a network URL like:
    Network: http://192.168.x.x:5173

    **3.** Open that URL on your phone's browser (must be on the same WiFi network).

## Time Spent

Roughly how much time you spent and how you approached the time box.

## Assumptions and Scope

What you intentionally included, skipped, or simplified.

## Stack

- **Frontend:**
- **Backend:**
- **Database:**

## What I Built

A brief description of your project and your approach.

## Notable Decisions

What choices did you make and why? What tradeoffs did you consider?

## Testing

What you tested and how.

## What I'd Do With More Time

What would you add, improve, or change?
