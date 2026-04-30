import dbConnect, { News } from '../../lib/db';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'GET') {
    const { category = 'general', id } = req.query;
    if (id) {
      try {
        const article = await News.findOne({ originalUrl: decodeURIComponent(id) });
        if (article) return res.status(200).json(article);
        return res.status(404).json({ error: 'Not found' });
      } catch (err) {
        return res.status(500).json({ error: err.message });
      }
    }

    // Always fetch fresh news from NewsAPI and store
    const apiKey = process.env.NEWS_API_KEY;
    if (!apiKey) {
      // fallback to database
      let articles = await News.find(category !== 'general' ? { category } : {})
        .sort({ publishedAt: -1 })
        .limit(30)
        .lean();
      return res.status(200).json(articles);
    }

    const categoryMap = { finance: 'business', sports: 'sports', general: 'general' };
    const query = categoryMap[category] || 'general';
    const url = `https://newsapi.org/v2/top-headlines?country=us&category=${query}&pageSize=25&apiKey=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();

    let articles = [];
    if (data.status === 'ok' && data.articles) {
      articles = data.articles.map(article => ({
        originalUrl: article.url,
        title: article.title || 'No title',
        summary: article.description || article.content?.substring(0, 600) || 'Read more...',
        source: article.source?.name || 'News',
        category: category === 'finance' ? 'finance' : category === 'sports' ? 'sports' : 'general',
        imageUrl: article.urlToImage || '',
        publishedAt: article.publishedAt ? new Date(article.publishedAt) : new Date(),
      }));
      // Store in database (upsert)
      for (const art of articles) {
        await News.findOneAndUpdate({ originalUrl: art.originalUrl }, art, { upsert: true });
      }
    } else {
      // Fallback to database
      articles = await News.find(category !== 'general' ? { category } : {})
        .sort({ publishedAt: -1 })
        .limit(30)
        .lean();
    }
    return res.status(200).json(articles);
  }

  res.setHeader('Allow', ['GET']);
  res.status(405).end();
}