/**
 * Debug Script - Check balances and verify setup
 * Run: NODE_TLS_REJECT_UNAUTHORIZED=0 node debug.js
 */

import { Wallet, JsonRpcProvider } from 'js-moi-sdk';

const MNEMONIC = "fortune toddler true say guilt vacant retire lion luxury come wagon pulp";
const RPC_URL = "https://dev.voyage-rpc.moi.technology/devnet";

// Token IDs from SWAP_CONFIG
const moiBTC_ID = "0x10030000eb02d2115f16899ad2a43147893f51868eb8683c7ea6a89d00000000";
const moiUSD_ID = "0x100300003afd81730f00c0c4522ae4736028c700e54875f4f20ed3ff00000000";
const POOL_OWNER = "0x000000008ef2c197c13948dd9ea777e9673afbfecf8d57b21456374f00000000";

async function debug() {
    console.log("═══════════════════════════════════════════════════════");
    console.log("  DEBUG - Checking Pool Owner Balances");
    console.log("═══════════════════════════════════════════════════════\n");
    
    // Step 1: Connect wallet and verify address
    const provider = new JsonRpcProvider(RPC_URL);
    const wallet = await Wallet.fromMnemonic(MNEMONIC, "m/44'/6174'/7020'/0/0");
    wallet.connect(provider);
    
    const walletAddress = wallet.getIdentifier().toHex();
    
    console.log("1️⃣  WALLET ADDRESS CHECK:");
    console.log(`   Wallet from mnemonic: ${walletAddress}`);
    console.log(`   POOL_OWNER in config: ${POOL_OWNER}`);
    console.log(`   Match: ${walletAddress === POOL_OWNER ? '✅ YES' : '❌ NO'}\n`);
    
    // Step 2: Fetch TDU (all assets)
    console.log("2️⃣  FETCHING TDU (getTDU)...");
    try {
        const tdu = await provider.getTDU(walletAddress);
        console.log(`   Raw TDU response:`, JSON.stringify(tdu, null, 2));
        console.log();
    } catch (error) {
        console.log(`   ❌ getTDU failed: ${error.message}\n`);
    }
    
    // Step 3: Check specific token balances
    console.log("3️⃣  CHECKING SPECIFIC TOKEN BALANCES...");
    console.log(`   Looking for moiBTC: ${moiBTC_ID}`);
    console.log(`   Looking for moiUSD: ${moiUSD_ID}\n`);
    
    try {
        const tdu = await provider.getTDU(walletAddress);
        
        if (!tdu || !Array.isArray(tdu) || tdu.length === 0) {
            console.log("   ⚠️  No assets found in TDU!\n");
        } else {
            console.log(`   Found ${tdu.length} asset(s):\n`);
            
            for (const entry of tdu) {
                const assetId = entry.asset_id || entry.assetId || entry.id;
                const amount = entry.amount || entry.balance || '0';
                
                console.log(`   Asset: ${assetId}`);
                console.log(`   Balance: ${amount}`);
                
                if (assetId === moiBTC_ID) {
                    console.log(`   → This is moiBTC ✅`);
                } else if (assetId === moiUSD_ID) {
                    console.log(`   → This is moiUSD ✅`);
                }
                console.log();
            }
        }
    } catch (error) {
        console.log(`   ❌ Error: ${error.message}\n`);
    }
    
    // Step 4: Summary
    console.log("═══════════════════════════════════════════════════════");
    console.log("  SUMMARY");
    console.log("═══════════════════════════════════════════════════════");
    console.log(`
🔗 View wallet on Voyage:
   https://voyage.moi.technology/account/${walletAddress}

🔗 View moiBTC asset:
   https://voyage.moi.technology/asset/${moiBTC_ID}

🔗 View moiUSD asset:
   https://voyage.moi.technology/asset/${moiUSD_ID}
`);
}

debug().catch(console.error);
