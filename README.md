# Bakpia Rasa Jogja — Starter (Landing v3 + API Orders)

## Isi Paket
- `index.html` — Landing page siap pakai (form → API → invoice modal + fallback ke WhatsApp)
- `config/config.js` — Konfigurasi (nomor WA, alamat, bank, QRIS, apiBase, dll)
- `api/orders.js` — Serverless function untuk Vercel (WhatsApp Cloud + invoice)
- `vercel.json` — Konfigurasi Vercel
- `.env.example` — Contoh environment variables

## Cara Pakai (Cepat)
1. Deploy folder `api/` ke Vercel (import repo atau upload).  
   - Set Env Vars: `WA_PHONE_NUMBER_ID`, `WA_ACCESS_TOKEN`, `MERCHANT_WA`, `INVOICE_PREFIX`, `BUSINESS_NAME`, `ORIGIN`.
2. Ambil URL deploy, misal `https://brj-orders.vercel.app`.  
3. Buka `config/config.js` → set `apiBase` ke URL tersebut.
4. Hosting `index.html` + folder `config/` di hosting mana pun (atau Vercel/Netlify).

## WhatsApp Cloud API (ringkas)
- Buat app di Meta for Developers → WhatsApp → gunakan phone number ID & access token.
- Uji coba: ganti `MERCHANT_WA` ke nomor penerima notifikasi order.

## Catatan
- Jika API gagal, halaman otomatis membuka WhatsApp dengan chat berisi detail pesanan (fallback).
- Untuk kirim pesan ke **pelanggan** via Cloud API, ubah target `to` di `orders.js`.
