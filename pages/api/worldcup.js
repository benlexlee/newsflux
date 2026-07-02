export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    // Use a free public API for World Cup data (no key required for basic info)
    const response = await fetch('https://worldcup.sfg.io/matches');
    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('World Cup API error:', error);
    // Return hardcoded sample data if APIs fail
    return res.status(200).json([
      { home_team: 'Brazil', away_team: 'Argentina', home_score: 2, away_score: 1, status: 'completed' },
      { home_team: 'Germany', away_team: 'France', home_score: 0, away_score: 0, status: 'scheduled' },
    ]);
  }
}