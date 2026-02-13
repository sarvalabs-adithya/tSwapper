/**
 * ============================================
 * Challenge 1: Soulbound Badge — Verification
 * ============================================
 * 
 * Run this after completing all checkpoints to verify your work.
 * 
 * Run: NODE_TLS_REJECT_UNAUTHORIZED=0 node test.js
 */

import { Wallet, JsonRpcProvider, getAssetDriver, LockType, RoutineOption } from "js-moi-sdk";
import { syncProgress } from "./src/lib/progress.js";

// 📝 Paste your deployed Asset ID here (from deploy.js output)
const ASSET_ID = "";
const MNEMONIC = "your twelve word mnemonic goes here replace this now";

let passed = 0;
let failed = 0;

function check(name, ok, detail) {
    if (ok) {
        console.log(`  ✅ ${name}`);
        passed++;
    } else {
        console.log(`  ❌ ${name} — ${detail || 'failed'}`);
        failed++;
    }
}

async function main() {
    console.log("============================================");
    console.log("  Challenge 1: Soulbound Badge — Verification");
    console.log("============================================\n");

    // Pre-flight
    check("ASSET_ID is set", ASSET_ID.length > 10, "Paste your Asset ID above");

    if (!ASSET_ID) {
        console.log("\n⚠️  Fill in your Asset ID first, then re-run.\n");
        return;
    }

    const provider = new JsonRpcProvider("https://dev.voyage-rpc.moi.technology/devnet");
    const wallet = await Wallet.fromMnemonic(MNEMONIC, "m/44'/6174'/7020'/0/0");
    wallet.connect(provider);
    const address = wallet.getIdentifier().toHex();

    // Check asset exists
    try {
        const info = await provider.getAssetInfoByAssetID(ASSET_ID);
        check("Asset exists on-chain", !!info, "Asset not found");
        check("Symbol is SBT", info?.symbol === "SBT", `Got: ${info?.symbol}`);
    } catch (e) {
        check("Asset exists on-chain", false, e.message);
    }

    // Check driver works
    let driver;
    try {
        driver = await getAssetDriver(ASSET_ID, wallet);
        check("AssetDriver created", !!driver);
        const routines = Object.keys(driver.routines || {});
        check("Has IssueBadge routine", routines.includes("IssueBadge"), `Routines: ${routines.join(", ")}`);
        check("Has Transfer routine", routines.includes("Transfer"), `Routines: ${routines.join(", ")}`);
    } catch (e) {
        check("AssetDriver created", false, e.message);
    }

    // Test IssueBadge
    if (driver) {
        try {
            const response = await driver.routines.IssueBadge(
                address,
                new RoutineOption({
                    participants: [{ id: address, lock_type: LockType.MUTATE_LOCK }]
                })
            );
            await response.wait();
            check("IssueBadge() succeeded", true);
        } catch (e) {
            check("IssueBadge() succeeded", false, e.message);
        }

        // Check balance after issue
        try {
            const tdu = await provider.getTDU(address);
            const entry = tdu?.find(e => e.asset_id === ASSET_ID);
            const balance = entry ? Number(entry.amount) : 0;
            check("Badge balance > 0 after issue", balance > 0, `Balance: ${balance}`);
        } catch (e) {
            check("Badge balance check", false, e.message);
        }

        // Test Transfer (should FAIL — that's the point!)
        try {
            const target = "0x00000000a880f68bd4c82545a8d4b529c4ca07d35e08128b1e6192f700000000";
            await driver.routines.Transfer(
                target, BigInt(1),
                new RoutineOption({
                    participants: [{ id: target, lock_type: LockType.MUTATE_LOCK }]
                })
            );
            check("Transfer() is blocked (soulbound)", false, "Transfer succeeded — it shouldn't!");
        } catch (e) {
            check("Transfer() is blocked (soulbound)", true);
        }
    }

    // Summary
    console.log(`\n============================================`);
    console.log(`  Results: ${passed} passed, ${failed} failed`);
    console.log(`============================================`);
    if (failed === 0) {
        console.log("  🎉 All checks passed! Challenge 1 complete.\n");
        await syncProgress(MNEMONIC, "1");
    } else {
        console.log("  Keep going! Fix the failing checks.\n");
    }
}

main().catch(console.error);
