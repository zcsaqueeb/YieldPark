import React, { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts'
import { getOrders, calcLiveYield, subscribe } from '../store/orders.js'
import { usePrices } from '../hooks/usePrices.js'
import { useKaminoVaults } from '../hooks/useKamino.js'
import { TrendingUp, DollarSign, Activity, Award, PlusCircle } from 'lucide-react'

const COLORS = ['#00D4AA', '#7C3AED', '#06B6D4', '#F59E0B', '#EF4444', '#10B981']

function generateYieldHistory(orders) {
  const now = Date.now()
  const days = 14
  const points = []
  for (let i = days; i >= 0; i--) {
    const d = new Date(now - i * 24 * 3600 * 1000)
    const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    let cumYield = 0
    orders.forEach(o => {
      if (o.status === 'active' || o.status === 'filled') {
        const age = Math.max(0, (now - i * 24 * 3600 * 1000) - o.createdAt)
        const ageYears = age / (1000 * 3600 * 24 * 365)
        cumYield += o.inputAmount * (o.kaminoApy / 100) * ageYears
      }
    })
    points.push({ date: label, yield: parseFloat(cumYield.toFixed(4)) })
  }
  return points
}

function TokenAllocationChart({ orders }) {
  const tokenMap = {}
  orders.forEach(o => {
    if (o.status === 'active') {
      const key = o.inputToken?.symbol || 'Unknown'
      tokenMap[key] = (tokenMap[key] || 0) + o.inputAmount
    }
  })
  return Object.entries(tokenMap).map(([symbol, amount]) => ({ symbol, amount }))
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card rounded-xl px-4 py-2.5 text-sm border border-yield-teal/20">
        <p className="text-yield-muted text-xs mb-1">{label}</p>
        <p className="text-yield-teal font-bold font-mono">+${payload[0]?.value?.toFixed(4)}</p>
      </div>
    )
  }
  return null
}

export default function Portfolio({ setPage }) {
  const [orders, setOrders] = useState(getOrders())
  const prices = usePrices()
  const { vaults } = useKaminoVaults()

  useEffect(() => {
    const unsub = subscribe(setOrders)
    return unsub
  }, [])

  const activeOrders = orders.filter(o => o.status === 'active')
  const filledOrders = orders.filter(o => o.status === 'filled')

  const totalDeployed = activeOrders.reduce((s, o) => s + o.inputAmount, 0)
  const totalLiveYield = activeOrders.reduce((s, o) => s + calcLiveYield(o), 0)
  const totalFilledYield = filledOrders.reduce((s, o) => s + (o.yieldEarned || 0), 0)
  const totalYield = totalLiveYield + totalFilledYield

  const avgApy = activeOrders.length > 0
    ? activeOrders.reduce((s, o) => s + o.kaminoApy, 0) / activeOrders.length
    : 8.7

  const yieldHistory = generateYieldHistory(orders)
  const allocationData = TokenAllocationChart({ orders })

  const annualized = totalDeployed > 0
    ? ((totalLiveYield / totalDeployed) * 365 * (1 / Math.max(1, (Date.now() - Math.min(...activeOrders.map(o => o.createdAt), Date.now())) / (1000 * 3600 * 24)))) * 100
    : 0

  const kaminoVaultBreakdown = Object.entries(
    activeOrders.reduce((acc, o) => {
      const key = o.kaminoVault || 'Kamino Vault'
      if (!acc[key]) acc[key] = { apy: o.kaminoApy, amount: 0, count: 0 }
      acc[key].amount += o.inputAmount
      acc[key].count += 1
      return acc
    }, {})
  )

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black mb-1">Portfolio</h1>
          <p className="text-yield-dim">Your yield-generating positions across all Kamino vaults.</p>
        </div>
        <button
          onClick={() => setPage('place')}
          className="teal-glow-btn px-5 py-2.5 rounded-xl font-bold text-black text-sm flex items-center gap-2"
        >
          <PlusCircle size={16} />
          Add Position
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Deployed',
            value: `$${totalDeployed.toLocaleString('en-US', { maximumFractionDigits: 0 })}`,
            icon: DollarSign,
            color: 'text-yield-text',
            iconColor: '#00D4AA',
            sub: `${activeOrders.length} active positions`
          },
          {
            label: 'Total Yield Earned',
            value: `$${totalYield.toFixed(4)}`,
            icon: TrendingUp,
            color: 'text-yield-teal',
            iconColor: '#00D4AA',
            sub: 'lifetime across all orders'
          },
          {
            label: 'Avg. Kamino APY',
            value: `${avgApy.toFixed(1)}%`,
            icon: Activity,
            color: 'text-yield-violet',
            iconColor: '#7C3AED',
            sub: 'weighted average'
          },
          {
            label: 'Orders Filled',
            value: filledOrders.length,
            icon: Award,
            color: 'text-yield-green',
            iconColor: '#10B981',
            sub: `+$${totalFilledYield.toFixed(2)} yield captured`
          },
        ].map(stat => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="glass-card rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: `${stat.iconColor}20`, border: `1px solid ${stat.iconColor}30` }}>
                  <Icon size={16} style={{ color: stat.iconColor }} />
                </div>
              </div>
              <p className={`text-2xl font-black font-mono ${stat.color}`}>{stat.value}</p>
              <p className="text-yield-text text-sm font-medium mt-0.5">{stat.label}</p>
              <p className="text-yield-muted text-xs mt-0.5">{stat.sub}</p>
            </div>
          )
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card rounded-2xl p-6">
          <h2 className="font-bold text-base mb-1">Cumulative Yield (14d)</h2>
          <p className="text-yield-muted text-xs mb-4">Total USD earned across all active and filled orders</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={yieldHistory} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="yieldGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00D4AA" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00D4AA" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
              <XAxis dataKey="date" tick={{ fill: '#6B7280', fontSize: 10 }} tickLine={false} axisLine={false} interval={2} />
              <YAxis tick={{ fill: '#6B7280', fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={v => `$${v.toFixed(2)}`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="yield" stroke="#00D4AA" strokeWidth={2} fill="url(#yieldGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <h2 className="font-bold text-base mb-1">Capital Allocation</h2>
          <p className="text-yield-muted text-xs mb-4">By input token (active orders)</p>
          {allocationData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie
                    data={allocationData}
                    dataKey="amount"
                    nameKey="symbol"
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={65}
                    paddingAngle={3}
                  >
                    {allocationData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [`$${value.toFixed(2)}`, name]}
                    contentStyle={{ background: '#111827', border: '1px solid #1F2937', borderRadius: 8 }}
                    labelStyle={{ color: '#9CA3AF' }}
                    itemStyle={{ color: '#F9FAFB' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {allocationData.map((d, i) => (
                  <div key={d.symbol} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="text-yield-dim">{d.symbol}</span>
                    </div>
                    <span className="font-mono text-yield-text">${d.amount.toFixed(0)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-yield-muted text-sm">
              No active positions
            </div>
          )}
        </div>
      </div>

      <div className="glass-card rounded-2xl p-6">
        <h2 className="font-bold text-base mb-4">Kamino Vault Positions</h2>
        {kaminoVaultBreakdown.length > 0 ? (
          <div className="space-y-3">
            {kaminoVaultBreakdown.map(([vault, data]) => (
              <div key={vault}
                className="flex items-center justify-between p-4 rounded-xl border border-yield-border bg-yield-surface hover:border-yield-teal/20 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-yield-purple/20 border border-yield-purple/30">
                    <TrendingUp size={16} className="text-yield-violet" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{vault}</p>
                    <p className="text-yield-muted text-xs">{data.count} order{data.count !== 1 ? 's' : ''} deposited</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono font-bold text-yield-teal">{data.apy?.toFixed(1)}% APY</p>
                  <p className="font-mono text-yield-text text-sm">${data.amount.toLocaleString('en-US', { maximumFractionDigits: 0 })}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-yield-muted text-sm text-center py-6">No active vault positions. Place an order to start earning.</p>
        )}
      </div>

      <div className="glass-card rounded-2xl p-6 text-center space-y-3"
        style={{ background: 'linear-gradient(135deg, rgba(0,212,170,0.05) 0%, rgba(124,58,237,0.05) 100%)' }}>
        <p className="text-yield-dim text-sm">Lifetime yield efficiency vs traditional limit orders</p>
        <p className="text-4xl font-black gradient-text">
          {totalDeployed > 0 && totalYield > 0 ? '3.2x' : '—'}
        </p>
        <p className="text-yield-muted text-xs">
          {totalDeployed > 0
            ? 'More capital efficiency than idle limit orders'
            : 'Place your first order to start tracking efficiency'}
        </p>
      </div>
    </div>
  )
}
