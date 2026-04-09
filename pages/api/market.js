import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
  
  try {
    const cryptoResponse = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
      params: { ids: 'bitcoin,ethereum', vs_currencies: 'usd' },
    });
    
    const marketData = {
      bitcoin: cryptoResponse.data.bitcoin?.usd || 42000,
      ethereum: cryptoResponse.data.ethereum?.usd || 2200,
      gold: 2050,
      eur_usd: 1.09,
      sp500: 4500,
    };
    
    res.status(200).json(marketData);
  } catch (error) {
    console.error('Market API error:', error);
    res.status(200).json({
      bitcoin: 42000,
      ethereum: 2200,
      gold: 2050,
      eur_usd: 1.09,
      sp500: 4500,
    });
  }
}