/**
 * Soulbound Badge - Deployment & Interaction Script
 * 
 * This script demonstrates how to:
 * 1. Deploy a Soulbound (non-transferable) asset
 * 2. Issue badges to recipients
 * 
 * Prerequisites:
 * 1. Compile the contract: cd logic && coco compile SoulboundBadge.coco --format json
 * 2. Update MNEMONIC below with your mnemonic
 * 
 * Run: NODE_TLS_REJECT_UNAUTHORIZED=0 node deploy.js
 */

import { Wallet, JsonRpcProvider, getAssetDriver, LockType, RoutineOption } from 'js-moi-sdk';
import manifest from './logic/soulboundbadge.json' with { type: 'json' };

// TODO: Replace with your mnemonic
const MNEMONIC = "your twelve word mnemonic phrase here";

async function main() {
    console.log("🔗 Connecting to MOI Devnet...\n");
    
    // Setup wallet
    const provider = new JsonRpcProvider('https://dev.voyage-rpc.moi.technology/devnet');
    const wallet = await Wallet.fromMnemonic(MNEMONIC, "m/44'/6174'/7020'/0/0");
    wallet.connect(provider);
    
    const address = wallet.getIdentifier().toHex();
    console.log(`👛 Wallet: ${address}`);
    
    // TODO: After deploying, fill in the asset ID here
    const assetId = "0x...your_deployed_asset_id...";
    
    console.log(`\n🚀 Interacting with Soulbound Asset: ${assetId}`);
    
    try {
        // Initialize the Asset Driver
        const driver = await getAssetDriver(assetId, wallet);
        
        // TODO: Replace with the recipient's address
        const recipientAddress = "0x...recipient_address...";
        
        // Execute the "IssueBadge" Routine
        const response = await driver.routines.IssueBadge(
            recipientAddress,
            new RoutineOption({
                participants: [
                    { 
                        id: recipientAddress, 
                        lock_type: LockType.MUTATE_LOCK 
                    }
                ]
            })
        );
        
        // Wait for Confirmation
        const receipt = await response.wait();
        console.log(`\n✅ Badge Issued!`);
        console.log(`   Hash: ${response.hash}`);
        console.log(`   Fuel Used: ${receipt.fuel_used}`);
        
    } catch (error) {
        console.error(`\n❌ Failed: ${error.message}`);
    }
}

main();
