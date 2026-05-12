import React, { useState, useEffect, useRef } from 'react'
import { PlusCircle, X, ExternalLink, TrendingUp, Clock, CheckCircle, XCircle, Zap, RefreshCw } from 'lucide-react'
import { getOrders, cancelOrder, subscribe, calcLiveYield, yieldPerSecond } from '../store/orders.js'
import { usePrices } from '../hooks/usePrices.js'

function YieldTicker({ order }) {
  const [liveYield, setLiveYield] = useState(calcLiveYield(order))
  const ps = yieldPerSecond(order)

  useEffect(() => {
    if (order.status !== 'active') return
    const id = setInterval(() => {
      setLiveYield(prev => prev + ps / 10)
    }, 100)
    return () => clearInterval(id)
  }, [order.id, order.status, ps])

  return (
    <span className="yield-counter font-mono font-bold text-sm tabular-nums">
      +${liveYield.toFixed(6)}
    </span>
  )
}

function PriceDistance({ order, prices }) {
  const currentPrice = prices[order.outputToken?.mint] || 0
  const target = order.targetPrice || 0
  if (!currentPrice || !target) return null
  const pct = ((currentPrice - target) / target) * 100
  const away = Math.abs(pct).toFixed(1)
  const reached = order.direction === 'below' ? currentPrice <= target : currentPrice >= target

  if (reached) {
    return (
      <span className="text-xs px-2 py-0.5 rounded-full bg-yield-teal/20 text-yield-teal font-bold">
        TRIGGERED
      </span>
    )
  }

  return (
    <span className="text-xs text-yield-muted font-mono">
      {away}% away
    </span>
  )
}

function OrderCard({ order, prices, onCancel }) {
  const isActive = order.status === 'active'
  const isFilled = order.status === 'filled'
  const isCancelled = order.status === 'cancelled'

  const age = Date.now() - order.createdAt
  const ageDays = (age / (1000 * 3600 * 24)).toFixed(1)

  return (
    <div className={[
      'glass-card rounded-2xl p-5 space-y-4 transition-all duration-300',
      isActive ? 'hover:border-yield-teal/30' : '',
      isFilled ? 'border-yield-green/20' : '',
      isCancelled ? 'opacity-60' : ''
    ].join(' ')}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative flex-shrink-0">
            <img
              src={order.inputToken?.logo}
              alt={order.inputToken?.symbol}
              className="w-9 h-9 rounded-full border-2 border-yield-border"
              onError={e => { e.target.style.display = 'none' }}
            />
            <img
              src={order.outputToken?.logo}
              alt={order.outputToken?.symbol}
              className="w-6 h-6 rounded-full border-2 border-yield-bg absolute -bottom-1 -right-1"
              onError={e => { e.target.style.display = 'none' }}
            />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-base">
              {order.inputToken?.symbol} <span className="text-yield-muted">→</span> {order.outputToken?.symbol}
            </p>
            <p className="text-yield-muted text-xs">
              {order.inputAmount?.toLocaleString('en-US', { maximumFractionDigits: 2 })} {order.inputToken?.symbol}
              {' '}@ {order.targetPrice < 0.01 ? order.targetPrice?.toFixed(6) : order.targetPrice?.toFixed(4)} ({order.direction})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {isActive && <span className="badge-live text-[10px]"><span className="badge-live-dot" />ACTIVE</span>}
          {isFilled && <span className="px-2.5 py-1 rounded-full text-[10px] font-bold status-filled">FILLED</span>}
          {isCancelled && <span className="px-2.5 py-1 rounded-full text-[10px] font-bold status-cancelled">CANCELLED</span>}
          {isActive && (
            <button
              onClick={() => onCancel(order.id)}
              className="p-1.5 rounded-lg text-yield-muted hover:text-yield-red hover:bg-yield-red/10 transition-colors"
              title="Cancel order"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-yield-surface rounded-xl p-3 text-center">
          <p className="text-yield-muted text-xs mb-1">
            {isActive ? 'Live Yield' : 'Yield Earned'}
          </p>
          {isActive ? (
            <YieldTicker order={order} />
          ) : (
            <span className="text-yield-teal font-mono font-bold text-sm">
              +${(order.yieldEarned || 0).toFixed(4)}
            </span>
          )}
        </div>

        <div className="bg-yield-surface rounded-xl p-3 text-center">
          <p className="text-yield-muted text-xs mb-1">Kamino APY</p>
          <p className="text-yield-violet font-mono font-bold text-sm">
            {order.kaminoApy?.toFixed(1)}%
          </p>
        </div>

        <div className="bg-yield-surface rounded-xl p-3 text-center">
          <p className="text-yield-muted text-xs mb-1">Age</p>
          <p className="text-yield-text font-mono text-sm">{ageDays}d</p>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-yield-muted">
          <Clock size={11} />
          <span>
            {isActive ? 'Active' : isFilled ? 'Filled' : 'Cancelled'}
            {' '}{new Date(isFilled ? (order.filledAt || order.createdAt) : order.createdAt).toLocaleDateString()}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isActive && <PriceDistance order={order} prices={prices} />}
          {isFilled && order.fillTx && (
            <a
              href={`https://explorer.solana.com/tx/${order.fillTx}?cluster=devnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-yield-cyan hover:text-yield-teal transition-colors"
            >
              <ExternalLink size={11} />
              Explorer
            </a>
          )}
        </div>
      </div>

      {isFilled && (
        <div className="flex items-center gap-2 bg-yield-green/5 border border-yield-green/20 rounded-xl px-3 py-2 text-xs">
          <CheckCircle size={12} className="text-yield-green" />
          <span className="text-yield-green font-semibold">
            Filled @ {order.fillPrice?.toFixed(4)} — {order.inputAmount} {order.inputToken?.symbol} swapped via DFlow
          </span>
        </div>
      )}
    </div>
  )
}

export default function Dashboard({ setPage }) {
  const [orders, setOrders] = useState(getOrders())
  const prices = usePrices()
  const [filter, setFilter] = useState('all')
  const [confirming, setConfirming] = useState(null)

  useEffect(() => {
    const unsub = subscribe(setOrders)
    return unsub
  }, [])

  const filtered = orders.filter(o => {
    if (filter === 'active') return o.status === 'active'
    if (filter === 'filled') return o.status === 'filled'
    if (filter === 'cancelled') return o.status === 'cancelled'
    return true
  })

  const activeOrders = orders.filter(o => o.status === 'active')
  const totalYield = activeOrders.reduce((sum, o) => sum + calcLiveYield(o), 0)
  const filledOrders = orders.filter(o => o.status === 'filled')
  const totalFilledYield = filledOrders.reduce((sum, o) => sum + (o.yieldEarned || 0), 0)

  function handleCancel(id) {
    if (confirming === id) {
      cancelOrder(id)
      setConfirming(null)
    } else {
      setConfirming(id)
      setTimeout(() => setConfirming(null), 3000)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black mb-1">Order Dashboard</h1>
          <p className="text-yield-dim">All your limit orders and accrued yield in real-time.</p>
        </div>
        <button
          onClick={() => setPage('place')}
          className="teal-glow-btn px-5 py-2.5 rounded-xl font-bold text-black text-sm flex items-center gap-2"
        >
          <PlusCircle size={16} />
          New Order
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Orders', value: activeOrders.length, color: 'text-yield-text', sub: 'currently earning' },
          { label: 'Live Yield', value: `$${totalYield.toFixed(4)}`, color: 'text-yield-teal', sub: 'accruing now' },
          { label: 'Total Filled', value: filledOrders.length, color: 'text-yield-green', sub: 'completed' },
          { label: 'Yield Captured', value: `$${totalFilledYield.toFixed(2)}`, color: 'text-yield-violet', sub: 'from filled orders' },
        ].map(stat => (
          <div key={stat.label} className="glass-card rounded-2xl p-4">
            <p className={`text-2xl font-black font-mono ${stat.color}`}>{stat.value}</p>
            <p className="text-yield-text text-sm font-medium mt-1">{stat.label}</p>
            <p className="text-yield-muted text-xs">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {[
          { id: 'all', label: 'All Orders' },
          { id: 'active', label: `Active (${activeOrders.length})` },
          { id: 'filled', label: `Filled (${filledOrders.length})` },
          { id: 'cancelled', label: 'Cancelled' },
        ].map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={[
              'px-4 py-1.5 rounded-xl text-sm font-semibold transition-all',
              filter === f.id
                ? 'bg-yield-teal text-black'
                : 'border border-yield-border text-yield-muted hover:border-yield-teal/40 hover:text-yield-text'
            ].join(' ')}
          >
            {f.label}
          </button>
        ))}
        <button
          onClick={() => setOrders(getOrders())}
          className="ml-auto p-2 rounded-xl border border-yield-border text-yield-muted hover:text-yield-text hover:border-yield-teal/40 transition-colors"
          title="Refresh"
        >
          <RefreshCw size={14} />
        </button>
      </div>

      {confirming && (
        <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-yield-red/10 border border-yield-red/30 text-yield-red text-sm">
          <XCircle size={16} />
          <span>Click cancel again to confirm. This will withdraw from Kamino and close the order.</span>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="text-center py-20 space-y-4">
          <div className="w-16 h-16 rounded-full bg-yield-subtle flex items-center justify-center mx-auto">
            <Zap size={24} className="text-yield-muted" />
          </div>
          <p className="text-yield-dim text-lg font-semibold">No orders yet</p>
          <p className="text-yield-muted text-sm">Place your first limit order to start earning yield while you wait.</p>
          <button
            onClick={() => setPage('place')}
            className="teal-glow-btn px-6 py-3 rounded-xl font-bold text-black text-sm inline-flex items-center gap-2"
          >
            <PlusCircle size={16} />
            Place First Order
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(order => (
            <OrderCard
              key={order.id}
              order={order}
              prices={prices}
              onCancel={handleCancel}
            />
          ))}
        </div>
      )}
    </div>
  )
}
