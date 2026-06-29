/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { NFTPreset } from '../types';

export const NFT_PRESETS: NFTPreset[] = [
  {
    id: 'bite-club',
    name: 'Bite Club',
    contractAddress: '0x32789f268b8e0b0d2d38f28fa8e5bdf6b5bc93c0',
    chain: 'ETH',
    logoPreset: 'bite_club',
    averagePrice: 0.12,
    floorPrice: 0.08
  },
  {
    id: 'bayc',
    name: 'Bored Ape Yacht Club',
    contractAddress: '0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d',
    chain: 'ETH',
    logoPreset: 'bored_ape',
    averagePrice: 12.5,
    floorPrice: 11.2
  },
  {
    id: 'azuki',
    name: 'Azuki',
    contractAddress: '0xed5af61a10097bc672f629fb9df37cd5e571c130',
    chain: 'ETH',
    logoPreset: 'azuki',
    averagePrice: 4.8,
    floorPrice: 4.2
  },
  {
    id: 'pudgy-penguins',
    name: 'Pudgy Penguins',
    contractAddress: '0xbd3531da5cf5857e7cfaa92426877b022e612cf8',
    chain: 'ETH',
    logoPreset: 'pudgy_penguins',
    averagePrice: 8.4,
    floorPrice: 7.9
  },
  {
    id: 'degods',
    name: 'DeGods',
    contractAddress: '0x8821bee22fdbca25d14300ecb2ce4924c88599be',
    chain: 'ETH',
    logoPreset: 'degods',
    averagePrice: 1.1,
    floorPrice: 0.95
  },
  {
    id: 'mad-lads',
    name: 'Mad Lads',
    contractAddress: 'J1S9H3Q9...madlads...sol',
    chain: 'SOL',
    logoPreset: 'sol_sun',
    averagePrice: 68.5,
    floorPrice: 64.0
  },
  {
    id: 'sappy-seals',
    name: 'Sappy Seals',
    contractAddress: '0x12470f7a3a8383a887b407ee7d53b5fa53f5cf80',
    chain: 'ETH',
    logoPreset: 'cyber_cube',
    averagePrice: 0.45,
    floorPrice: 0.38
  },
  {
    id: 'base-buddies',
    name: 'Base Buddies',
    contractAddress: '0xb45e...basebuddies...base',
    chain: 'BASE',
    logoPreset: 'base_orbit',
    averagePrice: 0.05,
    floorPrice: 0.04
  }
];

export const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&w=150&q=80', // Cosmic gradient
  'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=150&q=80', // Abstract paint
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&q=80', // Neon geometry
  'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=150&q=80', // Dark liquid
  'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?auto=format&fit=crop&w=150&q=80'  // Cyberpunk glow
];
