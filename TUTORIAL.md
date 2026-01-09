# Your first DiApp
## (Native Assets)

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
- **No code/low code:** While we do support coco (our native context oriented programming language) for advanced logics, most use cases of blockchain can be performed with just simple SDK interaction calls (asset creation, burn, mint, transfer) and many more in the works related to agentic AI, e-commerce etc.

You just look in your own **"Digital Backpack."**

### 0.3 Native Assets

Assets are "native" in MOI because the protocol recognizes and manages them directly at the network level. This means core asset actions like create, transfer, mint, burn, approve, and revoke do not require smart contracts. Your assets are first-class objects the chain understands by default.

This is particularly helpful because of two reasons:

- **Ease of development:** Developers can build useful DiApps using standard protocol asset operations via the SDK, without writing, deploying, or maintaining token smart contracts. That means fewer moving parts.
- **Safety:** On contract-centric chains, every token is its own piece of code, and "ERC-20 compliant" doesn't guarantee safe or consistent behavior. With native assets, core actions like transfer/mint/burn follow protocol-enforced, standardized rules, reducing the exposure for token-specific bugs and malicious edge cases. Custom behavior is still possible through custom logic, but the baseline asset layer stays predictable and secure.

#### 0.3.1 MOI Asset Standards (MAS)

If assets are native objects, how does the network know if an asset is a currency (fungible) or a unique collectible (NFT)?

MOI uses **MAS (MOI Asset Standards)**. Think of these as "pre-installed behavior profiles." When you create an asset, you simply tell the network which standard to use, and it automatically enforces the correct rules.

- **MAS0 (Fungible Asset):** The standard for interchangeable tokens, similar to ERC-20 on Ethereum. Every unit is identical to another (e.g., Stablecoins, Loyalty Points). **We will be using MAS0 in this tutorial.**
- **MAS1 (Non-Fungible Asset):** The standard for unique items, similar to ERC-721. Each unit has a unique ID (e.g., Digital Art, Real Estate Deeds).
- **MAS2 (Hybrid Asset):** A standard that mixes both, allowing for complex collections (e.g., A video game inventory containing both Gold Coins and Unique Weapons).

For implementation details check out their docs: https://js-moi-sdk.docs.moi.technology/asset#

### 0.4 Developer Tools Offered (Your MOI Starter Kit)

Before we jump into code, here are the main tools you'll keep bouncing between while building on MOI. Think of this as your toolbelt check before we start the missions.

#### 0.4.1 IOMe (Wallet + Identity)

IOMe is how you create and control your MOI identity. This is where your mnemonic lives and where signatures come from.

You'll use IOMe for:
- **Generating your wallet / mnemonic:** This is the seed your code uses to create a Wallet instance.
- **Connecting to Voyage:** For devnet testing, it's the quickest way to spin up an identity and fund it.

**Important reminder:** if someone gets your mnemonic, they get your account. Treat it like the master key.

#### 0.4.2 Voyage (Explorer + Playgrounds)

Voyage is MOI's official explorer, but it's more than that. It's where you go to see the chain, verify your interactions, and even create test assets without writing code.

You'll use Voyage for:
- **Explorer:** Search any address, asset ID, logic ID, or interaction hash and inspect exactly what happened.
- **Submissions / Receipts:** Your "proof page." If your app says "transfer successful," this is where you confirm the receipt, fuel used, and participants involved.
- **Testnet Faucet:** Grab testnet KMOI (fuel) so you can actually send interactions.
- **Asset Playground:** Quickly create a test token (like TEST) and copy the Asset ID for your app.
- **Logic Playground:** Later, when you deploy custom logic, this is your fastest way to test routines and outputs without building a full UI.

Basically: **Voyage is your debugger + playground.** You'll keep it open in a tab the whole time.

#### 0.4.3 JS-MOI-SDK (The Bridge Between Your App and MOI)

This is what you'll actually code with. js-moi-sdk is how your Next.js/React app talks to the MOI network.

You'll use it for:
- **Provider:** Network connection (read chain data)
- **Wallet/Signer:** Identity (sign and send interactions)
- **Interactions:** Transaction container
- **Operations:** Actions inside an interaction (transfer, mint, burn, create, approve, revoke, etc.)
- **Receipts:** Execution record you wait for after sending an interaction
- **TDU:** "Digital backpack" query for a user's full asset portfolio

**Big picture:** the SDK is your client library, like ethers.js is for Ethereum, but built around MOI's participant-centric model.

### 0.5 Let's Get Started (Setup Checklist)

Before we build anything, we need two things:
1. An identity on MOI (your IOMe wallet)
2. Fuel tokens on devnet (testnet KMOI) so you can send interactions

#### 0.5.1 Create Your IOMe Wallet (Your MOI Identity)

We use the IOMe interface directly inside Voyage.

1. Open [Voyage Devnet](https://voyage.moi.technology)
2. Click **"Generate IOMe Id"**
3. You'll get a 12-word mnemonic (Secret Recovery Phrase)

**CRITICAL:** Copy and save this mnemonic securely. You will use it in code to authorize transactions. **Do not share it with anyone.**

#### 0.5.2 Fund Your Wallet (Get Testnet Fuel)

A fresh wallet starts at 0 KMOI, which means you can't create assets or send transfers yet.

1. In Voyage, find the **"Testnet Faucet"** button
2. Click it to request testnet KMOI
3. Wait ~10 seconds and check your balance

You should see around 100k testnet KMOI.

#### 0.5.3 Make Sure Your Local Setup is Ready

You'll need:
- **Node.js** v16+
- Basic familiarity with React/Next.js and JavaScript

#### 0.5.4 Keep These Open While Building

You'll keep bouncing between:
- [Voyage Explorer](https://voyage.moi.technology) (verify transactions / receipts)
- [JS-MOI-SDK docs](https://js-moi-sdk.docs.moi.technology) (look up classes + methods)
- [MOI Concepts Docs](https://docs.moi.technology) (Understand MOI Fundamentals)
- [Discord](https://discord.gg/GkP7mDw5) (if you get stuck) - Join our discord server and head on to the "dev-chat" channel. Feel free to ask any and all questions.

---

## 1. Introduction

To get you acclimated with native assets, we are going to be building a very simple token transfer application. We will build an interface that allows you to select from your existing assets and transfer them to a participant address specified by the user all without writing a single smart contract, just interactive with the network through javascript SDK calls.

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

### 1.3 Open the Logic File

👉 **Start here:** Open `src/lib/logic.js`. You will see empty functions marked with TODO. Your mission is to implement them using the MOI SDK.

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

const provider = new JsonRpcProvider('https://dev.voyage-rpc.moi.technology/devnet');

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

## Mission 3: Creating Your Own MAS0 Asset on MOI

**Goal:** Create a new MAS0 asset on the MOI network and capture its Asset ID.

### Understanding the Task

On MOI, assets are native, meaning the protocol understands assets as first-class objects out of the box. So "creating a token" doesn't mean writing or deploying token code. Instead, you create an asset through a standard network operation using the SDK.

You have two ways to do this:
- **The Visual Way (Voyage):** Quickest for testing.
- **The Code Way (SDK):** Best for building apps.

### Method 1: The Visual Way (Voyage)

Before we write the code, let's create an asset manually so you can see how easy it is.

1. Go to [Voyage Devnet](https://voyage.moi.technology) and connect your wallet.
2. Open the **Playground** tab in the menu.
3. Ensure "Devnet" is selected. Enter a Symbol (e.g., TEST) and a Supply (e.g., 1000).
4. Click **Create**.
5. Once confirmed, look at the "Submissions" box, click the hash, and find your **Asset ID** under the operations tab (starts with `0x...`). Copy this ID.

### Method 2: The Code Way (SDK)

In this mission, you'll:
- Use your wallet as the signer (the creator).
- Set your wallet identifier as the manager of the asset.
- Create the asset with a symbol and supply.
- Wait for confirmation and extract the newly created Asset ID.

### The Code

Update `src/lib/logic.js` with the function below:

```javascript
export async function createAsset(wallet, symbol, supply) {
  // Manager is the wallet identifier (the controller of this asset)
  const id = wallet.getIdentifier().toHex();

  // Create MAS0 asset using a standard protocol operation
  const response = await MAS0AssetLogic.create(
    wallet,
    symbol,
    parseInt(supply),
    id,
    true // enableEvents
  ).send();

  // Wait for network confirmation
  const receipt = await response.wait();

  // Pull the result (SDK may return structured output here)
  const result = await response.result();

  // Extract Asset ID from result or fallback to receipt fields
  const assetId = result?.asset_id || receipt?.operations?.[0]?.data?.asset_id;

  return { hash: response.hash, receipt, assetId };
}
```

---

## Mission 4: Utilizing Assets (Transfer)

**Goal:** Execute a transfer interaction using the asset you just created.

### Understanding the Task

Congratulations! You have successfully connected to the network (Mission 1), read your digital backpack (Mission 2), and created a brand new native asset (Mission 3).

Now, the final step is to utilize that asset.

The SDK provides a universal class called `MAS0AssetLogic`. Think of it as a universal remote control for Fungible Tokens. You simply punch in the Asset ID, and it gives you access to the entire standard protocol suite.

**Capabilities include:**
- **Core:** transfer, mint, burn
- **Allowance:** approve, revoke
- **Management:** lockup, release

You can view the full list of methods in the [MAS0 Documentation](https://js-moi-sdk.docs.moi.technology/asset#).

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

## Mission 5: Testing & Verification

**Goal:** Validating the transfer function.

### Verify "Write" Logic (The Transfer)

Finally, let's use your application to move these tokens.

1. **Initiate Transfer:** In your app's UI, select the new asset
2. **Set Recipient:** Enter a friend's address or a secondary wallet address you control.
3. **Send:** Click your Transfer button (triggering the logic from Mission 4).

### Final Proof

1. Copy the **Interaction Hash** returned by your app.
2. Paste it into the search bar on [Voyage](https://voyage.moi.technology).
3. Verify that the "From" and "To" addresses match your request.

---

## Next Steps

Congratulations! You've built your first DiApp on MOI. You've learned:

- How to connect to the MOI network
- How to create wallets from mnemonics
- How to read account state (TDU)
- How to create native assets
- How to transfer assets

This foundation can be extended to build DEXs, NFT marketplaces, DeFi apps, and more on MOI.

## Resources

- **JS-MOI-SDK Documentation:** https://js-moi-sdk.docs.moi.technology
- **Voyage Explorer:** https://voyage.moi.technology
- **Discord Community:** https://discord.gg/GkP7mDw5
