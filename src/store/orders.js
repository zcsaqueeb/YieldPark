// YieldWait order store — localStorage backed with mock seed data

const STORAGE_KEY = 'yieldwait_orders_v2';

let _listeners = [];

function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

const NOW = Date.now();
const HOUR = 3600 * 1000;
const DAY = 24 * HOUR;

const SEED_ORDERS = [
  {
    id: 'ord_seed_1',
    status: 'active',
    inputToken: { symbol: 'USDC', mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', decimals: 6, logo: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png' },
    outputToken: { symbol: 'SOL', mint: 'So11111111111111111111111111111111111111112', decimals: 9, logo: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png' },
    inputAmount: 1200,
    targetPrice: 120.00,
    direction: 'below',
    kaminoApy: 8.7,
    kaminoVault: 'USDC Lending Vault',
    createdAt: NOW - 2.3 * DAY,
    yieldEarnedAtCreation: 0,
    txSignature: null,
    fillPrice: null,
    fillTx: null,
  },
  {
    id: 'ord_seed_2',
    status: 'active',
    inputToken: { symbol: 'USDC', mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', decimals: 6, logo: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png' },
    outputToken: { symbol: 'WIF', mint: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm', decimals: 6, logo: 'https://coin-images.coingecko.com/coins/images/33566/small/dogwifhat.jpg' },
    inputAmount: 500,
    targetPrice: 1.85,
    direction: 'below',
    kaminoApy: 8.7,
    kaminoVault: 'USDC Lending Vault',
    createdAt: NOW - 0.8 * DAY,
    yieldEarnedAtCreation: 0,
    txSignature: null,
    fillPrice: null,
    fillTx: null,
  },
  {
    id: 'ord_seed_3',
    status: 'filled',
    inputToken: { symbol: 'USDC', mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', decimals: 6, logo: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png' },
    outputToken: { symbol: 'SOL', mint: 'So11111111111111111111111111111111111111112', decimals: 9, logo: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png' },
    inputAmount: 800,
    targetPrice: 145.00,
    direction: 'below',
    kaminoApy: 8.7,
    kaminoVault: 'USDC Lending Vault',
    createdAt: NOW - 6 * DAY,
    yieldEarnedAtCreation: 0,
    txSignature: null,
    fillPrice: 144.92,
    fillTx: '3xKPmQ9hRf7dNbZ1TcWu6sYv2pJqAe5mLrCx8wGnHb4kVoEjFiSdYpQzMt',
    filledAt: NOW - 3 * DAY,
    yieldEarned: 3.24,
  },
  {
    id: 'ord_seed_4',
    status: 'filled',
    inputToken: { symbol: 'USDC', mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', decimals: 6, logo: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png' },
    outputToken: { symbol: 'JUP', mint: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN', decimals: 6, logo: 'https://static.jup.ag/jup/icon.png' },
    inputAmount: 350,
    targetPrice: 0.72,
    direction: 'below',
    kaminoApy: 8.7,
    kaminoVault: 'USDC Lending Vault',
    createdAt: NOW - 9 * DAY,
    yieldEarnedAtCreation: 0,
    txSignature: null,
    fillPrice: 0.715,
    fillTx: '7mNpKz2rTxAb4cHqWe9sLuJv5dYoGi8nFrBt3mXvQe1pKsRzCwGhDqAb2n',
    filledAt: NOW - 7 * DAY,
    yieldEarned: 1.87,
  },
];

function loadOrders() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  // First load — save seed data
  localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_ORDERS));
  return SEED_ORDERS;
}

function saveOrders(orders) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  _listeners.forEach(fn => fn(orders));
}

export function getOrders() {
  return loadOrders();
}

export function addOrder(order) {
  const orders = loadOrders();
  const newOrder = { ...order, id: 'ord_' + generateId(), createdAt: Date.now(), yieldEarnedAtCreation: 0 };
  orders.unshift(newOrder);
  saveOrders(orders);
  return newOrder;
}

export function cancelOrder(id) {
  const orders = loadOrders().map(o =>
    o.id === id ? { ...o, status: 'cancelled', cancelledAt: Date.now() } : o
  );
  saveOrders(orders);
}

export function fillOrder(id, fillPrice, fillTx, yieldEarned) {
  const orders = loadOrders().map(o =>
    o.id === id ? { ...o, status: 'filled', fillPrice, fillTx, yieldEarned, filledAt: Date.now() } : o
  );
  saveOrders(orders);
}

export function subscribe(fn) {
  _listeners.push(fn);
  return () => { _listeners = _listeners.filter(f => f !== fn); };
}

// Calculate live yield for an active order
export function calcLiveYield(order) {
  if (order.status !== 'active') return order.yieldEarned || 0;
  const ageMs = Date.now() - order.createdAt;
  const ageYears = ageMs / (1000 * 3600 * 24 * 365);
  return order.inputAmount * (order.kaminoApy / 100) * ageYears;
}

// Per-second yield increment
export function yieldPerSecond(order) {
  return (order.inputAmount * (order.kaminoApy / 100)) / (365 * 24 * 3600);
}
