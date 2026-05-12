import React, { useMemo, useEffect, useState } from 'react'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { SOLANA_RPC_PROXY } from './config.js'
import Navbar from './components/Navbar.jsx'
import LandingPage from './components/LandingPage.jsx'
import PlaceOrder from './components/PlaceOrder.jsx'
import Dashboard from './components/Dashboard.jsx'
import Portfolio from './components/Portfolio.jsx'
import Analytics from './components/Analytics.jsx'

const connectionConfig = {
  commitment: 'confirmed',
  wsEndpoint: '',
}

function useSolflareRecommended() {
  useEffect(() => {
    const STYLE_ID = 'solflare-recommended-styles'
    if (document.getElementById(STYLE_ID)) return
    const style = document.createElement('style')
    style.id = STYLE_ID
    style.textContent = `
      .wallet-adapter-modal-list li.solflare-recommended {
        order: -1; border: 1px solid rgba(0,212,170,0.4); border-radius: 8px;
        background: rgba(0,212,170,0.08); position: relative;
      }
      .solflare-recommended-badge {
        display: inline-flex; align-items: center;
        background: linear-gradient(135deg, #00D4AA, #06B6D4);
        color: #000; font-size: 10px; font-weight: 700;
        padding: 2px 8px; border-radius: 4px; margin-left: auto;
        letter-spacing: 0.5px; text-transform: uppercase;
      }
    `
    document.head.appendChild(style)

    function promoteSolflare(modalList) {
      const items = modalList.querySelectorAll('li')
      let sfItem = null
      items.forEach(li => {
        const btn = li.querySelector('.wallet-adapter-button')
        if (btn && btn.textContent?.toLowerCase().includes('solflare')) sfItem = li
      })
      if (sfItem && !sfItem.classList.contains('solflare-recommended')) {
        modalList.prepend(sfItem)
        sfItem.classList.add('solflare-recommended')
        const btn = sfItem.querySelector('.wallet-adapter-button')
        if (btn && !btn.querySelector('.solflare-recommended-badge')) {
          const badge = document.createElement('span')
          badge.className = 'solflare-recommended-badge'
          badge.textContent = 'Recommended'
          btn.appendChild(badge)
        }
      }
    }

    const observer = new MutationObserver(mutations => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === 1) {
            const list = node.classList?.contains('wallet-adapter-modal-list')
              ? node : node.querySelector?.('.wallet-adapter-modal-list')
            if (list) promoteSolflare(list)
          }
        }
      }
    })
    observer.observe(document.body, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [])
}

function WalletContextProvider({ children }) {
  useSolflareRecommended()
  const wallets = useMemo(() => [], [])
  return (
    <ConnectionProvider endpoint={SOLANA_RPC_PROXY} config={connectionConfig}>
      <WalletProvider wallets={wallets} autoConnect={false}>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}

export default function App() {
  const [page, setPage] = useState('home')

  return (
    <WalletContextProvider>
      <div className="min-h-screen bg-yield-bg text-yield-text">
        {/* Background effects */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #00D4AA 0%, transparent 70%)' }} />
          <div className="absolute top-[30%] right-[-15%] w-[500px] h-[500px] rounded-full opacity-8"
            style={{ background: 'radial-gradient(circle, #7C3AED 0%, transparent 70%)' }} />
          <div className="absolute bottom-[-10%] left-[30%] w-[400px] h-[400px] rounded-full opacity-6"
            style={{ background: 'radial-gradient(circle, #06B6D4 0%, transparent 70%)' }} />
          {/* Grid lines */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#00D4AA" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <Navbar page={page} setPage={setPage} />
        <main className="relative z-10">
          {page === 'home' && <LandingPage setPage={setPage} />}
          {page === 'place' && <PlaceOrder setPage={setPage} />}
          {page === 'dashboard' && <Dashboard setPage={setPage} />}
          {page === 'portfolio' && <Portfolio setPage={setPage} />}
          {page === 'analytics' && <Analytics setPage={setPage} />}
        </main>
      </div>
    </WalletContextProvider>
  )
}
