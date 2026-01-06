import { Wallet, JsonRpcProvider, MAS0AssetLogic } from 'js-moi-sdk';

// Initialize Network Provider (Voyage Devnet)
// We define this globally so other functions can use it later
// This is part of Mission 1 - you'll learn about providers there
const provider = new JsonRpcProvider('https://dev.voyage-rpc.moi.technology/devnet');

// ============================================
// Mission 1: Connection & Identity
// ============================================
// Goal: Initialize the Network Provider and the Wallet Signer.
//
// Understanding the Task:
// To interact with the MOI network, we need two components working together:
// 1. Provider - acts as our connection to the blockchain node (allows us to read data)
// 2. Wallet - holds our private keys and allows us to sign transactions (write data)
//
// If you look at the official documentation for creating a wallet, you'll find the Wallet class.
// Specifically, we want to create a wallet from a recovery phrase, so we look for the
// fromMnemonic method. This method requires two arguments:
// - Your 12-word mnemonic string
// - A "derivation path"
//
// When creating a wallet, we must specify a derivation path. Think of this as a directory
// structure for your keys; m/44'/6174'/7020'/0/0 points to your first account (Index 0).
// If you changed the final digit to 1, you would generate a completely different address
// from the same mnemonic.
//
// Finally, a wallet by itself is just a key pair sitting in memory. To make it useful,
// we have to connect it to our provider. This binds the network connection to the signer,
// allowing the wallet to automatically fetch its own nonce and broadcast transactions.
//
// Steps to implement:
// 1. Uncomment the provider line above (it's already defined for you)
// 2. Define standard MOI derivation path: "m/44'/6174'/7020'/0/0"
// 3. Create Wallet instance from mnemonic using Wallet.fromMnemonic()
// 4. Attach provider to enable network IO using wallet.connect()
// 5. Extract address from wallet object (check wallet.address, wallet.identifier?.toHex(), or wallet.getIdentifier()?.toHex())
// 6. Return an object with both wallet and address: { wallet, address }
//
// TODO: Implement the function below
export async function createWallet(mnemonic) {
  // TODO: Define standard MOI derivation path
  
  // TODO: Create Wallet instance from mnemonic
  
  // TODO: Attach provider to enable network IO
  
  // TODO: Extract address from wallet object
  
  // TODO: Return an object with both wallet and address: { wallet, address }
  throw new Error('Mission 1: Not implemented yet - Complete the createWallet function');
}

// ============================================
// Mission 2: Reading State (The Digital Backpack)
// ============================================
// Goal: Retrieve the account's complete asset portfolio in one query.
//
// Understanding the Task:
// In traditional blockchains like Ethereum, your wallet is actually kind of "blind."
// It doesn't know what tokens you own. To find out, it has to go visit every single
// Token Contract individually and ask, "Does this person have a balance here?" It's inefficient.
//
// MOI is Participant-Centric. Think of your account like a digital backpack.
// The network tracks exactly what is inside it. We call this the TDU (Total Digital Utility).
//
// Steps to implement:
// 1. Query the Account State directly using provider.getTDU(address)
// 2. Guard Rail: If the user is new, the TDU might be null or not an array - return null
// 3. For each asset entry, fetch its metadata using provider.getAssetInfoByAssetID()
// 4. Use Promise.all() to fetch multiple asset infos in parallel (efficient!)
// 5. Format each asset with: id, balance (as string), and symbol
// 6. Guard Rail: If fetching metadata fails for an asset, don't crash!
//    Return the asset anyway, just without a symbol (or with "UNK")
//
// What is happening here?
// - We use Promise.all because we are firing off multiple queries at once (one for each asset)
// - We convert the balance to a string because JavaScript struggles with the massive numbers blockchains use
//
// TODO: Implement the function below
export async function getAccountAssets(address) {
  // TODO: Query the Account State directly
  
  // TODO: Guard Rail 1 - If the user is new, stop here
  
  // TODO: Loop through every asset to find its human-readable Symbol
  
  // For each asset entry:
  //   TODO: Try to fetch the symbol using provider.getAssetInfoByAssetID(entry.asset_id)
  //   TODO: Return formatted object: { id, balance: BigInt(entry.amount).toString(), symbol }
  //   TODO: Guard Rail 2 - If metadata fetch fails, catch and return asset without symbol
  
  throw new Error('Mission 2: Not implemented yet - Complete the getAccountAssets function');
}

// ============================================
// Mission 3: Writing State (Transfer)
// ============================================
// Goal: Execute an asset transfer.
//
// Understanding the Task:
// In most blockchains, to interact with a token, you need two things:
// - The Contract Address
// - The ABI (The specific code interface for that contract)
//
// If you lose the ABI, you can't talk to the contract. It's like trying to make a phone call
// without knowing the language the other person speaks.
//
// MOI simplifies this with MAS0 (MOI Asset Standard 0). The SDK provides a universal class
// called MAS0AssetLogic. You can think of this as a remote. You don't need to know the specific
// code of the token; you just punch in the Asset ID, and this logic knows exactly how to format,
// sign, and broadcast standard actions like transfer, mint, or burn.
//
// The "Three Steps" of a Transaction:
// When writing state to a blockchain, we always follow this pattern:
// 1. Initialize: Create the logic object that links the Asset ID to your Wallet
// 2. Send: Ask the SDK to build the transaction, sign it with your key, and broadcast it to the network
// 3. Wait: The transaction is floating in the mempool. We must wait for a validator to pick it up
//    and add it to a block.
//
// Steps to implement:
// 1. Initialize the Logic - Create MAS0AssetLogic(assetId, wallet)
//    This binds the Asset ID to the Wallet so the SDK knows WHO is signing
// 2. Execute Transfer - Call .transfer(receiverAddress, BigInt(transferAmount)).send()
//    We use BigInt because token amounts are too large for standard JS numbers
//    This signs & broadcasts the transaction instantly
// 3. Await Consensus - Call .wait() on the response
//    The code pauses here until the network confirms the action
// 4. Return the transaction hash and receipt
//
// TODO: Implement the function below
export async function transfer(wallet, assetId, receiverAddress, transferAmount) {
  // TODO: Initialize the Logic
  
  // TODO: Execute Transfer (Sign & Broadcast)
  
  // TODO: Await Consensus
  
  // TODO: Return hash and receipt
  
  throw new Error('Mission 3: Not implemented yet - Complete the transfer function');
}
