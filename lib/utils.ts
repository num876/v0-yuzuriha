import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const STOCK_SYMBOLS = [
  'AAPL', 'TSLA', 'NVDA', 'MSFT', 'AMZN', 'GOOGL', 'META', 'NFLX', 'AMD', 'INTC',
  'QCOM', 'AVGO', 'ARM', 'COIN', 'MSTR', 'PLTR', 'BABA', 'TSM', 'ASML', 'SMCI',
  'ORCL', 'IBM', 'CRM', 'UBER', 'LYFT', 'ABNB', 'DIS', 'V', 'MA', 'PYPL', 'SQ',
  'HOOD', 'JPM', 'GS', 'BAC', 'WMT', 'COST', 'HD', 'NKE', 'SBUX'
];

export const COMMODITY_SYMBOLS = ['XAUUSD', 'XAGUSD', 'USOIL', 'GLD'];

export function isStockSymbol(symbol: string): boolean {
  if (!symbol) return false;
  const clean = symbol.toUpperCase().split('-')[0].split('_')[0];
  return STOCK_SYMBOLS.includes(clean);
}

export function isCommoditySymbol(symbol: string): boolean {
  if (!symbol) return false;
  const clean = symbol.toUpperCase().split('-')[0].split('_')[0];
  return COMMODITY_SYMBOLS.includes(clean);
}

