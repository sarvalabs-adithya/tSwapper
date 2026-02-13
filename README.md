# MOI Sprint

Learn MOI by building. Complete challenges. Ship code.

Full guides: [moisprint.com](https://moisprint.com)

---

## Challenges

Each challenge is a **standalone project** with its own frontend, deploy script, test suite, and contract.

| # | Challenge | What you build | Directory |
|---|-----------|---------------|-----------|
| 01 | **Soulbound Badge** | Non-transferable token (identity/credentials) | `SoulBound/` |
| 02 | **Simple Swap** | DEX with fixed-rate token swaps | `Swap/` |

## Getting Started

Pick a challenge and `cd` into its directory:

```bash
# Challenge 1
cd SoulBound
npm install
npm run dev

# Challenge 2
cd Swap
npm install
npm run dev
```

Each challenge runs independently at http://localhost:5173 with its own checkpoint tracker.

## How It Works

You work across three windows:

| Window | What you do |
|--------|-------------|
| **Browser** (localhost:5173) | Read instructions, see hints, click Verify |
| **Editor** (VS Code / Cursor) | Write contract code (`.coco`), deploy scripts, and logic functions |
| **Terminal** | Run deploy scripts and `node test.js` |

Each challenge has:
- A `.coco` contract with TODO stubs — **you write the implementation**
- A `deploy.js` with TODO stubs — **you write the deploy script**
- A `src/lib/logic.js` with TODO stubs — **you implement the JS interactions**
- A `test.js` that verifies everything works end-to-end

## Prerequisites

- Node.js v18+
- A MOI wallet with devnet tokens ([voyage.moi.technology](https://voyage.moi.technology))
- Your wallet mnemonic (12 or 24 words)

## Network

```
https://dev.voyage-rpc.moi.technology/devnet
```

## Resources

- [MOI SDK Docs](https://js-moi-sdk.docs.moi.technology)
- [Voyage Explorer](https://voyage.moi.technology)
- [Full Challenge Guides](https://moisprint.com)

## License

ISC
