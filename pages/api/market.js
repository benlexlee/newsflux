export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    // Bitcoin from CoinGecko (no key)
    const btcRes = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd');
    const btcData = await btcRes.json();
    const bitcoin = btcData.bitcoin?.usd || 42000;

    // Gold price from a free API (metalpriceapi – free tier without key gives demo data, but we'll use a public endpoint)
    // Alternative: use a CORS proxy to get from goldprice.org? Better to use a free API that doesn't require key.
    // For now, we'll use a reliable free source: https://api.gold-api.com/ (no key required for basic)
    let gold = 2050;
    try {
      const goldRes = await fetch('https://api.gold-api.com/price/XAU');
      const goldData = await goldRes.json();
      gold = goldData.price || 2050;
    } catch (e) { console.log('Gold API error, using fallback'); }

    // EUR/USD from free exchangerate.host (no key)
    let eurUsd = 1.09;
    try {
      const forexRes = await fetch('https://api.exchangerate.host/convert?from=EUR&to=USD');
      const forexData = await forexRes.json();
      eurUsd = forexData.result || 1.09;
    } catch (e) { console.log('Forex API error'); }

    // S&P 500 from Yahoo Finance (via a free CORS proxy)
    let sp500 = 4500;
    try {
      const spRes = await fetch('https://query1.finance.yahoo.com/v8/finance/chart/%5EGSPC');
      const spData = await spRes.json();
      sp500 = spData.chart?.result?.[0]?.meta?.regularMarketPrice || 4500;
    } catch (e) { console.log('S&P 500 API error'); }

    res.status(200).json({
      bitcoin,
      gold,
      eur_usd: eurUsd,
      sp500,
    });
  } catch (error) {
    console.error('Market API error:', error);
    res.status(200).json({
      bitcoin: 42000,
      gold: 2050,
      eur_usd: 1.09,
      sp500: 4500,
    });
  }
}