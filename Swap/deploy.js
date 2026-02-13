/**
 * ============================================
 * Challenge 2: Deploy SimpleSwap
 * ============================================
 * 
 * Your task:
 *   1. Create moiBTC and moiUSD assets
 *   2. Deploy the SimpleSwap contract
 *   3. Print the SWAP_CONFIG to paste into src/lib/logic.js
 * 
 * Hints:
 *   - Use MAS0AssetLogic.newAsset(wallet, symbol, supply, manager, enableEvents)
 *     to create each asset. It returns an object with .assetId
 *   - Use new LogicFactory(manifest, wallet) then factory.deploy("Init", rate, assetA, assetB)
 *     to deploy the contract. Call deployIx.result() to get { logic_id }
 *   - Rate should be 50000 (1 moiBTC = 50,000 moiUSD)
 * 
 * Run: NODE_TLS_REJECT_UNAUTHORIZED=0 node deploy.js
 */

import { Wallet, JsonRpcProvider, MAS0AssetLogic, LogicFactory } from "js-moi-sdk";
import manifest from "./simpleswap.json" with { type: "json" };

// 📝 Replace with your mnemonic
const MNEMONIC = "your twelve word mnemonic goes here replace this now";
const RATE = 50000;

async function main() {
    const provider = new JsonRpcProvider("https://dev.voyage-rpc.moi.technology/devnet");

    // ============================================
    // TODO: Create wallet from mnemonic
    // Hint: await Wallet.fromMnemonic(MNEMONIC, "m/44'/6174'/7020'/0/0")
    //       then wallet.connect(provider)
    // ============================================


    // ============================================
    // TODO: Create moiBTC asset (supply: 1000)
    // Hint: await MAS0AssetLogic.newAsset(wallet, "moiBTC", 1000, owner, true)
    // ============================================


    // ============================================
    // TODO: Create moiUSD asset (supply: 100000000)
    // ============================================


    // ============================================
    // TODO: Deploy SimpleSwap contract
    // Hint: const factory = new LogicFactory(manifest, wallet)
    //       const deployIx = await factory.deploy("Init", RATE, btcAssetId, usdAssetId)
    //       const result = await deployIx.result()
    // ============================================


    // ============================================
    // TODO: Print the SWAP_CONFIG so you can paste it into src/lib/logic.js
    // It should look like:
    //
    // export const SWAP_CONFIG = {
    //   LOGIC_ID: "0x...",
    //   POOL_OWNER: "0x...",
    //   moiBTC: { id: "0x...", symbol: "moiBTC", decimals: 0, icon: "₿" },
    //   moiUSD: { id: "0x...", symbol: "moiUSD", decimals: 0, icon: "$" },
    //   RATE: 50000
    // };
    // ============================================

    console.log("❌ Not implemented yet! Fill in the TODOs above.");
}

main().catch(console.error);
