# tSwap

A client-side React application for transferring assets on the MOI Network.

## Features

- 🔐 **Wallet Login** - Connect using mnemonic phrase with customizable HD path
- 💰 **Asset Browser** - View all your assets with symbols and balances via TDU
- 📤 **Token Transfer** - Send assets to any address on the MOI network
- 🎨 **Modern UI** - Clean, dark-themed interface

## Quick Start

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build
```

## Prerequisites

- Node.js v18+
- A MOI wallet with devnet tokens
- Your wallet mnemonic phrase

## Project Structure

```
tswap/
├── src/
│   ├── lib/logic.js      # MOI SDK wrapper (TODO: Implement the functions)
│   ├── App.jsx           # Main React app
│   └── index.css         # Styles
├── TUTORIAL.md           # Complete step-by-step tutorial
└── package.json
```

## How It Works

All wallet operations happen **in the browser** — no server needed.

1. **Login** → Enter mnemonic → wallet created client-side
2. **Load Assets** → Query MOI RPC for TDU (Total Digital Utility)
3. **Select Asset** → Choose from dropdown with symbols
4. **Transfer** → Sign transaction in browser → broadcast to network

## Learning Path

This is a **learning scaffold** with TODO placeholders. 

**👉 Start here:** Navigate to `src/lib/logic.js` to begin implementing the blockchain logic.

Your mission is to implement the functions in `src/lib/logic.js`:

- **Mission 1:** Connection & Identity (`createWallet`)
- **Mission 2:** Reading State (`getAccountAssets`)
- **Mission 3:** Writing State (`transfer`)

👉 **See [TUTORIAL.md](./TUTORIAL.md) for the complete step-by-step guide**

## Security

✅ Mnemonic never leaves the browser  
✅ No server-side storage  
✅ Direct connection to MOI RPC

## Network

Currently connects to MOI Devnet:
```
https://dev.voyage-rpc.moi.technology/devnet
```

Edit `src/lib/logic.js` to change networks.

## Documentation

- **[TUTORIAL.md](./TUTORIAL.md)** - Complete developer guide with missions
- **MOI SDK Docs:** js-moi-sdk.docs.moi.technology
- **Voyage Explorer:** voyage.moi.technology

## License

ISC
