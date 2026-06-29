/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Wallet, CardConfig } from './types';
import { WalletManager } from './components/WalletManager';
import { CardCustomizer } from './components/CardCustomizer';
import { PNLCardPreview } from './components/PNLCardPreview';
import { renderPNLCardToCanvas, copyImageToClipboard } from './components/CanvasRenderer';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Download,
  Copy,
  Twitter,
  Coins,
  CheckCircle2,
  AlertTriangle,
  Zap,
  RefreshCw,
  Wallet as WalletIcon,
  HelpCircle,
  ExternalLink
} from 'lucide-react';

export default function App() {
  // Load wallets from localStorage or set starter profiles
  const [wallets, setWallets] = useState<Wallet[]>(() => {
    const saved = localStorage.getItem('pnl_wallets');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    // Realistic initial starters so user has instant interaction
    return [
      {
        id: 'w-default-1',
        name: 'zntyyaacc',
        address: '0x32789f268b8e0b0d2d38f28fa8e5bdf6b5bc93c0',
        chain: 'ETH',
        avatarUrl: 'https://images.unsplash.com/photo-1642156814441-ab39227aa435?auto=format&fit=crop&w=150&q=80',
        createdAt: Date.now()
      },
      {
        id: 'w-default-2',
        name: 'SolanaWhale_NFT',
        address: 'DeGodsH3Q9J1S9madlads640sol',
        chain: 'SOL',
        avatarUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&q=80',
        createdAt: Date.now() - 50000
      }
    ];
  });

  const [activeWalletId, setActiveWalletId] = useState<string>('w-default-1');

  // Core configuration for the card
  const [cardConfig, setCardConfig] = useState<CardConfig>({
    walletId: 'w-default-1',
    username: 'zntyyaacc',
    avatarUrl: 'https://images.unsplash.com/photo-1642156814441-ab39227aa435?auto=format&fit=crop&w=150&q=80',
    collectionName: 'Bite Club',
    contractAddress: '0x32789f268b8e0b0d2d38f28fa8e5bdf6b5bc93c0',
    
    mintedCount: 0,
    mintedVal: 0.000,
    boughtCount: 45,
    boughtVal: 0.000,
    soldCount: 45,
    soldVal: 0.004,
    holdingCount: 0,
    holdingVal: 0.000,
    
    currency: 'ETH',
    pnlUsd: 13.80,
    pnlPercent: 176,
    pnlToken: 0.004,
    isProfit: true,
    
    logoPreset: 'bite_club',
    watermark: '',
    bgStyle: 'cosmic',
    shineEffect: true,
    discordName: 'Ego DAO',
    discordLogoUrl: '',
    mainCurrency: 'USD'
  });

  // Action status states
  const [isRendering, setIsRendering] = useState(false);
  const [notifications, setNotifications] = useState<{ id: string; type: 'success' | 'info' | 'error'; message: string }[]>([]);

  // Persist wallets on change
  useEffect(() => {
    localStorage.setItem('pnl_wallets', JSON.stringify(wallets));
  }, [wallets]);

  // Sync wallet selection changes to the card config
  const handleSelectWallet = (id: string) => {
    setActiveWalletId(id);
    const selected = wallets.find(w => w.id === id);
    if (selected) {
      setCardConfig(prev => ({
        ...prev,
        walletId: id,
        username: selected.name,
        avatarUrl: selected.avatarUrl || 'https://images.unsplash.com/photo-1642156814441-ab39227aa435?auto=format&fit=crop&w=150&q=80',
        currency: selected.chain === 'SOL' ? 'SOL' : 'ETH'
      }));
      addNotification('success', `Wallet profile "${selected.name}" loaded into active card!`);
    }
  };

  const handleAddWallet = (newWallet: Omit<Wallet, 'id' | 'createdAt'>) => {
    const id = `wallet-${Date.now()}`;
    const wallet: Wallet = {
      ...newWallet,
      id,
      createdAt: Date.now()
    };
    setWallets(prev => [wallet, ...prev]);
    setActiveWalletId(id);
    setCardConfig(prev => ({
      ...prev,
      walletId: id,
      username: wallet.name,
      avatarUrl: wallet.avatarUrl || 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&w=150&q=80',
      currency: wallet.chain === 'SOL' ? 'SOL' : 'ETH'
    }));
    addNotification('success', `Wallet "${wallet.name}" added and activated!`);
  };

  const handleDeleteWallet = (id: string) => {
    const remaining = wallets.filter(w => w.id !== id);
    setWallets(remaining);
    addNotification('info', 'Wallet deleted successfully.');
    
    // If deleted active wallet, pick another or default to custom
    if (activeWalletId === id) {
      if (remaining.length > 0) {
        handleSelectWallet(remaining[0].id);
      } else {
        setActiveWalletId('custom');
        setCardConfig(prev => ({
          ...prev,
          walletId: 'custom',
          username: 'Guest Account'
        }));
      }
    }
  };

  const handleUpdateWallet = (id: string, updated: Partial<Wallet>) => {
    setWallets(prev => prev.map(w => w.id === id ? { ...w, ...updated } : w));
    if (activeWalletId === id && updated.name) {
      setCardConfig(prev => ({ ...prev, username: updated.name! }));
    }
    addNotification('success', 'Wallet details updated.');
  };

  // Toast notification manager
  const addNotification = (type: 'success' | 'info' | 'error', message: string) => {
    const id = `notif-${Date.now()}`;
    setNotifications(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  };

  // Core download logic utilizing canvas paint
  const handleDownloadPNG = async () => {
    setIsRendering(true);
    addNotification('info', 'Rendering high-resolution PNL card...');
    
    try {
      // Delay slightly for render animation to complete
      await new Promise(resolve => setTimeout(resolve, 800));
      const dataUrl = await renderPNLCardToCanvas(cardConfig);
      
      const link = document.createElement('a');
      link.download = `PNL-Card-${cardConfig.collectionName.replace(/\s+/g, '-')}-${cardConfig.username}.png`;
      link.href = dataUrl;
      link.click();
      
      addNotification('success', 'PNL Card downloaded successfully!');
    } catch (err) {
      console.error(err);
      addNotification('error', 'Failed to generate PNG. Make sure the avatar image is valid.');
    } finally {
      setIsRendering(false);
    }
  };

  // Clipboard copy
  const handleCopyToClipboard = async () => {
    setIsRendering(true);
    addNotification('info', 'Preparing image copy...');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const dataUrl = await renderPNLCardToCanvas(cardConfig);
      const success = await copyImageToClipboard(dataUrl);
      
      if (success) {
        addNotification('success', 'PNL Card copied to Clipboard! You can now paste (Ctrl+V) directly in Discord or X.');
      } else {
        addNotification('error', 'Browser clipboard format is not supported. Please use Download PNG.');
      }
    } catch (err) {
      console.error(err);
      addNotification('error', 'Failed to copy image. Please download manually.');
    } finally {
      setIsRendering(false);
    }
  };

  // Share to Twitter/X
  const handleShareTwitter = () => {
    const profitSign = cardConfig.pnlUsd >= 0 ? '🚀 +' : '📉 ';
    const text = `Generated a premium PNL card for my "${cardConfig.collectionName}" collection! PNL: ${profitSign}$${Math.abs(cardConfig.pnlUsd).toFixed(0)} (${cardConfig.pnlPercent.toFixed(0)}% ROI). Created via PNL Card Studio!`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(twitterUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 flex flex-col font-sans selection:bg-white/10 selection:text-white">
      
      {/* Toast Notification HUD */}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm pointer-events-none">
        <AnimatePresence>
          {notifications.map((n) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className={`p-4 rounded-xl shadow-2xl border text-xs font-semibold flex items-center gap-3 pointer-events-auto ${
                n.type === 'success'
                  ? 'bg-emerald-950/90 border-emerald-800 text-emerald-300'
                  : n.type === 'error'
                  ? 'bg-red-950/90 border-red-800 text-red-300'
                  : 'bg-zinc-900/95 border-white/5 text-zinc-300'
              }`}
            >
              {n.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
              {n.type === 'error' && <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />}
              {n.type === 'info' && <Zap className="w-4 h-4 text-white shrink-0" />}
              <span>{n.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Main Header navigation */}
      <header className="border-b border-white/5 bg-[#050505]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-lg shadow-white/5">
              <Coins className="w-5 h-5 text-black" />
            </div>
            <div>
              <h1 className="text-base font-black tracking-wider text-white flex items-center gap-1.5 uppercase">
                PNL Card Studio
                <span className="text-[9px] font-bold bg-white/5 border border-white/10 text-white px-2 py-0.5 rounded-full uppercase tracking-normal normal-case">
                  Beta v1.2
                </span>
              </h1>
              <p className="text-[11px] text-zinc-500 font-medium">NFT & Crypto PNL Card Generator</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {cardConfig.discordName && (
              <div
                className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-zinc-400 border border-white/5 bg-white/5 px-3 py-1.5 rounded-xl"
              >
                Discord: {cardConfig.discordName}
              </div>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        
        {/* Dashboard Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Controls (Wallets & Customizer) */}
          <div className="lg:col-span-5 space-y-8">
            
            {/* 1. Wallet Manager */}
            <WalletManager
              wallets={wallets}
              activeWalletId={activeWalletId}
              onSelectWallet={handleSelectWallet}
              onAddWallet={handleAddWallet}
              onDeleteWallet={handleDeleteWallet}
              onUpdateWallet={handleUpdateWallet}
            />

            {/* 2. Card Customizer */}
            <CardCustomizer
              config={cardConfig}
              onChange={(updates) => setCardConfig(prev => ({ ...prev, ...updates }))}
              selectedWalletName={
                activeWalletId !== 'custom' ? wallets.find(w => w.id === activeWalletId)?.name : undefined
              }
              selectedWalletAddress={
                activeWalletId !== 'custom' ? wallets.find(w => w.id === activeWalletId)?.address : undefined
              }
            />

          </div>

          {/* RIGHT COLUMN: Live Card Preview & Share Actions */}
          <div className="lg:col-span-7 space-y-8 sticky top-[100px]">
            
            {/* Live Interactive Card Box */}
            <div className="bg-[#0e0e0e] border border-white/5 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-white/5 rounded-xl border border-white/10">
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white tracking-wide">Live Card Preview</h3>
                    <p className="text-xs text-zinc-400">Interactive & Real-Time</p>
                  </div>
                </div>
              </div>

              {/* Renders the actual card with interactive tilts and custom elements */}
              <div className="py-2 flex justify-center">
                <PNLCardPreview config={cardConfig} />
              </div>
            </div>

            {/* Share and Action Console */}
            <div className="bg-[#0e0e0e] border border-white/5 rounded-2xl p-6 shadow-2xl space-y-4">
              <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider">Export & Share Card</h3>
              <p className="text-xs text-zinc-500">Choose an option below to export or share your portfolio card.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                
                {/* 1. Download Action */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isRendering}
                  onClick={handleDownloadPNG}
                  className="flex items-center justify-center gap-2 py-3 px-4 bg-white hover:bg-zinc-200 disabled:bg-zinc-800 text-black font-black rounded-xl text-xs shadow-lg transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  {isRendering ? 'Processing...' : 'Download PNG'}
                </motion.button>

                {/* 2. Copy Action */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isRendering}
                  onClick={handleCopyToClipboard}
                  className="flex items-center justify-center gap-2 py-3 px-4 bg-black hover:bg-zinc-900 disabled:bg-zinc-950 border border-white/5 text-zinc-200 font-bold rounded-xl text-xs transition-all cursor-pointer"
                >
                  <Copy className="w-4 h-4 text-white" />
                  Copy Image
                </motion.button>

                {/* 3. Share Action */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleShareTwitter}
                  className="flex items-center justify-center gap-2 py-3 px-4 bg-black hover:bg-zinc-900 border border-white/5 text-zinc-200 font-bold rounded-xl text-xs transition-all cursor-pointer"
                >
                  <Twitter className="w-4 h-4 text-white" />
                  Share on X
                </motion.button>

              </div>

              {/* Help Tips */}
              <div className="border-t border-white/5 pt-4 flex items-start gap-2.5">
                <HelpCircle className="w-4 h-4 text-zinc-600 shrink-0 mt-0.5" />
                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  Tip: Using the <span className="text-zinc-300">"Copy Image"</span> button allows you to paste directly (Ctrl+V) into Discord chats or social media threads without cluttering your device storage!
                </p>
              </div>
            </div>

          </div>

        </div>

      </main>

      {/* Simple styled footer */}
      <footer className="mt-auto border-t border-white/5 py-6 text-center bg-[#050505] text-xs text-zinc-650">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-zinc-500">© 2026 PNL Card Studio. Built with React & Tailwind.</p>
          <div className="flex items-center gap-4 text-zinc-500">
            <a href="https://discord.gg/egodao" target="_blank" rel="noreferrer" className="hover:text-zinc-350 transition-colors">Discord</a>
            <span className="text-zinc-800">•</span>
            <a href="#" className="hover:text-zinc-350 transition-colors">Term of Services</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
