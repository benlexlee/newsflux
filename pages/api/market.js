export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    // Bitcoin from CoinGecko (free, no key)
    let bitcoin = 42000;
    try {
      const btcRes = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd');
      const btcData = await btcRes.json();
      bitcoin = btcData.bitcoin?.usd || 42000;
    } catch (e) { console.log('BTC API error'); }

    // Gold from GoldAPI (free)
    let gold = 2350;
    try {
      const goldRes = await fetch('https://api.gold-api.com/price/XAU');
      const goldData = await goldRes.json();
      gold = goldData.price || 2350;
    } catch (e) { console.log('Gold API error'); }

    // EUR/USD from ExchangeRate-API (free)
    let eurUsd = 1.09;
    try {
      const forexRes = await fetch('https://api.exchangerate-api.com/v4/latest/EUR');
      const forexData = await forexRes.json();
      eurUsd = forexData.rates?.USD || 1.09;
    } catch (e) { console.log('Forex API error'); }

    // S&P 500 from Yahoo Finance (via proxy)
    let sp500 = 4800;
    try {
      const spRes = await fetch('https://query1.finance.yahoo.com/v8/finance/chart/%5EGSPC');
      const spData = await spRes.json();
      sp500 = spData.chart?.result?.[0]?.meta?.regularMarketPrice || 4800;
    } catch (e) { console.log('S&P 500 API error'); }

    res.status(200).json({ bitcoin, gold, eur_usd: eurUsd, sp500 });
  } catch (error) {
    console.error('Market API error:', error);
    res.status(200).json({ bitcoin: 42000, gold: 2350, eur_usd: 1.09, sp500: 4800 });
  }
}