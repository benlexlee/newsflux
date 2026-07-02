export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    // SportScore public API (no key required)
    const response = await fetch('https://sportscore.com/api/v1/football/live');
    if (!response.ok) throw new Error('Failed to fetch live scores');
    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Live scores API error:', error);
    // Fallback static data if API fails
    return res.status(200).json([
      { home: 'Real Madrid', away: 'Barcelona', home_score: 2, away_score: 1, status: 'Live' },
      { home: 'Arsenal', away: 'Chelsea', home_score: 3, away_score: 0, status: 'Live' },
      { home: 'Bayern Munich', away: 'Dortmund', home_score: 1, away_score: 1, status: 'Live' },
    ]);
  }
}