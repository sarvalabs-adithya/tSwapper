import { useState } from 'react';
import {
  createWallet,
  SOULBOUND_CONFIG, SOULBOUND_CODE, issueBadge, tryTransferBadge, getBadgeBalance,
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
      <ChallengeSoulbound wallet={wallet} mnemonic={mnemonic} address={address} />
      <footer className="footer">MOI Sprint &middot; Challenge 1 &middot; Devnet</footer>
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
        <span>Soulbound Badge</span>
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
          <h1>Soulbound Badge</h1>
          <p>Deploy a non-transferable token. Issue badges. Prove they can't move.</p>
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
// CHALLENGE: SOULBOUND BADGE
// ============================================================
function ChallengeSoulbound({ wallet, mnemonic, address }) {
  const { results, running, verify } = useVerify();

  return (
    <div className="challenge-page">
      <div className="ch-page-header">
        <span className="ch-label">Challenge 01</span>
        <h1>Soulbound Badge</h1>
        <p>Soulbound tokens are minted to an address and <strong>can never be transferred</strong>. They represent identity, reputation, or credentials. In this challenge you'll write the contract, deploy it, issue badges, and prove they can't move.</p>
      </div>

      <div className="checkpoints">
        {/* CP 0: Setup */}
        <Checkpoint num="0" title="Setup & Read the Contract"
          result={results.cp0} running={running === 'cp0'}
          onVerify={() => verify('cp0', async () => {
            await createWallet(mnemonic);
            return 'Connected to MOI devnet!';
          })}
          verifyLabel="Test Connection"
        >
          <p>Make sure your environment is ready:</p>
          <pre className="shell">npm install</pre>
          <p>Read the contract reference — this is what your <code>SoulboundBadge.coco</code> should look like when complete:</p>
          <div className="code-block">
            <div className="code-head"><span>logic/SoulboundBadge.coco (reference)</span></div>
            <pre>{SOULBOUND_CODE}</pre>
          </div>
          <div className="callout"><strong>Key insight:</strong> The <code>Transfer</code> endpoint always throws. That's what makes it soulbound.</div>
        </Checkpoint>

        {/* CP 1: Write & Deploy */}
        <Checkpoint num="1" title="Write the Contract & Deploy"
          result={results.cp1} running={running === 'cp1'}
          onVerify={() => verify('cp1', async () => {
            if (!SOULBOUND_CONFIG.ASSET_ID) throw new Error('SOULBOUND_CONFIG.ASSET_ID is empty. Deploy first, then paste the ID into src/lib/logic.js');
            return `Asset ID configured: ${SOULBOUND_CONFIG.ASSET_ID.slice(0, 20)}...`;
          })}
          verifyLabel="Check Config"
        >
          <p><strong>Step 1:</strong> Open <code>logic/SoulboundBadge.coco</code> and fill in the TODO bodies:</p>
          <ol>
            <li><code>Init()</code> — store Sender as admin</li>
            <li><code>IssueBadge()</code> — check admin, then mint</li>
            <li><code>Transfer()</code> — always throw (soulbound!)</li>
          </ol>
          <p><strong>Step 2:</strong> Open <code>deploy.js</code> and fill in the TODOs to deploy using <code>AssetFactory</code></p>
          <pre className="shell">NODE_TLS_REJECT_UNAUTHORIZED=0 node deploy.js</pre>
          <p>Then paste the Asset ID into <code>SOULBOUND_CONFIG.ASSET_ID</code> in <code>src/lib/logic.js</code></p>
        </Checkpoint>

        {/* CP 2: getBadgeBalance */}
        <Checkpoint num="2" title="Implement getBadgeBalance()"
          result={results.cp2} running={running === 'cp2'}
          onVerify={() => verify('cp2', async () => {
            const bal = await getBadgeBalance(address);
            return `Balance: ${bal} badges`;
          })}
          verifyLabel="Verify"
        >
          <p>Open <code>src/lib/logic.js</code> and find the <code>getBadgeBalance()</code> stub. Implement it:</p>
          <div className="code-block">
            <div className="code-head"><span>Hint</span></div>
            <pre>{`// Query the provider for the user's assets
const tdu = await provider.getTDU(address);

// Find the entry matching our soulbound asset
const entry = tdu?.find(e => e.asset_id === SOULBOUND_CONFIG.ASSET_ID);

// Return the balance as a string
return entry ? BigInt(entry.amount).toString() : '0';`}</pre>
          </div>
        </Checkpoint>

        {/* CP 3: issueBadge */}
        <Checkpoint num="3" title="Implement issueBadge()"
          result={results.cp3} running={running === 'cp3'}
          onVerify={() => verify('cp3', async () => {
            const { wallet: w } = await createWallet(mnemonic);
            const res = await issueBadge(w, address);
            return `Badge issued! Hash: ${res.hash?.slice(0, 16)}...`;
          })}
          verifyLabel="Issue Badge to Yourself"
        >
          <p>Find the <code>issueBadge()</code> stub. Use <code>getAssetDriver</code> and call <code>driver.routines.IssueBadge()</code></p>
          <div className="code-block">
            <div className="code-head"><span>Hint</span></div>
            <pre>{`const driver = await getAssetDriver(SOULBOUND_CONFIG.ASSET_ID, wallet);

const response = await driver.routines.IssueBadge(
  recipientAddress,
  new RoutineOption({
    participants: [{
      id: recipientAddress,
      lock_type: LockType.MUTATE_LOCK
    }]
  })
);

const receipt = await response.wait();
return { hash: response.hash, receipt, success: receipt.status === 0 };`}</pre>
          </div>
        </Checkpoint>

        {/* CP 4: tryTransfer */}
        <Checkpoint num="4" title="Try Transfer (watch it fail!)"
          result={results.cp4} running={running === 'cp4'}
          onVerify={() => verify('cp4', async () => {
            const { wallet: w } = await createWallet(mnemonic);
            const target = '0x00000000a880f68bd4c82545a8d4b529c4ca07d35e08128b1e6192f700000000';
            try {
              await tryTransferBadge(w, target);
              throw new Error('Transfer succeeded — it shouldn\'t have! Check your contract.');
            } catch (err) {
              if (err.message.includes("shouldn't have")) throw err;
              return 'Transfer blocked! "Soulbound and cannot be transferred" — that\'s the lesson!';
            }
          })}
          verifyLabel="Attempt Transfer"
        >
          <p>Find the <code>tryTransferBadge()</code> stub. Implement it — same pattern as issueBadge but calling <code>driver.routines.Transfer()</code></p>
          <p>When you click Verify, it <strong>should fail</strong>. That's the whole point of soulbound tokens!</p>
          <div className="callout warn"><strong>Expected:</strong> The contract throws "This asset is Soulbound and cannot be transferred!"</div>
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
          <p>Make sure all checkpoints above are green, then run the CLI test:</p>
          <pre className="shell">NODE_TLS_REJECT_UNAUTHORIZED=0 node test.js</pre>
          <div className="lesson-box">
            <strong>What you learned</strong>
            <p>Soulbound tokens prove identity without being tradeable. You wrote a Coco asset contract, deployed it with <code>AssetFactory</code>, used <code>getAssetDriver</code> to interact with it, and proved that the Transfer endpoint is locked down.</p>
          </div>
        </Checkpoint>
      </div>
    </div>
  );
}
