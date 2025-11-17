// api/btc-price.js
import fetch from 'node-fetch';

export default async function handler(req, res) {
  try {
    const response = await fetch('https://api.bithumb.com/public/ticker/KRW-BTC');
    const data = await response.json();
    res.status(200).json({ price: parseFloat(data.data.closing_price) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ price: 50000000 }); // fallback 가격
  }
}
