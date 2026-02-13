/**
 * ============================================
 * Challenge 1: Soulbound Badge — Logic Layer
 * ============================================
 * 
 * This file contains the functions that power the app.
 * Some are given (scaffolding). Others are YOUR TODOs.
 * 
 * Complete each TODO to make the checkpoints pass.
 */

import { Wallet, JsonRpcProvider, getAssetDriver, LockType, RoutineOption } from 'js-moi-sdk';

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


// ╔════════════════════════════════════════════╗
// ║  YOUR CONFIG                              ║
// ╚════════════════════════════════════════════╝

// 📝 After running deploy.js, paste your Asset ID here:
export const SOULBOUND_CONFIG = {
  ASSET_ID: "",   // <-- TODO: Paste your deployed Asset ID
  SYMBOL: "SBT",
};

// GIVEN: The completed contract source (for reference in the UI)
export const SOULBOUND_CODE = `coco asset SoulboundBadge

state logic:
    admin Identifier

endpoint deploy Init():
    mutate Sender -> SoulboundBadge.Logic.admin

endpoint dynamic IssueBadge(recipient Identifier):
    memory admin Identifier
    observe  admin <- SoulboundBadge.Logic.admin
    if Sender != admin:
        throw "Only Admin can issue badges!"
    asset.Mint(token_id: 0, beneficiary: recipient, amount: U256(1))

endpoint Transfer(beneficiary Identifier, amount U256):
    throw "This asset is Soulbound and cannot be transferred!"`;


// ╔════════════════════════════════════════════╗
// ║  YOUR TODOS                               ║
// ╚════════════════════════════════════════════╝

/**
 * Checkpoint 3: Issue a Soulbound Badge
 * 
 * Use getAssetDriver() to get the driver for the SoulBound asset,
 * then call driver.routines.IssueBadge() to mint a badge.
 * 
 * Hints:
 *   - const driver = await getAssetDriver(SOULBOUND_CONFIG.ASSET_ID, wallet)
 *   - IssueBadge takes: (recipientAddress, routineOption)
 *   - You need a RoutineOption with participants:
 *     new RoutineOption({ participants: [{ id: recipientAddress, lock_type: LockType.MUTATE_LOCK }] })
 *   - Call response.wait() to confirm
 * 
 * @returns {{ hash: string, receipt: object, success: boolean }}
 */
export async function issueBadge(wallet, recipientAddress) {
  // ============================================
  // 👇 YOUR CODE HERE
  // ============================================

  throw new Error("Checkpoint 3 not complete: Implement issueBadge()");
}

/**
 * Checkpoint 4: Try to transfer a badge (it SHOULD fail!)
 * 
 * Call driver.routines.Transfer() — the contract will throw
 * "This asset is Soulbound and cannot be transferred!"
 * 
 * Hints:
 *   - Same pattern as issueBadge: getAssetDriver, then call routines.Transfer
 *   - Transfer takes: (recipientAddress, amount, routineOption)
 *   - amount should be BigInt(1)
 * 
 * @returns {{ hash: string, receipt: object, success: boolean }}
 */
export async function tryTransferBadge(wallet, recipientAddress) {
  // ============================================
  // 👇 YOUR CODE HERE
  // ============================================

  throw new Error("Checkpoint 4 not complete: Implement tryTransferBadge()");
}

/**
 * Checkpoint 2: Check badge balance for an address
 * 
 * Query the provider for the address's TDU (Token Distribution Unit),
 * then find the entry matching our SOULBOUND_CONFIG.ASSET_ID.
 * 
 * Hints:
 *   - const tdu = await provider.getTDU(address)
 *   - tdu is an array of { asset_id, amount }
 *   - Find the entry where asset_id === SOULBOUND_CONFIG.ASSET_ID
 *   - Return the amount as a string, or '0' if not found
 * 
 * @returns {string} balance
 */
export async function getBadgeBalance(address) {
  // ============================================
  // 👇 YOUR CODE HERE
  // ============================================

  throw new Error("Checkpoint 2 not complete: Implement getBadgeBalance()");
}
