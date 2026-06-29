/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { CardConfig, NFTPreset, BgStyleType } from '../types';
import { NFT_PRESETS, AVATAR_PRESETS } from '../data/presets';
import { Sparkles, Cpu, Layers, Edit, Eye, Type, Shield, Image as ImageIcon, Loader2, Check, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface CardCustomizerProps {
  config: CardConfig;
  onChange: (updates: Partial<CardConfig>) => void;
  selectedWalletName?: string;
  selectedWalletAddress?: string;
}

export const CardCustomizer: React.FC<CardCustomizerProps> = ({
  config,
  onChange,
  selectedWalletName,
  selectedWalletAddress
}) => {
  const [activeTab, setActiveTab] = useState<'simulation' | 'stats' | 'style'>('simulation');
  const [isFetchingCollection, setIsFetchingCollection] = useState(false);
  const [fetchSuccess, setFetchSuccess] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Triggered when selected wallet changes
  useEffect(() => {
    if (selectedWalletName) {
      onChange({ username: selectedWalletName });
    }
  }, [selectedWalletName]);

  // Automatic PNL calculation effect based on user's exact formula:
  // (a) Hitung berapa yang sedang di-holding dan berapa yang sudah sold.
  // (b) Untuk yang sold, hitung dia menjual berapa. Untuk yang holding, hitung berapa value-nya pada saat kartu itu dibuat.
  // (c) Hasil tersebut dikurangi dengan berapa total dia membeli atau total biaya dia minted.
  useEffect(() => {
    const totalCost = config.mintedVal + config.boughtVal;
    const totalRevenue = config.soldVal + config.holdingVal;
    const pnlToken = totalRevenue - totalCost;
    
    // Conversion to USD
    const ethPriceUsd = config.ethPriceUsd ?? 3000;
    const solPriceUsd = 145;
    const conversionRate = config.currency === 'SOL' ? solPriceUsd : ethPriceUsd;
    const pnlUsd = pnlToken * conversionRate;
    
    // Percentage ROI
    const pnlPercent = totalCost > 0 ? (pnlToken / totalCost) * 100 : 0;
    const isProfit = pnlToken >= 0;

    // To prevent infinite re-renders, only call onChange if values actually changed
    if (
      Math.abs(config.pnlToken - pnlToken) > 0.0001 ||
      Math.abs(config.pnlUsd - pnlUsd) > 0.01 ||
      Math.abs(config.pnlPercent - pnlPercent) > 0.1 ||
      config.isProfit !== isProfit
    ) {
      onChange({
        pnlToken,
        pnlUsd,
        pnlPercent,
        isProfit
      });
    }
  }, [config.mintedVal, config.boughtVal, config.soldVal, config.holdingVal, config.currency]);

  // Handlers for automatic contract resolution
  const handleContractAddressChange = async (address: string) => {
    onChange({ contractAddress: address });
    
    if (!address || address.trim().length < 10) {
      setFetchSuccess(false);
      setFetchError(null);
      return;
    }
    
    setIsFetchingCollection(true);
    setFetchSuccess(false);
    setFetchError(null);
    
    const cleanAddr = address.trim();
    
    // 1. Cek preset lokal dulu (zero-latency)
    const preset = NFT_PRESETS.find(p => p.contractAddress.toLowerCase() === cleanAddr.toLowerCase());
    if (preset) {
      onChange({
        collectionName: preset.name,
        logoPreset: preset.logoPreset,
        currency: preset.chain === 'SOL' ? 'SOL' : 'ETH'
      });
      setIsFetchingCollection(false);
      setFetchSuccess(true);
      return;
    }

    // 2. Fetch dari OpenSea API
    const openSeaKey = import.meta.env.VITE_OPENSEA_API_KEY;
    if (openSeaKey) {
      try {
        // Fetch nama koleksi dari contract
        const contractRes = await fetch(
          `https://api.opensea.io/api/v2/chain/ethereum/contract/${cleanAddr}`,
          { headers: { 'x-api-key': openSeaKey, 'accept': 'application/json' } }
        );
        if (contractRes.ok) {
          const contractData = await contractRes.json();
          const collectionSlug = contractData.collection;
          const collectionName = contractData.name;

          // Fetch gambar dari collection slug
          if (collectionSlug) {
            const colRes = await fetch(
              `https://api.opensea.io/api/v2/collections/${collectionSlug}`,
              { headers: { 'x-api-key': openSeaKey, 'accept': 'application/json' } }
            );
            if (colRes.ok) {
              const colData = await colRes.json();
              const imageUrl = colData.image_url || colData.banner_image_url || '';
              onChange({
                collectionName: collectionName || colData.name,
                ...(imageUrl && { customLogoUrl: imageUrl })
              });
              setIsFetchingCollection(false);
              setFetchSuccess(true);
              return;
            }
          }

          if (collectionName) {
            onChange({ collectionName });
            setIsFetchingCollection(false);
            setFetchSuccess(true);
            return;
          }
        }
      } catch (err) {
        console.error('OpenSea fetch failed', err);
      }
    }
    
    // 3. Fallback ke Reservoir
    try {
      const res = await fetch(`https://api.reservoir.tools/collections/v5?id=${cleanAddr}`);
      if (res.ok) {
        const data = await res.json();
        if (data?.collections?.length > 0) {
          onChange({ collectionName: data.collections[0].name });
          setIsFetchingCollection(false);
          setFetchSuccess(true);
          return;
        }
      }
    } catch (err) {
      console.error('Reservoir fetch failed', err);
    }
    
    // 4. Fallback nama dari address
    const shortAddr = cleanAddr.slice(0, 6) + '...' + cleanAddr.slice(-4);
    onChange({ collectionName: `NFT Contract ${shortAddr}` });
    setIsFetchingCollection(false);
    setFetchSuccess(true);
  };

  // Fetch real PNL dari Etherscan berdasarkan wallet + contract address
  const [isFetchingPNL, setIsFetchingPNL] = useState(false);
  const [pnlFetchError, setPnlFetchError] = useState<string | null>(null);

  const runSimulation = async () => {
    const walletAddr = selectedWalletAddress || config.walletAddress;
    const contractAddr = config.contractAddress;
    const etherscanKey = import.meta.env.VITE_ETHERSCAN_API_KEY;

    if (!walletAddr || !contractAddr) {
      setPnlFetchError('Pastikan wallet address dan contract address sudah diisi.');
      return;
    }
    if (!etherscanKey) {
      setPnlFetchError('VITE_ETHERSCAN_API_KEY belum diset di .env');
      return;
    }

    setIsFetchingPNL(true);
    setPnlFetchError(null);

    try {
      // 1. Fetch harga ETH real-time dari CoinGecko
      let ethPriceUsd = 3000;
      try {
        const priceRes = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
        if (priceRes.ok) {
          const priceData = await priceRes.json();
          ethPriceUsd = priceData?.ethereum?.usd ?? 3000;
        }
      } catch { /* pakai fallback */ }

      // 2. Fetch semua transaksi NFT (ERC-721) wallet ini untuk contract ini
      const txRes = await fetch(
        `https://api.etherscan.io/api?module=account&action=tokennfttx&contractaddress=${contractAddr}&address=${walletAddr}&sort=asc&apikey=${etherscanKey}`
      );
      if (!txRes.ok) throw new Error('Gagal fetch dari Etherscan');
      const txData = await txRes.json();

      if (txData.status === '0') {
        throw new Error(txData.message === 'No transactions found'
          ? 'Tidak ada transaksi NFT ditemukan untuk wallet + contract ini.'
          : txData.message || 'Etherscan error');
      }

      const txList = txData.result as Array<{
        from: string; to: string; value: string;
        tokenID: string; timeStamp: string; hash: string;
      }>;

      const wallet = walletAddr.toLowerCase();

      // 3. Fetch harga ETH per transaksi dari Etherscan (internal tx value)
      //    Kita ambil nilai ETH dari setiap tx hash
      const getTxValue = async (hash: string): Promise<number> => {
        try {
          const r = await fetch(
            `https://api.etherscan.io/api?module=proxy&action=eth_getTransactionByHash&txhash=${hash}&apikey=${etherscanKey}`
          );
          const d = await r.json();
          const weiHex = d?.result?.value;
          if (!weiHex) return 0;
          return parseInt(weiHex, 16) / 1e18;
        } catch { return 0; }
      };

      // Proses transaksi — batch fetch nilai ETH (max 5 paralel biar tidak rate-limit)
      let mintedCount = 0, mintedVal = 0;
      let boughtCount = 0, boughtVal = 0;
      let soldCount = 0, soldVal = 0;
      let holdingCount = 0;

      const nullAddr = '0x0000000000000000000000000000000000000000';
      const heldTokens = new Set<string>();

      // Batch fetch nilai transaksi
      const batchSize = 5;
      for (let i = 0; i < txList.length; i += batchSize) {
        const batch = txList.slice(i, i + batchSize);
        const values = await Promise.all(batch.map(tx => getTxValue(tx.hash)));

        batch.forEach((tx, idx) => {
          const ethVal = values[idx];
          const isIncoming = tx.to.toLowerCase() === wallet;
          const isOutgoing = tx.from.toLowerCase() === wallet;

          if (isIncoming) {
            if (tx.from.toLowerCase() === nullAddr) {
              // Mint
              mintedCount++;
              mintedVal += ethVal;
            } else {
              // Beli dari orang lain
              boughtCount++;
              boughtVal += ethVal;
            }
            heldTokens.add(tx.tokenID);
          } else if (isOutgoing) {
            // Jual / transfer keluar
            soldCount++;
            soldVal += ethVal;
            heldTokens.delete(tx.tokenID);
          }
        });
      }

      holdingCount = heldTokens.size;

      // 4. Estimasi nilai holding pakai floor price dari OpenSea kalau ada
      let floorPrice = 0;
      const openSeaKey = import.meta.env.VITE_OPENSEA_API_KEY;
      if (openSeaKey && holdingCount > 0) {
        try {
          const contractRes = await fetch(
            `https://api.opensea.io/api/v2/chain/ethereum/contract/${contractAddr}`,
            { headers: { 'x-api-key': openSeaKey, 'accept': 'application/json' } }
          );
          if (contractRes.ok) {
            const cd = await contractRes.json();
            if (cd.collection) {
              const colRes = await fetch(
                `https://api.opensea.io/api/v2/collections/${cd.collection}/stats`,
                { headers: { 'x-api-key': openSeaKey, 'accept': 'application/json' } }
              );
              if (colRes.ok) {
                const colStats = await colRes.json();
                floorPrice = colStats?.total?.floor_price ?? 0;
              }
            }
          }
        } catch { /* skip floor price */ }
      }

      const holdingVal = holdingCount * floorPrice;

      onChange({
        mintedCount,
        mintedVal,
        boughtCount,
        boughtVal,
        soldCount,
        soldVal,
        holdingCount,
        holdingVal,
        ethPriceUsd,
      });

    } catch (err: unknown) {
      setPnlFetchError(err instanceof Error ? err.message : 'Terjadi error saat fetch data.');
    } finally {
      setIsFetchingPNL(false);
    }
  };

  const logos = [
    { key: 'bite_club', name: 'Bite Club Shape' },
    { key: 'bored_ape', name: 'Cyber Crown' },
    { key: 'azuki', name: 'Star Shuriken' },
    { key: 'pudgy_penguins', name: 'Arctic Shield' },
    { key: 'degods', name: 'Deity Column' },
    { key: 'cyber_cube', name: 'Sleek Cyber Cube' },
    { key: 'ether_diamond', name: 'Sleek Diamond' },
    { key: 'base_orbit', name: 'Layered Orbit' },
    { key: 'sol_sun', name: 'Sol Radiant' }
  ];

  const backgrounds: { id: BgStyleType; name: string; class: string }[] = [
    { id: 'cosmic', name: 'Cosmic Slate', class: 'bg-gradient-to-r from-zinc-950 via-teal-950/20 to-blue-950/20' },
    { id: 'nebula', name: 'Cyber Nebula', class: 'bg-gradient-to-r from-zinc-950 via-purple-950/30 to-pink-950/20' },
    { id: 'solar', name: 'Solar Eclipse', class: 'bg-gradient-to-r from-zinc-950 via-orange-950/30 to-red-950/20' },
    { id: 'gold', name: 'Obsidian Gold', class: 'bg-gradient-to-r from-zinc-950 via-amber-950/30 to-yellow-950/10' },
    { id: 'obsidian', name: 'Monochrome Silver', class: 'bg-gradient-to-r from-zinc-950 via-zinc-800/40 to-zinc-900/15' }
  ];

  return (
    <div id="card-customizer-section" className="bg-[#0e0e0e] border border-white/5 rounded-2xl p-6 shadow-2xl space-y-6">
      {/* Navigation tabs */}
      <div className="flex border-b border-white/5 pb-1">
        <button
          onClick={() => setActiveTab('simulation')}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
            activeTab === 'simulation'
              ? 'border-white text-white font-black'
              : 'border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" /> Generate PNL
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
            activeTab === 'stats'
              ? 'border-white text-white font-black'
              : 'border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Edit className="w-3.5 h-3.5" /> Manual Stats
        </button>
        <button
          onClick={() => setActiveTab('style')}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
            activeTab === 'style'
              ? 'border-white text-white font-black'
              : 'border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Layers className="w-3.5 h-3.5" /> Style & Theme
        </button>
      </div>

      {/* TAB 1: PRESETS AND SIMULATION */}
      {activeTab === 'simulation' && (
        <div className="space-y-5 animate-fade-in">
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">Custom NFT Contract Address</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Enter contract address (e.g., 0xbc4ca0... or 0x3278...)"
                value={config.contractAddress}
                onChange={(e) => handleContractAddressChange(e.target.value)}
                className="w-full bg-black border border-[#333] focus:border-white/40 rounded-xl pl-3 pr-10 py-3 text-xs text-white placeholder-zinc-600 focus:outline-none font-mono transition-all"
              />
              <div className="absolute right-3.5 top-3.5 flex items-center">
                {isFetchingCollection && <Loader2 className="w-4 h-4 text-zinc-500 animate-spin" />}
                {!isFetchingCollection && fetchSuccess && <Check className="w-4 h-4 text-emerald-400" />}
              </div>
            </div>
          </div>

          <div className="p-3 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold block">Detected Collection Name</span>
              <span className="text-sm font-black text-white">{config.collectionName || 'Awaiting contract address...'}</span>
            </div>
            {fetchSuccess && (
              <span className="text-[10px] bg-emerald-950 border border-emerald-800 text-emerald-400 px-2 py-0.5 rounded-full font-bold">
                Active
              </span>
            )}
          </div>

          <div className="bg-[#111111] border border-white/5 rounded-xl p-4.5 space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-1.5 bg-white/5 rounded-lg border border-white/10 shrink-0">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-zinc-200">Fetch Real PNL Data</h4>
                <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                  Fetch data transaksi NFT nyata dari blockchain Ethereum berdasarkan wallet & contract address.
                </p>
              </div>
            </div>

            {pnlFetchError && (
              <div className="flex items-start gap-2 bg-red-950/40 border border-red-500/20 rounded-lg p-3">
                <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-red-400 leading-relaxed">{pnlFetchError}</p>
              </div>
            )}

            <motion.button
              whileHover={{ scale: isFetchingPNL ? 1 : 1.01 }}
              whileTap={{ scale: isFetchingPNL ? 1 : 0.99 }}
              onClick={runSimulation}
              disabled={isFetchingPNL}
              className="w-full bg-white hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold py-2.5 rounded-xl text-xs transition-all shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {isFetchingPNL
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Fetching dari Etherscan...</>
                : <><Cpu className="w-4 h-4" /> Generate PNL</>
              }
            </motion.button>
          </div>
        </div>
      )}

      {/* TAB 2: DETAILED MANUAL STATS */}
      {activeTab === 'stats' && (
        <div className="space-y-4 animate-fade-in max-h-[350px] overflow-y-auto pr-1">
          {/* Minted & Bought */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] text-zinc-400 font-semibold uppercase tracking-wider">Minted Count</label>
              <input
                type="number"
                min="0"
                value={config.mintedCount}
                onChange={(e) => onChange({ mintedCount: parseInt(e.target.value) || 0 })}
                className="w-full bg-black border border-[#333] focus:border-white/40 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] text-zinc-400 font-semibold uppercase tracking-wider">Minted Value</label>
              <input
                type="number"
                step="0.001"
                min="0"
                value={config.mintedVal}
                onChange={(e) => onChange({ mintedVal: parseFloat(e.target.value) || 0 })}
                className="w-full bg-black border border-[#333] focus:border-white/40 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Bought */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] text-zinc-400 font-semibold uppercase tracking-wider">Bought Count</label>
              <input
                type="number"
                min="0"
                value={config.boughtCount}
                onChange={(e) => onChange({ boughtCount: parseInt(e.target.value) || 0 })}
                className="w-full bg-black border border-[#333] focus:border-white/40 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] text-zinc-400 font-semibold uppercase tracking-wider">Bought Value</label>
              <input
                type="number"
                step="0.001"
                min="0"
                value={config.boughtVal}
                onChange={(e) => onChange({ boughtVal: parseFloat(e.target.value) || 0 })}
                className="w-full bg-black border border-[#333] focus:border-white/40 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Sold & Holding */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] text-zinc-400 font-semibold uppercase tracking-wider">Sold Count</label>
              <input
                type="number"
                min="0"
                value={config.soldCount}
                onChange={(e) => onChange({ soldCount: parseInt(e.target.value) || 0 })}
                className="w-full bg-black border border-[#333] focus:border-white/40 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] text-zinc-400 font-semibold uppercase tracking-wider">Sold Value</label>
              <input
                type="number"
                step="0.001"
                min="0"
                value={config.soldVal}
                onChange={(e) => onChange({ soldVal: parseFloat(e.target.value) || 0 })}
                className="w-full bg-black border border-[#333] focus:border-white/40 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Holding */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] text-zinc-400 font-semibold uppercase tracking-wider">Holding Count</label>
              <input
                type="number"
                min="0"
                value={config.holdingCount}
                onChange={(e) => onChange({ holdingCount: parseInt(e.target.value) || 0 })}
                className="w-full bg-black border border-[#333] focus:border-white/40 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] text-zinc-400 font-semibold uppercase tracking-wider">Holding Value</label>
              <input
                type="number"
                step="0.001"
                min="0"
                value={config.holdingVal}
                onChange={(e) => onChange({ holdingVal: parseFloat(e.target.value) || 0 })}
                className="w-full bg-black border border-[#333] focus:border-white/40 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Core PNL Calculation Preview (Auto computed!) */}
          <div className="border-t border-white/5 pt-3.5 mt-2 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Auto-Calculated PNL Results</span>
            </div>
            <p className="text-[10px] text-zinc-500 leading-relaxed">
              Calculated via: <span className="text-zinc-300">(Sold Value + Holding Value) - (Minted Cost + Bought Cost)</span>.
            </p>

            <div className="grid grid-cols-3 gap-2 bg-black/40 p-2.5 rounded-xl border border-white/5 mt-1 text-center">
              <div>
                <span className="text-[9px] text-zinc-500 block uppercase font-bold">Total PNL</span>
                <span className={`text-xs font-black ${config.isProfit ? 'text-emerald-400' : 'text-red-400'}`}>
                  {config.isProfit ? '+' : ''}{config.pnlToken.toFixed(4)} {config.currency}
                </span>
              </div>
              <div>
                <span className="text-[9px] text-zinc-500 block uppercase font-bold">Total USD</span>
                <span className={`text-xs font-black ${config.isProfit ? 'text-emerald-400' : 'text-red-400'}`}>
                  {config.isProfit ? '+' : ''}${config.pnlUsd.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                </span>
              </div>
              <div>
                <span className="text-[9px] text-zinc-500 block uppercase font-bold">ROI (%)</span>
                <span className={`text-xs font-black ${config.isProfit ? 'text-emerald-400' : 'text-red-400'}`}>
                  {config.isProfit ? '+' : ''}{config.pnlPercent.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: VISUAL STYLES */}
      {activeTab === 'style' && (
        <div className="space-y-4 animate-fade-in max-h-[350px] overflow-y-auto pr-1">
          {/* Main Currency Display Selector */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">Primary PNL Currency</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onChange({ mainCurrency: 'USD' })}
                className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                  config.mainCurrency === 'USD'
                    ? 'bg-white border-white text-black font-black'
                    : 'bg-black border-[#333] text-zinc-400 hover:border-zinc-700'
                }`}
              >
                USD ($)
              </button>
              <button
                type="button"
                onClick={() => onChange({ mainCurrency: 'ETH' })}
                className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                  config.mainCurrency === 'ETH'
                    ? 'bg-white border-white text-black font-black'
                    : 'bg-black border-[#333] text-zinc-400 hover:border-zinc-700'
                }`}
              >
                Crypto Token ({config.currency})
              </button>
            </div>
          </div>

          {/* Background selection */}
          <div className="space-y-2">
            <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">Card Theme & Background</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {backgrounds.map((bg) => (
                <button
                  key={bg.id}
                  onClick={() => onChange({ bgStyle: bg.id })}
                  className={`flex flex-col p-2.5 rounded-xl border text-left transition-all ${
                    config.bgStyle === bg.id
                      ? 'border-white bg-[#161616] shadow-md shadow-white/5'
                      : 'border-white/5 bg-[#111111] hover:bg-[#161616]'
                  }`}
                >
                  <div className={`w-full h-8 rounded-lg ${bg.class} mb-1.5 border border-white/5`} />
                  <span className="text-[11px] font-bold text-zinc-100">{bg.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Discord integration */}
          <div className="space-y-2.5 bg-black/40 p-3.5 rounded-xl border border-white/5">
            <span className="text-[11px] font-black text-white uppercase tracking-wider block">Custom Discord Integration</span>
            <div className="space-y-2">
              <div className="space-y-1">
                <span className="text-[10px] text-zinc-500">Discord Invite or Username</span>
                <input
                  type="text"
                  placeholder="e.g., discord.gg/egodao or zntyacc#1337"
                  value={config.discordName || ''}
                  onChange={(e) => onChange({ discordName: e.target.value })}
                  className="w-full bg-black border border-[#333] focus:border-white/40 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none transition-all"
                />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-zinc-500">Discord Icon / Logo URL</span>
                <input
                  type="text"
                  placeholder="e.g., https://... or leave blank for default"
                  value={config.discordLogoUrl || ''}
                  onChange={(e) => onChange({ discordLogoUrl: e.target.value })}
                  className="w-full bg-black border border-[#333] focus:border-white/40 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Social Watermark Customization */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-zinc-400" /> Watermark (X / Twitter handle)
            </label>
            <input
              type="text"
              placeholder="x.com/username"
              value={config.watermark}
              onChange={(e) => onChange({ watermark: e.target.value })}
              className="w-full bg-black border border-[#333] focus:border-white/40 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none transition-all"
            />
          </div>

          {/* Manual Avatar Customizer if desired */}
          <div className="space-y-2 pt-1">
            <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-zinc-400" /> Profile Avatar Preset
            </label>
            <div className="flex items-center gap-2 overflow-x-auto py-1">
              {AVATAR_PRESETS.map((pUrl, idx) => (
                <button
                  key={idx}
                  onClick={() => onChange({ avatarUrl: pUrl })}
                  className={`relative shrink-0 w-11 h-11 rounded-xl overflow-hidden border-2 transition-all ${
                    config.avatarUrl === pUrl ? 'border-white scale-105' : 'border-white/5 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={pUrl} alt="Avatar Preset" className="w-full h-full object-cover" />
                </button>
              ))}
              <input
                type="text"
                placeholder="Paste custom image URL..."
                value={config.avatarUrl.startsWith('https://images.unsplash.com') ? '' : config.avatarUrl}
                onChange={(e) => {
                  if (e.target.value.trim()) {
                     onChange({ avatarUrl: e.target.value.trim() });
                  }
                }}
                className="bg-black border border-[#333] rounded-xl text-[10px] px-2.5 py-2 w-32 focus:outline-none focus:border-white/40 text-white truncate placeholder-zinc-600 transition-all"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
