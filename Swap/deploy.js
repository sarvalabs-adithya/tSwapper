/**
 * SimpleSwap - Single Deployment Script
 * 
 * This script:
 * 1. Creates moiBTC and moiUSD assets (if needed)
 * 2. Deploys the SimpleSwap contract
 * 3. Outputs all the IDs for the frontend
 * 
 * Run: NODE_TLS_REJECT_UNAUTHORIZED=0 node deploy.js
 */

import { Wallet, JsonRpcProvider, MAS0AssetLogic, LogicFactory } from 'js-moi-sdk';
import manifest from './simpleswap.json' with { type: 'json' };

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════
const MNEMONIC = "fortune toddler true say guilt vacant retire lion luxury come wagon pulp";
const RPC_URL = "https://dev.voyage-rpc.moi.technology/devnet";

// Set to true to create fresh tokens, false to use existing ones
// For tutorial: set to true to see the full asset creation flow
const CREATE_NEW_TOKENS = true;

// Existing token IDs (if CREATE_NEW_TOKENS = false)
const EXISTING_moiBTC = "0x10030000eb02d2115f16899ad2a43147893f51868eb8683c7ea6a89d00000000";
const EXISTING_moiUSD = "0x100300003afd81730f00c0c4522ae4736028c700e54875f4f20ed3ff00000000";

// Exchange rate: 1 moiBTC = 50,000 moiUSD
const RATE = 50000;

// ═══════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════
async function deploy() {
    console.log("═══════════════════════════════════════════════════════");
    console.log("  SimpleSwap - Deployment");
    console.log("═══════════════════════════════════════════════════════\n");
    
    // Connect wallet (used for everything - token creation, deployment, and as contract owner)
    const provider = new JsonRpcProvider(RPC_URL);
    const wallet = await Wallet.fromMnemonic(MNEMONIC, "m/44'/6174'/7020'/0/0");
    wallet.connect(provider);
    
    const ownerAddress = wallet.getIdentifier().toHex();
    console.log(`👛 Wallet: ${ownerAddress}`);
    console.log(`   🔗 View on Voyage: https://voyage.moi.technology/account/${ownerAddress}\n`);
    
    let moiBTC_ID, moiUSD_ID;
    
    // ─────────────────────────────────────────────────────────────────────────
    // STEP 1: Create or use existing tokens
    // ─────────────────────────────────────────────────────────────────────────
    if (CREATE_NEW_TOKENS) {
        console.log("📦 Creating tokens...");
        
        // Create moiBTC
        console.log("   Creating moiBTC (supply: 1,000)...");
        const btcResponse = await MAS0AssetLogic.create(wallet, "moiBTC", 1000, ownerAddress, true).send();
        const btcReceipt = await btcResponse.wait();
        const btcResult = await btcResponse.result();
        moiBTC_ID = btcResult?.asset_id || btcReceipt?.ix_operations?.[0]?.data?.asset_id;
        
        // Mint moiBTC to owner
        if (moiBTC_ID) {
            const btcLogic = new MAS0AssetLogic(moiBTC_ID, wallet);
            await (await btcLogic.mint(ownerAddress, BigInt(1000)).send()).wait();
        }
        console.log(`   ✅ moiBTC: ${moiBTC_ID}`);
        
        // Create moiUSD
        console.log("   Creating moiUSD (supply: 100,000,000)...");
        const usdResponse = await MAS0AssetLogic.create(wallet, "moiUSD", 100000000, ownerAddress, true).send();
        const usdReceipt = await usdResponse.wait();
        const usdResult = await usdResponse.result();
        moiUSD_ID = usdResult?.asset_id || usdReceipt?.ix_operations?.[0]?.data?.asset_id;
        
        // Mint moiUSD to owner
        if (moiUSD_ID) {
            const usdLogic = new MAS0AssetLogic(moiUSD_ID, wallet);
            await (await usdLogic.mint(ownerAddress, BigInt(100000000)).send()).wait();
        }
        console.log(`   ✅ moiUSD: ${moiUSD_ID}\n`);
        
    } else {
        console.log("📦 Using existing tokens...");
        moiBTC_ID = EXISTING_moiBTC;
        moiUSD_ID = EXISTING_moiUSD;
        console.log(`   moiBTC: ${moiBTC_ID}`);
        console.log(`   moiUSD: ${moiUSD_ID}\n`);
    }
    
    // ─────────────────────────────────────────────────────────────────────────
    // STEP 2: Deploy SimpleSwap contract
    // The contract owner will be the wallet address (Sender in the contract)
    // ─────────────────────────────────────────────────────────────────────────
    console.log("📝 Deploying SimpleSwap contract...");
    console.log(`   Rate: 1 moiBTC = ${RATE.toLocaleString()} moiUSD`);
    console.log(`   Contract Owner: ${ownerAddress}`);
    
    const factory = new LogicFactory(manifest, wallet);
    const response = await factory.deploy("Init", RATE, moiBTC_ID, moiUSD_ID);
    const receipt = await response.wait();
    const logicId = receipt.ix_operations?.[0]?.data?.logic_id;
    
    if (receipt.status !== 0) {
        throw new Error(`Deploy failed with status ${receipt.status}`);
    }
    
    console.log(`   ✅ Logic ID: ${logicId}\n`);
    
    // ─────────────────────────────────────────────────────────────────────────
    // OUTPUT
    // ─────────────────────────────────────────────────────────────────────────
    console.log("═══════════════════════════════════════════════════════");
    console.log("  ✅ DEPLOYMENT COMPLETE");
    console.log("═══════════════════════════════════════════════════════");
    console.log(`
📋 Copy this config to src/lib/logic.js:

export const SWAP_CONFIG = {
  LOGIC_ID: "${logicId}",
  POOL_OWNER: "${ownerAddress}",
  moiBTC: {
    id: "${moiBTC_ID}",
    symbol: "moiBTC",
    decimals: 0,
    icon: "₿"
  },
  moiUSD: {
    id: "${moiUSD_ID}",
    symbol: "moiUSD",
    decimals: 0,
    icon: "$"
  },
  RATE: ${RATE}
};
`);
    
    console.log(`
🔗 View Contract Deployment: https://voyage.moi.technology/interaction/${response.hash}
🔗 View Contract Owner Wallet: https://voyage.moi.technology/account/${ownerAddress}
🔗 View Contract Logic: https://voyage.moi.technology/logic/${logicId}
`);
}

deploy().catch(console.error);
