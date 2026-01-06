import { useState, useEffect } from 'react';
import { createWallet, getAccountAssets, transfer } from './lib/logic';

export default function App() {
  const [wallet, setWallet] = useState(null);
  const [mnemonic, setMnemonic] = useState(null);
  const [hdPath, setHdPath] = useState(null);
  const [address, setAddress] = useState('');
  const [assets, setAssets] = useState([]);
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [loading, setLoading] = useState(false);
  const [assetsLoading, setAssetsLoading] = useState(false);
  const [result, setResult] = useState(null);

  const selectedAsset = assets.find(a => a.id === selectedAssetId);

  useEffect(() => {
    if (address) {
      loadAssets();
    }
  }, [address]);

  async function loadAssets() {
    setAssetsLoading(true);
    try {
      const data = await getAccountAssets(address);
      
      // Handle null response in UI layer
      if (data === null) {
        setAssets([]);
      } else {
        setAssets(data);
        
        // Auto-select first asset if none selected
        if (data.length > 0 && !selectedAssetId) {
          setSelectedAssetId(data[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load assets:', err);
      setAssets([]);
    } finally {
      setAssetsLoading(false);
    }
  }

  function handleLogout() {
    setWallet(null);
    setMnemonic(null);
    setHdPath(null);
    setAddress('');
    setAssets([]);
    setSelectedAssetId('');
    setResult(null);
  }

  if (!wallet) {
    return <Login onLogin={(w, mnem, path, addr) => { 
      setWallet(w); 
      setMnemonic(mnem); 
      setHdPath(path); 
      setAddress(addr); 
    }} />;
  }

  return (
    <div className="container">
      <h1>tSwap</h1>
      <p className="subtitle">Transfer assets on MOI</p>

      <div className="user-bar">
        <span className="address">{address.slice(0, 12)}...{address.slice(-8)}</span>
        <button className="secondary" onClick={handleLogout}>Logout</button>
      </div>

      <div className="card">
        <div className="section-header">
          <div className="section-title">Select Asset</div>
          <button 
            className="refresh-btn" 
            onClick={loadAssets}
            disabled={assetsLoading}
          >
            {assetsLoading ? <span className="loader" /> : '↻'}
          </button>
        </div>
        
        {assetsLoading && assets.length === 0 ? (
          <div className="loading-text">Loading assets...</div>
        ) : assets.length === 0 ? (
          <div className="empty-text">No assets found</div>
        ) : (
          <select 
            className="asset-select"
            value={selectedAssetId}
            onChange={e => setSelectedAssetId(e.target.value)}
          >
            {assets.map(asset => (
              <option key={asset.id} value={asset.id}>
                {asset.symbol || 'Unknown Asset'} — {asset.balance} ({asset.id.slice(0, 8)}...{asset.id.slice(-6)})
              </option>
            ))}
          </select>
        )}
        
        {selectedAsset && (
          <div className="selected-info">
            <div className="info-row">
              <span className="info-label">Symbol</span>
              <span className="info-value symbol">{selectedAsset.symbol || 'Unknown Asset'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Balance</span>
              <span className="info-value balance">{selectedAsset.balance}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Asset ID</span>
              <span className="info-value id">{selectedAsset.id}</span>
            </div>
          </div>
        )}
      </div>
      
      <div className="card">
        <div className="section-title">Transfer</div>
        {selectedAsset ? (
          <TransferForm 
            mnemonic={mnemonic}
            hdPath={hdPath}
            asset={selectedAsset}
            loading={loading}
            setLoading={setLoading}
            setResult={setResult}
            onSuccess={loadAssets}
          />
        ) : (
          <div className="empty-text">Select an asset above to transfer</div>
        )}
        {result && (
          <div className={`result ${result.success ? 'success' : 'error'}`}>
            {result.message}
          </div>
        )}
      </div>
    </div>
  );
}

function Login({ onLogin }) {
  const [mnemonic, setMnemonic] = useState('');
  const [hdPath, setHdPath] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const { wallet, address: addr } = await createWallet(mnemonic.trim());
      onLogin(wallet, mnemonic.trim(), hdPath || "m/44'/6174'/7020'/0/0", addr);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <h1>tSwap</h1>
      <p className="subtitle">Connect your wallet</p>
      
      <form className="card" onSubmit={handleSubmit}>
        <label>Mnemonic</label>
        <textarea 
          value={mnemonic}
          onChange={e => setMnemonic(e.target.value)}
          placeholder="Enter your 12 or 24 word phrase"
          required
        />
        
        <label>HD Path (optional)</label>
        <input 
          value={hdPath}
          onChange={e => setHdPath(e.target.value)}
          placeholder="m/44'/6174'/7020'/0/0"
        />
        
        <button type="submit" disabled={loading}>
          {loading ? <><span className="loader" />Connecting...</> : 'Connect'}
        </button>
        
        {error && <div className="result error">{error}</div>}
      </form>
    </div>
  );
}

function TransferForm({ mnemonic, hdPath, asset, loading, setLoading, setResult, onSuccess }) {
  const [receiver, setReceiver] = useState('');
  const [amount, setAmount] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    
    try {
      // Recreate wallet from mnemonic for each transfer to ensure signing capability
      const { wallet } = await createWallet(mnemonic);
      const { hash } = await transfer(wallet, asset.id, receiver, parseInt(amount));
      setResult({ success: true, message: `Success! Sent ${amount} ${asset.symbol || 'Unknown Asset'}. Hash: ${hash}` });
      setReceiver('');
      setAmount('');
      onSuccess();
    } catch (err) {
      setResult({ success: false, message: err.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="transfer-header">
        Sending <span className="highlight">{asset.symbol || 'Unknown Asset'}</span>
      </div>
      
      <label>Receiver</label>
      <input 
        value={receiver}
        onChange={e => setReceiver(e.target.value)}
        placeholder="0x..."
        required
      />
      
      <label>Amount</label>
      <div className="amount-row">
        <input 
          type="number"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          placeholder="100"
          min="1"
          max={asset.balance}
          required
        />
        <button 
          type="button" 
          className="max-btn"
          onClick={() => setAmount(asset.balance)}
        >
          MAX
        </button>
      </div>
      
      <button type="submit" disabled={loading || !receiver || !amount}>
        {loading ? <><span className="loader" />Sending...</> : `Send ${asset.symbol || 'Unknown Asset'}`}
      </button>
    </form>
  );
}
