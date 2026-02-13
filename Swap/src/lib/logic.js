/**
 * ============================================
 * Challenge 2: Simple Swap — Logic Layer
 * ============================================
 * 
 * This file contains the functions that power the app.
 * Some are given (scaffolding). Others are YOUR TODOs.
 * 
 * Complete each TODO to make the checkpoints pass.
 */

import { Wallet, JsonRpcProvider, MAS0AssetLogic, getLogicDriver, LockType, RoutineOption } from 'js-moi-sdk';

// ============================================
// GIVEN: Network & Provider (do not modify)
// ============================================
const provider = new JsonRpcProvider('https://dev.voyage-rpc.moi.technology/devnet');

// ============================================
// GIVEN: Wallet creation (do not modify)
// ============================================
export async function createWallet(mnemonic) {
  const wallet = await Wallet.fromMnemonic(mnemonic, "m/44'/6174'/7020'/0/0");
  wallet.connect(provider);
  const address = wallet.address || wallet.identifier?.toHex() || wallet.getIdentifier()?.toHex();
  if (!address) throw new Error('Could not get wallet address');
  return { wallet, address };
}

// ============================================
// GIVEN: Read account assets (do not modify)
// ============================================
export async function getAccountAssets(address) {
  const entries = await provider.getTDU(address);
  if (!entries || !Array.isArray(entries)) return null;
  return Promise.all(
    entries.map(async (entry) => {
      try {
        const info = await provider.getAssetInfoByAssetID(entry.asset_id);
        return { id: entry.asset_id, balance: BigInt(entry.amount).toString(), symbol: info?.symbol };
      } catch {
        return { id: entry.asset_id, balance: BigInt(entry.amount).toString(), symbol: undefined };
      }
    })
  );
}

// ============================================
// GIVEN: Pool owner wallet (for swap flow)
// This is a shared devnet account that holds pool liquidity.
// It is NOT a secret — devnet only, no real funds.
// ============================================
const POOL_OWNER_MNEMONIC = "fortune toddler true say guilt vacant retire lion luxury come wagon pulp";

async function getPoolOwnerWallet() {
  const wallet = await Wallet.fromMnemonic(POOL_OWNER_MNEMONIC, "m/44'/6174'/7020'/0/0");
  wallet.connect(provider);
  return wallet;
}


// ╔════════════════════════════════════════════╗
// ║  YOUR CONFIG                              ║
// ╚════════════════════════════════════════════╝

// 📝 After running deploy.js, paste your IDs here:
export const SWAP_CONFIG = {
  LOGIC_ID: "",      // <-- TODO: Paste your Logic ID
  POOL_OWNER: "",    // <-- TODO: Paste your pool owner address
  moiBTC: {
    id: "",          // <-- TODO: Paste your moiBTC Asset ID
    symbol: "moiBTC",
    decimals: 0,
    icon: "₿"
  },
  moiUSD: {
    id: "",          // <-- TODO: Paste your moiUSD Asset ID
    symbol: "moiUSD",
    decimals: 0,
    icon: "$"
  },
  RATE: 50000
};

// GIVEN: The completed contract source (for reference in the UI)
export const SWAP_CODE = `coco SimpleSwap

state logic:
    rate U64
    owner Identifier
    asset_a Identifier
    asset_b Identifier
    total_swaps U64
    volume_a U256
    volume_b U256

endpoint deploy Init(initial_rate U64, token_a Identifier, token_b Identifier):
    mutate initial_rate -> SimpleSwap.Logic.rate
    mutate Sender -> SimpleSwap.Logic.owner
    mutate token_a -> SimpleSwap.Logic.asset_a
    mutate token_b -> SimpleSwap.Logic.asset_b

endpoint dynamic SwapAtoB(amount_in U256) -> (amount_out U256):
    observe current_rate <- SimpleSwap.Logic.rate
    memory calc_out U256 = amount_in * U256(current_rate)
    // ... update stats, emit event ...
    yield amount_out calc_out

endpoint dynamic SwapBtoA(amount_in U256) -> (amount_out U256):
    observe current_rate <- SimpleSwap.Logic.rate
    memory calc_out U256 = amount_in / U256(current_rate)
    yield amount_out calc_out`;

// GIVEN: Pure math helpers (do not modify)
export function calculateSwapOutput(inputAmount, inputToken, rate) {
  if (inputToken === 'moiBTC') return inputAmount * rate;
  return Math.floor(inputAmount / rate);
}

export async function getSwapRate() {
  return SWAP_CONFIG.RATE;
}


// ╔════════════════════════════════════════════╗
// ║  YOUR TODOS                               ║
// ╚════════════════════════════════════════════╝

/**
 * Checkpoint 3: Transfer tokens
 * 
 * Use MAS0AssetLogic to transfer tokens from one address to another.
 * 
 * Hints:
 *   - const logic = new MAS0AssetLogic(assetId, wallet)
 *   - const response = await logic.transfer(receiverAddress, BigInt(amount)).send()
 *   - const receipt = await response.wait()
 * 
 * @returns {{ hash: string, receipt: object }}
 */
export async function transfer(wallet, assetId, receiverAddress, transferAmount) {
  // ============================================
  // 👇 YOUR CODE HERE
  // ============================================

  throw new Error("Checkpoint 3 not complete: Implement transfer()");
}

/**
 * Checkpoint 4: Execute a full swap
 * 
 * The swap flow has 3 steps:
 *   1. User transfers input token TO pool owner (user signs)
 *   2. Record swap on contract (call SwapAtoB or SwapBtoA)
 *   3. Pool owner transfers output token TO user (pool owner signs)
 * 
 * Hints:
 *   - For step 1: Use MAS0AssetLogic with the user's wallet
 *   - For step 2: Use getLogicDriver(SWAP_CONFIG.LOGIC_ID, wallet)
 *     then call driver.routines.SwapAtoB(amountBigInt) or SwapBtoA
 *   - For step 3: Use getPoolOwnerWallet() to get the pool signer,
 *     then MAS0AssetLogic with the pool wallet
 *   - If inputToken === 'moiBTC': output = amount * RATE (A→B)
 *   - If inputToken === 'moiUSD': output = amount / RATE (B→A)
 * 
 * @returns {{ hash: string, receipt: object, success: boolean, outputAmount: string }}
 */
export async function executeSwap(userWallet, inputToken, inputAmount) {
  // ============================================
  // 👇 YOUR CODE HERE
  // ============================================

  throw new Error("Checkpoint 4 not complete: Implement executeSwap()");
}

/**
 * Checkpoint 2: Get swap token balances for an address
 * 
 * Query the user's moiBTC and moiUSD balances.
 * 
 * Hints:
 *   - Use getAccountAssets(address) (already given above)
 *   - Find entries matching SWAP_CONFIG.moiBTC.id and SWAP_CONFIG.moiUSD.id
 * 
 * @returns {{ moiBTC: string, moiUSD: string }}
 */
export async function getSwapBalances(address) {
  // ============================================
  // 👇 YOUR CODE HERE
  // ============================================

  throw new Error("Checkpoint 2 not complete: Implement getSwapBalances()");
}

/**
 * Checkpoint 2: Get pool (liquidity) balances
 * 
 * Query the pool owner's moiBTC and moiUSD balances.
 * 
 * Hints:
 *   - Use provider.getTDU(SWAP_CONFIG.POOL_OWNER) to get the pool's assets
 *   - Find entries matching moiBTC and moiUSD asset IDs
 * 
 * @returns {{ moiBTC: string, moiUSD: string }}
 */
export async function getPoolBalances() {
  // ============================================
  // 👇 YOUR CODE HERE
  // ============================================

  throw new Error("Checkpoint 2 not complete: Implement getPoolBalances()");
}
