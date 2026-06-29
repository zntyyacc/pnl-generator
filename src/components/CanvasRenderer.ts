/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CardConfig } from '../types';
import { createStandaloneSVG } from './MetallicLogos';

// Helper to load an image from a URL and return a promise
const loadImage = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous'; // Avoid canvas taint
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(new Error(`Failed to load image at ${url}: ${JSON.stringify(e)}`));
    img.src = url;
  });
};

// Helper to convert SVG markup to an Image element
const loadSVGToImage = async (svgMarkup: string): Promise<HTMLImageElement> => {
  const encoded = encodeURIComponent(svgMarkup)
    .replace(/'/g, "%27")
    .replace(/"/g, "%22");
  const dataUrl = `data:image/svg+xml;charset=utf-8,${encoded}`;
  return loadImage(dataUrl);
};

// Draws a rounded rectangle path
const drawRoundedRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) => {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
};

export const renderPNLCardToCanvas = async (config: CardConfig): Promise<string> => {
  // Canvas size of 1200 x 675 (Perfect 16:9 ratio for Twitter/Discord sharing)
  const width = 1200;
  const height = 675;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Could not get 2D canvas context');
  }

  // 1. Draw Background Base
  ctx.fillStyle = '#050508';
  ctx.fillRect(0, 0, width, height);

  // 2. Draw Theme-specific Background Glows & Stars
  // Draw space dust (stars)
  const starCount = 120;
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < starCount; i++) {
    // Deterministic random generator based on coordinates so the stars don't move each render
    const x = Math.sin(i * 12345.67) * 0.5 + 0.5;
    const y = Math.cos(i * 98765.43) * 0.5 + 0.5;
    const size = (Math.sin(i * 456.78) * 0.5 + 0.5) * 1.5 + 0.5;
    const opacity = (Math.cos(i * 890.12) * 0.5 + 0.5) * 0.7 + 0.2;
    
    ctx.globalAlpha = opacity;
    ctx.beginPath();
    ctx.arc(x * width, y * height, size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1.0;

  // Draw radial glowing sweep lights
  let glowGrad = ctx.createRadialGradient(
    width * 0.5, height * 0.2, 50,
    width * 0.7, height * 0.5, 550
  );

  switch (config.bgStyle) {
    case 'cosmic':
      // Blue, teal, and soft white sweeps
      glowGrad.addColorStop(0, 'rgba(255, 255, 255, 0.08)');
      glowGrad.addColorStop(0.3, 'rgba(16, 185, 129, 0.04)'); // Teal touch
      glowGrad.addColorStop(0.6, 'rgba(59, 130, 246, 0.05)'); // Deep blue
      glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      break;
    case 'nebula':
      // Purple, pink, and magenta swirls
      glowGrad = ctx.createRadialGradient(
        width * 0.8, height * 0.3, 20,
        width * 0.6, height * 0.6, 500
      );
      glowGrad.addColorStop(0, 'rgba(236, 72, 153, 0.12)'); // Pink
      glowGrad.addColorStop(0.5, 'rgba(139, 92, 246, 0.08)'); // Purple
      glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      break;
    case 'solar':
      // Radiant Orange/Red eclipse
      glowGrad = ctx.createRadialGradient(
        width * 0.85, height * 0.4, 10,
        width * 0.7, height * 0.5, 450
      );
      glowGrad.addColorStop(0, 'rgba(249, 115, 22, 0.15)'); // Orange
      glowGrad.addColorStop(0.4, 'rgba(239, 68, 68, 0.06)'); // Red
      glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      break;
    case 'gold':
      // Classy rich amber/gold shine
      glowGrad.addColorStop(0, 'rgba(255, 215, 0, 0.10)'); // Gold
      glowGrad.addColorStop(0.5, 'rgba(212, 175, 55, 0.04)'); // Bronze
      glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      break;
    case 'obsidian':
      // Silver monochrome metallic sheen
      glowGrad.addColorStop(0, 'rgba(255, 255, 255, 0.12)'); // Light silver
      glowGrad.addColorStop(0.4, 'rgba(150, 150, 160, 0.04)');
      glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      break;
  }

  ctx.fillStyle = glowGrad;
  ctx.fillRect(0, 0, width, height);

  // Add subtle linear ambient light streak
  const streakGrad = ctx.createLinearGradient(0, 0, width, height);
  streakGrad.addColorStop(0, 'rgba(255, 255, 255, 0.02)');
  streakGrad.addColorStop(0.4, 'rgba(255, 255, 255, 0.05)');
  streakGrad.addColorStop(0.45, 'rgba(255, 255, 255, 0.10)');
  streakGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.02)');
  streakGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = streakGrad;
  ctx.fillRect(0, 0, width, height);

  // 3. Draw User Profile (Avatar & Username)
  const avatarX = 70;
  const avatarY = 55;
  const avatarSize = 85;
  const avatarRadius = 24; // Beautiful squircle or soft rounded rect

  // Drawing Squircle avatar boundary
  ctx.save();
  drawRoundedRect(ctx, avatarX, avatarY, avatarSize, avatarSize, avatarRadius);
  ctx.clip();

  // Try drawing avatar image
  try {
    const avatarImg = await loadImage(config.avatarUrl);
    ctx.drawImage(avatarImg, avatarX, avatarY, avatarSize, avatarSize);
  } catch (err) {
    // Fallback beautiful crypto-styled placeholder gradient if user avatar fails
    const placeholderGrad = ctx.createLinearGradient(avatarX, avatarY, avatarX + avatarSize, avatarY + avatarSize);
    placeholderGrad.addColorStop(0, '#3b82f6');
    placeholderGrad.addColorStop(1, '#8b5cf6');
    ctx.fillStyle = placeholderGrad;
    ctx.fillRect(avatarX, avatarY, avatarSize, avatarSize);
    
    // Draw generic user initials
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(config.username.slice(0, 2).toUpperCase(), avatarX + avatarSize/2, avatarY + avatarSize/2);
  }
  ctx.restore();

  // Draw Avatar Border (Double outline for high fidelity)
  ctx.strokeStyle = 'rgba(255,255,255,0.15)';
  ctx.lineWidth = 4;
  drawRoundedRect(ctx, avatarX - 2, avatarY - 2, avatarSize + 4, avatarSize + 4, avatarRadius + 2);
  ctx.stroke();

  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 1.5;
  drawRoundedRect(ctx, avatarX, avatarY, avatarSize, avatarSize, avatarRadius);
  ctx.stroke();

  // Draw Username text
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 34px sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(config.username, avatarX + avatarSize + 22, avatarY + avatarSize / 2);


  // 4. Draw Collection Title Label & Title Value
  const labelX = 70;
  const labelY = 195;

  ctx.fillStyle = '#8e8e93';
  ctx.font = '500 18px sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('Collection', labelX, labelY);

  ctx.fillStyle = '#ffffff';
  // Massively bold, thick headers matching the image style
  ctx.font = '900 64px sans-serif';
  ctx.fillText(config.collectionName, labelX, labelY + 30);


  // 5. Draw Statistics Grid (Minted, Bought, Sold, Holding)
  const gridY = 340;
  const colWidth = 160;
  const spacingX = 40;
  const colHeaders = [
    `Minted ${config.mintedCount}`,
    `Bought ${config.boughtCount}`,
    `Sold ${config.soldCount}`,
    `Holding ${config.holdingCount}`
  ];

  const colValues = [
    `${config.mintedVal.toFixed(3)}`,
    `${config.boughtVal.toFixed(3)}`,
    `${config.soldVal.toFixed(3)}`,
    `${config.holdingVal.toFixed(3)}`
  ];

  for (let i = 0; i < 4; i++) {
    const colX = labelX + i * (colWidth + spacingX);

    // Draw Column Border divider (except first)
    if (i > 0) {
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(colX - spacingX / 2, gridY);
      ctx.lineTo(colX - spacingX / 2, gridY + 68);
      ctx.stroke();
    }

    // Column Label
    ctx.fillStyle = '#8e8e93';
    ctx.font = '500 16px sans-serif';
    ctx.fillText(colHeaders[i], colX, gridY);

    // Column Value
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px sans-serif';
    ctx.fillText(colValues[i], colX, gridY + 32);

    // Diamond symbol next to the value
    const symbolX = colX + ctx.measureText(colValues[i]).width + 12;
    const symbolY = gridY + 48;

    // Drawing the sleek vertical 4-point diamond symbol
    ctx.save();
    ctx.translate(symbolX, symbolY);
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(0, -9); // Top
    ctx.lineTo(6, 0);  // Right
    ctx.lineTo(0, 9);  // Bottom
    ctx.lineTo(-6, 0); // Left
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }


  // 6. Draw PNL (Profit & Loss) Section (bottom-left)
  const pnlY = 465;
  const profitColor = '#00e676'; // Pure vibrant neon green
  const lossColor = '#ff3d00';   // Pure vibrant neon red
  const activeColor = config.pnlUsd >= 0 ? profitColor : lossColor;

  ctx.fillStyle = activeColor;
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText('PNL', labelX, pnlY);

  const sign = config.pnlUsd >= 0 ? '+' : '';
  const isMainUsd = config.mainCurrency !== 'ETH';
  
  // Large PNL display value
  const pnlString = isMainUsd 
    ? `${sign}$${Math.abs(config.pnlUsd).toLocaleString('en-US', { maximumFractionDigits: 2 })}`
    : `${sign}${Math.abs(config.pnlToken).toFixed(4)} ${config.currency === 'SOL' ? '◎' : '✦'}`;
  
  ctx.fillStyle = activeColor;
  ctx.font = 'bold 84px sans-serif';
  ctx.fillText(pnlString, labelX, pnlY + 22);

  // Sub row statistics e.g. ( ▲ 176% | +0.003 ✦ )
  const subRowY = pnlY + 115;
  const triangle = config.pnlUsd >= 0 ? '▲' : '▼';
  const tokenSign = config.pnlToken >= 0 ? '+' : '-';
  const currencySymbol = config.currency === 'SOL' ? '◎' : '✦';
  
  const pnlPercentStr = `${config.pnlPercent.toFixed(0)}%`;
  
  const subValueStr = isMainUsd
    ? `${tokenSign}${Math.abs(config.pnlToken).toFixed(4)} ${currencySymbol}`
    : `${sign}$${Math.abs(config.pnlUsd).toLocaleString('en-US', { maximumFractionDigits: 2 })}`;

  ctx.fillStyle = activeColor;
  ctx.font = '600 24px sans-serif';
  ctx.fillText('(', labelX, subRowY);
  
  let currentOffset = labelX + ctx.measureText('(').width + 5;
  
  // Triangle glyph
  ctx.fillText(triangle, currentOffset, subRowY);
  currentOffset += ctx.measureText(triangle).width + 8;
  
  // Percentage
  ctx.fillText(pnlPercentStr, currentOffset, subRowY);
  currentOffset += ctx.measureText(pnlPercentStr).width + 12;

  // Split Divider
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.fillText('|', currentOffset, subRowY);
  currentOffset += ctx.measureText('|').width + 12;

  // Sub value (Token change or USD depending on toggle)
  ctx.fillStyle = activeColor;
  ctx.fillText(subValueStr, currentOffset, subRowY);
  currentOffset += ctx.measureText(subValueStr).width + 10;
  
  ctx.fillText(')', currentOffset, subRowY);


  // 7. Draw Metallic 3D Logo on the right side
  try {
    const logoSvg = createStandaloneSVG(config.logoPreset, config.bgStyle);
    const logoImg = await loadSVGToImage(logoSvg);
    const logoSize = 350;
    
    // Position matching right-center align of the original image
    const logoX = width - logoSize - 55;
    const logoY = 160;
    
    ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
  } catch (err) {
    console.error('Failed to draw SVG logo to canvas:', err);
  }


  // 8. Draw Watermark & Discord bottom-right
  const watermarkX = width - 70;
  const watermarkY = height - 55;
  
  // If user has set a Discord name, render a beautiful Discord social badge
  if (config.discordName) {
    ctx.save();
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px sans-serif';
    
    const text = config.discordName;
    const textWidth = ctx.measureText(text).width;
    
    // Position of logo
    const logoSize = 26;
    const logoX = watermarkX - textWidth - 12;
    const logoY = watermarkY - 13;
    
    // Draw text
    ctx.fillText(text, watermarkX, watermarkY);
    
    // Load logo or draw default high-fidelity SVG Discord logo
    try {
      const logoUrl = config.discordLogoUrl || 'https://assets-global.website-files.com/6257adef93867e50d84d30e2/636e0a6cae7b15a16522e8d2_icon_clyde_blurple_RGB.png'; // Standard Discord Clyde logo
      const discLogoImg = await loadImage(logoUrl);
      ctx.drawImage(discLogoImg, logoX - logoSize, logoY - logoSize / 2, logoSize, logoSize);
    } catch (e) {
      // Fallback: simple blue circle Discord badge
      ctx.fillStyle = '#5865F2';
      ctx.beginPath();
      ctx.arc(logoX - logoSize / 2, logoY, logoSize / 2, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('D', logoX - logoSize / 2, logoY + 1);
    }
    ctx.restore();
    
    // If standard watermark is also set, draw it slightly higher
    if (config.watermark) {
      ctx.fillStyle = 'rgba(255,255,255,0.25)';
      ctx.font = '500 14px sans-serif';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'bottom';
      ctx.fillText(config.watermark, watermarkX, watermarkY - 30);
    }
  } else {
    // Only standard watermark
    if (config.watermark) {
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.font = '500 18px sans-serif';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'bottom';
      ctx.fillText(config.watermark, watermarkX, watermarkY);
    }
  }

  // Return base64 URL of the rendered canvas
  return canvas.toDataURL('image/png', 1.0);
};

// Help helper to copy image blob to clipboard
export const copyImageToClipboard = async (dataUrl: string): Promise<boolean> => {
  try {
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    await navigator.clipboard.write([
      new ClipboardItem({
        [blob.type]: blob
      })
    ]);
    return true;
  } catch (err) {
    console.error('Failed to copy image to clipboard:', err);
    return false;
  }
};
