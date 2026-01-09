/**
 * Fund Pool - Add liquidity to the swap pool
 * 
 * This mints tokens to the pool owner so swaps can work
 * 
 * Run: NODE_TLS_REJECT_UNAUTHORIZED=0 node fund-pool.js
 */

import { Wallet, JsonRpcProvider, MAS0AssetLogic } from 'js-moi-sdk';

// Use the same config as deploy.js
const MNEMONIC = "fortune toddler true say guilt vacant retire lion luxury come wagon pulp";
const RPC_URL = "https://dev.voyage-rpc.moi.technology/devnet";

// Token IDs (same as in logic.js)
const moiBTC_ID = "0x10030000eb02d2115f16899ad2a43147893f51868eb8683c7ea6a89d00000000";
const moiUSD_ID = "0x100300003afd81730f00c0c4522ae4736028c700e54875f4f20ed3ff00000000";

async function fundPool() {
    console.log("═══════════════════════════════════════════════════════");
    console.log("  Fund Pool - Adding Liquidity");
    console.log("═══════════════════════════════════════════════════════\n");
    
    // Connect wallet (pool owner)
    const provider = new JsonRpcProvider(RPC_URL);
    const wallet = await Wallet.fromMnemonic(MNEMONIC, "m/44'/6174'/7020'/0/0");
    wallet.connect(provider);
    
    const ownerAddress = wallet.getIdentifier().toHex();
    console.log(`👛 Pool Owner: ${ownerAddress}\n`);
    
    // Mint moiBTC to pool owner
    console.log("💰 Minting moiBTC to pool...");
    try {
        const btcLogic = new MAS0AssetLogic(moiBTC_ID, wallet);
        const btcAmount = BigInt(100); // 100 moiBTC
        await (await btcLogic.mint(ownerAddress, btcAmount).send()).wait();
        console.log(`   ✅ Minted ${btcAmount} moiBTC\n`);
    } catch (error) {
        console.log(`   ⚠️  Could not mint moiBTC: ${error.message}`);
        console.log(`   (You may not be the asset manager)\n`);
    }
    
    // Mint moiUSD to pool owner
    console.log("💰 Minting moiUSD to pool...");
    try {
        const usdLogic = new MAS0AssetLogic(moiUSD_ID, wallet);
        const usdAmount = BigInt(5000000); // 5,000,000 moiUSD
        await (await usdLogic.mint(ownerAddress, usdAmount).send()).wait();
        console.log(`   ✅ Minted ${usdAmount} moiUSD\n`);
    } catch (error) {
        console.log(`   ⚠️  Could not mint moiUSD: ${error.message}`);
        console.log(`   (You may not be the asset manager)\n`);
    }
    
    console.log("═══════════════════════════════════════════════════════");
    console.log("  ✅ POOL FUNDED");
    console.log("═══════════════════════════════════════════════════════");
    console.log(`\n🔗 View Pool: https://voyage.moi.technology/account/${ownerAddress}\n`);
    console.log("Refresh the app to see updated pool balances!");
}

fundPool().catch(console.error);
