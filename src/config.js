const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.eitherway.ai';

export const PROXY_API = (url) => `${API_BASE_URL}/api/proxy-api?url=${encodeURIComponent(url)}`;
export const DIALECT_PROXY = `${API_BASE_URL}/api/dialect`;
export const DFLOW_PROXY = `${API_BASE_URL}/api/dflow`;
export const SOLANA_RPC_PROXY = `${API_BASE_URL}/api/solana/rpc`;

export const QUICKNODE_RPC = `${API_BASE_URL}/api/quicknode/rpc/solana`;

// Token definitions
export const TOKENS = {
  SOL: {
    mint: 'So11111111111111111111111111111111111111112',
    symbol: 'SOL',
    name: 'Solana',
    decimals: 9,
    logo: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
    coingeckoId: 'solana',
  },
  USDC: {
    mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    logo: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png',
    coingeckoId: 'usd-coin',
  },
  USDT: {
    mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
    symbol: 'USDT',
    name: 'Tether USD',
    decimals: 6,
    logo: 'https://coin-images.coingecko.com/coins/images/325/small/Tether.png',
    coingeckoId: 'tether',
  },
  JUP: {
    mint: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',
    symbol: 'JUP',
    name: 'Jupiter',
    decimals: 6,
    logo: 'https://static.jup.ag/jup/icon.png',
    coingeckoId: 'jupiter-exchange-solana',
  },
  BONK: {
    mint: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
    symbol: 'BONK',
    name: 'Bonk',
    decimals: 5,
    logo: 'https://arweave.net/hQiPZOsRZXGXBJd_82PhVdlM_hACsT_q6wqwf5cSY7I',
    coingeckoId: 'bonk',
  },
  WIF: {
    mint: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm',
    symbol: 'WIF',
    name: 'dogwifhat',
    decimals: 6,
    logo: 'https://coin-images.coingecko.com/coins/images/33566/small/dogwifhat.jpg',
    coingeckoId: 'dogwifhat',
  },
};

export const TOKEN_LIST = Object.values(TOKENS);

// Kamino vault APYs (fetched live, these are fallbacks)
export const KAMINO_VAULT_APYS = {
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': 8.7,  // USDC
  'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': 7.2,  // USDT
  'So11111111111111111111111111111111111111112': 6.1,     // SOL
};

export const BIRDEYE_BASE = 'https://public-api.birdeye.so';
export const KAMINO_API_BASE = 'https://api.kamino.finance';
