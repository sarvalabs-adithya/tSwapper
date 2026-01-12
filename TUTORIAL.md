# Your First DiApp (Native Assets)

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

**The Legacy Problem (Ethereum/Bitcoin/Solana):** These chains operate as Global State Machines.

- **The Single-File Line:** To prevent double-spending, every transaction in the world must be ordered in one single sequence.
- **The Bottleneck:** If Alice pays Bob in Tokyo, and Charlie pays Dave in New York, they are unrelated events. Yet, Legacy Chains force Charlie to wait for Alice. This is why gas fees spike and networks clog—everyone is fighting for the same "Global Lock."

### 0.2 The MOI Solution

MOI removes the "Global Lock" by replacing the Global State Machine with an **Interaction State Machine (ISM)**. It relies on two core technologies:

#### 0.2.1 ISM (Interaction State Machine) — The "Engine"

ISM allows the network to run multiple state machines in parallel.

- **Contextual Execution:** Instead of a single global line, ISM creates a temporary, localized consensus lane for every interaction.
- **Parallelism:** If Alice pays Bob, and Charlie pays Dave, ISM treats them as separate Contexts. They are processed simultaneously by different sets of nodes. This enables horizontal scaling—adding more nodes actually makes the network faster.

#### 0.2.2 Native Assets

Assets are "native" in MOI because the protocol recognizes and manages them directly at the protocol level. This means core asset actions like create, transfer, mint, burn, approve, and revoke **do not require smart contracts**. Your assets are first-class objects the network understands by default.

This is particularly helpful because of two reasons:

- **Ease of development:** Developers can build useful DiApps using standard protocol asset operations via the SDK, without writing, deploying, or maintaining token smart contracts. That means fewer moving parts.
- **Safety:** On contract-centric chains, every token is its own piece of code, and "ERC-20 compliant" doesn't guarantee safe or consistent behavior. With native assets, core actions like transfer/mint/burn follow protocol-enforced, standardized rules, reducing the exposure for token-specific bugs and malicious edge cases.

#### 0.2.3 MOI Asset Standards (MAS)

If assets are native objects, how does the network know if an asset is a currency (fungible) or a unique collectible (NFT)?

MOI uses **MAS (MOI Asset Standards)**. Think of these as "pre-installed behavior profiles." When you create an asset, you simply tell the network which standard to use, and it automatically enforces the correct rules.

- **MAS0 (Fungible Asset):** The standard for interchangeable tokens, similar to ERC-20 on Ethereum. Every unit is identical to another (e.g., Stablecoins, Loyalty Points). **We will be using MAS0 in this tutorial.**
- **MAS1 (Non-Fungible Asset):** The standard for unique items, similar to ERC-721. Each unit has a unique ID (e.g., Digital Art, Real Estate Deeds).
- **MAS2 (Hybrid Asset):** A standard that mixes both, allowing for complex collections (e.g., A video game inventory containing both Gold Coins and Unique Weapons).
- **MASX (Custom Asset):** If you need to create an asset with a specific rule embedded - for example a soulbound token or a token with tax rules then MOI allows you to create your own custom assets.

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

Voyage is MOI's official explorer, but it's more than that. It's where you go to see the protocol, verify your interactions, and even create test assets without writing code.

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
- **Provider:** Network connection (read protocol data)
- **Wallet/Signer:** Identity (sign and send interactions)
- **Interactions:** Transaction container
- **Operations:** Actions inside an interaction (transfer, mint, burn, create, approve, revoke, etc.)
- **Receipts:** Execution record you wait for after sending an interaction
- **TDU:** "Digital backpack" query for a user's full asset portfolio

**Big picture:** the SDK is your client library, like ethers.js is for Ethereum, but built around MOI's participant-centric model.

#### 0.4.4 Coco (Logic Language)

Coco is MOI's official programming language for writing and deploying Logics. It is a statically typed, context-oriented, and indentation-based language designed specifically for MOI's participant-centric execution model. Coco powers the creation of advanced, stateful logic directly on-chain, extending MOI's native capabilities beyond simple asset transfers.

**Purpose:** Coco enables developers to define custom logic that governs on-chain behavior—such as swaps, vaults, permissions, registries, fee mechanisms, or automated routines—while maintaining the efficiency and safety of MOI's execution layer.

Check out [cocolang.dev](https://cocolang.dev) for our official Coco documentation!

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
- [Discord](https://discord.gg/GkP7mDw5) (if you get stuck) - Join our discord server and head on to the "dev-chat" channel.

---

## 1. Introduction

To get you acclimated with native assets, we are going to be building a very simple token transfer application. We will build an interface that allows you to select from your existing assets and transfer them to a participant address specified by the user all without writing a single smart contract, just interacting with the network through JavaScript SDK calls.

### 1.1 Mission Map (What You're About to Build)

This tutorial is split into a set of short missions designed to give you hands-on experience with MOI Native Assets. Each mission teaches one core capability, and by the end you'll know how to build DiApps using protocol-native asset operations (create, mint, transfer, approve) and then bring in Coco Logic when you need custom rules or on-chain coordination.

**What You'll Learn (Mission-by-Mission):**

| Mission | Goal |
|---------|------|
| **Mission 1** | Set up a Provider (network connection) and a Wallet (signer) |
| **Mission 2** | Fetch an account's full asset portfolio using getTDU() |
| **Mission 3** | Create moiBTC and moiUSD tokens (for use in Mission 7!) |
| **Mission 4** | Transfer tokens using the transfer function |
| **Mission 5** | Verify your transfers on Voyage |
| **Mission 6** | Write a Soulbound token using Coco |
| **Mission 7** | Build SimpleSwap using your moiBTC, moiUSD, and transfer function |

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

## Mission 3: Creating moiBTC and moiUSD

**Goal:** Create the two tokens you'll use throughout this tutorial: **moiBTC** and **moiUSD**.

### Understanding the Task

On MOI, assets are native, meaning the protocol understands assets as first-class objects out of the box. So "creating a token" doesn't mean writing or deploying token code. Instead, you create an asset through a standard network operation using the SDK.

In this mission, you'll create two specific tokens that we'll use in **Mission 7 (SimpleSwap)**:
- **moiBTC** - A mock Bitcoin token (supply: 1,000)
- **moiUSD** - A mock USD stablecoin (supply: 100,000,000)

**Save the Asset IDs!** You'll need them for Mission 7.

### The Code

Update `src/lib/logic.js` with the function below:

```javascript
import { MAS0AssetLogic } from 'js-moi-sdk';

export async function createAsset(wallet, symbol, supply) {
  // Manager is the wallet identifier (the controller of this asset)
  const managerAddress = wallet.getIdentifier().toHex();

  // Create MAS0 asset using a standard protocol operation
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
  const assetId = result?.asset_id || receipt?.operations?.[0]?.data?.asset_id;

  // Mint the supply to the creator
  if (assetId) {
    const assetLogic = new MAS0AssetLogic(assetId, wallet);
    const mintResponse = await assetLogic.mint(managerAddress, BigInt(supply)).send();
    await mintResponse.wait();
  }

  return { hash: response.hash, receipt, assetId };
}
```

### Your Task: Create Your Swap Tokens

Using the app UI or a script, create these two assets:

1. **moiBTC**
   - Symbol: `moiBTC`
   - Supply: `1000`
   - Save the Asset ID!

2. **moiUSD**
   - Symbol: `moiUSD`
   - Supply: `100000000`
   - Save the Asset ID!

These will become your liquidity pool for Mission 7's SimpleSwap!

---

## Mission 4: Utilizing Assets (Transfer)

**Goal:** Transfer your moiBTC and moiUSD tokens using the transfer function.

### Understanding the Task

Congratulations! You have successfully connected to the network (Mission 1), read your digital backpack (Mission 2), and created moiBTC and moiUSD (Mission 3).

Now, the final step is to utilize those assets. The SDK provides a universal class called `MAS0AssetLogic`. Think of it as a universal remote control for Fungible Tokens. You simply punch in the Asset ID, and it gives you access to the entire standard protocol suite.

**Capabilities include:**
- **Core:** transfer, mint, burn
- **Allowance:** approve, revoke
- **Management:** lockup, release

You can view the full list of methods in the [MAS0 Documentation](https://js-moi-sdk.docs.moi.technology/asset#).

### The Code

Update the `transfer` function in `src/lib/logic.js`:

```javascript
export async function transfer(wallet, assetId, receiverAddress, transferAmount) {
  // 1. Initialize the Logic
  // We bind the Asset ID to the Wallet so the SDK knows WHO is signing
  const assetLogic = new MAS0AssetLogic(assetId, wallet);

  // 2. Execute Transfer (Sign & Broadcast)
  // We use BigInt because token amounts are too large for standard JS numbers
  const transferResponse = await assetLogic.transfer(
    receiverAddress, 
    BigInt(transferAmount)
  ).send();

  // 3. Await Consensus
  // The code pauses here until the network confirms the action
  const transactionReceipt = await transferResponse.wait();

  return { hash: transferResponse.hash, receipt: transactionReceipt };
}
```

### Your Task: Fund a Second Wallet

For Mission 7, you'll need two wallets:
1. **Pool Owner Wallet** - Holds the liquidity (moiBTC + moiUSD)
2. **Trader Wallet** - The user who will swap

Create a **second IOMe wallet** and transfer some tokens to it:
- Transfer **100 moiBTC** to the trader wallet
- Transfer **5,000,000 moiUSD** to the trader wallet

This sets up both wallets for swapping in Mission 7!

---

## Mission 5: Testing & Verification

**Goal:** Validate your transfer function on Voyage.

### Verify "Write" Logic (The Transfer)

Let's use your application to move these tokens.

1. **Initiate Transfer:** In your app's UI, select moiBTC or moiUSD
2. **Set Recipient:** Enter your second wallet address
3. **Send:** Click your Transfer button (triggering the logic from Mission 4)

### Final Proof

1. Copy the **Interaction Hash** returned by your app
2. Paste it into the search bar on [Voyage](https://voyage.moi.technology)
3. Verify that the "From" and "To" addresses match your request
4. Check that the correct amount was transferred

---

## Mission 6: Custom Logic (Soulbound Token)

**Goal:** Create a "Soulbound" token (SBT) that cannot be transferred, demonstrating how to override standard asset behavior using MOI Logic (Coco).

### 6.1 Understanding the Paradigm Shift

We have successfully built an entire app using Native Assets (MAS0). You minted, transferred, and traded tokens without writing a single line of smart contract code.

But what if you need an asset that **breaks the standard rules**?
- A token that decays over time?
- A "Soulbound" badge that cannot be transferred?
- A stablecoin that algorithmically adjusts its supply?

For that, you need **MOI Logic (Coco)**. In this mission, we stop using the pre-built `MAS0AssetLogic` class and instead define our own Asset Logic Manifest from scratch—giving you total control over how your digital objects behave.

Check out [cocolang.dev](https://cocolang.dev) for our official Coco documentation!

### 6.2 Setup: Initializing Your Logic Workspace

Before we write any code, we need to set up a workspace for our logic. The Coco compiler needs a specific environment to work correctly.

**1. Initialize the Project**

Open your terminal in your project root and run:

```bash
mkdir SoulBound && cd SoulBound
coco nut init
```

**2. Understanding coco.nut**

Running that command generated a file named `coco.nut`. Think of `coco.nut` as the `package.json` for your Logic. It serves two main purposes:
- **Configuration:** It tells the compiler how to build your project.
- **Dependencies:** It tracks any external libraries or standard modules your logic might need.

### 6.3 The Logic: Writing a Soulbound Token

Standard assets (MAS0) allow transfers by default. To make an asset "Soulbound" (non-transferable), we need to write a logic that intercepts the Transfer action and blocks it.

Create a file named `SoulboundBadge.coco`:

```coco
coco asset SoulboundBadge

// 1. STATE: We remember who the admin is
state logic:
    admin Identifier

// 2. DEPLOY: Set the creator as the admin
endpoint deploy Init():
    mutate Sender -> SoulboundBadge.Logic.admin

// 3. MINT: Only Admin can create new badges
endpoint dynamic IssueBadge(recipient Identifier):
    memory admin Identifier
    observe admin <- SoulboundBadge.Logic.admin
    // Guard: Check if sender is admin
    if Sender != admin:
        throw "Only Admin can issue badges!"
    // Mint 1 unit to the recipient
    asset.Mint(token_id: 0, beneficiary: recipient, amount: U256(1))

// 4. TRANSFER: The Custom Rule
// We expose a Transfer endpoint to override the default behavior,
// but we make it fail instantly. This makes the token impossible to move.
endpoint Transfer(beneficiary Identifier, amount U256):
    throw "This asset is Soulbound and cannot be transferred!"
```

**Key Concepts:**
- **`coco asset`**: This keyword signals the MOI Protocol to treat this logic as a Native Asset.
- **Protocol Primitives**: Because you used the `asset` keyword, your logic gains access to `asset.Mint`, `asset.Burn`, and `asset.Transfer`.
- **Overriding Behavior**: By explicitly defining `endpoint Transfer` and making it throw an error, we intercept the standard native behavior.

### 6.4 Compiling Your Logic

Your JavaScript application cannot read `.coco` files directly. To make your Logic understandable to the SDK, we need to compile it into a JSON Manifest.

Run the compilation command in your terminal:

```bash
coco compile SoulboundBadge.coco --format json
```

This command will generate a file named `soulboundbadge.json` containing the ABI (Application Binary Interface) and the bytecode of your logic.

### 6.5 Interacting with Custom Logic

Now that we have defined how the asset behaves, we need to interact with it using the SDK. Unlike standard assets, we use the `AssetDriver` to connect to custom logic.

Create `deploy.js`:

```javascript
import { Wallet, JsonRpcProvider, getAssetDriver, LockType, RoutineOption } from 'js-moi-sdk';
import manifest from './soulboundbadge.json' with { type: 'json' };

// Replace with your mnemonic
const MNEMONIC = "your twelve word mnemonic phrase here";

async function main() {
  console.log("Connecting to MOI Devnet...\n");

  // 1. Setup Wallet & Provider
  const provider = new JsonRpcProvider('https://dev.voyage-rpc.moi.technology/devnet');
  const wallet = await Wallet.fromMnemonic(MNEMONIC, "m/44'/6174'/7020'/0/0");
  wallet.connect(provider);

  const address = wallet.getIdentifier().toHex();
  console.log(`Wallet: ${address}`);

  // 2. Define the Target Asset (The one you deployed)
  const assetId = "0x...your_asset_id...";

  try {
    // 3. Initialize the Asset Driver
    const driver = await getAssetDriver(assetId, wallet);

    // 4. Execute the "IssueBadge" Routine
    const recipientAddress = "0x...recipient_address...";

    const response = await driver.routines.IssueBadge(
      recipientAddress,
      new RoutineOption({
        participants: [
          { id: recipientAddress, lock_type: LockType.MUTATE_LOCK }
        ]
      })
    );

    // 5. Wait for Confirmation
    const receipt = await response.wait();
    console.log(`\nBadge Issued!`);
    console.log(`   Hash: ${response.hash}`);
    console.log(`   Fuel Used: ${receipt.fuel_used}`);
  } catch (error) {
    console.error(`\nFailed: ${error.message}`);
  }
}

main();
```

**Next Steps:** Try to transfer this token using the standard `transfer` function from Mission 4. You will see it fail with: "This asset is Soulbound and cannot be transferred!"

---

## Mission 7: Building SimpleSwap

**Goal:** Build a complete token swap system using your moiBTC and moiUSD from Mission 3, and the transfer function from Mission 4!

### 7.1 Understanding the Architecture

SimpleSwap uses a **hybrid architecture**:
- **Native transfers:** Used for moving tokens (Fast, Simple) - *The same `transfer` function from Mission 4!*
- **Coco contract:** Used for recording swaps on-chain (Stats + Events)

| Component | Function |
|-----------|----------|
| **moiBTC & moiUSD** | The tokens you created in Mission 3 |
| **Pool Owner Wallet** | Your main wallet that holds liquidity |
| **SimpleSwap Contract** | Stores exchange rates, tracks stats, emits events |
| **transfer()** | The same function from Mission 4! |

### 7.2 The Swap Flow (Example: 1 moiBTC → 50,000 moiUSD)

1. **Transfer IN:** User sends 1 moiBTC → Pool Owner (using `transfer()` from Mission 4!)
2. **Record:** Contract records the swap, increments total_swaps, updates volume, emits SwapExecuted
3. **Transfer OUT:** Pool Owner sends 50,000 moiUSD → User (using `transfer()` again!)

**Key Insight:** A swap is just two transfers with some bookkeeping!

### 7.3 Step 1: The Coco Contract

The contract stores configuration and records swaps. It does **not** hold the tokens; the Pool Owner wallet holds the liquidity.

File: `Swap/SimpleSwap.coco`

```coco
coco SimpleSwap

// STATE: Configuration and statistics stored on-chain
state logic:
    rate U64              // Exchange rate: 1 moiBTC = rate moiUSD
    owner Identifier      // Pool owner (can update rate)
    asset_a Identifier    // moiBTC asset ID
    asset_b Identifier    // moiUSD asset ID
    total_swaps U64       // Counter: how many swaps executed
    volume_a U256         // Total moiBTC volume traded
    volume_b U256         // Total moiUSD volume traded

// EVENTS: Emitted on every swap (for indexing and tracking)
event SwapExecuted:
    topic user Identifier
    topic direction U64        // 0 = moiBTC→moiUSD, 1 = moiUSD→moiBTC
    field amount_in U256
    field amount_out U256

// DEPLOY: Initialize the contract with rate and asset IDs
endpoint deploy Init(initial_rate U64, token_a Identifier, token_b Identifier):
    mutate initial_rate -> SimpleSwap.Logic.rate
    mutate Sender -> SimpleSwap.Logic.owner
    mutate token_a -> SimpleSwap.Logic.asset_a
    mutate token_b -> SimpleSwap.Logic.asset_b
    mutate 0 -> SimpleSwap.Logic.total_swaps
    mutate U256(0) -> SimpleSwap.Logic.volume_a
    mutate U256(0) -> SimpleSwap.Logic.volume_b

// SWAP moiBTC → moiUSD: Record the swap and update stats
endpoint dynamic SwapAtoB(amount_in U256) -> (amount_out U256):
    memory current_rate U64
    observe current_rate <- SimpleSwap.Logic.rate
    memory calc_out U256 = amount_in * U256(current_rate)
    memory swaps U64
    memory vol_a U256
    observe swaps <- SimpleSwap.Logic.total_swaps
    observe vol_a <- SimpleSwap.Logic.volume_a
    mutate swaps + 1 -> SimpleSwap.Logic.total_swaps
    mutate vol_a + amount_in -> SimpleSwap.Logic.volume_a
    emit SwapExecuted{
        user: Sender,
        direction: 0,
        amount_in: amount_in,
        amount_out: calc_out
    }
    yield amount_out calc_out

// SWAP moiUSD → moiBTC: Record the reverse swap
endpoint dynamic SwapBtoA(amount_in U256) -> (amount_out U256):
    memory current_rate U64
    observe current_rate <- SimpleSwap.Logic.rate
    memory calc_out U256 = amount_in / U256(current_rate)
    memory swaps U64
    memory vol_b U256
    observe swaps <- SimpleSwap.Logic.total_swaps
    observe vol_b <- SimpleSwap.Logic.volume_b
    mutate swaps + 1 -> SimpleSwap.Logic.total_swaps
    mutate vol_b + amount_in -> SimpleSwap.Logic.volume_b
    emit SwapExecuted{
        user: Sender,
        direction: 1,
        amount_in: amount_in,
        amount_out: calc_out
    }
    yield amount_out calc_out

// VIEW: Read-only queries
endpoint GetRate() -> (rate U64):
    observe rate <- SimpleSwap.Logic.rate

endpoint GetStats() -> (total_swaps U64, volume_a U256, volume_b U256):
    observe total_swaps <- SimpleSwap.Logic.total_swaps
    observe volume_a <- SimpleSwap.Logic.volume_a
    observe volume_b <- SimpleSwap.Logic.volume_b

// ADMIN: Only the owner can update the exchange rate
endpoint dynamic SetRate(new_rate U64):
    memory admin Identifier
    observe admin <- SimpleSwap.Logic.owner
    if Sender != admin:
        throw "Only owner can update rate"
    mutate new_rate -> SimpleSwap.Logic.rate
```

### 7.4 Step 2: Compile the Contract

```bash
cd Swap
coco compile SimpleSwap.coco --format json
```

This generates `simpleswap.json`.

### 7.5 Step 3: Deploy Everything

Update the mnemonic in `Swap/deploy.js` and run:

```bash
cd Swap
NODE_TLS_REJECT_UNAUTHORIZED=0 node deploy.js
```

This script will:
1. Create moiBTC (if not using your existing one)
2. Create moiUSD (if not using your existing one)
3. Deploy the SimpleSwap contract
4. Output the SWAP_CONFIG

Copy the SWAP_CONFIG output to `src/lib/logic.js`.

### 7.6 Step 4: The Swap Logic (JavaScript)

This code orchestrates the **Transfer IN → Record → Transfer OUT** process using the same `transfer` function from Mission 4!

```javascript
import { MAS0AssetLogic, getLogicDriver } from 'js-moi-sdk';

export async function executeSwap(userWallet, inputToken, inputAmount) {
  const userAddress = userWallet.getIdentifier().toHex();
  const poolOwnerWallet = await getPoolOwnerWallet();
  const amount = BigInt(inputAmount);

  // Get contract driver for recording swaps
  const swapContract = await getLogicDriver(SWAP_CONFIG.LOGIC_ID, userWallet);

  if (inputToken === "moiBTC") {
    const outputAmount = amount * BigInt(SWAP_CONFIG.RATE);

    // Step 1: User sends moiBTC to pool owner
    // This uses the SAME transfer logic from Mission 4!
    const userBTC = new MAS0AssetLogic(SWAP_CONFIG.moiBTC.id, userWallet);
    await (await userBTC.transfer(SWAP_CONFIG.POOL_OWNER, amount).send()).wait();

    // Step 2: Record swap on contract
    try {
      const contractTx = await swapContract.routines.SwapAtoB(amount);
      await contractTx.wait();
    } catch (e) {
      console.log("Contract record note:", e.message);
    }

    // Step 3: Pool owner sends moiUSD to user
    // Again, using the SAME transfer pattern!
    const poolUSD = new MAS0AssetLogic(SWAP_CONFIG.moiUSD.id, poolOwnerWallet);
    await (await poolUSD.transfer(userAddress, outputAmount).send()).wait();

    return { success: true, outputAmount: outputAmount.toString() };
  }
  // ... reverse swap logic for moiUSD → moiBTC
}
```

**Notice:** We're reusing the exact same `MAS0AssetLogic.transfer()` pattern from Mission 4! A swap is just orchestrated transfers.

### 7.7 Testing Your Swap

1. **Deploy:** Run `node deploy.js` and copy the config
2. **Start App:** Run `npm run dev`
3. **Login:** Use your trader wallet (not the pool owner)
4. **Swap:** Execute a swap on the frontend
5. **Verify:**
   - Your moiBTC decreases
   - Your moiUSD increases
   - Pool balances update
   - Check the swap on Voyage

---

## Congratulations!

**AND THAT'S A WRAP!!** You have officially built your first DiApp on MOI. You are now one of the first contextual compute developers!

### What You Built

| Mission | Achievement |
|---------|-------------|
| **1** | Connected to MOI network |
| **2** | Read account state with TDU |
| **3** | Created moiBTC and moiUSD |
| **4** | Transferred tokens (reused in Mission 7!) |
| **5** | Verified on Voyage |
| **6** | Built a Soulbound Token with Coco |
| **7** | Built SimpleSwap using your tokens + transfer function! |

### Key Takeaways

1. **Native Assets** eliminate the need for token contracts
2. **The transfer function is reusable** - swaps are just orchestrated transfers!
3. **Coco** is only needed when you want custom behavior or on-chain recording
4. **Participant-Centric** design means your account knows what it owns

### What's Next?

- Build an **NFT marketplace** using MAS1
- Create a **DAO** with voting tokens
- Implement **staking** with the lockup/release operations
- Explore **agentic AI** integrations

---

## 💡 A Note on Architecture

**You don't actually need a smart contract to build a swap.**

Everything in Mission 7 could be accomplished with just two `transfer()` calls:
1. User sends moiBTC → Pool Owner
2. Pool Owner sends moiUSD → User

That's it. Pure native asset transfers. No Coco required.

**So why did we include SimpleSwap.coco?**

To teach you **Hybrid Architecture** — the ability to combine:
- **Native Operations** (fast, simple, protocol-level)
- **Custom Logic** (flexibility, on-chain state, events)

In production apps, you'll often want:
- **Transparency**: On-chain events (`SwapExecuted`) for indexers and UIs
- **Stats Tracking**: `total_swaps`, `volume_a`, `volume_b` stored on-chain
- **Admin Controls**: `SetRate` for governance

This pattern — native transfers for speed, contracts for coordination — is the sweet spot for building on MOI.

**Remember:** Start simple with native assets. Add custom logic only when you need it.

---

## Resources

- **JS-MOI-SDK Documentation:** https://js-moi-sdk.docs.moi.technology
- **Coco Language:** https://cocolang.dev
- **Voyage Explorer:** https://voyage.moi.technology
- **Discord Community:** https://discord.gg/GkP7mDw5
