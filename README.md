# tSwap - Your First DiApp on MOI

A tutorial project for learning MOI Native Assets through hands-on missions.

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## Tutorial

See [TUTORIAL.md](./TUTORIAL.md) for the complete step-by-step guide.

## Mission Overview

| Mission | Goal |
|---------|------|
| **Mission 1** | Connect to MOI network & create wallet |
| **Mission 2** | Read account assets using TDU |
| **Mission 3** | Create moiBTC and moiUSD tokens |
| **Mission 4** | Transfer tokens between wallets |
| **Mission 5** | Verify transactions on Voyage |
| **Mission 6** | Build a Soulbound Token with Coco |
| **Mission 7** | Build SimpleSwap using your tokens! |

## Project Structure

```
tSwap/
├── src/
│   ├── lib/
│   │   └── logic.js      # TODO: Implement the missions here!
│   ├── App.jsx           # Frontend (ready to use)
│   ├── index.css         # Styles
│   └── main.jsx          # Entry point
├── Swap/
│   ├── SimpleSwap.coco   # Mission 7: Swap contract
│   ├── deploy.js         # Mission 7: Deployment script
│   └── coco.nut          # Coco config
├── SoulBound/
│   ├── logic/
│   │   └── SoulboundBadge.coco  # Mission 6: SBT contract
│   └── deploy.js         # Mission 6: Deployment script
└── TUTORIAL.md           # Full tutorial guide
```

## Prerequisites

- Node.js v16+
- [IOMe Wallet](https://voyage.moi.technology) - Generate and fund your wallet
- [Coco CLI](https://cocolang.dev) - For compiling contracts (Missions 6-7)

## Resources

- [JS-MOI-SDK Documentation](https://js-moi-sdk.docs.moi.technology)
- [Coco Language](https://cocolang.dev)
- [Voyage Explorer](https://voyage.moi.technology)
- [Discord Community](https://discord.gg/GkP7mDw5)

## Branches

- `main` - Scaffold with TODO functions (start here!)
- `solution` - Complete implementation

## License

MIT
