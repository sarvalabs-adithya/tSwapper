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
│   ├── lib/moi.js      # MOI SDK wrapper
│   ├── App.jsx         # Main React app
│   └── index.css       # Styles
├── TUTORIAL.md         # Complete developer guide
└── package.json
```

## How It Works

All wallet operations happen **in the browser** — no server needed.

1. **Login** → Enter mnemonic → wallet created client-side
2. **Load Assets** → Query MOI RPC for TDU (Total Digital Utility)
3. **Select Asset** → Choose from dropdown with symbols
4. **Transfer** → Sign transaction in browser → broadcast to network

## Security

✅ Mnemonic never leaves the browser  
✅ No server-side storage  
✅ Direct connection to MOI RPC

## Network

Currently connects to MOI Devnet:
```
https://dev.voyage-rpc.moi.technology/devnet
```

Edit `src/lib/moi.js` to change networks.

## Documentation

See [TUTORIAL.md](./TUTORIAL.md) for a complete step-by-step guide on building this app.

## License

ISC
