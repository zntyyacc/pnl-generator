/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface MetallicLogoProps {
  presetKey: string;
  className?: string;
  id?: string;
}

// Standard multi-stop chrome gradients for that high-end metallic feel
export const ChromeGradientDef: React.FC = () => (
  <defs>
    {/* Silver/Chrome Gradient */}
    <linearGradient id="chrome-silver" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#ffffff" />
      <stop offset="15%" stopColor="#d0d0d5" />
      <stop offset="30%" stopColor="#ffffff" />
      <stop offset="45%" stopColor="#55555d" />
      <stop offset="55%" stopColor="#e8e8ed" />
      <stop offset="75%" stopColor="#1e1e24" />
      <stop offset="90%" stopColor="#e2e2e8" />
      <stop offset="100%" stopColor="#777780" />
    </linearGradient>

    {/* Secondary Chrome Gradient (different angle / highlights) */}
    <linearGradient id="chrome-silver-oblique" x1="100%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor="#9a9a9a" />
      <stop offset="20%" stopColor="#ffffff" />
      <stop offset="40%" stopColor="#44444c" />
      <stop offset="60%" stopColor="#f5f5f5" />
      <stop offset="80%" stopColor="#111115" />
      <stop offset="100%" stopColor="#ffffff" />
    </linearGradient>

    {/* Gold/Bronze Chrome Gradient */}
    <linearGradient id="chrome-gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#ffeeb5" />
      <stop offset="20%" stopColor="#d4af37" />
      <stop offset="40%" stopColor="#ffffff" />
      <stop offset="55%" stopColor="#8a6d1c" />
      <stop offset="70%" stopColor="#ffd700" />
      <stop offset="85%" stopColor="#4e3b07" />
      <stop offset="100%" stopColor="#fff2cc" />
    </linearGradient>

    {/* Dark Cyber Metal (Titanium/Obsidian) */}
    <linearGradient id="chrome-obsidian" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stopColor="#12131a" />
      <stop offset="25%" stopColor="#4c4f5e" />
      <stop offset="45%" stopColor="#1b1c24" />
      <stop offset="60%" stopColor="#989bb0" />
      <stop offset="75%" stopColor="#0d0e12" />
      <stop offset="100%" stopColor="#ffffff" />
    </linearGradient>

    {/* Outer stroke shadow or glow */}
    <filter id="metallic-glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="3" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>

    <filter id="shadow-glow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="2" dy="4" stdDeviation="4" floodColor="#000000" floodOpacity="0.8" />
    </filter>
  </defs>
);

// High-fidelity custom geometries (Unified as the premium 3D Metallic Discord logo)
export const getLogoSVGMarkup = (presetKey: string, gradientId: string = 'chrome-silver'): string => {
  const color = `url(#${gradientId})`;
  const fallbackColor = gradientId === 'chrome-gold' ? '#d4af37' : '#ffffff';

  return `
    <g filter="url(#shadow-glow)">
      <!-- Premium metallic Discord badge background with multi-stop gradient -->
      <rect x="35" y="35" width="130" height="130" rx="38" fill="${color}" stroke="${fallbackColor}" stroke-width="1.5" />
      
      <!-- Inner high-fidelity shiny Discord Clyde SVG path -->
      <path d="M72,75 C72,75 79,68 91,66 C92,66 93,67 93,68 C93,71 90,75 90,75 C101,73 111,73 122,75 C122,75 119,71 119,68 C119,67 120,66 121,66 C133,68 140,75 140,75 C146,88 144,111 144,111 C135,117 125,120 120,121 C119,121 118,120 117,119 C116,116 114,113 113,110 C120,108 126,104 129,100 C128,99 126,98 124,97 C112,102 99,102 87,97 C85,98 83,99 82,100 C85,104 91,108 98,110 C97,113 95,116 94,119 C93,120 92,121 91,121 C86,120 76,117 67,111 C67,111 65,88 71,75 Z M93,88 A6,6 0 1,0 93,100 A6,6 0 1,0 93,88 Z M119,88 A6,6 0 1,0 119,100 A6,6 0 1,0 119,88 Z" fill="#ffffff" opacity="0.95" />

      <!-- Sleek diagonal metal cut/highlight line -->
      <path d="M 37 37 L 163 163" stroke="#ffffff" stroke-width="1.2" stroke-linecap="round" opacity="0.3" />
    </g>
  `;
};

// Generates complete standalone SVG string (useful for Canvas drawing)
export const createStandaloneSVG = (presetKey: string, bgStyle: string): string => {
  let gradientId = 'chrome-silver';
  if (bgStyle === 'gold') gradientId = 'chrome-gold';
  else if (bgStyle === 'obsidian') gradientId = 'chrome-obsidian';
  else if (bgStyle === 'nebula') gradientId = 'chrome-silver-oblique';

  const markup = getLogoSVGMarkup(presetKey, gradientId);

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
      ${gradientId === 'chrome-silver' || gradientId === 'chrome-silver-oblique' || gradientId === 'chrome-gold' || gradientId === 'chrome-obsidian' ? `
        <defs>
          <linearGradient id="chrome-silver" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#ffffff" />
            <stop offset="15%" stop-color="#d0d0d5" />
            <stop offset="30%" stop-color="#ffffff" />
            <stop offset="45%" stop-color="#55555d" />
            <stop offset="55%" stop-color="#e8e8ed" />
            <stop offset="75%" stop-color="#1e1e24" />
            <stop offset="90%" stop-color="#e2e2e8" />
            <stop offset="100%" stop-color="#777780" />
          </linearGradient>
          <linearGradient id="chrome-silver-oblique" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#9a9a9a" />
            <stop offset="20%" stop-color="#ffffff" />
            <stop offset="40%" stop-color="#44444c" />
            <stop offset="60%" stop-color="#f5f5f5" />
            <stop offset="80%" stop-color="#111115" />
            <stop offset="100%" stop-color="#ffffff" />
          </linearGradient>
          <linearGradient id="chrome-gold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#ffeeb5" />
            <stop offset="20%" stop-color="#d4af37" />
            <stop offset="40%" stop-color="#ffffff" />
            <stop offset="55%" stop-color="#8a6d1c" />
            <stop offset="70%" stop-color="#ffd700" />
            <stop offset="85%" stop-color="#4e3b07" />
            <stop offset="100%" stop-color="#fff2cc" />
          </linearGradient>
          <linearGradient id="chrome-obsidian" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#12131a" />
            <stop offset="25%" stop-color="#4c4f5e" />
            <stop offset="45%" stop-color="#1b1c24" />
            <stop offset="60%" stop-color="#989bb0" />
            <stop offset="75%" stop-color="#0d0e12" />
            <stop offset="100%" stop-color="#ffffff" />
          </linearGradient>
          <filter id="shadow-glow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="2" dy="4" stdDeviation="4" flood-color="#000000" flood-opacity="0.8" />
          </filter>
        </defs>
      ` : ''}
      ${markup}
    </svg>
  `;
};

// React component wrapper for in-app display
export const MetallicLogo: React.FC<MetallicLogoProps> = ({ presetKey, className = 'w-32 h-32', id }) => {
  return (
    <svg
      id={id}
      viewBox="0 0 200 200"
      className={`${className} overflow-visible`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <ChromeGradientDef />
      <g dangerouslySetInnerHTML={{ __html: getLogoSVGMarkup(presetKey, 'chrome-silver') }} />
    </svg>
  );
};

export const MetallicLogoStyled: React.FC<MetallicLogoProps & { bgStyle: string }> = ({ presetKey, className = 'w-32 h-32', bgStyle, id }) => {
  let gradientId = 'chrome-silver';
  if (bgStyle === 'gold') gradientId = 'chrome-gold';
  else if (bgStyle === 'obsidian') gradientId = 'chrome-obsidian';
  else if (bgStyle === 'nebula') gradientId = 'chrome-silver-oblique';

  return (
    <svg
      id={id}
      viewBox="0 0 200 200"
      className={`${className} overflow-visible`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <ChromeGradientDef />
      <g dangerouslySetInnerHTML={{ __html: getLogoSVGMarkup(presetKey, gradientId) }} />
    </svg>
  );
};
