# ⚡ InstaDrop 402

**The Instant Pay-to-Download Protocol — Built on Stacks Blockchain**

> Upload any digital file. Set a price in STX. Share the link. Buyers pay and download instantly — no accounts, no stores, no middlemen. *WeTransfer meets Web3.*

---

## 🎯 What is InstaDrop 402?

InstaDrop 402 is a decentralized digital file marketplace that implements the **HTTP 402 (Payment Required)** protocol using **Stacks (STX)** cryptocurrency. Sellers can upload any digital file, set a price, and share a unique link. Buyers pay directly from their wallet and receive the file instantly.

### Key Features

| Feature | Description |
|---------|-------------|
| 🔒 **HTTP 402 Protocol** | Native paywall — files are locked behind a real blockchain payment |
| ⚡ **Instant Download** | File delivered immediately after payment confirmation |
| 💰 **STX Payments** | Pay with Stacks cryptocurrency via Leather or Xverse wallet |
| 🛡️ **Blockchain Verified** | Every transaction verified against the Stacks blockchain |
| 📁 **Any File Type** | PDF, ZIP, images, audio, video, code, design files, and more |
| 🎁 **Free Drops** | Option to share files for free |
| 📊 **Seller Dashboard** | Track uploads, downloads, and earnings |
| 🔍 **Marketplace** | Browse, search, and filter available drops |

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19 + TypeScript + Vite 7 |
| **Styling** | Tailwind CSS 4 |
| **Blockchain** | Stacks (STX) — Testnet |
| **Wallet** | @stacks/connect (Leather & Xverse) |
| **Backend** | Express.js + Node.js |
| **Storage** | Local file system + JSON database |
| **Protocol** | HTTP 402 Payment Required |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm
- Stacks wallet ([Leather](https://leather.io) or [Xverse](https://www.xverse.app/))

### Installation

```bash
# Clone the repo
git clone https://github.com/panzauto46-bot/InstaDrop402web.git
cd InstaDrop402web

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start the API server (Terminal 1)
npm run server

# Start the frontend dev server (Terminal 2)
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## 📖 How It Works

```
┌─────────────────────────────────────────────────────┐
│                  SELLER FLOW                         │
│                                                     │
│  1. Connect Wallet  →  2. Upload File  →  3. Set   │
│     (Leather/Xverse)    (Drag & Drop)     Price    │
│                                            (STX)   │
│                    4. Share Link  →  Done! 🎉       │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│                  BUYER FLOW                          │
│                                                     │
│  1. Open Link  →  2. See File Details  →  3. Pay   │
│                                            (STX)   │
│                                                     │
│  4. TX Verified on Blockchain  →  5. Auto Download  │
└─────────────────────────────────────────────────────┘
```

### The x402 Protocol

When a buyer requests a paid file download:

1. Server responds with **HTTP 402 Payment Required**
2. Response includes price, currency (STX), and seller wallet
3. Buyer approves STX transfer via wallet
4. Transaction ID sent back to server
5. Server **verifies transaction on Stacks blockchain** (via Hiro API)
6. If valid → file is streamed to buyer
7. If invalid → **403 Forbidden** (download blocked)

---

## 🔒 Security

- **Real blockchain verification** — Every payment verified against Stacks Testnet API
- **No direct file access** — Files served only through the authenticated API endpoint
- **File type validation** — Whitelisted extensions only
- **File size limits** — Maximum 500MB per upload
- **Wallet-based identity** — No passwords, no accounts to hack

---

## 📁 Project Structure

```
InstaDrop402web/
├── src/
│   ├── App.tsx              # Main app + routing
│   ├── main.tsx             # React entry point
│   ├── store.ts             # Types & utilities
│   ├── index.css            # Tailwind + custom animations
│   ├── components/
│   │   ├── Navbar.tsx       # Navigation + wallet status
│   │   ├── DropZone.tsx     # File upload drag & drop
│   │   ├── PriceConfigurator.tsx  # Price settings
│   │   └── Toast.tsx        # Notification system
│   ├── pages/
│   │   ├── HomePage.tsx     # Landing page
│   │   ├── ExplorePage.tsx  # Marketplace browse
│   │   ├── DashboardPage.tsx # Seller dashboard
│   │   └── DropPage.tsx     # File detail + payment
│   ├── config/
│   │   └── stacks.ts        # Blockchain config + API
│   ├── hooks/
│   │   └── useWallet.ts     # Wallet connection hook
│   └── utils/
│       ├── api.ts           # API client
│       └── cn.ts            # Class name utility
├── server/
│   └── index.js             # Express API + x402 logic
├── data/
│   └── db.json              # JSON database
└── public/
    └── uploads/             # Uploaded files storage
```

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/files` | List all drops |
| `GET` | `/api/files/:id` | Get single drop |
| `GET` | `/api/files/seller/:wallet` | Get drops by seller |
| `POST` | `/api/upload` | Upload new file |
| `GET` | `/api/download/:id` | Download file (x402 guard) |
| `GET` | `/api/stats` | Platform statistics |

---

## 🛠️ Built For

**Stacks Hackathon 2026** — Demonstrating the HTTP 402 Payment Required protocol as a real-world use case for micropayments on the Stacks blockchain.

---

## 📄 License

This project is private and proprietary.

---

<p align="center">
  <b>⚡ InstaDrop 402</b> — The Instant Pay-to-Download Protocol<br>
  Built with ❤️ on Stacks
</p>
