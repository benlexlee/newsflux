export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const apiKey = process.env.FOOTBALL_API_KEY;

  if (!apiKey) {
    console.warn('FOOTBALL_API_KEY not set');
    return res.status(200).json([]);
  }

  try {
    // Fetch today's matches
    const today = new Date().toISOString().split('T')[0];
    const url = `https://api.football-data.org/v4/matches?dateFrom=${today}&dateTo=${today}`;
    
    const response = await fetch(url, {
      headers: {
        'X-Auth-Token': apiKey,
      },
    });

    if (!response.ok) {
      console.error(`API error: ${response.status} ${response.statusText}`);
      return res.status(200).json([]);
    }

    const data = await response.json();
    const matches = (data.matches || []).map(match => ({
      home: match.homeTeam?.name || 'Team A',
      away: match.awayTeam?.name || 'Team B',
      home_score: match.score?.fullTime?.home ?? match.score?.halfTime?.home ?? null,
      away_score: match.score?.fullTime?.away ?? match.score?.halfTime?.away ?? null,
      status: match.status || 'SCHEDULED',
      time: match.utcDate ? new Date(match.utcDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
      date: match.utcDate ? new Date(match.utcDate).toLocaleDateString() : '',
    }));

    return res.status(200).json(matches);
  } catch (error) {
    console.error('Live scores API error:', error);
    return res.status(200).json([]);
  }
}