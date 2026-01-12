/**
 * SimpleSwap - Full Deployment Script
 * 
 * This script:
 * 1. Creates moiBTC and moiUSD assets (or uses existing ones from .env)
 * 2. Mints them to the pool owner
 * 3. Deploys the SimpleSwap contract
 * 4. Outputs the SWAP_CONFIG for your frontend
 * 
 * Prerequisites:
 * 1. Copy .env.example to .env and fill in your mnemonic
 * 2. Compile the contract: coco compile SimpleSwap.coco --format json
 * 
 * Run: NODE_TLS_REJECT_UNAUTHORIZED=0 node deploy.js
 */

import 'dotenv/config';
import { Wallet, JsonRpcProvider, MAS0AssetLogic, LogicFactory } from 'js-moi-sdk';
import manifest from './simpleswap.json' with { type: 'json' };

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION - Loaded from .env file (with fallbacks for demo)
// ═══════════════════════════════════════════════════════════════════════════

const MNEMONIC = process.env.POOL_OWNER_MNEMONIC || "fortune toddler true say guilt vacant retire lion luxury come wagon pulp";
const RPC_URL = process.env.RPC_URL || "https://dev.voyage-rpc.moi.technology/devnet";
const RATE = parseInt(process.env.SWAP_RATE) || 50000;

// If you already created tokens in Mission 3, set these in .env
const EXISTING_moiBTC = process.env.MOIBTC_ASSET_ID || "";
const EXISTING_moiUSD = process.env.MOIUSD_ASSET_ID || "";

// Set to false if you want to use existing tokens from Mission 3
const CREATE_NEW_TOKENS = !EXISTING_moiBTC || !EXISTING_moiUSD;

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
        // Use existing tokens from Mission 3 (loaded from .env)
        console.log("📦 Using existing tokens from .env...");
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
📝 Update your .env with these values:

POOL_OWNER_ADDRESS=${ownerAddress}
MOIBTC_ASSET_ID=${moiBTC_ID}
MOIUSD_ASSET_ID=${moiUSD_ID}
SWAP_LOGIC_ID=${logicId}
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
