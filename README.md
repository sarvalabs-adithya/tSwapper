# Your first DiApp
## (Without smart contracts)

**By: Adithya Ganesh (DevRel)**

---

## 0. Preface: The "Participant-Centric" Shift

Before we write a single line of code, it is critical to understand that MOI is not just another Ethereum clone. It solves the State Bloat problem by fundamentally changing who owns the data.

### 0.1 What is a Blockchain? (The Engineer's View)

Forget "crypto" for a second. To a developer, a blockchain is simply a **Replicated State Machine**.
- **State:** The current snapshot of data (e.g., "Alice has $10").
- **Transition:** A function that changes the state (e.g., "Alice sends $5 to Bob").
- **Consensus:** The network agrees on the new state.

In older blockchains (like Bitcoin or Ethereum), the Smart Contract is the center of the universe. To find out what you own, you must visit hundreds of different contracts and ask, "Is my name on your list?" This is inefficient and leads to massive network congestion.

### 0.2 The MOI Difference: You are the Center

MOI flips this model. It is **Participant-Centric**.
- **Identity:** Your account is not just a key; it is a **Digital Container** that holds references to your assets.
- **Assets:** Assets are not rows in a contract's database; they are **Logical Objects** that move with you.
- **Advantage:** You don't scan the entire network to find your tokens.
- **No smart contracts:** While we do support coco (our native context oriented programming language) for advanced logics, most use cases of blockchain can be performed with just simple SDK interaction calls (asset creation, burn, mint, transfer) and many more in the works related to agentic AI, e-commerce etc.

You just look in your own **"Digital Backpack."**

---

## 1. Introduction

To get you acclimated with our contract-less approach, we are going to be building a very simple token transfer application. It is very simple, we will build an interface that allows you to select from your existing assets and transfer them to a participant address specified by the user all without writing a single smart contract, just interactive with the network through javascript SDK calls.

### 1.1 Prerequisites

Before we start, it is important that the developer has experience with full stack applications while also having a basic understanding of blockchain.

#### 1.1.1 IOMe Wallet & Devnet Fuel Tokens

Before writing code, you need a valid identity on the MOI network and some Fuel (gas) to pay for transactions.

**Step 1: Create Your IOMe Wallet**

We use the IOMe interface directly on the Voyage Explorer.
- Navigate to [Voyage Devnet](https://voyage.moi.technology).
- Click **"Generate IOMe Id"** to create a new wallet
- **CRITICAL:** When your 12-word Mnemonic (Secret Recovery Phrase) is displayed, copy and save it securely. You will need this string in your code to authorize transactions. **DO NOT SHARE THIS INFO WITH ANYONE**

**Step 2: Fund Your Wallet (The Faucet)**

Your new wallet has 0 testnet KMOI. You cannot send assets or mint tokens without paying network fees.
- Once logged in to Voyage, look for the **"Testnet Faucet"** button
- Click it to request Testnet KMOI tokens.
- Wait ~10 seconds and check your balance, you should see 100k testnet KMOI tokens

**Step 3: Technical Requirements**
- **Node.js:** v16 or higher installed.
- **Experience:** Basic familiarity with React/Next.js and JavaScript (Async/Await).

#### 1.1.2 Community and Resources

**Join the Developer Community**

If you get stuck or have questions about the SDK, join the official Discord server.
- **Discord Invite:** https://discord.gg/GkP7mDw5

**Documentation & Tools**

Keep these resources handy while you build:
- **JS-MOI-SDK Documentation:** js-moi-sdk.docs.moi.technology
- **Voyage Explorer:** voyage.moi.technology (To verify your transactions)

### 1.2 Setup

We have prepared a frontend template for you. It handles the UI/UX so you can focus purely on the blockchain logic.

Run the following commands in your terminal:

```bash
# 1. Clone the scaffold repository
git clone https://github.com/sarvalabs-adithya/tSwapper.git

# 2. Enter the project folder
cd tSwapper

# 3. Install dependencies
npm install
```

**Open the Logic File**

Open `src/lib/logic.js`. You will see empty functions marked with TODO. Your mission is to implement them using the MOI SDK.

---

## Mission 1: Connection & Identity

**Goal:** Initialize the Network Provider and the Wallet Signer.

### Understanding the Task

To interact with the MOI network, we need two components working together. First, we need a **Provider**, which acts as our connection to the blockchain node—it allows us to read data. Second, we need a **Wallet**, which holds our private keys and allows us to sign transactions (write data).

If you were to look at the official documentation for creating a wallet, you would find the Wallet class. Specifically, we want to create a wallet from a recovery phrase, so we look for the `fromMnemonic` method. This method requires two arguments: your 12-word mnemonic string and a "derivation path."

When creating a wallet, we must specify a derivation path. Think of this as a directory structure for your keys; `m/44'/6174'/7020'/0/0` points to your first account (Index 0). If you changed the final digit to 1, you would generate a completely different address from the same mnemonic.

Finally, a wallet by itself is just a key pair sitting in memory. To make it useful, we have to connect it to our provider. This binds the network connection to the signer, allowing the wallet to automatically fetch its own nonce and broadcast transactions.

### The Code

Update `createWallet` in `src/lib/logic.js`:

```javascript
import { Wallet, JsonRpcProvider } from 'js-moi-sdk';

// 1. Initialize Network Provider (Voyage Devnet)
// We define this globally so other functions can use it later
const provider = new JsonRpcProvider('https://dev.voyage-rpc.moi.technology/devnet');

export async function createWallet(mnemonic) {
  // 2. Define standard MOI derivation path 
  const derivationPath = "m/44'/6174'/7020'/0/0";
  // 3. Create Wallet instance from mnemonic
  const wallet = await Wallet.fromMnemonic(mnemonic, derivationPath);
  // 4. Attach provider to enable network IO
  wallet.connect(provider);
  return wallet;
}
```

---

## Mission 2: Reading State (The Digital Backpack)

**Goal:** Retrieve the account's complete asset portfolio in one query.

### Understanding the Task

In traditional blockchains like Ethereum, your wallet is actually kind of "blind." It doesn't know what tokens you own. To find out, it has to go visit every single Token Contract individually and ask, "Does this person have a balance here?" It's inefficient.

MOI is Participant-Centric. Think of your account like a **digital backpack**. The network tracks exactly what is inside it. We call this the **TDU (Total Digital Utility)**.

### Step 1: The "Happy Path"

Let's write the logical flow first. Don't copy this yet—just read it to understand the strategy.

```javascript
// SIMPLIFIED CONCEPT (Do not copy yet)
export async function getAccountAssets(address) {
  // 1. Get the raw list of assets (IDs and Balances)
  const userAssetEntries = await provider.getTDU(address);
  
  // 2. Loop through every asset to find its human-readable Symbol
  const accountAssets = await Promise.all(
    userAssetEntries.map(async (assetEntry) => {
      // Fetch metadata (like "MOI" or "USDC")
      const assetInfo = await provider.getAssetInfoByAssetID(assetEntry.asset_id);
      
      return {
        id: assetEntry.asset_id,
        balance: BigInt(assetEntry.amount).toString(), // Format the big numbers
        symbol: assetInfo.symbol
      };
    })
  );
  
  return accountAssets;
}
```

**What is happening here?**
- We use `Promise.all` because we are firing off multiple queries at once (one for each asset).
- We convert the balance to a string because JavaScript struggles with the massive numbers blockchains use.

### Step 2: The Reality Check (Adding Guard Rails)

In the real world, things break. What if the account is new? The TDU might be null. We need to add guard rails to handle these edge cases gracefully.

### Step 3: The Final Code

Update the `getAccountAssets` function in `src/lib/logic.js` with this robust version:

```javascript
export async function getAccountAssets(address) {
  // 1. Query the Account State directly
  const userAssetEntries = await provider.getTDU(address);
  
  // Guard Rail 1: If the user is new, stop here.
  // We return null so the UI knows to show an empty state.
  if (!userAssetEntries || !Array.isArray(userAssetEntries)) {
    return null;
  }
  
  const accountAssets = await Promise.all(
    userAssetEntries.map(async (assetEntry) => {
      try {
        // 2. Try to fetch the symbol
        const assetInfo = await provider.getAssetInfoByAssetID(assetEntry.asset_id);
        return {
          id: assetEntry.asset_id,
          balance: BigInt(assetEntry.amount).toString(),
          symbol: assetInfo?.symbol
        };
      } catch {
        // Guard Rail 2: If metadata fails, don't crash! 
        // Return the asset anyway, just without a symbol.
        return {
          id: assetEntry.asset_id,
          balance: BigInt(assetEntry.amount).toString(),
          symbol: undefined // The UI will handle this
        };
      }
    })
  );
  
  return accountAssets;
}
```

---

## Mission 3: Writing State (Transfer)

**Goal:** Execute an asset transfer.

### Understanding the Task

In most blockchains, to interact with a token, you need two things:
- The Contract Address.
- The ABI (The specific code interface for that contract).

If you lose the ABI, you can't talk to the contract. It's like trying to make a phone call without knowing the language the other person speaks.

MOI simplifies this with **MAS0 (MOI Asset Standard 0)**. The SDK provides a universal class called `MAS0AssetLogic`. You can think of this as a remote. You don't need to know the specific code of the token; you just punch in the Asset ID, and this logic knows exactly how to format, sign, and broadcast standard actions like transfer, mint, or burn.

### The "Three Steps" of a Transaction

When writing state to a blockchain, we always follow this pattern:
1. **Initialize:** Create the logic object that links the Asset ID to your Wallet.
2. **Send:** Ask the SDK to build the transaction, sign it with your key, and broadcast it to the network. This happens instantly.
3. **Wait:** The transaction is floating in the mempool. We must wait for a validator to pick it up and add it to a block.

### The Final Code

Update the `transfer` function in `src/lib/logic.js` with the code below. It maps perfectly to those three steps.

```javascript
import { MAS0AssetLogic } from 'js-moi-sdk';

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
```

---

## Mission 4: Testing & Verification

**Goal:** Validating the transfer function.

To test a transfer, you need something to transfer! Since we haven't written a minting script yet, we will use the Voyage Explorer to simulate a real-world scenario where a user already owns assets (like having bought them on an exchange) and just wants to use your wallet to move them.

### Step 1: Get Assets (The Visual Way)

We will create a test token directly on the network using the official explorer.

- **Access Voyage:** Go to [Voyage Devnet](https://voyage.moi.technology) and connect your IOMe wallet.
- **Open Playground:** Navigate to the **Asset Playground** tab in the menu.
- **Create Token:** Ensure "Devnet" is selected. Enter a Symbol (e.g., TEST) and a Supply (e.g., 1000), then click Create.
- **Find the Asset ID:**
  - Look at the "Submissions" box on the right side of the screen.
  - Wait for your interaction to appear and click on the latest Interaction Hash.
  - Scroll down to the Operations tab.
  - Locate and Copy the Asset ID (it will look like a long alphanumeric string).

**Note:** Voyage has many advanced capabilities for inspecting network state. We are using it here to demonstrate that for testing purposes, you truly need "no code" to get started.

### Step 2: Verify "Read" Logic (The Backpack Check)

Now that the asset exists on the network, we need to prove your application can "see" it.

- **Refresh your DiApp:** Reload your local application.
- **Check the List:** Look at the asset list generated by your `getAccountAssets` function (from Mission 2).
- **Verification:**
  - **Success:** You see TEST (or your symbol) with a balance of 1000 in the list. This confirms your app is correctly reading the global state.
  - **Failure:** If the list is empty, check your console for errors or ensure your wallet address matches the one used on Voyage.

### Step 3: Verify "Write" Logic (The Transfer)

Finally, let's use your application to move these tokens.

- **Initiate Transfer:** In your app's UI, select the new asset (or paste the Asset ID you copied).
- **Set Recipient:** Enter a friend's address or a secondary wallet address you control.
- **Send:** Click your Transfer button (triggering the logic from Mission 3).
- **Confirm:** Sign the request in your wallet when prompted.
- **Final Proof:**
  - Copy the Transaction Hash returned by your app.
  - Paste it into the search bar on Voyage.
  - Verify that the "From" and "To" addresses match your request.

---

## Next Steps

Congratulations! You've built your first DiApp on MOI. You've learned:

- How to connect to the MOI network
- How to create wallets from mnemonics
- How to read account state (TDU)
- How to transfer assets

This foundation can be extended to build DEXs, NFT marketplaces, DeFi apps, and more on MOI.

## Resources

- **JS-MOI-SDK Documentation:** js-moi-sdk.docs.moi.technology
- **Voyage Explorer:** voyage.moi.technology
- **Discord Community:** https://discord.gg/GkP7mDw5
