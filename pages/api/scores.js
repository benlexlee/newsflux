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
    // Return empty array – no fake data
    return res.status(200).json([]);
  }
}