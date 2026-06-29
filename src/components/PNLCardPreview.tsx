/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from 'react';
import { CardConfig } from '../types';
import { MetallicLogoStyled } from './MetallicLogos';
import { motion } from 'motion/react';
import { Info, ExternalLink, HelpCircle } from 'lucide-react';

interface PNLCardPreviewProps {
  config: CardConfig;
}

export const PNLCardPreview: React.FC<PNLCardPreviewProps> = ({ config }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tiltStyle, setTiltStyle] = useState<React.CSSProperties>({});
  const [shineStyle, setShineStyle] = useState<React.CSSProperties>({ opacity: 0 });

  // 3D Parallax Glass Tilt Effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left; // x position within element
    const y = e.clientY - rect.top;  // y position within element

    const width = rect.width;
    const height = rect.height;

    // Convert coordinates to angles (-8deg to 8deg)
    const rotateX = ((y / height) - 0.5) * -14;
    const rotateY = ((x / width) - 0.5) * 14;

    // Position of holographic shine reflection
    const shineX = (x / width) * 100;
    const shineY = (y / height) * 100;

    setTiltStyle({
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.01, 1.01, 1.01)`,
      transition: 'transform 0.1s cubic-bezier(0.25, 1, 0.5, 1)'
    });

    setShineStyle({
      background: `radial-gradient(circle at ${shineX}% ${shineY}%, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 65%)`,
      opacity: 1
    });
  };

  const handleMouseLeave = () => {
    setTiltStyle({
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
      transition: 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)'
    });

    setShineStyle({
      opacity: 0,
      transition: 'opacity 0.5s ease'
    });
  };

  // Background Theme styles
  const bgThemes: Record<string, string> = {
    cosmic: 'bg-[#040407] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-950/20 via-blue-950/15 to-[#020204]',
    nebula: 'bg-[#050408] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-pink-950/30 via-purple-950/20 to-[#020104]',
    solar: 'bg-[#050404] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-orange-950/25 via-red-950/15 to-[#020202]',
    gold: 'bg-[#050503] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-950/25 via-yellow-950/10 to-[#020201]',
    obsidian: 'bg-[#060608] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-zinc-800/15 via-zinc-900/10 to-[#030304]'
  };

  const activeTheme = bgThemes[config.bgStyle] || bgThemes.cosmic;
  
  // Green vs Red indicators
  const pnlColorClass = config.pnlUsd >= 0 ? 'text-[#00e676]' : 'text-[#ff3d00]';
  const pnlBgClass = config.pnlUsd >= 0 ? 'bg-[#00e676]/5' : 'bg-[#ff3d00]/5';
  const arrowSymbol = config.pnlUsd >= 0 ? '▲' : '▼';
  const tokenSign = config.pnlToken >= 0 ? '+' : '-';
  const currencyChar = config.currency === 'SOL' ? '◎' : '✦';

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* 3D Wrapper Box */}
      <div
        className="w-full max-w-[660px] aspect-[16/9] perspective-[1000px] cursor-pointer touch-none"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div
          ref={cardRef}
          style={tiltStyle}
          className={`w-full h-full relative rounded-2xl border border-zinc-850 overflow-hidden flex flex-col justify-between p-7 select-none shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] transition-all ${activeTheme}`}
        >
          {/* Holographic light reflection overlay */}
          <div
            className="absolute inset-0 pointer-events-none mix-blend-color-dodge z-30"
            style={shineStyle}
          />

          {/* Sparkly Starry Fine Dust Layer */}
          <div className="absolute inset-0 pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8Y2lyY2xlIGN4PSIyIiBjeT0iMiIgcj0iMSIgZmlsbD0iI2ZmZiIgZmlsbC1vcGFjaXR5PSIwLjA2Ii8+Cjwvc3ZnPg==')] opacity-90 z-10" />

          {/* Top Bar: Profile (Avatar & Wallet nickname) */}
          <div className="flex items-center gap-3.5 z-20">
            {/* Double-outlined squircle avatar */}
            <div className="relative shrink-0 p-[1.5px] rounded-2xl bg-zinc-800/80 border border-white/10 shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
              <div className="w-13 h-13 rounded-2xl overflow-hidden bg-zinc-900 border border-black/80 flex items-center justify-center">
                <img
                  src={config.avatarUrl}
                  alt={config.username}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to stylized initials if load fails
                    e.currentTarget.style.display = 'none';
                    const parent = e.currentTarget.parentElement;
                    if (parent) {
                      const initials = document.createElement('div');
                      initials.className = 'text-white font-extrabold text-sm';
                      initials.innerText = config.username.slice(0, 2).toUpperCase();
                      parent.appendChild(initials);
                    }
                  }}
                />
              </div>
            </div>

            <div className="flex flex-col">
              <span className="font-extrabold text-lg text-white tracking-wide drop-shadow-md">
                {config.username}
              </span>
              {config.contractAddress && (
                <span className="text-[10px] font-mono text-zinc-500 hover:text-zinc-400 select-all truncate max-w-[200px]">
                  {config.contractAddress.slice(0, 6)}...{config.contractAddress.slice(-6)}
                </span>
              )}
            </div>
          </div>

          {/* Collection Title section */}
          <div className="flex flex-col z-20 mt-1">
            <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-widest">
              Collection
            </span>
            <span className="text-white font-black text-4xl sm:text-5xl tracking-tight leading-none mt-1 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] uppercase">
              {config.collectionName}
            </span>
          </div>

          {/* Statistics Grid (Minted, Bought, Sold, Holding) */}
          <div className="grid grid-cols-4 z-20 border-zinc-900 bg-black/10 backdrop-blur-[1px] py-1 px-1 rounded-xl">
            {/* Col 1 */}
            <div className="flex flex-col">
              <span className="text-[10px] sm:text-xs font-semibold text-zinc-500 tracking-wide">
                Minted {config.mintedCount}
              </span>
              <div className="flex items-center gap-1 mt-0.5 sm:mt-1">
                <span className="text-white font-extrabold text-base sm:text-lg tracking-wide font-mono">
                  {config.mintedVal.toFixed(3)}
                </span>
                <span className="text-[10px] text-zinc-300">✦</span>
              </div>
            </div>

            {/* Col 2 */}
            <div className="flex flex-col border-l border-zinc-800/50 pl-3">
              <span className="text-[10px] sm:text-xs font-semibold text-zinc-500 tracking-wide">
                Bought {config.boughtCount}
              </span>
              <div className="flex items-center gap-1 mt-0.5 sm:mt-1">
                <span className="text-white font-extrabold text-base sm:text-lg tracking-wide font-mono">
                  {config.boughtVal.toFixed(3)}
                </span>
                <span className="text-[10px] text-zinc-300">✦</span>
              </div>
            </div>

            {/* Col 3 */}
            <div className="flex flex-col border-l border-zinc-800/50 pl-3">
              <span className="text-[10px] sm:text-xs font-semibold text-zinc-500 tracking-wide">
                Sold {config.soldCount}
              </span>
              <div className="flex items-center gap-1 mt-0.5 sm:mt-1">
                <span className="text-white font-extrabold text-base sm:text-lg tracking-wide font-mono">
                  {config.soldVal.toFixed(3)}
                </span>
                <span className="text-[10px] text-zinc-300">✦</span>
              </div>
            </div>

            {/* Col 4 */}
            <div className="flex flex-col border-l border-zinc-800/50 pl-3">
              <span className="text-[10px] sm:text-xs font-semibold text-zinc-500 tracking-wide">
                Holding {config.holdingCount}
              </span>
              <div className="flex items-center gap-1 mt-0.5 sm:mt-1">
                <span className="text-white font-extrabold text-base sm:text-lg tracking-wide font-mono">
                  {config.holdingVal.toFixed(3)}
                </span>
                <span className="text-[10px] text-zinc-300">✦</span>
              </div>
            </div>
          </div>

          {/* Bottom Bar: PNL & Watermark */}
          <div className="flex items-end justify-between z-20">
            {/* PNL Info */}
            <div className="flex flex-col">
              <span className={`text-[10px] font-bold uppercase tracking-wider ${pnlColorClass}`}>
                PNL
              </span>
              
              <span className={`font-black text-4xl sm:text-5xl tracking-tight leading-none ${pnlColorClass} mt-1 drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]`}>
                {config.pnlUsd >= 0 ? '+' : ''}${Math.abs(config.pnlUsd).toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </span>

              <div className={`flex items-center gap-1.5 mt-2 text-[12px] sm:text-sm font-extrabold ${pnlColorClass}`}>
                <span>(</span>
                <span className="text-xs">{arrowSymbol}</span>
                <span>{config.pnlPercent.toFixed(0)}%</span>
                <span className="text-zinc-500">|</span>
                <span>{tokenSign}{Math.abs(config.pnlToken).toFixed(3)}</span>
                <span className="text-[9px] translate-y-[-1px]">✦</span>
                <span>)</span>
              </div>
            </div>

            {/* Signature Watermark */}
            <div className="flex flex-col items-end text-right">
              <span className="text-zinc-500 text-[11px] font-bold tracking-wide hover:text-zinc-400">
                {config.watermark}
              </span>
            </div>
          </div>

          {/* Right Floating 3D Metallic Emblem */}
          <div className="absolute right-[-10px] top-[14%] w-[260px] h-[260px] sm:w-[280px] sm:h-[280px] flex items-center justify-center pointer-events-none z-10 select-none overflow-visible">
            <div className="relative w-full h-full flex items-center justify-center">
              <MetallicLogoStyled
                presetKey={config.logoPreset}
                bgStyle={config.bgStyle}
                className="w-[90%] h-[90%] drop-shadow-[0_15px_30px_rgba(0,0,0,0.85)] animate-pulse"
              />
              
              {/* Shining sweep effect over the emblem on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shine pointer-events-none mix-blend-overlay" />
            </div>
          </div>
        </div>
      </div>

      {/* Tilt Instructions and interactive badge */}
      <div className="flex items-center gap-1.5 px-3 py-1 bg-zinc-950/60 border border-zinc-800/60 rounded-full text-[10px] text-zinc-400">
        <Info className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
        <span>Hover over the card for interactive 3D parallax & metallic shine effects</span>
      </div>
    </div>
  );
};
