// api/orders.js — Vercel Serverless Function
fetch('URL', options)

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', process.env.ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function formatRupiah(n){
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n || 0);
}

function genInvoice(prefix="INV-", now = new Date()){
  const pad = (x,n=2) => String(x).padStart(n, '0');
  const id = `${prefix}${now.getFullYear()}${pad(now.getMonth()+1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}-${Math.random().toString(36).slice(2,6).toUpperCase()}`;
  return id;
}

async function sendWhatsApp({ phoneNumberId, accessToken, to, text }){
  const url = `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`;
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ messaging_product: 'whatsapp', to, type: 'text', text: { body: text } })
  });
  const data = await r.json();
  if(!r.ok) throw new Error(`WA Error ${r.status}: ${JSON.stringify(data)}`);
  return data;
}

module.exports = async (req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const { nama, wa, varian, qty, metode, zona, alamat, pay, catatan, hargaVarian, ongkir, subtotal, total } = body;

    if (!nama || !wa || !varian || !qty) return res.status(400).json({ error: 'Data tidak lengkap' });

    const invoiceId = genInvoice(process.env.INVOICE_PREFIX || 'INV-');
    const business = process.env.BUSINESS_NAME || 'Bakpia Rasa Jogja';

    const sub = Number(subtotal) || (Number(hargaVarian||0) * Number(qty||1));
    const ship = Number(ongkir||0);
    const grand = Number(total) || (sub + ship);

    const lines = [
      `${business} — KONFIRMASI PESANAN`,
      `Invoice: ${invoiceId}`,
      '',
      `Nama   : ${nama}`,
      `WA     : ${wa}`,
      `Varian : ${varian}`,
      `Jumlah : ${qty} box`,
      `Metode : ${metode || '-'}${zona?` / ${zona}`:''}`,
      alamat ? `Alamat : ${alamat}` : null,
      `Pembayaran: ${(pay||'-').toUpperCase()}`,
      catatan ? `Catatan : ${catatan}` : null,
      '',
      `Subtotal: ${formatRupiah(sub)}`,
      `Ongkir  : ${formatRupiah(ship)}`,
      `TOTAL   : ${formatRupiah(grand)}`,
      '',
      'Terima kasih 🙏'
    ].filter(Boolean).join('\n');

    let waResult = null;
    const PHONE_ID = process.env.WA_PHONE_NUMBER_ID;
    const TOKEN = process.env.WA_ACCESS_TOKEN;
    if (PHONE_ID && TOKEN) {
      const merchantTo = process.env.MERCHANT_WA || '6282326201440';
      waResult = await sendWhatsApp({ phoneNumberId: PHONE_ID, accessToken: TOKEN, to: merchantTo, text: `[PESAN BARU]\nDari: ${nama} (${wa})\n\n${lines}` });
    }

    return res.status(200).json({ ok: true, invoiceId, wa: waResult, ...body });
  } catch (e) {
    return res.status(500).json({ ok:false, error: e.message });
  }
};
