# Scaffold vs Solution Analysis

## Current State

### ✅ What's Good
- Complete UI/UX implementation (as intended - students focus on blockchain logic)
- Proper project structure
- All dependencies configured
- Clean, modern styling

### ❌ What's Missing for Learning

## Critical Issues

### 1. **File Naming Mismatch**
- **Solution expects:** `src/lib/logic.js`
- **Current scaffold has:** `src/lib/moi.js`
- **Impact:** Students following the tutorial will be confused

### 2. **No TODOs or Placeholders**
- **Solution expects:** Empty functions with `TODO` comments
- **Current scaffold has:** Fully implemented functions
- **Impact:** Students can't learn by implementing - they just see the answer

### 3. **Missing Mission Structure**
The solution document is organized into "Missions":
- Mission 1: Connection & Identity (`createWallet`)
- Mission 2: Reading State (`getAccountAssets`)
- Mission 3: Writing State (`transfer`)
- Mission 4: Testing & Verification

**Current scaffold:** All missions are already complete

### 4. **Missing Educational Comments**
- Solution provides step-by-step explanations
- Current code has minimal comments
- Need: "Understanding the Task" sections as code comments

### 5. **Function Signature Differences**
- **Solution:** `createWallet(mnemonic)` - no hdPath parameter
- **Current:** `createWallet(mnemonic, hdPath)` - has optional hdPath
- **Solution:** `getAccountAssets(address)` returns `null` for empty accounts
- **Current:** Returns empty array `[]`

### 6. **Missing Helper Function**
- **Solution mentions:** `getAddress(wallet)` helper function
- **Current:** Address extraction is inline in App.jsx

## Recommended Changes

### Priority 1: Create Learning Scaffold

1. **Rename `moi.js` → `logic.js`**
   - Matches tutorial expectations

2. **Replace implementations with TODOs:**
   ```javascript
   // Mission 1: Connection & Identity
   // TODO: Initialize JsonRpcProvider
   // TODO: Create wallet from mnemonic
   // TODO: Connect wallet to provider
   export async function createWallet(mnemonic) {
     // Your code here
     throw new Error('Not implemented yet');
   }
   ```

3. **Add educational comments:**
   - Copy "Understanding the Task" sections from solution doc
   - Add step-by-step hints

4. **Fix function signatures:**
   - Remove `hdPath` parameter from `createWallet` (or make it truly optional with default)
   - Ensure `getAccountAssets` returns `null` for empty accounts (as per solution)

5. **Add helper function:**
   ```javascript
   export function getAddress(wallet) {
     // TODO: Extract address from wallet object
   }
   ```

### Priority 2: Documentation

1. **Update README.md:**
   - Add link to the solution document
   - Clarify this is a learning scaffold
   - Add "Getting Started" section pointing to `logic.js`

2. **Create `MISSIONS.md` or update README:**
   - List the 4 missions
   - Point to solution document for detailed instructions

### Priority 3: Code Structure

1. **Keep UI intact** (as per solution doc - "handles UI/UX")
2. **Ensure App.jsx imports from `logic.js`** (not `moi.js`)
3. **Add error boundaries** for better learning experience

## Specific Code Changes Needed

### `src/lib/logic.js` (NEW - replace moi.js)

```javascript
import { Wallet, JsonRpcProvider, MAS0AssetLogic } from 'js-moi-sdk';

// ============================================
// Mission 1: Connection & Identity
// ============================================
// Goal: Initialize the Network Provider and the Wallet Signer.
//
// Understanding the Task:
// To interact with the MOI network, we need two components:
// 1. Provider - connection to blockchain node (reads data)
// 2. Wallet - holds private keys (signs transactions)
//
// Steps:
// 1. Initialize JsonRpcProvider with Voyage Devnet URL
// 2. Create wallet from mnemonic using Wallet.fromMnemonic()
// 3. Connect wallet to provider using wallet.connect()
//
// TODO: Implement the function below
export async function createWallet(mnemonic) {
  // Your code here
  throw new Error('Mission 1: Not implemented yet');
}

// Helper function to extract address from wallet
export function getAddress(wallet) {
  // TODO: Extract address from wallet object
  // Hint: Check wallet.address, wallet.identifier?.toHex(), or wallet.getIdentifier()
  throw new Error('getAddress: Not implemented yet');
}

// ============================================
// Mission 2: Reading State (The Digital Backpack)
// ============================================
// Goal: Retrieve the account's complete asset portfolio in one query.
//
// Understanding the Task:
// MOI is Participant-Centric. Your account is like a "digital backpack"
// that tracks all your assets. We call this the TDU (Total Digital Utility).
//
// Steps:
// 1. Query TDU using provider.getTDU(address)
// 2. For each asset, fetch metadata using provider.getAssetInfoByAssetID()
// 3. Return formatted array with id, balance, and symbol
// 4. Handle edge cases (null/empty TDU)
//
// TODO: Implement the function below
export async function getAccountAssets(address) {
  // Your code here
  // Hint: Use Promise.all() to fetch multiple asset infos in parallel
  throw new Error('Mission 2: Not implemented yet');
}

// ============================================
// Mission 3: Writing State (Transfer)
// ============================================
// Goal: Execute an asset transfer.
//
// Understanding the Task:
// MOI uses MAS0 (MOI Asset Standard 0) with MAS0AssetLogic class.
// You don't need contract ABIs - just the Asset ID!
//
// The "Three Steps" of a Transaction:
// 1. Initialize: Create MAS0AssetLogic(assetId, wallet)
// 2. Send: Call .transfer().send() to sign and broadcast
// 3. Wait: Call .wait() to await block confirmation
//
// TODO: Implement the function below
export async function transfer(wallet, assetId, receiverAddress, transferAmount) {
  // Your code here
  // Hint: Use BigInt() for transferAmount
  throw new Error('Mission 3: Not implemented yet');
}
```

### Update `src/App.jsx`

Change import:
```javascript
// Change from:
import { createWallet, getAccountAssets, transfer } from './lib/moi';

// To:
import { createWallet, getAccountAssets, transfer, getAddress } from './lib/logic';
```

Update address extraction:
```javascript
// In Login component, use helper:
const addr = getAddress(wallet);
```

## Additional Improvements

### 1. Add Progress Indicators
- Show which missions are complete
- Visual feedback when functions are implemented

### 2. Add Test Suite (Optional)
- Simple test file to verify implementations
- Can be in a separate `test/` folder

### 3. Add Solution Branch
- Keep `main` as scaffold
- Create `solution` branch with complete code
- Students can check their work

### 4. Add `.env.example`
- For RPC endpoint configuration
- Teaches environment variable usage

## Summary

The current scaffold is a **complete solution** when it should be a **learning scaffold**. To make it educational:

1. ✅ Keep the UI (it's perfect)
2. ❌ Remove implementations from `logic.js`
3. ✅ Add TODOs and educational comments
4. ✅ Match function signatures to solution doc
5. ✅ Rename file to match tutorial expectations
6. ✅ Add helper functions mentioned in solution

This will transform it from "working app" to "learning experience" where students implement the blockchain logic themselves.

