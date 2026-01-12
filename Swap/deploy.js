/**
 * SimpleSwap - Full Deployment Script
 * 
 * This script:
 * 1. Creates moiBTC and moiUSD assets (or uses existing ones)
 * 2. Mints them to the pool owner
 * 3. Deploys the SimpleSwap contract
 * 4. Outputs the SWAP_CONFIG for your frontend
 * 
 * Prerequisites:
 * 1. Compile the contract: coco compile SimpleSwap.coco --format json
 * 2. Update MNEMONIC below with your pool owner's mnemonic
 * 
 * Run: NODE_TLS_REJECT_UNAUTHORIZED=0 node deploy.js
 */

import { Wallet, JsonRpcProvider, MAS0AssetLogic, LogicFactory } from 'js-moi-sdk';
import manifest from './simpleswap.json' with { type: 'json' };

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION - UPDATE THESE VALUES
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Replace with your mnemonic (this wallet becomes the pool owner)
const MNEMONIC = "your twelve word mnemonic phrase here";

const RPC_URL = "https://dev.voyage-rpc.moi.technology/devnet";

// Exchange rate: 1 moiBTC = 50,000 moiUSD
const RATE = 50000;

// Set to true to create NEW tokens, false to use existing ones from Mission 3
const CREATE_NEW_TOKENS = true;

// If CREATE_NEW_TOKENS = false, fill these with your Mission 3 asset IDs
const EXISTING_moiBTC = "";
const EXISTING_moiUSD = "";

// ═══════════════════════════════════════════════════════════════════════════
// MAIN DEPLOYMENT
// ═══════════════════════════════════════════════════════════════════════════
async function deploy() {
    console.log("═══════════════════════════════════════════════════════");
    console.log("  SimpleSwap - Full Deployment");
    console.log("═══════════════════════════════════════════════════════\n");
    
    // Connect wallet
    const provider = new JsonRpcProvider(RPC_URL);
    const wallet = await Wallet.fromMnemonic(MNEMONIC, "m/44'/6174'/7020'/0/0");
    wallet.connect(provider);
    
    const ownerAddress = wallet.getIdentifier().toHex();
    console.log(`👛 Pool Owner: ${ownerAddress}`);
    console.log(`   🔗 View on Voyage: https://voyage.moi.technology/account/${ownerAddress}\n`);
    
    let moiBTC_ID, moiUSD_ID;
    
    if (CREATE_NEW_TOKENS) {
        // ─────────────────────────────────────────────────────────────────────
        // STEP 1: Create moiBTC
        // ─────────────────────────────────────────────────────────────────────
        console.log("📦 Creating moiBTC (supply: 1,000)...");
        const btcResponse = await MAS0AssetLogic.create(
            wallet, "moiBTC", 1000, ownerAddress, true
        ).send();
        await btcResponse.wait();
        const btcResult = await btcResponse.result();
        moiBTC_ID = btcResult?.asset_id;
        
        // Mint to pool owner
        const btcLogic = new MAS0AssetLogic(moiBTC_ID, wallet);
        await (await btcLogic.mint(ownerAddress, BigInt(1000)).send()).wait();
        console.log(`   ✅ moiBTC: ${moiBTC_ID}`);
        console.log(`   💰 Minted 1,000 moiBTC to pool\n`);
        
        // ─────────────────────────────────────────────────────────────────────
        // STEP 2: Create moiUSD
        // ─────────────────────────────────────────────────────────────────────
        console.log("📦 Creating moiUSD (supply: 100,000,000)...");
        const usdResponse = await MAS0AssetLogic.create(
            wallet, "moiUSD", 100000000, ownerAddress, true
        ).send();
        await usdResponse.wait();
        const usdResult = await usdResponse.result();
        moiUSD_ID = usdResult?.asset_id;
        
        // Mint to pool owner
        const usdLogic = new MAS0AssetLogic(moiUSD_ID, wallet);
        await (await usdLogic.mint(ownerAddress, BigInt(100000000)).send()).wait();
        console.log(`   ✅ moiUSD: ${moiUSD_ID}`);
        console.log(`   💰 Minted 100,000,000 moiUSD to pool\n`);
        
    } else {
        // Use existing tokens from Mission 3
        console.log("📦 Using existing tokens from Mission 3...");
        moiBTC_ID = EXISTING_moiBTC;
        moiUSD_ID = EXISTING_moiUSD;
        console.log(`   moiBTC: ${moiBTC_ID}`);
        console.log(`   moiUSD: ${moiUSD_ID}\n`);
    }
    
    // ─────────────────────────────────────────────────────────────────────────
    // STEP 3: Deploy SimpleSwap Contract
    // ─────────────────────────────────────────────────────────────────────────
    console.log("📝 Deploying SimpleSwap contract...");
    console.log(`   Rate: 1 moiBTC = ${RATE.toLocaleString()} moiUSD`);
    
    const factory = new LogicFactory(manifest, wallet);
    const response = await factory.deploy("Init", RATE, moiBTC_ID, moiUSD_ID);
    const receipt = await response.wait();
    
    const logicId = receipt.ix_operations?.[0]?.data?.logic_id;
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
🔗 View on Voyage:
   Pool Owner: https://voyage.moi.technology/account/${ownerAddress}
   moiBTC: https://voyage.moi.technology/asset/${moiBTC_ID}
   moiUSD: https://voyage.moi.technology/asset/${moiUSD_ID}
   Contract: https://voyage.moi.technology/logic/${logicId}
`);
}

deploy().catch(console.error);
