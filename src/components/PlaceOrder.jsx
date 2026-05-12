import React, { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { ArrowDown, ChevronDown, TrendingUp, TrendingDown, Zap, Info, CheckCircle, AlertCircle, Loader, Shield } from 'lucide-react'
import { TOKEN_LIST, TOKENS } from '../config.js'
import { usePrices } from '../hooks/usePrices.js'
import { useKaminoVaults } from '../hooks/useKamino.js'
import { addOrder } from '../store/orders.js'

function TokenSelector({ selected, onSelect, exclude }) {
  const [open, setOpen] = useState(false)
  const filtered = TOKEN_LIST.filter(t => t.mint !== exclude?.mint)

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl border border-yield-border bg-yield-surface hover:border-yield-teal/40 transition-colors"
      >
        <img src={selected.logo} alt={selected.symbol} className="w-6 h-6 rounded-full" onError={e => { e.target.style.display='none' }} />
        <span className="font-bold text-sm">{selected.symbol}</span>
        <ChevronDown size={14} className="text-yield-muted" />
      </button>
      {open && (
        <div className="absolute top-full mt-2 left-0 z-50 glass-card rounded-xl overflow-hidden shadow-2xl min-w-[160px]"
          style={{ border: '1px solid rgba(0,212,170,0.2)' }}>
          {filtered.map(token => (
            <button
              key={token.mint}
              type="button"
              onClick={() => { onSelect(token); setOpen(false) }}
              className={`w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-yield-teal/10 transition-colors text-left ${
                selected.mint === token.mint ? 'bg-yield-teal/10 text-yield-teal' : 'text-yield-text'
              }`}
            >
              <img src={token.logo} alt={token.symbol} className="w-5 h-5 rounded-full" onError={e => { e.target.style.display='none' }} />
              <div>
                <p className="font-bold text-sm">{token.symbol}</p>
                <p className="text-yield-muted text-xs">{token.name}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function calcYieldPreview(amount, apy, days) {
  const dailyRate = apy / 100 / 365
  return amount * dailyRate * days
}

export default function PlaceOrder({ setPage }) {
  const { connected, publicKey } = useWallet()
  const prices = usePrices()
  const { vaults } = useKaminoVaults()

  const [inputToken, setInputToken] = useState(TOKENS.USDC)
  const [outputToken, setOutputToken] = useState(TOKENS.SOL)
  const [amount, setAmount] = useState('')
  const [targetPrice, setTargetPrice] = useState('')
  const [direction, setDirection] = useState('below') // 'below' | 'above'
  const [waitDays, setWaitDays] = useState(7)
  const [status, setStatus] = useState(null) // null | 'loading' | 'success' | 'error'
  const [errorMsg, setErrorMsg] = useState('')

  const inputPrice = prices[inputToken.mint] || 1
  const outputPrice = prices[outputToken.mint] || 1
  const currentRatio = inputToken.symbol === 'USDC' || inputToken.symbol === 'USDT'
    ? outputPrice
    : (outputPrice / inputPrice)

  const kaminoApy = vaults[inputToken.mint]?.apy ?? 8.7
  const kaminoVaultName = vaults[inputToken.mint]?.name ?? 'Kamino Lending Vault'

  const amountNum = parseFloat(amount) || 0
  const projectedYield = calcYieldPreview(amountNum, kaminoApy, waitDays)
  const projectedYieldPercent = amountNum > 0 ? ((projectedYield / amountNum) * 100).toFixed(3) : '0.000'

  const amountUSD = amountNum * (inputToken.symbol === 'USDC' || inputToken.symbol === 'USDT' ? 1 : inputPrice)

  function swapTokens() {
    const tmp = inputToken
    setInputToken(outputToken)
    setOutputToken(tmp)
    setTargetPrice('')
  }

  function setPresetPrice(mult) {
    const base = currentRatio
    setTargetPrice((base * mult).toFixed(outputToken.decimals <= 6 ? 4 : 2))
    setDirection(mult < 1 ? 'below' : 'above')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!connected) return
    if (!amountNum || amountNum <= 0) { setErrorMsg('Enter a valid amount'); return }
    if (!parseFloat(targetPrice)) { setErrorMsg('Enter a valid target price'); return }

    setStatus('loading')
    setErrorMsg('')

    try {
      await new Promise(r => setTimeout(r, 1200)) // Simulate tx

      addOrder({
        status: 'active',
        inputToken: { symbol: inputToken.symbol, mint: inputToken.mint, decimals: inputToken.decimals, logo: inputToken.logo },
        outputToken: { symbol: outputToken.symbol, mint: outputToken.mint, decimals: outputToken.decimals, logo: outputToken.logo },
        inputAmount: amountNum,
        targetPrice: parseFloat(targetPrice),
        direction,
        kaminoApy,
        kaminoVault: kaminoVaultName,
        txSignature: 'devnet_' + Math.random().toString(36).substr(2, 16),
      })

      setStatus('success')
      setTimeout(() => { setPage('dashboard') }, 2000)
    } catch (err) {
      setStatus('error')
      setErrorMsg(err.message || 'Transaction failed')
    }
  }

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      <div>
        <h1 className="text-3xl font-black mb-1">Place Limit Order</h1>
        <p className="text-yield-dim">Your collateral earns yield the moment this order is created.</p>
      </div>

      {/* Kamino banner */}
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-yield-purple/30 bg-yield-purple/5">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-yield-purple/20">
          <TrendingUp size={16} className="text-yield-violet" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-yield-text">Kamino Auto-Yield Active</p>
          <p className="text-xs text-yield-muted truncate">
            Collateral deposited to <span className="text-yield-violet">{kaminoVaultName}</span> · <span className="text-yield-teal font-bold">{kaminoApy.toFixed(1)}% APY</span>
          </p>
        </div>
        <div className="badge-live text-[10px]">
          <span className="badge-live-dot" />
          LIVE
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Input amount */}
        <div className="glass-card rounded-2xl p-5 space-y-3">
          <label className="text-yield-muted text-sm font-medium">You're spending</label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              min="0"
              step="any"
              className="flex-1 bg-transparent text-3xl font-bold outline-none text-yield-text placeholder:text-yield-subtle"
            />
            <TokenSelector selected={inputToken} onSelect={setInputToken} exclude={outputToken} />
          </div>
          {amountNum > 0 && (
            <p className="text-yield-muted text-xs">
              ≈ ${amountUSD.toLocaleString('en-US', { maximumFractionDigits: 2 })} USD
            </p>
          )}
          {/* Quick amounts */}
          <div className="flex gap-2 flex-wrap">
            {[100, 500, 1000, 5000].map(v => (
              <button key={v} type="button"
                onClick={() => setAmount(String(v))}
                className="text-xs px-3 py-1 rounded-lg border border-yield-border text-yield-muted hover:border-yield-teal/40 hover:text-yield-teal transition-colors">
                {inputToken.symbol === 'USDC' || inputToken.symbol === 'USDT' ? `$${v}` : `${v}`}
              </button>
            ))}
          </div>
        </div>

        {/* Swap arrow */}
        <div className="flex justify-center">
          <button type="button" onClick={swapTokens}
            className="p-2.5 rounded-xl border border-yield-border bg-yield-surface hover:border-yield-teal/40 hover:bg-yield-teal/5 transition-all group">
            <ArrowDown size={18} className="text-yield-muted group-hover:text-yield-teal transition-colors" />
          </button>
        </div>

        {/* Output token */}
        <div className="glass-card rounded-2xl p-5 space-y-3">
          <label className="text-yield-muted text-sm font-medium">To receive</label>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <p className="text-yield-muted text-sm">
                {amountNum > 0 && parseFloat(targetPrice) > 0
                  ? `≈ ${(amountNum / parseFloat(targetPrice)).toFixed(4)} ${outputToken.symbol}`
                  : <span className="text-yield-subtle">—</span>}
              </p>
            </div>
            <TokenSelector selected={outputToken} onSelect={setOutputToken} exclude={inputToken} />
          </div>
        </div>

        {/* Target price */}
        <div className="glass-card rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-yield-muted text-sm font-medium">Trigger Price</label>
            <p className="text-xs text-yield-muted">
              Current: <span className="text-yield-text font-mono font-bold">
                {currentRatio < 0.01 ? currentRatio.toFixed(6) : currentRatio.toFixed(4)} {inputToken.symbol}/{outputToken.symbol}
              </span>
            </p>
          </div>

          {/* Direction toggle */}
          <div className="flex gap-2">
            {(['below', 'above']).map(dir => (
              <button key={dir} type="button"
                onClick={() => setDirection(dir)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                  direction === dir
                    ? dir === 'below'
                      ? 'border-yield-teal/40 bg-yield-teal/10 text-yield-teal'
                      : 'border-yield-amber/40 bg-yield-amber/10 text-yield-amber'
                    : 'border-yield-border text-yield-muted hover:border-yield-border/80'
                }`}>
                {dir === 'below' ? <TrendingDown size={14} /> : <TrendingUp size={14} />}
                Buy {outputToken.symbol} {dir === 'below' ? 'below' : 'above'}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="number"
              placeholder={currentRatio.toFixed(4)}
              value={targetPrice}
              onChange={e => setTargetPrice(e.target.value)}
              step="any"
              min="0"
              className="input-field flex-1 text-xl font-mono font-bold"
            />
            <span className="flex items-center px-3 text-yield-muted text-sm font-mono">{inputToken.symbol}</span>
          </div>

          <div className="flex gap-2 flex-wrap">
            {[
              { label: '-5%', mult: 0.95, dir: 'below' },
              { label: '-10%', mult: 0.90, dir: 'below' },
              { label: '-15%', mult: 0.85, dir: 'below' },
              { label: '+5%', mult: 1.05, dir: 'above' },
              { label: '+10%', mult: 1.10, dir: 'above' },
            ].map(({ label, mult, dir }) => (
              <button key={label} type="button"
                onClick={() => { setPresetPrice(mult); setDirection(dir) }}
                className="text-xs px-3 py-1.5 rounded-lg border border-yield-border text-yield-muted hover:border-yield-teal/40 hover:text-yield-teal transition-colors font-mono">
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Yield preview */}
        {amountNum > 0 && (
          <div className="glass-card-teal rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Zap size={16} className="text-yield-teal" />
              <h3 className="font-bold text-sm text-yield-teal">Projected Yield While Waiting</h3>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-yield-muted text-sm">Est. wait time:</span>
              <div className="flex gap-2">
                {[3, 7, 14, 30].map(d => (
                  <button key={d} type="button"
                    onClick={() => setWaitDays(d)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      waitDays === d ? 'bg-yield-teal text-black' : 'border border-yield-border text-yield-muted hover:border-yield-teal/40'
                    }`}>
                    {d}d
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <p className="yield-counter text-xl font-bold">+${projectedYield.toFixed(2)}</p>
                <p className="text-yield-muted text-xs mt-1">yield in {waitDays}d</p>
              </div>
              <div className="text-center">
                <p className="text-yield-teal text-xl font-bold font-mono">{kaminoApy.toFixed(1)}%</p>
                <p className="text-yield-muted text-xs mt-1">Kamino APY</p>
              </div>
              <div className="text-center">
                <p className="text-yield-green text-xl font-bold font-mono">{projectedYieldPercent}%</p>
                <p className="text-yield-muted text-xs mt-1">return on wait</p>
              </div>
            </div>

            <div className="flex items-start gap-2 text-xs text-yield-muted">
              <Info size={12} className="mt-0.5 flex-shrink-0" />
              <p>Collateral is deposited to Kamino's {kaminoVaultName} immediately upon order placement. Yield accrues every block.</p>
            </div>
          </div>
        )}

        {/* DFlow note */}
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-yield-subtle/50 border border-yield-border">
          <Shield size={16} className="text-yield-cyan flex-shrink-0" />
          <p className="text-xs text-yield-muted">
            When triggered, your order executes via <span className="text-yield-cyan font-semibold">DFlow</span> — MEV-protected order routing with zero slippage attacks.
          </p>
        </div>

        {/* Error */}
        {errorMsg && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-yield-red/10 border border-yield-red/30 text-yield-red text-sm">
            <AlertCircle size={16} />
            {errorMsg}
          </div>
        )}

        {/* Success */}
        {status === 'success' && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-yield-green/10 border border-yield-green/30 text-yield-green text-sm">
            <CheckCircle size={16} />
            Order placed! Kamino yield is accruing. Redirecting to dashboard…
          </div>
        )}

        {/* Submit */}
        {connected ? (
          <button
            type="submit"
            disabled={status === 'loading' || status === 'success'}
            className={`w-full py-4 rounded-xl font-bold text-black text-lg flex items-center justify-center gap-2 transition-all ${
              status === 'loading' || status === 'success'
                ? 'opacity-60 cursor-not-allowed bg-yield-teal/60'
                : 'teal-glow-btn'
            }`}
          >
            {status === 'loading' ? (
              <>
                <Loader size={20} className="animate-spin" />
                Depositing to Kamino...
              </>
            ) : status === 'success' ? (
              <>
                <CheckCircle size={20} />
                Order Placed!
              </>
            ) : (
              <>
                <Zap size={20} />
                Place Order + Start Earning
              </>
            )}
          </button>
        ) : (
          <div className="text-center space-y-3">
            <p className="text-yield-muted text-sm">Connect your wallet to place an order</p>
            <div className="flex justify-center">
              <WalletMultiButton />
            </div>
          </div>
        )}
      </form>
    </div>
  )
}
