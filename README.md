# ⚡ InstaDrop 402

**The Instant Pay-to-Download Protocol — Built on Stacks Blockchain**

> Upload any digital file. Set a price in STX. Share the link. Buyers pay and download instantly — no accounts, no stores, no middlemen. *WeTransfer meets Web3.*

---

## 🎯 What is InstaDrop 402?

InstaDrop 402 is a decentralized digital file marketplace that implements the **HTTP 402 (Payment Required)** protocol using **Stacks (STX)** cryptocurrency. 

**Unique Hybrid Architecture:** 
To maximize security and control during the Hackathon, we utilize a **Hybrid Deployment Strategy**:
- **Frontend:** Hosted globally on **Netlify** for lightning-fast access.
- **Backend:** Hosted on a secure **Local Server** (Laptop/PC) via encrypted **Serveo Tunneling**.
- **Control:** Managed via a custom-built **Admin Generator** tool.

### Key Features

| Feature | Description |
|---------|-------------|
| 🔒 **HTTP 402 Protocol** | Native paywall — files are locked behind a real blockchain payment |
| ⚡ **Instant Download** | File delivered immediately after payment confirmation |
| 💰 **STX Payments** | Pay with Stacks cryptocurrency via Leather or Xverse wallet |
| 🛡️ **Blockchain Verified** | Every transaction verified against the Stacks blockchain |
| 📁 **Any File Type** | PDF, ZIP, images, audio, video, code, design files, and more |
| 🚀 **Hybrid Deployment** | Frontend on Cloud (Netlify), Backend on Secure Local Node |
| 🛠️ **Admin Generator** | Custom DevOps tool to manage the hybrid infrastructure |

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19 + TypeScript + Vite 7 |
| **Styling** | Tailwind CSS 4 |
| **Blockchain** | Stacks (STX) — Testnet |
| **Wallet** | @stacks/connect (Leather & Xverse) |
| **Backend** | Express.js + Node.js |
| **Tunneling** | Serveo.net (SSH Packet Forwarding) |
| **DevOps** | Custom Admin Generator (Node.js Script) |

---

## 🚀 How to Run (Hackathon Demo)

Since this project uses a Hybrid Architecture, follow these steps to start the **Backend Node**:

### 1. Prerequisites
- Node.js 18+ installed
- Windows OS (for Admin Generator)
- Internet Connection

### 2. Start the Engine
1. Clone the repo.
2. Double-click **`start-admin.bat`**.
3. The **Admin Generator Panel** will open in your browser.
4. Click **"1. Start Server"** (Starts the API).
5. Click **"2. Start Tunnel"** (Starts the Secure Tunnel).
6. Copy the Tunnel URL and click **"Update & Deploy"** in the panel.

### 3. Access the App
Go to the live frontend URL:
👉 **[https://instadrop402.netlify.app](https://instadrop402.netlify.app)**

---

## 📖 How It Works

```
┌──────────────────────┐      ┌──────────────────────┐      ┌──────────────────────┐
│  USER (Browser)      │      │  NETLIFY (Frontend)  │      │  LOCAL BACKEND       │
│                      │      │                      │      │  (Your Laptop)       │
│  1. Opens App    ───────►   │  2. Serves UI        │      │                      │
│                      │      │                      │      │                      │
│  3. Requests File ───────►  │  4. Proxy Request ───────►  │  5. Check Payment    │
│                      │      │                      │      │     (db.json)        │
│  6. Download File ◄───────  │  ◄────── Stream File ◄──────│                      │
└──────────────────────┘      └──────────────────────┘      └──────────────────────┘
```

### The x402 Protocol Flow
1. **Upload:** Seller uploads file → Stored in Local Secure Node → Metadata on Chain/DB.
2. **Pay:** Buyer pays STX → Transaction ID generated.
3. **Verify:** Backend verifies TX on Stacks Blockchain.
4. **Unlock:** If valid, file streams through the secure tunnel to the buyer.

---

## 🛠️ Built For

**Stacks Hackathon 2026** — Demonstrating the HTTP 402 Payment Required protocol as a real-world use case for micropayments on the Stacks blockchain.

---

<p align="center">
  <b>⚡ InstaDrop 402</b> — The Instant Pay-to-Download Protocol<br>
  Built with ❤️ on Stacks
</p>
