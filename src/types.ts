/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ChainType = 'ETH' | 'SOL' | 'BASE' | 'POLYGON';

export interface Wallet {
  id: string;
  name: string;
  address: string;
  chain: ChainType;
  avatarUrl?: string;
  createdAt: number;
}

export type BgStyleType = 'cosmic' | 'nebula' | 'solar' | 'gold' | 'obsidian';

export interface CardConfig {
  walletId: string; // 'custom' or wallet.id
  username: string;
  avatarUrl: string;
  collectionName: string;
  contractAddress: string;
  
  // Stats
  mintedCount: number;
  mintedVal: number;
  boughtCount: number;
  boughtVal: number;
  soldCount: number;
  soldVal: number;
  holdingCount: number;
  holdingVal: number;
  
  currency: 'ETH' | 'SOL' | 'USD' | 'BASE';
  
  // PNL Indicators
  pnlUsd: number;
  pnlPercent: number;
  pnlToken: number;
  isProfit: boolean;
  
  // Aesthetics
  logoPreset: string; // key of metallic logo
  customLogoUrl?: string;
  watermark: string;
  bgStyle: BgStyleType;
  shineEffect: boolean;

  // Price cache
  ethPriceUsd?: number;

  // Discord & Currency options
  discordName?: string;
  discordLogoUrl?: string;
  mainCurrency?: 'ETH' | 'USD';
}

export interface NFTPreset {
  id: string;
  name: string;
  contractAddress: string;
  chain: ChainType;
  logoPreset: string; // key of logo
  averagePrice: number; // in chain base currency
  floorPrice: number;
}
