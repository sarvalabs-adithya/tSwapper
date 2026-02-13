/**
 * ============================================
 * Challenge 2: SimpleSwap - Verification
 * ============================================
 * 
 * Run this after completing all checkpoints to verify your work.
 * 
 * Run: NODE_TLS_REJECT_UNAUTHORIZED=0 node test.js
 */

import { Wallet, JsonRpcProvider, getLogicDriver } from "js-moi-sdk";
import { syncProgress } from "./src/lib/progress.js";

// 📝 Paste your deployed IDs here (from deploy.js output)
const LOGIC_ID = "";
const moiBTC_ID = "";
const moiUSD_ID = "";
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
    console.log("  Challenge 2: SimpleSwap — Verification");
    console.log("============================================\n");

    // Pre-flight
    check("LOGIC_ID is set", LOGIC_ID.length > 10, "Paste your Logic ID above");
    check("moiBTC_ID is set", moiBTC_ID.length > 10, "Paste your moiBTC Asset ID above");
    check("moiUSD_ID is set", moiUSD_ID.length > 10, "Paste your moiUSD Asset ID above");

    if (!LOGIC_ID || !moiBTC_ID || !moiUSD_ID) {
        console.log("\n⚠️  Fill in your IDs first, then re-run.\n");
        return;
    }

    const provider = new JsonRpcProvider("https://dev.voyage-rpc.moi.technology/devnet");
    const wallet = await Wallet.fromMnemonic(MNEMONIC, "m/44'/6174'/7020'/0/0");
    wallet.connect(provider);
    const owner = wallet.getIdentifier().toHex();

    // Check assets exist
    try {
        const btcInfo = await provider.getAssetInfoByAssetID(moiBTC_ID);
        check("moiBTC exists on-chain", !!btcInfo, "Asset not found");
        check("moiBTC symbol is correct", btcInfo?.symbol === "moiBTC", `Got: ${btcInfo?.symbol}`);
    } catch (e) {
        check("moiBTC exists on-chain", false, e.message);
    }

    try {
        const usdInfo = await provider.getAssetInfoByAssetID(moiUSD_ID);
        check("moiUSD exists on-chain", !!usdInfo, "Asset not found");
        check("moiUSD symbol is correct", usdInfo?.symbol === "moiUSD", `Got: ${usdInfo?.symbol}`);
    } catch (e) {
        check("moiUSD exists on-chain", false, e.message);
    }

    // Check contract works
    try {
        const driver = await getLogicDriver(LOGIC_ID, wallet);
        check("SimpleSwap contract is reachable", !!driver);

        const rateResult = await driver.routines.GetRate();
        check("GetRate() returns 50000", Number(rateResult.output.rate) === 50000, `Got: ${rateResult.output?.rate}`);

        const poolInfo = await driver.routines.GetPoolInfo();
        check("GetPoolInfo() returns owner", poolInfo.output.owner === owner, `Got: ${poolInfo.output?.owner}`);
    } catch (e) {
        check("SimpleSwap contract is reachable", false, e.message);
    }

    // Check pool has balance
    try {
        const tdu = await provider.getTDU(owner);
        const btcBal = tdu?.find(e => e.asset_id === moiBTC_ID);
        const usdBal = tdu?.find(e => e.asset_id === moiUSD_ID);
        check("Pool has moiBTC balance", btcBal && Number(btcBal.amount) > 0, "No moiBTC in pool");
        check("Pool has moiUSD balance", usdBal && Number(usdBal.amount) > 0, "No moiUSD in pool");
    } catch (e) {
        check("Pool has balance", false, e.message);
    }

    // Summary
    console.log(`\n============================================`);
    console.log(`  Results: ${passed} passed, ${failed} failed`);
    console.log(`============================================`);
    if (failed === 0) {
        console.log("  🎉 All checks passed! Challenge 2 complete.\n");
        await syncProgress(MNEMONIC, "2");
    } else {
        console.log("  Keep going! Fix the failing checks.\n");
    }
}

main().catch(console.error);
