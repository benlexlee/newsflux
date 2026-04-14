import Parser from 'rss-parser';
import dbConnect, { News } from '../../lib/db';

const parser = new Parser();

const feedUrls = {
  finance: [
    'https://feeds.bloomberg.com/markets/news.rss',
    'https://feeds.reuters.com/reuters/businessNews',
    'https://rss.nytimes.com/services/xml/rss/nyt/Business.xml',
    'https://www.wsj.com/xml/rss/3_7085.xml',
  ],
  sports: [
    'https://www.espn.com/espn/rss/news',
    'https://feeds.bbci.co.uk/sport/rss.xml',
    'https://sports.yahoo.com/top/rss.xml',
  ],
};

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'GET') {
    const { category = 'general', id } = req.query;

    // If an ID (URL) is provided, return that single article
    if (id) {
      try {
        const article = await News.findOne({ originalUrl: decodeURIComponent(id) });
        if (article) {
          return res.status(200).json(article);
        } else {
          return res.status(404).json({ error: 'Article not found' });
        }
      } catch (err) {
        return res.status(500).json({ error: err.message });
      }
    }

    // Otherwise, return a list of recent articles from the database
    const query = category !== 'general' ? { category } : {};
    const articles = await News.find(query)
      .sort({ publishedAt: -1 })
      .limit(20)
      .lean();
    return res.status(200).json(articles);
  }

  if (req.method === 'POST') {
    // Manual refresh: fetch from RSS and store
    const { category = 'general' } = req.body;
    let feedList;
    if (category === 'finance') feedList = feedUrls.finance;
    else if (category === 'sports') feedList = feedUrls.sports;
    else feedList = [...feedUrls.finance, ...feedUrls.sports];

    try {
      const allArticles = [];
      for (const url of feedList) {
        try {
          const feed = await parser.parseURL(url);
          const articles = feed.items.slice(0, 6).map(item => ({
            originalUrl: item.link,
            title: item.title,
            summary: (item.contentSnippet || item.description || '').substring(0, 500),
            source: new URL(url).hostname.replace('www.', ''),
            category: category === 'finance' ? 'finance' : category === 'sports' ? 'sports' : 'general',
            imageUrl: item.enclosure?.url || '',
            publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
          }));
          allArticles.push(...articles);
        } catch (err) {
          console.error(`Feed error ${url}:`, err.message);
        }
      }
      // Save each article to MongoDB (upsert)
      for (const article of allArticles) {
        await News.findOneAndUpdate(
          { originalUrl: article.originalUrl },
          { ...article, updatedAt: new Date() },
          { upsert: true }
        );
      }
      return res.status(200).json({ message: `Fetched ${allArticles.length} articles` });
    } catch (error) {
      console.error('News fetch error:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}