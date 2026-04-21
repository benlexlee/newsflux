import dbConnect from '../../lib/db';
import Score from '../../lib/models/Score';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'GET') {
    const { game, limit = 10 } = req.query;
    const query = game ? { game } : {};
    const scores = await Score.find(query)
      .sort(game === 'chess' || game === 'sudoku' ? { time: 1 } : { score: -1 })
      .limit(parseInt(limit))
      .lean();
    return res.status(200).json(scores);
  }

  if (req.method === 'POST') {
    const { game, nickname, score, time } = req.body;
    if (!game || !nickname || score === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const newScore = await Score.create({ game, nickname, score, time });
    return res.status(201).json(newScore);
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}