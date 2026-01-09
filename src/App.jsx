import { useState, useEffect, useCallback } from 'react';
import { createWallet, getAccountAssets, transfer, createAsset, SWAP_CONFIG, getSwapRate, calculateSwapOutput, executeSwap, getSwapBalances, getPoolBalances } from './lib/logic';

export default function App() {
  const [wallet, setWallet] = useState(null);
  const [mnemonic, setMnemonic] = useState(null);
  const [address, setAddress] = useState('');
  const [activeTab, setActiveTab] = useState('swap');

  if (!wallet) {
    return <Login onLogin={(w, mnem, addr) => { 
      setWallet(w); 
      setMnemonic(mnem); 
      setAddress(addr); 
    }} />;
  }

  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="logo">
          <span className="logo-icon">⟡</span>
          <span className="logo-text">tSwap</span>
        </div>
        <div className="nav-tabs">
          <button 
            className={`nav-tab ${activeTab === 'swap' ? 'active' : ''}`}
            onClick={() => setActiveTab('swap')}
          >
            Swap
          </button>
          <button 
            className={`nav-tab ${activeTab === 'portfolio' ? 'active' : ''}`}
            onClick={() => setActiveTab('portfolio')}
          >
            Portfolio
          </button>
        </div>
        <div className="wallet-badge">
          <span className="wallet-dot"></span>
          <span className="wallet-address">{address.slice(0, 6)}...{address.slice(-4)}</span>
          <button className="disconnect-btn" onClick={() => {
            setWallet(null);
            setMnemonic(null);
            setAddress('');
          }}>×</button>
        </div>
      </nav>

      <main className="main-content">
        {activeTab === 'swap' ? (
          <SwapPanel wallet={wallet} mnemonic={mnemonic} address={address} />
        ) : (
          <PortfolioPanel wallet={wallet} mnemonic={mnemonic} address={address} />
        )}
      </main>

      <footer className="footer">
        <span>Powered by MOI Network</span>
        <span className="footer-dot">•</span>
        <span>Devnet</span>
      </footer>
    </div>
  );
}

function SwapPanel({ wallet, mnemonic, address }) {
  const [inputToken, setInputToken] = useState('moiBTC');
  const [outputToken, setOutputToken] = useState('moiUSD');
  const [inputAmount, setInputAmount] = useState('');
  const [outputAmount, setOutputAmount] = useState('');
  const [balances, setBalances] = useState({ moiBTC: '0', moiUSD: '0' });
  const [poolBalances, setPoolBalances] = useState({ moiBTC: '0', moiUSD: '0' });
  const [rate, setRate] = useState(SWAP_CONFIG.RATE);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [priceImpact, setPriceImpact] = useState(0);

  // Load balances and rate
  const loadData = useCallback(async () => {
    try {
      const { wallet: freshWallet } = await createWallet(mnemonic);
      const [newBalances, newRate, newPoolBalances] = await Promise.all([
        getSwapBalances(address),
        getSwapRate(), // Fixed rate from config
        getPoolBalances() // Uses hardcoded pool owner
      ]);
      setBalances(newBalances);
      setRate(newRate);
      setPoolBalances(newPoolBalances);
    } catch (err) {
      console.error('Failed to load data:', err);
    }
  }, [address, mnemonic]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Calculate output when input changes
  useEffect(() => {
    if (inputAmount && !isNaN(inputAmount)) {
      const amount = parseInt(inputAmount);
      const output = calculateSwapOutput(amount, inputToken, rate);
      setOutputAmount(output.toString());
      // Simulate small price impact for UX
      setPriceImpact(Math.min(amount * 0.001, 0.5));
    } else {
      setOutputAmount('');
      setPriceImpact(0);
    }
  }, [inputAmount, inputToken, rate]);

  // Swap tokens
  const handleSwapTokens = () => {
    setInputToken(outputToken);
    setOutputToken(inputToken);
    setInputAmount(outputAmount);
    setOutputAmount(inputAmount);
  };

  // Execute swap (approve + swap in one flow)
  const handleSwap = async () => {
    if (!inputAmount || loading) return;
    
    setLoading(true);
    setResult(null);
    
    try {
      const { wallet: freshWallet } = await createWallet(mnemonic);
      
      // Full flow: Transfer to pool → Record on contract → Receive from pool
      const { hash, success } = await executeSwap(freshWallet, inputToken, parseInt(inputAmount));
      
      setResult({
        success: true,
        message: `✅ Swapped ${inputAmount} ${inputToken} → ${outputAmount} ${outputToken}`,
        hash
      });
      
      setInputAmount('');
      setOutputAmount('');
      loadData();
    } catch (err) {
      setResult({ success: false, message: `Swap failed: ${err.message}` });
    } finally {
      setLoading(false);
    }
  };

  const inputBalance = inputToken === 'moiBTC' ? balances.moiBTC : balances.moiUSD;
  const outputBalance = outputToken === 'moiBTC' ? balances.moiBTC : balances.moiUSD;
  const inputConfig = inputToken === 'moiBTC' ? SWAP_CONFIG.moiBTC : SWAP_CONFIG.moiUSD;
  const outputConfig = outputToken === 'moiBTC' ? SWAP_CONFIG.moiBTC : SWAP_CONFIG.moiUSD;

  return (
    <div className="swap-container">
      <div className="swap-header">
        <h2>Swap</h2>
        <button className="settings-btn" onClick={loadData}>↻</button>
      </div>

      <div className="swap-card">
        {/* Input Section */}
        <div className="token-section input-section">
          <div className="token-row">
            <span className="token-label">You pay</span>
            <span className="token-balance">Balance: {Number(inputBalance).toLocaleString()}</span>
          </div>
          <div className="token-input-row">
            <input
              type="number"
              className="token-amount-input"
              placeholder="0"
              value={inputAmount}
              onChange={e => setInputAmount(e.target.value)}
              min="0"
              max={inputBalance}
            />
            <button className="token-selector">
              <span className="token-icon">{inputConfig.icon}</span>
              <span className="token-symbol">{inputConfig.symbol}</span>
            </button>
          </div>
          <div className="token-actions">
            <button className="percent-btn" onClick={() => setInputAmount(Math.floor(inputBalance * 0.25).toString())}>25%</button>
            <button className="percent-btn" onClick={() => setInputAmount(Math.floor(inputBalance * 0.5).toString())}>50%</button>
            <button className="percent-btn" onClick={() => setInputAmount(Math.floor(inputBalance * 0.75).toString())}>75%</button>
            <button className="percent-btn max" onClick={() => setInputAmount(inputBalance)}>MAX</button>
          </div>
        </div>

        {/* Swap Button */}
        <button className="swap-direction-btn" onClick={handleSwapTokens}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M7 10l5-5 5 5M7 14l5 5 5-5"/>
          </svg>
        </button>

        {/* Output Section */}
        <div className="token-section output-section">
          <div className="token-row">
            <span className="token-label">You receive</span>
            <span className="token-balance">Balance: {Number(outputBalance).toLocaleString()}</span>
          </div>
          <div className="token-input-row">
            <input
              type="text"
              className="token-amount-input"
              placeholder="0"
              value={outputAmount}
              readOnly
            />
            <button className="token-selector">
              <span className="token-icon">{outputConfig.icon}</span>
              <span className="token-symbol">{outputConfig.symbol}</span>
            </button>
          </div>
        </div>

        {/* Rate Info */}
        {inputAmount && (
          <div className="swap-info">
            <div className="info-item">
              <span>Rate</span>
              <span className="info-value">1 moiBTC = {rate.toLocaleString()} moiUSD</span>
            </div>
            <div className="info-item">
              <span>Price Impact</span>
              <span className="info-value impact">&lt; {priceImpact.toFixed(2)}%</span>
            </div>
            <div className="info-item">
              <span>Network</span>
              <span className="info-value">MOI Devnet</span>
            </div>
          </div>
        )}

        {/* Swap Button */}
        <button 
          className="swap-execute-btn"
          onClick={handleSwap}
          disabled={loading || !inputAmount || parseInt(inputAmount) > parseInt(inputBalance)}
        >
          {loading ? (
            <><span className="loader"></span>Swapping...</>
          ) : !inputAmount ? (
            'Enter amount'
          ) : parseInt(inputAmount) > parseInt(inputBalance) ? (
            'Insufficient balance'
          ) : (
            `Swap ${inputToken} → ${outputToken}`
          )}
        </button>

        {/* Result */}
        {result && (
          <div className={`swap-result ${result.success ? 'success' : 'error'}`}>
            <span>{result.message}</span>
            {result.hash && (
              <a 
                href={`https://voyage.moi.technology/interaction/${result.hash}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="tx-link"
              >
                View TX →
              </a>
            )}
          </div>
        )}
      </div>

      {/* Your Balances */}
      <div className="swap-stats">
        <div className="stat-card">
          <span className="stat-label">Your moiBTC</span>
          <span className="stat-value">{Number(balances.moiBTC).toLocaleString()}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Your moiUSD</span>
          <span className="stat-value">{Number(balances.moiUSD).toLocaleString()}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Rate</span>
          <span className="stat-value">1:{rate.toLocaleString()}</span>
        </div>
      </div>

      {/* Pool Liquidity */}
      <div className="pool-stats">
        <div className="pool-header">
          <span className="pool-title">🏊 Liquidity Pool</span>
        </div>
        <div className="pool-bars">
          <div className="pool-bar">
            <div className="pool-bar-label">
              <span>₿ moiBTC</span>
              <span>{Number(poolBalances.moiBTC).toLocaleString()}</span>
            </div>
            <div className="pool-bar-track">
              <div className="pool-bar-fill btc" style={{ width: `${Math.min(Number(poolBalances.moiBTC) / 100 * 100, 100)}%` }}></div>
            </div>
          </div>
          <div className="pool-bar">
            <div className="pool-bar-label">
              <span>$ moiUSD</span>
              <span>{Number(poolBalances.moiUSD).toLocaleString()}</span>
            </div>
            <div className="pool-bar-track">
              <div className="pool-bar-fill usd" style={{ width: `${Math.min(Number(poolBalances.moiUSD) / 5000000 * 100, 100)}%` }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PortfolioPanel({ wallet, mnemonic, address }) {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [showTransfer, setShowTransfer] = useState(false);

  useEffect(() => {
    loadAssets();
  }, [address]);

  async function loadAssets() {
    setLoading(true);
    try {
      const data = await getAccountAssets(address);
      setAssets(data || []);
    } catch (err) {
      console.error('Failed to load assets:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="portfolio-container">
      <div className="portfolio-header">
        <h2>Portfolio</h2>
        <button className="settings-btn" onClick={loadAssets}>↻</button>
      </div>

      {loading ? (
        <div className="loading-state">Loading assets...</div>
      ) : assets.length === 0 ? (
        <div className="empty-state">No assets found</div>
      ) : (
        <div className="asset-grid">
          {assets.map(asset => (
            <div 
              key={asset.id} 
              className={`asset-card ${selectedAsset?.id === asset.id ? 'selected' : ''}`}
              onClick={() => setSelectedAsset(asset)}
            >
              <div className="asset-icon">
                {asset.symbol === 'moiBTC' ? '₿' : asset.symbol === 'moiUSD' ? '$' : '◈'}
              </div>
              <div className="asset-info">
                <span className="asset-symbol">{asset.symbol || 'Unknown'}</span>
                <span className="asset-balance">{Number(asset.balance).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedAsset && (
        <div className="asset-detail-card">
          <div className="detail-header">
            <h3>{selectedAsset.symbol || 'Unknown Asset'}</h3>
            <span className="detail-balance">{Number(selectedAsset.balance).toLocaleString()}</span>
          </div>
          <div className="detail-id">{selectedAsset.id}</div>
          <button 
            className="transfer-btn"
            onClick={() => setShowTransfer(!showTransfer)}
          >
            {showTransfer ? 'Cancel' : 'Transfer'}
          </button>
          
          {showTransfer && (
            <TransferForm
              mnemonic={mnemonic}
              asset={selectedAsset}
              onSuccess={() => {
                setShowTransfer(false);
                loadAssets();
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}

function TransferForm({ mnemonic, asset, onSuccess }) {
  const [receiver, setReceiver] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const { wallet } = await createWallet(mnemonic);
      await transfer(wallet, asset.id, receiver, parseInt(amount));
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="transfer-form" onSubmit={handleSubmit}>
      <input
        placeholder="Receiver address (0x...)"
        value={receiver}
        onChange={e => setReceiver(e.target.value)}
        required
      />
      <div className="amount-input-row">
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          min="1"
          max={asset.balance}
          required
        />
        <button type="button" className="max-btn" onClick={() => setAmount(asset.balance)}>MAX</button>
      </div>
      <button type="submit" disabled={loading}>
        {loading ? 'Sending...' : `Send ${asset.symbol || 'Asset'}`}
      </button>
      {error && <div className="form-error">{error}</div>}
    </form>
  );
}

function Login({ onLogin }) {
  const [mnemonic, setMnemonic] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const { wallet, address } = await createWallet(mnemonic.trim());
      onLogin(wallet, mnemonic.trim(), address);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-container">
      <div className="login-bg"></div>
      <div className="login-content">
        <div className="login-hero">
          <div className="hero-icon">⟡</div>
          <h1>tSwap</h1>
          <p>DeFi on MOI Network</p>
        </div>
        
        <form className="login-card" onSubmit={handleSubmit}>
          <h2>Connect Wallet</h2>
          <p className="login-subtitle">Enter your seed phrase to access tSwap</p>
          
          <textarea 
            value={mnemonic}
            onChange={e => setMnemonic(e.target.value)}
            placeholder="Enter your 12 or 24 word seed phrase..."
            required
          />
          
          <button type="submit" disabled={loading}>
            {loading ? <><span className="loader"></span>Connecting...</> : 'Connect Wallet'}
          </button>
          
          {error && <div className="login-error">{error}</div>}
        </form>

        <div className="login-features">
          <div className="feature">
            <span className="feature-icon">⚡</span>
            <span>Instant Swaps</span>
          </div>
          <div className="feature">
            <span className="feature-icon">🔒</span>
            <span>Non-Custodial</span>
          </div>
          <div className="feature">
            <span className="feature-icon">💎</span>
            <span>Fixed Rates</span>
          </div>
        </div>
      </div>
    </div>
  );
}
