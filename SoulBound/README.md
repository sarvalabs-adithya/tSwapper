# Challenge 1: Soulbound Badge

Deploy a non-transferable token on MOI. Issue badges. Discover why soulbound tokens can't move.

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

A **soulbound token** — an asset that can be minted to any address but can **never be transferred**. Soulbound tokens represent identity, reputation, or credentials on-chain.

## Files You'll Edit

| File | What to do |
|------|-----------|
| `logic/SoulboundBadge.coco` | Write the contract: Init, IssueBadge, Transfer |
| `deploy.js` | Write the deploy script using AssetFactory |
| `src/lib/logic.js` | Implement `issueBadge()`, `tryTransferBadge()`, `getBadgeBalance()` |

## Verify

```bash
NODE_TLS_REJECT_UNAUTHORIZED=0 node test.js
```

## Skills Learned

- `AssetFactory` — deploying Coco asset contracts
- `getAssetDriver` — interacting with deployed assets
- `RoutineOption` / `LockType` — MOI's participant model
- Soulbound pattern — making tokens non-transferable

## Network

```
https://dev.voyage-rpc.moi.technology/devnet
```

## Resources

- [MOI SDK Docs](https://js-moi-sdk.docs.moi.technology)
- [Voyage Explorer](https://voyage.moi.technology)
