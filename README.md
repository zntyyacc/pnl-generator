# PNL Card Generator

Generate kartu PNL NFT trading lo sendiri — fetch data transaksi real dari blockchain Ethereum dan tampilkan dalam bentuk card yang bisa di-share.

## Fitur

- Fetch nama & gambar koleksi NFT otomatis via OpenSea API
- Fetch histori transaksi real dari Etherscan (beli, jual, mint)
- Kalkulasi PNL otomatis berdasarkan data on-chain
- Harga ETH real-time dari CoinGecko
- Export card sebagai PNG, siap di-share ke Twitter/X

## Setup

**Prerequisites:** Node.js

1. Install dependencies:
   ```
   npm install
   ```

2. Buat file `.env` dari template:
   ```
   copy .env.example .env
   ```

3. Isi API key di file `.env`:
   ```
   VITE_OPENSEA_API_KEY=api_key_opensea_lo
   VITE_ETHERSCAN_API_KEY=api_key_etherscan_lo
   ```

4. Jalankan secara lokal:
   ```
   npm run dev
   ```

## Deploy ke Vercel

1. Push repo ini ke GitHub
2. Connect di [vercel.com](https://vercel.com)
3. Tambahkan environment variables di Vercel Dashboard → Settings → Environment Variables:
   - `VITE_OPENSEA_API_KEY`
   - `VITE_ETHERSCAN_API_KEY`
4. Deploy otomatis setiap kali push ke GitHub

## API Keys

| Key | Sumber | Gratis? |
|-----|--------|---------|
| `VITE_OPENSEA_API_KEY` | [docs.opensea.io](https://docs.opensea.io/reference/api-overview) | ✅ |
| `VITE_ETHERSCAN_API_KEY` | [etherscan.io/myapikey](https://etherscan.io/myapikey) | ✅ |
