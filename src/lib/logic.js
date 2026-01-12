import { Wallet, JsonRpcProvider, MAS0AssetLogic } from 'js-moi-sdk';

// Initialize Network Provider (Voyage Devnet)
const provider = new JsonRpcProvider('https://dev.voyage-rpc.moi.technology/devnet');

// ============================================
// Mission 1: Connection & Identity
// ============================================
// Goal: Initialize the Network Provider and the Wallet Signer.
//
// Understanding the Task:
// To interact with the MOI network, we need two components:
// 1. Provider - connection to the blockchain node (read data)
// 2. Wallet - holds private keys (write data)
//
// Steps to implement:
// 1. Define standard MOI derivation path: "m/44'/6174'/7020'/0/0"
// 2. Create Wallet instance from mnemonic using Wallet.fromMnemonic()
// 3. Connect wallet to provider using wallet.connect()
// 4. Extract address from wallet object
// 5. Return { wallet, address }
//
// TODO: Implement the function below
export async function createWallet(mnemonic) {
  // TODO: Define standard MOI derivation path
  
  // TODO: Create Wallet instance from mnemonic
  
  // TODO: Connect wallet to provider
  
  // TODO: Extract address from wallet object
  
  // TODO: Return { wallet, address }
  
  throw new Error('Mission 1: Not implemented yet - Complete the createWallet function');
}

// ============================================
// Mission 2: Reading State (The Digital Backpack)
// ============================================
// Goal: Retrieve the account's complete asset portfolio in one query.
//
// Understanding the Task:
// MOI is Participant-Centric. Your account is like a digital backpack.
// The network tracks what's inside using TDU (Total Digital Utility).
//
// Steps to implement:
// 1. Query using provider.getTDU(address)
// 2. Guard: If null or not array, return null
// 3. For each asset, fetch metadata with provider.getAssetInfoByAssetID()
// 4. Use Promise.all() for parallel fetching
// 5. Return array of { id, balance (as string), symbol }
//
// TODO: Implement the function below
export async function getAccountAssets(address) {
  // TODO: Query the Account State directly
  
  // TODO: Guard Rail - If the user is new, return null
  
  // TODO: Loop through assets with Promise.all
  
  // TODO: For each asset, fetch symbol and format response
  
  throw new Error('Mission 2: Not implemented yet - Complete the getAccountAssets function');
}

// ============================================
// Mission 3: Creating moiBTC and moiUSD
// ============================================
// Goal: Create native MAS0 assets that you'll use in Mission 7 (SimpleSwap)!
//
// Understanding the Task:
// On MOI, assets are native - no smart contract needed!
// You'll create two tokens:
// - moiBTC (supply: 1,000)
// - moiUSD (supply: 100,000,000)
//
// Save the Asset IDs! You'll need them for Mission 7.
//
// Steps to implement:
// 1. Get manager address: wallet.getIdentifier().toHex()
// 2. Create asset: MAS0AssetLogic.create(wallet, symbol, supply, manager, true).send()
// 3. Wait for confirmation: response.wait()
// 4. Get result: response.result()
// 5. Extract assetId from result
// 6. Mint supply to manager: new MAS0AssetLogic(assetId, wallet).mint(manager, BigInt(supply)).send()
// 7. Return { hash, receipt, assetId }
//
// TODO: Implement the function below
export async function createAsset(wallet, symbol, supply) {
  // TODO: Get manager address (wallet identifier)
  
  // TODO: Create MAS0 asset
  
  // TODO: Wait for confirmation
  
  // TODO: Extract Asset ID from result
  
  // TODO: Mint supply to the creator
  
  // TODO: Return { hash, receipt, assetId }
  
  throw new Error('Mission 3: Not implemented yet - Complete the createAsset function');
}

// ============================================
// Mission 4: Utilizing Assets (Transfer)
// ============================================
// Goal: Transfer your moiBTC and moiUSD tokens.
//
// Understanding the Task:
// MAS0AssetLogic is like a universal remote for fungible tokens.
// This same transfer function will be REUSED in Mission 7 for swaps!
//
// Steps to implement:
// 1. Create MAS0AssetLogic instance: new MAS0AssetLogic(assetId, wallet)
// 2. Execute transfer: assetLogic.transfer(receiver, BigInt(amount)).send()
// 3. Wait for confirmation: response.wait()
// 4. Return { hash, receipt }
//
// TODO: Implement the function below
export async function transfer(wallet, assetId, receiverAddress, transferAmount) {
  // TODO: Initialize the Logic (bind Asset ID to Wallet)
  
  // TODO: Execute Transfer (use BigInt for amount!)
  
  // TODO: Await Consensus
  
  // TODO: Return { hash, receipt }
  
  throw new Error('Mission 4: Not implemented yet - Complete the transfer function');
}

// ============================================
// Mission 7: SimpleSwap Configuration
// ============================================
// After completing Missions 3-4 and deploying the SimpleSwap contract,
// fill in these values from the deploy.js output.
//
// This config connects your frontend to:
// - The moiBTC and moiUSD you created in Mission 3
// - The SimpleSwap contract you deploy in Mission 7
// - The pool owner wallet that holds liquidity
//
// TODO: Update these values after running Swap/deploy.js
export const SWAP_CONFIG = {
  // TODO: Fill in after deploying SimpleSwap contract
  LOGIC_ID: "",
  
  // TODO: Fill in with pool owner address
  POOL_OWNER: "",
  
  // TODO: Fill in with moiBTC asset ID from Mission 3
  moiBTC: {
    id: "",
    symbol: "moiBTC",
    decimals: 0,
    icon: "₿"
  },
  
  // TODO: Fill in with moiUSD asset ID from Mission 3
  moiUSD: {
    id: "",
    symbol: "moiUSD",
    decimals: 0,
    icon: "$"
  },
  
  // Exchange rate: 1 moiBTC = 50,000 moiUSD
  RATE: 50000
};
