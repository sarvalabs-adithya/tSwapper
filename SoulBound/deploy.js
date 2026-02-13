/**
 * ============================================
 * Challenge 1: Deploy Soulbound Badge
 * ============================================
 * 
 * Your task:
 *   1. Connect your wallet to MOI devnet
 *   2. Deploy the SoulboundBadge asset using AssetFactory
 *   3. Print the Asset ID to paste into src/lib/logic.js
 * 
 * Hints:
 *   - Use AssetFactory.create(wallet, symbol, supply, manager, events, manifest, "Init")
 *     The SoulboundBadge Init() takes no arguments, so no extra args needed.
 *   - Call factory.send() to submit the transaction
 *   - Call ix.result() to get the deployment result with asset_id
 *   - The result is an array; grab result[0].asset_id
 * 
 * Run: NODE_TLS_REJECT_UNAUTHORIZED=0 node deploy.js
 */

import { Wallet, JsonRpcProvider, AssetFactory } from "js-moi-sdk";
import manifest from "./logic/soulboundbadge.json" with { type: "json" };

// 📝 Replace with your mnemonic
const MNEMONIC = "your twelve word mnemonic goes here replace this now";

// Asset configuration
const SYMBOL = "SBT";
const SUPPLY = 1000000;

async function main() {
    const provider = new JsonRpcProvider("https://dev.voyage-rpc.moi.technology/devnet");

    // ============================================
    // TODO: Create wallet from mnemonic and connect to provider
    // Hint: const wallet = await Wallet.fromMnemonic(MNEMONIC, "m/44'/6174'/7020'/0/0")
    //       wallet.connect(provider)
    // ============================================


    // ============================================
    // TODO: Get your wallet address (this will be the manager/admin)
    // Hint: wallet.getIdentifier().toHex()
    // ============================================


    // ============================================
    // TODO: Deploy the SoulboundBadge asset
    // Hint: const factory = AssetFactory.create(
    //         wallet, SYMBOL, SUPPLY, managerAddress, true, manifest, "Init"
    //       )
    //       const ix = await factory.send()
    //       const result = await ix.result()
    //       const assetId = result[0].asset_id (or however the SDK returns it)
    // ============================================


    // ============================================
    // TODO: Print the Asset ID
    // Then paste it into SOULBOUND_CONFIG.ASSET_ID in src/lib/logic.js
    // ============================================

    console.log("❌ Not implemented yet! Fill in the TODOs above.");
}

main().catch(console.error);
