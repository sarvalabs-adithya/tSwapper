import { Wallet, JsonRpcProvider, MAS0AssetLogic } from 'js-moi-sdk';

const provider = new JsonRpcProvider('https://dev.voyage-rpc.moi.technology/devnet');

export async function createWallet(mnemonic) {
  const derivationPath = "m/44'/6174'/7020'/0/0";
  const wallet = await Wallet.fromMnemonic(mnemonic, derivationPath);
  wallet.connect(provider);
  return wallet;
}

export function getAddress(wallet) {
  if (wallet.address) return wallet.address;
  if (wallet.identifier?.toHex) return wallet.identifier.toHex();
  if (wallet.getIdentifier) return wallet.getIdentifier().toHex();
  throw new Error('Could not get wallet address');
}

export async function getAccountAssets(address) {
  const userAssetEntries = await provider.getTDU(address);
  
  if (!userAssetEntries || !Array.isArray(userAssetEntries)) {
    return null;
  }
  
  const accountAssets = await Promise.all(
    userAssetEntries.map(async (assetEntry) => {
      try {
        const assetInfo = await provider.getAssetInfoByAssetID(assetEntry.asset_id);
        return {
          id: assetEntry.asset_id,
          balance: BigInt(assetEntry.amount).toString(),
          symbol: assetInfo?.symbol
        };
      } catch {
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

export async function transfer(wallet, assetId, receiverAddress, transferAmount) {
  const assetLogic = new MAS0AssetLogic(assetId, wallet);
  const transferResponse = await assetLogic.transfer(receiverAddress, BigInt(transferAmount)).send();
  const transactionReceipt = await transferResponse.wait();
  return { hash: transferResponse.hash, receipt: transactionReceipt };
}
