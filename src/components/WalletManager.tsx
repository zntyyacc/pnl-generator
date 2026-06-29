/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Wallet, ChainType } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Wallet as WalletIcon, Plus, Trash2, Edit3, Check, Copy, AlertCircle, Sparkles } from 'lucide-react';

interface WalletManagerProps {
  wallets: Wallet[];
  activeWalletId: string;
  onSelectWallet: (id: string) => void;
  onAddWallet: (wallet: Omit<Wallet, 'id' | 'createdAt'>) => void;
  onDeleteWallet: (id: string) => void;
  onUpdateWallet: (id: string, updated: Partial<Wallet>) => void;
}

export const WalletManager: React.FC<WalletManagerProps> = ({
  wallets,
  activeWalletId,
  onSelectWallet,
  onAddWallet,
  onDeleteWallet,
  onUpdateWallet
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [nickname, setNickname] = useState('');
  const [address, setAddress] = useState('');
  const [customAvatar, setCustomAvatar] = useState('');
  const [chain, setChain] = useState<ChainType>('ETH');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!nickname.trim()) {
      setError('Wallet nickname is required');
      return;
    }

    if (!address.trim()) {
      setError('Wallet address is required');
      return;
    }

    // Basic address length verification for safety
    if (address.length < 10) {
      setError('Invalid address format (too short)');
      return;
    }

    // Random avatar preset for the wallet
    const avatarPresets = [
      'https://images.unsplash.com/photo-1642156814441-ab39227aa435?auto=format&fit=crop&w=150&q=80',
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&q=80',
      'https://images.unsplash.com/photo-1621761191319-c6fb62004040?auto=format&fit=crop&w=150&q=80',
      'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=150&q=80',
      'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?auto=format&fit=crop&w=150&q=80'
    ];
    const finalAvatar = customAvatar.trim() || avatarPresets[Math.floor(Math.random() * avatarPresets.length)];

    onAddWallet({
      name: nickname.trim(),
      address: address.trim(),
      chain,
      avatarUrl: finalAvatar
    });

    setNickname('');
    setAddress('');
    setCustomAvatar('');
    setIsAdding(false);
  };

  const startEdit = (wallet: Wallet) => {
    setEditingId(wallet.id);
    setEditName(wallet.name);
  };

  const saveEdit = (id: string) => {
    if (!editName.trim()) return;
    onUpdateWallet(id, { name: editName.trim() });
    setEditingId(null);
  };

  const handleCopy = (id: string, addr: string) => {
    navigator.clipboard.writeText(addr);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const chainColors: Record<ChainType, string> = {
    ETH: 'bg-zinc-900/60 text-zinc-300 border-white/10',
    SOL: 'bg-zinc-900/60 text-zinc-300 border-white/10',
    BASE: 'bg-zinc-900/60 text-zinc-300 border-white/10',
    POLYGON: 'bg-zinc-900/60 text-zinc-300 border-white/10'
  };

  return (
    <div id="wallet-manager-section" className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6 shadow-2xl space-y-6">
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-white/5 rounded-xl border border-white/10">
            <WalletIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white tracking-wide">My Wallets</h3>
            <p className="text-xs text-zinc-400">Connect & manage multiple accounts</p>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            setIsAdding(!isAdding);
            setError('');
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            isAdding
              ? 'bg-[#111111] text-zinc-300 border border-white/5'
              : 'bg-white hover:bg-zinc-200 text-black shadow-lg shadow-white/5'
          }`}
        >
          {isAdding ? 'Cancel' : (
            <>
              <Plus className="w-3.5 h-3.5" /> Add Wallet
            </>
          )}
        </motion.button>
      </div>

      <AnimatePresence mode="wait">
        {isAdding && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleAdd}
            className="space-y-4 bg-[#0e0e0e] p-4 rounded-xl border border-white/5 overflow-hidden"
          >
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Wallet Nickname</label>
              <input
                type="text"
                placeholder="e.g., zntyyaacc or ETH Whale"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full bg-black border border-[#333] focus:border-white/40 rounded-xl px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Wallet Address / ENS / Sol Domain</label>
              <input
                type="text"
                placeholder="0x... or domain.eth"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-black border border-[#333] focus:border-white/40 rounded-xl px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none font-mono transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">Blockchain Network (Chain)</label>
              <div className="grid grid-cols-4 gap-2">
                {(['ETH', 'SOL', 'BASE', 'POLYGON'] as ChainType[]).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setChain(c)}
                    className={`py-1.5 rounded-lg text-xs font-bold transition-all border ${
                      chain === c
                        ? 'bg-white border-white text-black shadow-md'
                        : 'bg-black border-[#333] hover:border-zinc-750 text-zinc-400'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Avatar Image URL (Optional)</label>
              <input
                type="text"
                placeholder="e.g., https://... or leave blank for random"
                value={customAvatar}
                onChange={(e) => setCustomAvatar(e.target.value)}
                className="w-full bg-black border border-[#333] focus:border-white/40 rounded-xl px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none transition-all"
              />
            </div>

            {error && (
              <div className="flex items-center gap-1.5 p-2.5 bg-red-950/40 border border-red-900/50 rounded-lg text-xs text-red-400">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-white hover:bg-zinc-200 text-black font-semibold py-2 rounded-xl text-sm transition-all shadow-md"
            >
              Save Wallet
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
        {wallets.length === 0 ? (
          <div className="text-center py-8 px-4 bg-[#111111] border border-dashed border-white/5 rounded-2xl">
            <WalletIcon className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
            <p className="text-sm text-zinc-400 font-medium">No wallets saved yet</p>
            <p className="text-xs text-zinc-500 mt-1 max-w-[200px] mx-auto">Add your first wallet to start generating PNL cards</p>
          </div>
        ) : (
          <div className="space-y-2">
            {wallets.map((wallet) => (
              <motion.div
                key={wallet.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`group relative flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer ${
                  activeWalletId === wallet.id
                    ? 'bg-[#161616] border-white/20 shadow-md'
                    : 'bg-[#111111] border-white/5 hover:bg-[#161616] hover:border-white/10'
                }`}
                onClick={() => onSelectWallet(wallet.id)}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Select check or Avatar */}
                  <div className="relative shrink-0">
                    <img
                      src={wallet.avatarUrl || 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&w=50&q=80'}
                      alt={wallet.name}
                      className="w-10 h-10 rounded-lg object-cover border border-zinc-700"
                    />
                    {activeWalletId === wallet.id && (
                      <div className="absolute -top-1.5 -right-1.5 bg-white p-0.5 rounded-full border border-black">
                        <Check className="w-2.5 h-2.5 text-black" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    {editingId === wallet.id ? (
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onBlur={() => saveEdit(wallet.id)}
                        onKeyDown={(e) => e.key === 'Enter' && saveEdit(wallet.id)}
                        onClick={(e) => e.stopPropagation()}
                        autoFocus
                        className="bg-black border border-[#333] focus:border-white/40 text-white rounded px-1.5 py-0.5 text-sm font-semibold focus:outline-none"
                      />
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-sm text-zinc-100 truncate block">
                          {wallet.name}
                        </span>
                        <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded border uppercase shrink-0 ${chainColors[wallet.chain]}`}>
                          {wallet.chain}
                        </span>
                      </div>
                    )}

                    <span className="text-[11px] font-mono text-zinc-500 block mt-0.5 truncate hover:text-zinc-300">
                      {wallet.address.slice(0, 6)}...{wallet.address.slice(-6)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => handleCopy(wallet.id, wallet.address)}
                    className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-lg transition-all"
                    title="Copy Address"
                  >
                    {copiedId === wallet.id ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={() => startEdit(wallet)}
                    className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-lg transition-all"
                    title="Rename"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onDeleteWallet(wallet.id)}
                    className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-zinc-900 rounded-lg transition-all"
                    title="Delete Wallet"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {wallets.length > 0 && (
        <div className="pt-2">
          <div className="flex items-center gap-2 p-3 bg-[#111111] border border-white/5 rounded-xl">
            <Sparkles className="w-4 h-4 text-zinc-400 shrink-0" />
            <p className="text-[11px] text-zinc-450 leading-relaxed">
              Selecting a wallet will instantly load its nickname and avatar into your active PNL Card on the right!
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
