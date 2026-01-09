import { Wallet, JsonRpcProvider, MAS0AssetLogic, getLogicDriver } from 'js-moi-sdk';

// Initialize Network Provider (Voyage Devnet)
const provider = new JsonRpcProvider('https://dev.voyage-rpc.moi.technology/devnet');

// ============================================
// Pool Owner Configuration (Liquidity Provider)
// This wallet holds moiBTC and moiUSD for swaps
// ============================================
const POOL_OWNER_MNEMONIC = "fortune toddler true say guilt vacant retire lion luxury come wagon pulp";

// Get pool owner wallet (for signing transfers FROM the pool)
async function getPoolOwnerWallet() {
  const wallet = await Wallet.fromMnemonic(POOL_OWNER_MNEMONIC, "m/44'/6174'/7020'/0/0");
  wallet.connect(provider);
  return wallet;
}

// ============================================
// Mission 1: Connection & Identity
// ============================================
export async function createWallet(mnemonic) {
  const derivationPath = "m/44'/6174'/7020'/0/0";
  const wallet = await Wallet.fromMnemonic(mnemonic, derivationPath);
  wallet.connect(provider);
  
  // Extract address from wallet object
  const address = wallet.address || wallet.identifier?.toHex() || wallet.getIdentifier()?.toHex();
  if (!address) throw new Error('Could not get wallet address');
  
  // Return both wallet and address
  return { wallet, address };
}

// ============================================
// Mission 2: Reading State (The Digital Backpack)
// ============================================
export async function getAccountAssets(address) {
  // Query the Account State directly
  const userAssetEntries = await provider.getTDU(address);
  
  // Guard Rail 1: If the user is new, stop here
  if (!userAssetEntries || !Array.isArray(userAssetEntries)) {
    return null;
  }
  
  // Loop through every asset to find its human-readable Symbol
  const accountAssets = await Promise.all(
    userAssetEntries.map(async (assetEntry) => {
      try {
        // Try to fetch the symbol
        const assetInfo = await provider.getAssetInfoByAssetID(assetEntry.asset_id);
        return {
          id: assetEntry.asset_id,
          balance: BigInt(assetEntry.amount).toString(),
          symbol: assetInfo?.symbol
        };
      } catch {
        // Guard Rail 2: If metadata fetch fails, return asset without symbol
        return {
          id: assetEntry.asset_id,
          balance: BigInt(assetEntry.amount).toString(),
          symbol: undefined
        };
      }
    })
  );
  
  return accountAssets;
}

// ============================================
// Mission 3: Creating your own MAS0 asset on MOI
// ============================================
export async function createAsset(wallet, symbol, supply) {
  // Manager is the wallet identifier (the controller of this asset)
  const managerAddress = wallet.getIdentifier().toHex();
  
  // Create MAS0 asset using create() - this creates the asset
  const response = await MAS0AssetLogic.create(
    wallet,
    symbol,
    parseInt(supply),
    managerAddress,
    true // enableEvents
  ).send();
  
  // Wait for network confirmation
  const receipt = await response.wait();
  
  // Pull the result (SDK may return structured output here)
  const result = await response.result();
  
  // Extract Asset ID from result or fallback to receipt fields
  const assetId = result?.asset_id || 
                  receipt?.ix_operations?.[0]?.data?.asset_id ||
                  receipt?.extra_data?.asset_id;
  
  // After creation, mint the supply to the creator's account
  // The manager (creator) can mint tokens up to the total supply
  if (assetId) {
    const assetLogic = new MAS0AssetLogic(assetId, wallet);
    const creatorAddress = wallet.getIdentifier().toHex();
    
    try {
      // Mint the entire supply to the creator
      const mintResponse = await assetLogic.mint(creatorAddress, BigInt(supply)).send();
      await mintResponse.wait();
    } catch (mintError) {
      // Mint may fail if already minted or if there's an issue
      // Silently continue - the asset was created successfully
    }
  }
  
  return { hash: response.hash, receipt, assetId };
}

// ============================================
// Mission 4: Utilizing Assets (Transfer)
// ============================================
export async function transfer(wallet, assetId, receiverAddress, transferAmount) {
  // 1. Initialize the Logic
  // We bind the Asset ID to the Wallet so the SDK knows WHO is signing
  const assetLogic = new MAS0AssetLogic(assetId, wallet);
  
  // 2. Execute Transfer (Sign & Broadcast)
  // We use BigInt because token amounts are too large for standard JS numbers
  const transferResponse = await assetLogic.transfer(receiverAddress, BigInt(transferAmount)).send();
  
  // 3. Await Consensus
  // The code pauses here until the network confirms the action
  const transactionReceipt = await transferResponse.wait();
  
  return { hash: transferResponse.hash, receipt: transactionReceipt };
}

// ============================================
// Mission 5: SimpleSwap - DeFi Token Swap
// Contract records swaps, JS handles token transfers
// ============================================

// Swap contract configuration
export const SWAP_CONFIG = {
  LOGIC_ID: "0x20000000e4be8c0d3dfb192c2b4aff94d06842143777b9c197d16f5d00000000",
  POOL_OWNER: "0x000000008ef2c197c13948dd9ea777e9673afbfecf8d57b21456374f00000000",
  moiBTC: {
    id: "0x10030000eb02d2115f16899ad2a43147893f51868eb8683c7ea6a89d00000000",
    symbol: "moiBTC",
    decimals: 0,
    icon: "₿"
  },
  moiUSD: {
    id: "0x100300003afd81730f00c0c4522ae4736028c700e54875f4f20ed3ff00000000",
    symbol: "moiUSD",
    decimals: 0,
    icon: "$"
  },
  RATE: 50000
};

// ============================================
// Execute Swap: 
// 1. User sends token to pool owner
// 2. Record swap on contract (for stats/events)
// 3. Pool owner sends token back to user
// ============================================
export async function executeSwap(userWallet, inputToken, inputAmount) {
  const userAddress = userWallet.getIdentifier().toHex();
  const poolOwnerWallet = await getPoolOwnerWallet();
  const amountBigInt = BigInt(inputAmount);
  
  // Get the swap contract driver
  const swapContract = await getLogicDriver(SWAP_CONFIG.LOGIC_ID, userWallet);
  
  if (inputToken === 'moiBTC') {
    // Swap moiBTC → moiUSD
    const outputAmount = amountBigInt * BigInt(SWAP_CONFIG.RATE);
    
    // Step 1: User transfers moiBTC TO pool owner (user signs)
    const userBTCLogic = new MAS0AssetLogic(SWAP_CONFIG.moiBTC.id, userWallet);
    await (await userBTCLogic.transfer(SWAP_CONFIG.POOL_OWNER, amountBigInt).send()).wait();
    
    // Step 2: Record swap on contract (emits event, updates stats)
    try {
      const contractTx = await swapContract.routines.SwapAtoB(amountBigInt);
      await contractTx.wait();
    } catch (e) {
      console.log('Contract record skipped:', e.message);
    }
    
    // Step 3: Pool owner transfers moiUSD TO user (pool owner signs)
    const poolUSDLogic = new MAS0AssetLogic(SWAP_CONFIG.moiUSD.id, poolOwnerWallet);
    const swapTx = await poolUSDLogic.transfer(userAddress, outputAmount).send();
    const receipt = await swapTx.wait();
    
    return {
      hash: swapTx.hash,
      receipt,
      success: receipt.status === 0,
      outputAmount: outputAmount.toString()
    };
    
  } else {
    // Swap moiUSD → moiBTC
    const outputAmount = amountBigInt / BigInt(SWAP_CONFIG.RATE);
    
    // Step 1: User transfers moiUSD TO pool owner (user signs)
    const userUSDLogic = new MAS0AssetLogic(SWAP_CONFIG.moiUSD.id, userWallet);
    await (await userUSDLogic.transfer(SWAP_CONFIG.POOL_OWNER, amountBigInt).send()).wait();
    
    // Step 2: Record swap on contract (emits event, updates stats)
    try {
      const contractTx = await swapContract.routines.SwapBtoA(amountBigInt);
      await contractTx.wait();
    } catch (e) {
      console.log('Contract record skipped:', e.message);
    }
    
    // Step 3: Pool owner transfers moiBTC TO user (pool owner signs)
    const poolBTCLogic = new MAS0AssetLogic(SWAP_CONFIG.moiBTC.id, poolOwnerWallet);
    const swapTx = await poolBTCLogic.transfer(userAddress, outputAmount).send();
    const receipt = await swapTx.wait();
    
    return {
      hash: swapTx.hash,
      receipt,
      success: receipt.status === 0,
      outputAmount: outputAmount.toString()
    };
  }
}

// Get swap rate - use config value (fixed rate)
export async function getSwapRate() {
  // Rate is fixed in config, no need to query contract
  return SWAP_CONFIG.RATE;
}

// Calculate swap output amount
export function calculateSwapOutput(inputAmount, inputToken, rate) {
  if (inputToken === 'moiBTC') {
    return inputAmount * rate;
  } else {
    return Math.floor(inputAmount / rate);
  }
}

// Get token balances for swap tokens
export async function getSwapBalances(address) {
  const assets = await getAccountAssets(address);
  if (!assets) return { moiBTC: '0', moiUSD: '0' };
  
  const moiBTC = assets.find(a => a.id === SWAP_CONFIG.moiBTC.id);
  const moiUSD = assets.find(a => a.id === SWAP_CONFIG.moiUSD.id);
  
  return {
    moiBTC: moiBTC?.balance || '0',
    moiUSD: moiUSD?.balance || '0'
  };
}

// Get pool balances (Pool Owner's wallet holds liquidity)
// Fetches owner's moiBTC and moiUSD balances via getTDU
export async function getPoolBalances() {
  try {
    const tdu = await provider.getTDU(SWAP_CONFIG.POOL_OWNER);
    if (!tdu || !Array.isArray(tdu)) return { moiBTC: '0', moiUSD: '0' };
    
    const btcEntry = tdu.find(e => e.asset_id === SWAP_CONFIG.moiBTC.id);
    const usdEntry = tdu.find(e => e.asset_id === SWAP_CONFIG.moiUSD.id);
    
    return {
      moiBTC: btcEntry ? btcEntry.amount.toString() : '0',
      moiUSD: usdEntry ? usdEntry.amount.toString() : '0'
    };
  } catch (error) {
    console.error('Failed to get pool balances:', error);
    return { moiBTC: '0', moiUSD: '0' };
  }
}

// Get pool info from contract
export async function getPoolInfo(wallet) {
  try {
    const swapLogic = await getLogicDriver(SWAP_CONFIG.LOGIC_ID, wallet);
    const response = await swapLogic.routines.GetPoolInfo();
    await response.wait();
    const result = await response.result();
    return result?.output || null;
  } catch (error) {
    console.error('Failed to get pool info:', error);
    return null;
  }
}
