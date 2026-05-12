import React, { useState } from 'react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { TrendingUp, LayoutDashboard, PlusCircle, BarChart2, Briefcase, Menu, X } from 'lucide-react'

const NAV_ITEMS = [
  { id: 'home', label: 'Home', icon: TrendingUp },
  { id: 'place', label: 'Place Order', icon: PlusCircle },
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'portfolio', label: 'Portfolio', icon: Briefcase },
  { id: 'analytics', label: 'Analytics', icon: BarChart2 },
]

export default function Navbar({ page, setPage }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="relative z-50 border-b border-yield-border/50"
      style={{ background: 'rgba(8,11,20,0.9)', backdropFilter: 'blur(20px)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button onClick={() => setPage('home')} className="flex items-center gap-2.5 group">
            <div className="relative">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #00D4AA, #06B6D4)' }}>
                <TrendingUp size={16} className="text-black" />
              </div>
              <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: 'linear-gradient(135deg, #00D4AA, #06B6D4)', filter: 'blur(8px)' }} />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm leading-tight gradient-text">YieldWait</span>
              <span className="text-[10px] text-yield-muted leading-tight">Protocol</span>
            </div>
          </button>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map(item => {
              const Icon = item.icon
              const active = page === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => setPage(item.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    active
                      ? 'text-yield-teal bg-yield-teal/10 border border-yield-teal/20'
                      : 'text-yield-dim hover:text-yield-text hover:bg-white/5'
                  }`}
                >
                  <Icon size={14} />
                  {item.label}
                </button>
              )
            })}
          </nav>

          {/* Wallet + mobile toggle */}
          <div className="flex items-center gap-3">
            {/* Partner pills */}
            <div className="hidden lg:flex items-center gap-2">
              <span className="text-[10px] px-2 py-1 rounded-full border border-yield-border text-yield-muted font-mono">
                DFlow
              </span>
              <span className="text-[10px] px-2 py-1 rounded-full border border-yield-border text-yield-muted font-mono">
                Kamino
              </span>
              <span className="text-[10px] px-2 py-1 rounded-full border border-yield-border text-yield-muted font-mono">
                Birdeye
              </span>
            </div>
            <WalletMultiButton />
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg text-yield-dim hover:text-yield-text hover:bg-white/5"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <nav className="md:hidden pb-4 flex flex-col gap-1">
            {NAV_ITEMS.map(item => {
              const Icon = item.icon
              const active = page === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => { setPage(item.id); setMobileOpen(false) }}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    active ? 'text-yield-teal bg-yield-teal/10' : 'text-yield-dim hover:text-yield-text hover:bg-white/5'
                  }`}
                >
                  <Icon size={15} />
                  {item.label}
                </button>
              )
            })}
          </nav>
        )}
      </div>
    </header>
  )
}
