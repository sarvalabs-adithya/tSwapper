import { Wallet, JsonRpcProvider, AssetDriver, getAssetDriver, LockType, RoutineOption } from 'js-moi-sdk';
import manifest from './logic/soulboundbadge.json' with { type: 'json' };

// ⚠️ REPLACE WITH YOUR MNEMONIC
const MNEMONIC = "fortune toddler true say guilt vacant retire lion luxury come wagon pulp";

async function deploy() {
    console.log("🔗 Connecting to MOI Devnet...\n");
    
    // Setup wallet
    const provider = new JsonRpcProvider('https://dev.voyage-rpc.moi.technology/devnet');
    const wallet = await Wallet.fromMnemonic(MNEMONIC, "m/44'/6174'/7020'/0/0");
    wallet.connect(provider);
    
    const address = wallet.getIdentifier().toHex();
    console.log(`👛 Wallet: ${address}`);
    
    // Asset config
    const symbol = "SBT";
    const supply = 1000000;
    
    console.log(`\n🚀 Deploying Soulbound Asset...`);
    console.log(`   Symbol: ${symbol}`);
    console.log(`   Supply: ${supply}`);
    console.log(`   Manager: ${address}\n`);
    
    try {
        const assetId = "0x1003ffff4960e5b0be3331c63e9e02ab3f833ff3121c89697aff92a200000000";
        const ad = await getAssetDriver(assetId, wallet)

        const response = await ad.routines.IssueBadge("0x00000000a880f68bd4c82545a8d4b529c4ca07d35e08128b1e6192f700000000", new RoutineOption({
            participants: [
                {
                    id: "0x00000000a880f68bd4c82545a8d4b529c4ca07d35e08128b1e6192f700000000",
                    lock_type: LockType.MUTATE_LOCK
                }
            ]
        }))

        console.log(response)
        
    } catch (error) {
        console.error(`\n❌ Failed: ${error.message}`);
    }
}

deploy();
