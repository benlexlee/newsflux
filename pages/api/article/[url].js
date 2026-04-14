import dbConnect, { News } from '../../../lib/db';

export default async function handler(req, res) {
  await dbConnect();
  const { url } = req.query;
  if (!url) {
    return res.status(400).json({ error: 'Missing article URL' });
  }
  try {
    const article = await News.findOne({ originalUrl: decodeURIComponent(url) });
    if (article) {
      return res.status(200).json(article);
    } else {
      return res.status(404).json({ error: 'Article not found' });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}