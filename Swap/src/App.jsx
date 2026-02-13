import { useState } from 'react';
import {
  createWallet,
  SWAP_CONFIG, SWAP_CODE, executeSwap, calculateSwapOutput, getSwapBalances, getPoolBalances, transfer,
} from './lib/logic';

// ============================================================
// APP
// ============================================================
export default function App() {
  const [wallet, setWallet] = useState(null);
  const [mnemonic, setMnemonic] = useState(null);
  const [address, setAddress] = useState('');

  if (!wallet) {
    return <ConnectWallet onConnect={(w, m, a) => { setWallet(w); setMnemonic(m); setAddress(a); }} />;
  }

  return (
    <div className="app">
      <Navbar address={address} onDisconnect={() => { setWallet(null); setMnemonic(null); setAddress(''); }} />
      <ChallengeSwap wallet={wallet} mnemonic={mnemonic} address={address} />
      <footer className="footer">MOI Sprint &middot; Challenge 2 &middot; Devnet</footer>
    </div>
  );
}

// ============================================================
// NAVBAR
// ============================================================
function Navbar({ address, onDisconnect }) {
  return (
    <nav className="nav">
      <div className="nav-logo">
        <span className="logo-mark">&#9671;</span>
        <span>Simple Swap</span>
      </div>
      <div className="nav-wallet">
        <span className="wallet-dot" />
        <span className="wallet-addr">{address.slice(0, 6)}...{address.slice(-4)}</span>
        <button className="wallet-x" onClick={onDisconnect}>&times;</button>
      </div>
    </nav>
  );
}

// ============================================================
// CONNECT
// ============================================================
function ConnectWallet({ onConnect }) {
  const [mn, setMn] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function go(e) {
    e.preventDefault(); setLoading(true); setError('');
    try {
      const { wallet, address } = await createWallet(mn.trim());
      onConnect(wallet, mn.trim(), address);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  return (
    <div className="connect-page">
      <div className="connect-bg" />
      <div className="connect-content">
        <div className="connect-hero">
          <div className="hero-diamond">&#9671;</div>
          <h1>Simple Swap</h1>
          <p>Create tokens, deploy a DEX contract, and execute swaps on MOI.</p>
        </div>
        <form className="connect-card" onSubmit={go}>
          <h2>Connect Wallet</h2>
          <p className="hint">Enter your seed phrase to start</p>
          <textarea value={mn} onChange={e => setMn(e.target.value)} placeholder="12 or 24 word seed phrase..." rows={3} required />
          <button type="submit" disabled={loading}>{loading ? 'Connecting...' : 'Start Challenge'}</button>
          {error && <div className="err">{error}</div>}
        </form>
      </div>
    </div>
  );
}

// ============================================================
// Verify helper
// ============================================================
function useVerify() {
  const [results, setResults] = useState({});
  const [running, setRunning] = useState(null);

  async function verify(id, fn) {
    setRunning(id);
    try {
      const res = await fn();
      setResults(r => ({ ...r, [id]: { ok: true, msg: res || 'Passed!' } }));
    } catch (err) {
      setResults(r => ({ ...r, [id]: { ok: false, msg: err.message } }));
    } finally {
      setRunning(null);
    }
  }

  return { results, running, verify };
}

// ============================================================
// CHECKPOINT component
// ============================================================
function Checkpoint({ num, title, children, result, running, onVerify, verifyLabel }) {
  const [open, setOpen] = useState(false);
  const status = result ? (result.ok ? 'pass' : 'fail') : 'pending';

  return (
    <div className={`checkpoint ${status}`}>
      <button className="cp-header" onClick={() => setOpen(!open)}>
        <span className="cp-status">
          {status === 'pass' ? '✓' : status === 'fail' ? '✗' : num}
        </span>
        <span className="cp-title">{title}</span>
        <span className="cp-toggle">{open ? '−' : '+'}</span>
      </button>
      {open && (
        <div className="cp-body">
          {children}
          {onVerify && (
            <button className="verify-btn" onClick={onVerify} disabled={running}>
              {running ? 'Checking...' : verifyLabel || 'Verify'}
            </button>
          )}
          {result && (
            <div className={`cp-result ${result.ok ? 'pass' : 'fail'}`}>
              {result.ok ? '✓ ' : '✗ '}{result.msg}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================
// CHALLENGE: SIMPLE SWAP
// ============================================================
function ChallengeSwap({ wallet, mnemonic, address }) {
  const { results, running, verify } = useVerify();
  const [inputToken, setInputToken] = useState('moiBTC');
  const [inputAmount, setInputAmount] = useState('');
  const outputToken = inputToken === 'moiBTC' ? 'moiUSD' : 'moiBTC';
  const outputAmount = inputAmount ? calculateSwapOutput(parseInt(inputAmount), inputToken, SWAP_CONFIG.RATE).toString() : '';

  return (
    <div className="challenge-page">
      <div className="ch-page-header">
        <span className="ch-label">Challenge 02</span>
        <h1>Simple Swap</h1>
        <p>A learning DEX on MOI. You'll write the contract, create tokens, deploy everything, and build the JS that handles actual token transfers between the user and the liquidity pool.</p>
      </div>

      <div className="checkpoints">
        {/* CP 0: Read Contract */}
        <Checkpoint num="0" title="Read the Contract"
          result={results.cp0} running={running === 'cp0'}
          onVerify={() => verify('cp0', async () => {
            await createWallet(mnemonic);
            return 'Connected!';
          })}
          verifyLabel="Test Connection"
        >
          <p>This is the reference for what your <code>SimpleSwap.coco</code> should look like when complete:</p>
          <div className="code-block">
            <div className="code-head"><span>SimpleSwap.coco (reference)</span></div>
            <pre>{SWAP_CODE}</pre>
          </div>
          <div className="callout"><strong>Architecture:</strong> The contract does math and stats. JS handles native asset transfers.</div>
        </Checkpoint>

        {/* CP 1: Deploy */}
        <Checkpoint num="1" title="Write Contract, Create Assets & Deploy"
          result={results.cp1} running={running === 'cp1'}
          onVerify={() => verify('cp1', async () => {
            if (!SWAP_CONFIG.LOGIC_ID) throw new Error('SWAP_CONFIG.LOGIC_ID is empty. Deploy first, then paste IDs into src/lib/logic.js');
            if (!SWAP_CONFIG.moiBTC.id) throw new Error('SWAP_CONFIG.moiBTC.id is empty');
            if (!SWAP_CONFIG.moiUSD.id) throw new Error('SWAP_CONFIG.moiUSD.id is empty');
            if (!SWAP_CONFIG.POOL_OWNER) throw new Error('SWAP_CONFIG.POOL_OWNER is empty');
            return 'Config looks good!';
          })}
          verifyLabel="Check Config"
        >
          <p><strong>Step 1:</strong> Open <code>SimpleSwap.coco</code> and fill in the TODO bodies:</p>
          <ol>
            <li><code>Init()</code> — store rate, owner, assets, initialize counters</li>
            <li><code>SwapAtoB()</code> — calculate output, update stats, emit event</li>
            <li><code>SwapBtoA()</code> — same pattern, reverse direction</li>
            <li><code>SetRate()</code> — owner-only rate update</li>
          </ol>
          <p><strong>Step 2:</strong> Open <code>deploy.js</code> and fill in the TODOs to:</p>
          <ol>
            <li>Create moiBTC (supply: 1,000) using <code>MAS0AssetLogic.newAsset()</code></li>
            <li>Create moiUSD (supply: 100,000,000)</li>
            <li>Deploy SimpleSwap using <code>LogicFactory</code> with rate = 50000</li>
          </ol>
          <pre className="shell">NODE_TLS_REJECT_UNAUTHORIZED=0 node deploy.js</pre>
          <p>Then paste <strong>all IDs</strong> into <code>SWAP_CONFIG</code> in <code>src/lib/logic.js</code></p>
        </Checkpoint>

        {/* CP 2: Balances */}
        <Checkpoint num="2" title="Implement getSwapBalances() & getPoolBalances()"
          result={results.cp2} running={running === 'cp2'}
          onVerify={() => verify('cp2', async () => {
            const bal = await getSwapBalances(address);
            const pool = await getPoolBalances();
            return `Your: ${bal.moiBTC} BTC, ${bal.moiUSD} USD | Pool: ${pool.moiBTC} BTC, ${pool.moiUSD} USD`;
          })}
          verifyLabel="Verify"
        >
          <p>Find <code>getSwapBalances()</code> and <code>getPoolBalances()</code> stubs. Implement them:</p>
          <div className="code-block">
            <div className="code-head"><span>getSwapBalances hint</span></div>
            <pre>{`const assets = await getAccountAssets(address);
if (!assets) return { moiBTC: '0', moiUSD: '0' };
const btc = assets.find(a => a.id === SWAP_CONFIG.moiBTC.id);
const usd = assets.find(a => a.id === SWAP_CONFIG.moiUSD.id);
return { moiBTC: btc?.balance || '0', moiUSD: usd?.balance || '0' };`}</pre>
          </div>
          <div className="code-block">
            <div className="code-head"><span>getPoolBalances hint</span></div>
            <pre>{`const tdu = await provider.getTDU(SWAP_CONFIG.POOL_OWNER);
const btc = tdu?.find(e => e.asset_id === SWAP_CONFIG.moiBTC.id);
const usd = tdu?.find(e => e.asset_id === SWAP_CONFIG.moiUSD.id);
return {
  moiBTC: btc ? btc.amount.toString() : '0',
  moiUSD: usd ? usd.amount.toString() : '0'
};`}</pre>
          </div>
        </Checkpoint>

        {/* CP 3: Transfer */}
        <Checkpoint num="3" title="Implement transfer()"
          result={results.cp3} running={running === 'cp3'}
          onVerify={() => verify('cp3', async () => {
            if (!SWAP_CONFIG.moiBTC.id) throw new Error('Deploy first (Checkpoint 1)');
            return 'transfer() is ready — you\'ll use it inside executeSwap() next!';
          })}
          verifyLabel="Check"
        >
          <p>Find the <code>transfer()</code> stub. This is the building block for swaps:</p>
          <div className="code-block">
            <div className="code-head"><span>Hint</span></div>
            <pre>{`const logic = new MAS0AssetLogic(assetId, wallet);
const response = await logic.transfer(receiverAddress, BigInt(transferAmount)).send();
const receipt = await response.wait();
return { hash: response.hash, receipt };`}</pre>
          </div>
        </Checkpoint>

        {/* CP 4: Execute Swap */}
        <Checkpoint num="4" title="Implement executeSwap()"
          result={results.cp4} running={running === 'cp4'}
          onVerify={() => verify('cp4', async () => {
            if (!inputAmount) throw new Error('Enter an amount in the swap box below first');
            const { wallet: w } = await createWallet(mnemonic);
            const res = await executeSwap(w, inputToken, parseInt(inputAmount));
            return `Swapped! Output: ${res.outputAmount} ${outputToken}. Hash: ${res.hash?.slice(0, 16)}...`;
          })}
          verifyLabel="Execute Swap"
        >
          <p>The big one! Implement the 3-step swap flow in <code>executeSwap()</code>:</p>
          <ol>
            <li><strong>User sends</strong> input token to pool owner</li>
            <li><strong>Record swap</strong> on contract (SwapAtoB or SwapBtoA)</li>
            <li><strong>Pool owner sends</strong> output token to user</li>
          </ol>
          <div className="callout"><strong>Tip:</strong> Use <code>getPoolOwnerWallet()</code> (already in logic.js) for step 3.</div>

          <div className="swap-test-box">
            <div className="swap-test-row">
              <div className="swap-test-side">
                <label>You pay</label>
                <input type="number" placeholder="0" value={inputAmount} onChange={e => setInputAmount(e.target.value)} min="0" />
              </div>
              <button className="swap-test-flip" onClick={() => setInputToken(t => t === 'moiBTC' ? 'moiUSD' : 'moiBTC')}>&#8645;</button>
              <div className="swap-test-side">
                <label>You receive</label>
                <input type="text" value={outputAmount} readOnly placeholder="0" />
              </div>
            </div>
            <div className="swap-test-info">{inputToken} &rarr; {outputToken} @ 1:{SWAP_CONFIG.RATE.toLocaleString()}</div>
          </div>
        </Checkpoint>

        {/* CP 5: Final */}
        <Checkpoint num="5" title="Run the Test Suite"
          result={results.cp5} running={running === 'cp5'}
          onVerify={() => verify('cp5', async () => {
            const allDone = results.cp0?.ok && results.cp1?.ok && results.cp2?.ok && results.cp3?.ok && results.cp4?.ok;
            if (!allDone) throw new Error('Complete checkpoints 0-4 first!');
            return 'All checkpoints passed! Run `node test.js` for the full CLI verification.';
          })}
          verifyLabel="Final Check"
        >
          <pre className="shell">NODE_TLS_REJECT_UNAUTHORIZED=0 node test.js</pre>
          <div className="lesson-box">
            <strong>What you learned</strong>
            <p>You built a DEX! Wrote a Coco logic contract, created MAS0 assets, and implemented the hybrid swap flow where the contract handles math and JS handles native token transfers.</p>
          </div>
        </Checkpoint>
      </div>
    </div>
  );
}
