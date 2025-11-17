import fetch from "node-fetch";

export default async function handler(req, res) {
  try {
    const response = await fetch('https://api.upbit.com/v1/ticker?markets=KRW-BTC', {
      headers: { "Accept": "application/json" }
    });
    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    console.error("BTC fetch error:", err);
    res.status(500).json({ error: "Failed to fetch BTC price" });
  }
}
