import dbConnect, { News } from '../../lib/db';

export default async function handler(req, res) {
  await dbConnect();
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { articles } = req.body;
  if (!articles || !Array.isArray(articles)) {
    return res.status(400).json({ error: 'Invalid articles array' });
  }
  let saved = 0;
  for (const article of articles) {
    await News.findOneAndUpdate(
      { originalUrl: article.originalUrl },
      article,
      { upsert: true }
    );
    saved++;
  }
  return res.status(200).json({ message: `Saved ${saved} articles` });
}