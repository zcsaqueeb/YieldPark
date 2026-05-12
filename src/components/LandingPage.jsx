import React, { useEffect, useRef, useState } from 'react'
import { ArrowRight, TrendingUp, Shield, Zap, Clock, DollarSign, Activity, ChevronRight } from 'lucide-react'

const COUNTER_RATE = 0.00000892 // USDC per second (simulates pooled yield)

function AnimatedCounter({ value, decimals = 6, prefix = '+$' }) {
  const [display, setDisplay] = useState(value)
  const prev = useRef(value)

  useEffect(() => {
    prev.current = display
    const diff = value - prev.current
    if (Math.abs(diff) < 0.000001) return
    setDisplay(value)
  }, [value])

  return (
    <span className="yield-counter font-mono tabular-nums">
      {prefix}{display.toFixed(decimals)}
    </span>
  )
}

function LiveYieldDisplay() {
  const [earned, setEarned] = useState(0.000000)
  const startRef = useRef(Date.now())

  useEffect(() => {
    const id = setInterval(() => {
      const elapsed = (Date.now() - startRef.current) / 1000
      setEarned(elapsed * COUNTER_RATE)
    }, 100)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="glass-card-teal rounded-2xl p-6 text-center">
      <p className="text-yield-muted text-sm mb-1 font-medium">Yield earned since you opened this page</p>
      <p className="text-3xl font-bold">
        <AnimatedCounter value={earned} />
      </p>
      <p className="text-yield-muted text-xs mt-1">across all protocol orders @ 8.7% APY</p>
    </div>
  )
}

const STEPS = [
  {
    n: '01',
    icon: DollarSign,
    color: '#00D4AA',
    title: 'Set Your Limit Order',
    desc: 'Choose any token pair, enter your target price, and specify the amount. Your order waits for the perfect entry.'
  },
  {
    n: '02',
    icon: TrendingUp,
    color: '#7C3AED',
    title: 'Kamino Earns Yield',
    desc: 'Your idle collateral is automatically deposited into Kamino\'s highest-yield lending vaults — earning 6-15% APY from second one.'
  },
  {
    n: '03',
    icon: Activity,
    color: '#06B6D4',
    title: 'Quicknode Watches',
    desc: 'Quicknode Streams + Birdeye price feeds monitor your target price 24/7 with millisecond precision.'
  },
  {
    n: '04',
    icon: Zap,
    color: '#F59E0B',
    title: 'DFlow Executes',
    desc: 'Price hits target → atomic transaction: withdraw from Kamino + MEV-protected swap via DFlow in one click.'
  },
]

const STATS = [
  { label: 'Total Value Locked', value: '$4.2M', sub: 'earning yield now' },
  { label: 'Orders Active', value: '1,847', sub: 'across 12 pairs' },
  { label: 'Avg. Yield Earned', value: '8.7%', sub: 'APY while waiting' },
  { label: 'Capital Efficiency', value: '3.2×', sub: 'vs idle limit orders' },
]

const PARTNERS = [
  { name: 'DFlow', role: 'MEV-Protected Execution', color: '#00D4AA' },
  { name: 'Kamino', role: 'Yield Generation', color: '#7C3AED' },
  { name: 'Birdeye', role: 'Price Monitoring', color: '#F59E0B' },
  { name: 'Quicknode', role: 'Infra & Streams', color: '#06B6D4' },
  { name: 'Solflare', role: 'Primary Wallet', color: '#E85329' },
]

export default function LandingPage({ setPage }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-24">

      {/* Hero */}
      <section className="text-center space-y-8 pt-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-yield-teal/30 bg-yield-teal/5 text-yield-teal text-sm font-medium">
          <span className="badge-live-dot"></span>
          Live on Solana Devnet · Powered by DFlow + Kamino
        </div>

        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-tight tracking-tight">
          Limit orders that<br />
          <span className="gradient-text">earn yield</span> while<br />
          they wait.
        </h1>

        <p className="text-xl text-yield-dim max-w-2xl mx-auto leading-relaxed">
          Set a buy or sell limit order. Your collateral automatically earns Kamino yield while waiting. 
          The moment your price target hits, DFlow executes the swap with MEV protection.
          <span className="text-yield-teal font-semibold"> You keep all the yield.</span>
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => setPage('place')}
            className="teal-glow-btn px-8 py-4 rounded-xl font-bold text-black text-lg flex items-center gap-2"
          >
            Place First Order
            <ArrowRight size={20} />
          </button>
          <button
            onClick={() => setPage('dashboard')}
            className="px-8 py-4 rounded-xl font-semibold text-yield-text text-lg border border-yield-border hover:border-yield-teal/40 hover:bg-yield-teal/5 transition-all flex items-center gap-2"
          >
            View Dashboard
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Live counter */}
        <div className="max-w-sm mx-auto">
          <LiveYieldDisplay />
        </div>
      </section>

      {/* Stats bar */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map(s => (
          <div key={s.label} className="glass-card rounded-2xl p-5 text-center hover:border-yield-teal/20 transition-colors">
            <p className="text-3xl font-black gradient-text">{s.value}</p>
            <p className="text-yield-text font-semibold text-sm mt-1">{s.label}</p>
            <p className="text-yield-muted text-xs mt-0.5">{s.sub}</p>
          </div>
        ))}
      </section>

      {/* How it works */}
      <section className="space-y-10">
        <div className="text-center space-y-3">
          <h2 className="text-3xl sm:text-4xl font-black">How YieldWait works</h2>
          <p className="text-yield-dim max-w-xl mx-auto">Four steps. Zero idle capital. Maximum efficiency.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((step, i) => {
            const Icon = step.icon
            return (
              <div key={i} className="glass-card rounded-2xl p-6 space-y-4 hover:scale-[1.02] transition-transform duration-300 relative overflow-hidden group">
                <div className="absolute top-0 right-0 text-6xl font-black opacity-5 select-none" style={{ color: step.color }}>
                  {step.n}
                </div>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ background: `${step.color}20`, border: `1px solid ${step.color}40` }}>
                  <Icon size={22} style={{ color: step.color }} />
                </div>
                <div>
                  <p className="text-xs font-mono mb-1" style={{ color: step.color }}>{step.n}</p>
                  <h3 className="font-bold text-yield-text mb-2">{step.title}</h3>
                  <p className="text-yield-muted text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Yield comparison */}
      <section className="glass-card rounded-3xl p-8 md:p-12 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(circle at 80% 50%, rgba(0,212,170,0.06) 0%, transparent 60%)' }} />
        <div className="relative grid md:grid-cols-2 gap-10 items-center">
          <div className="space-y-4">
            <h2 className="text-3xl font-black">Why leave money on the table?</h2>
            <p className="text-yield-dim leading-relaxed">
              Traditional limit orders lock your capital idle. YieldWait puts every waiting dollar to work. 
              On a $10,000 order waiting 7 days, that's <span className="text-yield-teal font-semibold">~$16.71 in free yield</span> you'd otherwise miss.
            </p>
            <div className="space-y-3">
              {[
                { label: 'Traditional DEX Limit Order', pct: 0, color: '#374151' },
                { label: 'YieldWait @ 8.7% APY', pct: 87, color: '#00D4AA' },
              ].map(item => (
                <div key={item.label} className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-yield-dim">{item.label}</span>
                    <span className="font-mono font-bold" style={{ color: item.color }}>
                      {item.pct === 0 ? '0.00%' : '8.70%'} APY
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-yield-subtle overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-1000"
                      style={{ width: `${item.pct}%`, background: item.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            {[
              { amount: '$1,000', wait: '3 days', yield: '$0.71', highlight: false },
              { amount: '$5,000', wait: '7 days', yield: '$8.36', highlight: false },
              { amount: '$10,000', wait: '14 days', yield: '$33.42', highlight: true },
              { amount: '$50,000', wait: '30 days', yield: '$358.36', highlight: false },
            ].map(row => (
              <div key={row.amount}
                className={`flex items-center justify-between px-5 py-3.5 rounded-xl border ${
                  row.highlight ? 'border-yield-teal/40 bg-yield-teal/5' : 'border-yield-border bg-yield-card'
                }`}>
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-yield-text">{row.amount}</span>
                  <span className="text-yield-muted text-sm">waiting {row.wait}</span>
                </div>
                <div className="text-right">
                  <p className="font-mono font-bold text-yield-teal">{row.yield}</p>
                  <p className="text-yield-muted text-xs">yield earned</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partners */}
      <section className="space-y-8 text-center">
        <h2 className="text-2xl font-bold text-yield-dim">Built on battle-tested partners</h2>
        <div className="flex flex-wrap justify-center gap-4">
          {PARTNERS.map(p => (
            <div key={p.name}
              className="glass-card rounded-xl px-6 py-4 flex flex-col items-center gap-1 hover:scale-105 transition-transform"
              style={{ borderColor: `${p.color}30` }}>
              <span className="font-bold text-sm" style={{ color: p.color }}>{p.name}</span>
              <span className="text-yield-muted text-xs">{p.role}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="text-center space-y-6 py-8">
        <h2 className="text-4xl font-black">Ready to earn while you wait?</h2>
        <p className="text-yield-dim max-w-lg mx-auto">
          Connect your Solflare wallet and place your first yield-generating limit order in under 60 seconds.
        </p>
        <button
          onClick={() => setPage('place')}
          className="teal-glow-btn px-10 py-5 rounded-xl font-bold text-black text-xl inline-flex items-center gap-3"
        >
          <TrendingUp size={22} />
          Start Earning Yield
        </button>
        <p className="text-yield-muted text-sm">Non-custodial · On-chain · No fees to place</p>
      </section>
    </div>
  )
}
