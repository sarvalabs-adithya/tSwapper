# Challenge 2: Simple Swap

Create tokens, deploy a DEX contract, and execute swaps with a fixed rate pool on MOI.

Full guide: [moisprint.com](https://moisprint.com)

---

## Prerequisites

- Node.js v18+
- A MOI wallet with devnet tokens ([voyage.moi.technology](https://voyage.moi.technology))
- Your wallet mnemonic (12 or 24 words)

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:5173 and follow the checkpoints.

---

## What You'll Build

A **learning DEX** — create two tokens (moiBTC and moiUSD), deploy a swap contract that records trades and calculates outputs, then write the JS that handles actual native token transfers between the user and a liquidity pool.

## Files You'll Edit

| File | What to do |
|------|-----------|
| `SimpleSwap.coco` | Write the contract: Init, SwapAtoB, SwapBtoA, SetRate |
| `deploy.js` | Create assets + deploy contract using LogicFactory |
| `src/lib/logic.js` | Implement `transfer()`, `executeSwap()`, `getSwapBalances()`, `getPoolBalances()` |

## Verify

```bash
NODE_TLS_REJECT_UNAUTHORIZED=0 node test.js
```

## Skills Learned

- `MAS0AssetLogic` — creating and transferring native assets
- `LogicFactory` — deploying Coco logic contracts
- `getLogicDriver` — interacting with deployed contracts
- Hybrid swap pattern — contract does math, JS handles transfers

## Network

```
https://dev.voyage-rpc.moi.technology/devnet
```

## Resources

- [MOI SDK Docs](https://js-moi-sdk.docs.moi.technology)
- [Voyage Explorer](https://voyage.moi.technology)
