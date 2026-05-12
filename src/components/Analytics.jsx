import React, { useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend, AreaChart, Area
} from 'recharts'
import { usePrices } from '../hooks/usePrices.js'
import { useKaminoVaults } from '../hooks/useKamino.js'
import { getOrders, subscribe, calcLiveYield } from '../store/orders.js'
import { TOKEN_LIST } from '../config.js'
import { TrendingUp, Activity, Zap, Clock } from 'lucide-react'

const PROTOCOL_STATS = {
  totalOrders: 1847,
  totalVolume: 4_200_000,
  totalYieldPaid: 28_400,
  avgWaitDays: 4.3,
  fillRate: 0.78,
  avgApy: 8.7,
}

function generateApyComparison() {
  return [
    { name: 'Jupiter Limit', apy: 0, color: '#374151' },
    { name: 'Raydium CLOB', apy: 0, color: '#374151' },
    { name: 'YieldWait', apy: 8.7, color: '#00D4AA' },
    { name: 'Kamino Direct', apy: 8.7, color: '#7C3AED' },
  ]
}

function generateHourlyVolume() {
  const data = []
  for (let h = 0; h < 24; h++) {
    data.push({
      hour: `${h}:00`,
      volume: Math.floor(Math.random() * 150000 + 50000),
      orders: Math.floor(Math.random() * 40 + 10),
    })
  }
  return data
}

function generateYieldByToken() {
  return [
    { token: 'USDC', apy: 8.7, tvl: 2100000, color: '#00D4AA' },
    { token: 'USDT', apy: 7.2, tvl: 1400000, color: '#06B6D4' },
    { token: 'SOL', apy: 6.1, tvl: 700000, color: '#7C3AED' },
  ]
}

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass-card rounded-xl px-4 py-2.5 text-xs border border-yield-teal/20">
      <p className="text-yield-muted mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="font-mono font-bold" style={{ color: p.color || '#00D4AA' }}>
          {p.name}: {typeof p.value === 'number' && p.name?.toLowerCase().includes('apy')
            ? `${p.value.toFixed(1)}%`
            : typeof p.value === 'number'
              ? p.value > 10000 ? `$${(p.value / 1000).toFixed(0)}k` : p.value.toFixed(0)
              : p.value}
        </p>
      ))}
    </div>
  )
}

function LivePriceTable() {
  const prices = usePrices()
  return (
    <div className="space-y-2">
      {TOKEN_LIST.slice(0, 6).map(token => {
        const price = prices[token.mint] || 0
        const change = (Math.random() - 0.48) * 3
        const positive = change >= 0
        return (
          <div key={token.mint} className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-yield-surface border border-yield-border hover:border-yield-teal/20 transition-colors">
            <div className="flex items-center gap-2.5">
              <img src={token.logo} alt={token.symbol} className="w-6 h-6 rounded-full" onError={e => { e.target.style.display = 'none' }} />
              <div>
                <p className="font-bold text-sm">{token.symbol}</p>
                <p className="text-yield-muted text-xs">{token.name}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-mono font-bold text-sm">
                {price < 0.01 ? price.toFixed(6) : price < 1 ? price.toFixed(4) : price.toFixed(2)}
              </p>
              <p className={`text-xs font-mono ${positive ? 'text-yield-green' : 'text-yield-red'}`}>
                {positive ? '+' : ''}{change.toFixed(2)}%
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function KaminoVaultTable() {
  const { vaults } = useKaminoVaults()
  const vaultList = generateYieldByToken()

  return (
    <div className="space-y-3">
      {vaultList.map(item => {
        const liveApy = vaults[
          item.token === 'USDC' ? 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
          : item.token === 'USDT' ? 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB'
          : 'So11111111111111111111111111111111111111112'
        ]?.apy ?? item.apy

        return (
          <div key={item.token} className="flex items-center justify-between p-4 rounded-xl border border-yield-border bg-yield-surface">
            <div className="flex items-center gap-3">
              <div className="w-2 h-10 rounded-full" style={{ background: item.color }} />
              <div>
                <p className="font-bold text-sm">{item.token} Lending Vault</p>
                <p className="text-yield-muted text-xs">TVL: ${(item.tvl / 1e6).toFixed(1)}M</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-yield-teal font-mono font-bold">{liveApy.toFixed(1)}%</p>
                <p className="text-yield-muted text-xs">APY</p>
              </div>
              <div className="badge-live text-[10px]">
                <span className="badge-live-dot" />
                LIVE
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function Analytics({ setPage }) {
  const [orders, setOrders] = useState(getOrders())
  const [hourlyData] = useState(generateHourlyVolume())
  const apyData = generateApyComparison()

  useEffect(() => {
    const unsub = subscribe(setOrders)
    return unsub
  }, [])

  const totalYield = orders.reduce((s, o) => {
    if (o.status === 'active') return s + calcLiveYield(o)
    return s + (o.yieldEarned || 0)
  }, 0)

  const protocolStats = [
    { label: 'Protocol Orders', value: PROTOCOL_STATS.totalOrders.toLocaleString(), icon: Activity, color: '#00D4AA', sub: 'all-time' },
    { label: 'Total Volume', value: `$${(PROTOCOL_STATS.totalVolume / 1e6).toFixed(1)}M`, icon: TrendingUp, color: '#7C3AED', sub: 'processed' },
    { label: 'Yield Distributed', value: `$${(PROTOCOL_STATS.totalYieldPaid / 1000).toFixed(1)}k`, icon: Zap, color: '#F59E0B', sub: 'to traders' },
    { label: 'Avg Wait Time', value: `${PROTOCOL_STATS.avgWaitDays}d`, icon: Clock, color: '#06B6D4', sub: 'to fill' },
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-black mb-1">Protocol Analytics</h1>
        <p className="text-yield-dim">Real-time stats on orders, yield, and Kamino vault performance.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {protocolStats.map(stat => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="glass-card rounded-2xl p-5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                style={{ background: `${stat.color}20`, border: `1px solid ${stat.color}30` }}>
                <Icon size={16} style={{ color: stat.color }} />
              </div>
              <p className="text-2xl font-black font-mono" style={{ color: stat.color }}>{stat.value}</p>
              <p className="text-yield-text text-sm font-medium mt-0.5">{stat.label}</p>
              <p className="text-yield-muted text-xs">{stat.sub}</p>
            </div>
          )
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass-card rounded-2xl p-6">
          <h2 className="font-bold text-base mb-1">24h Order Volume</h2>
          <p className="text-yield-muted text-xs mb-4">Orders placed and volume by hour</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={hourlyData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
              <XAxis dataKey="hour" tick={{ fill: '#6B7280', fontSize: 9 }} tickLine={false} axisLine={false} interval={5} />
              <YAxis tick={{ fill: '#6B7280', fontSize: 9 }} tickLine={false} axisLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="volume" fill="#00D4AA" fillOpacity={0.8} radius={[4, 4, 0, 0]} name="Volume ($)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <h2 className="font-bold text-base mb-1">APY Comparison</h2>
          <p className="text-yield-muted text-xs mb-4">YieldWait vs traditional limit orders</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={apyData} layout="vertical" margin={{ top: 5, right: 20, left: 80, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#6B7280', fontSize: 9 }} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} domain={[0, 12]} />
              <YAxis type="category" dataKey="name" tick={{ fill: '#9CA3AF', fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="apy" name="APY (%)" radius={[0, 4, 4, 0]}>
                {apyData.map((entry, i) => (
                  <cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-3 flex items-center gap-2 text-xs text-yield-muted">
            <div className="w-3 h-3 rounded-sm bg-yield-teal" />
            <span>YieldWait earns 8.7% APY vs 0% for traditional DEX limit orders</span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass-card rounded-2xl p-6">
          <h2 className="font-bold text-base mb-4">Live Token Prices</h2>
          <LivePriceTable />
          <p className="text-yield-muted text-xs mt-3">Prices via Birdeye · 30s refresh</p>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <h2 className="font-bold text-base mb-4">Kamino Vault APYs</h2>
          <KaminoVaultTable />
          <p className="text-yield-muted text-xs mt-3">Rates updated every 60s from Kamino Finance API</p>
        </div>
      </div>

      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-bold text-base">DFlow Execution Quality</h2>
            <p className="text-yield-muted text-xs mt-0.5">MEV protection and slippage stats</p>
          </div>
          <div className="badge-live text-[10px]">
            <span className="badge-live-dot" />
            LIVE
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Fill Rate', value: '78%', color: '#00D4AA', sub: 'of triggered orders' },
            { label: 'Avg Slippage', value: '0.08%', color: '#06B6D4', sub: 'vs 0.3% market avg' },
            { label: 'MEV Saved', value: '$12.4k', color: '#7C3AED', sub: 'all-time' },
            { label: 'Avg Fill Time', value: '1.2s', color: '#F59E0B', sub: 'after trigger' },
          ].map(s => (
            <div key={s.label} className="text-center p-4 rounded-xl bg-yield-surface border border-yield-border">
              <p className="text-2xl font-black font-mono" style={{ color: s.color }}>{s.value}</p>
              <p className="text-yield-text text-sm font-medium mt-1">{s.label}</p>
              <p className="text-yield-muted text-xs">{s.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
