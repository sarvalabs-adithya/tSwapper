# Build a Token Transfer App on MOI
## Developer Onboarding Guide

---

## 1. Introduction

In this tutorial, you'll build **tSwap** — a client-side React application that lets users transfer assets on the MOI network.

### What You'll Learn
- Connect to the MOI network using `js-moi-sdk`
- Create wallets from mnemonic phrases
- Query account assets using the TDU (Total Digital Utility) API
- Transfer assets using MAS0AssetLogic
- Build a clean, functional React UI

### What You'll Build
A single-page app with:
- Wallet login via mnemonic
- Asset dropdown with symbols and balances
- Transfer form to send tokens

### Time Estimate
~30 minutes

---

## 2. Prerequisites

### Required
- **Node.js** v18 or higher
- **npm** or **yarn**
- Basic knowledge of **React** and **JavaScript**

### MOI-Specific
- A MOI wallet with devnet tokens
- Your wallet's **mnemonic phrase** (12 or 24 words)
- Access to MOI Devnet RPC: `https://dev.voyage-rpc.moi.technology/devnet`

### Get Devnet Tokens
Visit the MOI Faucet to get testnet tokens for your wallet address.

---

## 3. Project Setup

### 3.1 Create Project

```bash
npm create vite@latest tswap -- --template react
cd tswap
```

### 3.2 Install Dependencies

```bash
npm install js-moi-sdk
npm install -D vite-plugin-node-polyfills
```

The MOI SDK uses Node.js modules that need polyfills for the browser.

### 3.3 Configure Vite

Replace `vite.config.js` with:

```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      include: ['buffer', 'process', 'stream', 'util', 'crypto'],
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
    }),
  ],
});
```

### 3.4 Project Structure

```
tswap/
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx        # React entry point
    ├── App.jsx         # Main application
    ├── index.css       # Styles
    └── lib/
        └── moi.js      # MOI SDK wrapper
```

---

## 4. Core Concepts

### Provider
A Provider connects your app to a MOI node. We use `JsonRpcProvider` to make RPC calls to the network.

```javascript
import { JsonRpcProvider } from 'js-moi-sdk';
const provider = new JsonRpcProvider('https://dev.voyage-rpc.moi.technology/devnet');
```

### Wallet
A Wallet is created from a mnemonic phrase and an HD derivation path. MOI uses coin type `6174`.

```javascript
import { Wallet } from 'js-moi-sdk';
const wallet = await Wallet.fromMnemonic(mnemonic, "m/44'/6174'/7020'/0/0");
wallet.connect(provider);
```

### Assets & TDU
TDU (Total Digital Utility) represents all assets owned by an account. Query it with:

```javascript
const assets = await provider.getTDU(address);
// Returns: [{ asset_id: "0x...", amount: "1000" }, ...]
```

Get asset details (symbol, supply, etc.) with:

```javascript
const info = await provider.getAssetInfoByAssetID(assetId);
// Returns: { symbol: "TOKYO", supply: "50000", ... }
```

### Transfers
Use `MAS0AssetLogic` to transfer assets:

```javascript
import { MAS0AssetLogic } from 'js-moi-sdk';
const asset = new MAS0AssetLogic(assetId, wallet);
const response = await asset.transfer(receiver, BigInt(amount)).send();
const receipt = await response.wait();
```

---

## 5. Step-by-Step Implementation

### 5.1 Create the MOI Helper Library

Create `src/lib/moi.js`:

```javascript
import { Wallet, JsonRpcProvider, MAS0AssetLogic } from 'js-moi-sdk';

const provider = new JsonRpcProvider('https://dev.voyage-rpc.moi.technology/devnet');

export async function createWallet(mnemonic, hdPath = "m/44'/6174'/7020'/0/0") {
  const wallet = await Wallet.fromMnemonic(mnemonic, hdPath);
  wallet.connect(provider);
  return wallet;
}

export function getAddress(wallet) {
  if (wallet.address) return wallet.address;
  if (wallet.identifier?.toHex) return wallet.identifier.toHex();
  if (wallet.identifier?.toString) return wallet.identifier.toString();
  throw new Error('Could not get wallet address');
}

export async function getAccountAssets(address) {
  const tdu = await provider.getTDU(address);
  
  if (!tdu || !Array.isArray(tdu)) {
    return [];
  }
  
  // Fetch asset info for each asset to get symbols
  const assets = await Promise.all(
    tdu.map(async (item) => {
      try {
        const info = await provider.getAssetInfoByAssetID(item.asset_id);
        return {
          id: item.asset_id,
          balance: BigInt(item.amount).toString(),
          symbol: info?.symbol || 'Unknown'
        };
      } catch {
        return {
          id: item.asset_id,
          balance: BigInt(item.amount).toString(),
          symbol: 'Unknown'
        };
      }
    })
  );
  
  return assets;
}

export async function getBalance(address, assetId) {
  const balance = await provider.getBalance(address, assetId);
  return BigInt(balance);
}

export async function transfer(wallet, assetId, receiver, amount) {
  const asset = new MAS0AssetLogic(assetId, wallet);
  const response = await asset.transfer(receiver, BigInt(amount)).send();
  const receipt = await response.wait();
  return { hash: response.hash, receipt };
}
```

**Key Functions:**

| Function | Purpose |
|----------|---------|
| `createWallet` | Create wallet from mnemonic + HD path |
| `getAddress` | Extract address from wallet object |
| `getAccountAssets` | Fetch all assets with symbols |
| `transfer` | Send assets to another address |

---

### 5.2 Build the Login Component

The Login component accepts a mnemonic and optional HD path:

```javascript
function Login({ onLogin }) {
  const [mnemonic, setMnemonic] = useState('');
  const [hdPath, setHdPath] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const path = hdPath || "m/44'/6174'/7020'/0/0";
      const wallet = await createWallet(mnemonic.trim(), path);
      const addr = getAddress(wallet);
      onLogin(wallet, addr);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>Mnemonic</label>
      <textarea 
        value={mnemonic}
        onChange={e => setMnemonic(e.target.value)}
        placeholder="Enter your 12 or 24 word phrase"
        required
      />
      
      <label>HD Path (optional)</label>
      <input 
        value={hdPath}
        onChange={e => setHdPath(e.target.value)}
        placeholder="m/44'/6174'/7020'/0/0"
      />
      
      <button type="submit" disabled={loading}>
        {loading ? 'Connecting...' : 'Connect'}
      </button>
      
      {error && <div className="error">{error}</div>}
    </form>
  );
}
```

---

### 5.3 Build the Asset Selector

After login, fetch assets and display in a dropdown:

```javascript
// Fetch assets on login
useEffect(() => {
  if (address) {
    loadAssets();
  }
}, [address]);

async function loadAssets() {
  setAssetsLoading(true);
  try {
    const userAssets = await getAccountAssets(address);
    setAssets(userAssets);
    
    // Auto-select first asset
    if (userAssets.length > 0) {
      setSelectedAssetId(userAssets[0].id);
    }
  } catch (err) {
    console.error('Failed to load assets:', err);
  } finally {
    setAssetsLoading(false);
  }
}
```

Render as dropdown:

```javascript
<select 
  value={selectedAssetId}
  onChange={e => setSelectedAssetId(e.target.value)}
>
  {assets.map(asset => (
    <option key={asset.id} value={asset.id}>
      {asset.symbol} — {asset.balance}
    </option>
  ))}
</select>
```

---

### 5.4 Build the Transfer Form

```javascript
function TransferForm({ wallet, asset, onSuccess }) {
  const [receiver, setReceiver] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { hash } = await transfer(wallet, asset.id, receiver, parseInt(amount));
      setResult({ success: true, message: `Success! Hash: ${hash}` });
      setReceiver('');
      setAmount('');
      onSuccess(); // Refresh balances
    } catch (err) {
      setResult({ success: false, message: err.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>Receiver</label>
      <input 
        value={receiver}
        onChange={e => setReceiver(e.target.value)}
        placeholder="0x..."
        required
      />
      
      <label>Amount</label>
      <input 
        type="number"
        value={amount}
        onChange={e => setAmount(e.target.value)}
        min="1"
        max={asset.balance}
        required
      />
      <button type="button" onClick={() => setAmount(asset.balance)}>
        MAX
      </button>
      
      <button type="submit" disabled={loading}>
        {loading ? 'Sending...' : `Send ${asset.symbol}`}
      </button>
      
      {result && (
        <div className={result.success ? 'success' : 'error'}>
          {result.message}
        </div>
      )}
    </form>
  );
}
```

---

### 5.5 Entry Point

Create `src/main.jsx`:

```javascript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

---

## 6. Testing the App

### Run Development Server

```bash
npm run dev
```

Open `http://localhost:5173`

### Test Flow

1. **Login** — Enter your devnet mnemonic
2. **View Assets** — Your tokens appear in the dropdown
3. **Select Asset** — Choose one to transfer
4. **Transfer** — Enter receiver address and amount
5. **Confirm** — Check the transaction hash in the success message

### Verify on Explorer

Use the MOI Explorer to verify your transaction went through.

---

## 7. Complete Code Reference

### File Summary

| File | Lines | Purpose |
|------|-------|---------|
| `src/lib/moi.js` | ~60 | MOI SDK wrapper functions |
| `src/App.jsx` | ~250 | React components |
| `src/index.css` | ~320 | Dark theme styles |
| `vite.config.js` | ~17 | Vite + polyfills config |

**Total: ~700 lines**

---

## 8. Next Steps

### Extend the App

| Feature | SDK Method |
|---------|------------|
| Create new asset | `AssetCreationOp` |
| Mint tokens | `AssetSupplyOp` |
| View tx history | `getInteractionByHash` |
| Real-time updates | `WebSocketProvider` |

### Production Considerations

- Use environment variables for RPC endpoints
- Add proper error boundaries
- Consider using a wallet extension instead of raw mnemonic input
- Add loading states and better UX feedback

---

## 9. Troubleshooting

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| "No assets found" | Account has no TDU | Get tokens from faucet |
| "Invalid nonce" | Pending transaction | Wait and retry |
| "provider.getTDU is not a function" | Wrong SDK version | Check `js-moi-sdk` version |
| Blank page | Missing polyfills | Check `vite.config.js` |

### Debug Tips

- Open browser DevTools → Console for errors
- Check Network tab for RPC responses
- Verify mnemonic is correct (no extra spaces)

---

## 10. Resources

| Resource | Link |
|----------|------|
| MOI SDK Docs | https://docs.moi.technology |
| MOI Devnet Explorer | https://voyage.moi.technology |
| js-moi-sdk GitHub | https://github.com/moi-technology/js-moi-sdk |

---

## Summary

You've built a complete token transfer application on MOI in ~700 lines of code. The key SDK components are:

- **`JsonRpcProvider`** — Network connection
- **`Wallet.fromMnemonic`** — Wallet creation
- **`provider.getTDU`** — Query all assets
- **`provider.getAssetInfoByAssetID`** — Get token metadata
- **`MAS0AssetLogic.transfer`** — Send tokens

This foundation can be extended to build DEXs, NFT marketplaces, DeFi apps, and more on MOI.

