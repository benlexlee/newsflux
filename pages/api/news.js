import Parser from 'rss-parser';
import dbConnect, { News } from '../../lib/db';

const parser = new Parser();

const feedUrls = {
  finance: [
    'https://feeds.bloomberg.com/markets/news.rss',
    'https://feeds.reuters.com/reuters/businessNews',
    'https://rss.nytimes.com/services/xml/rss/nyt/Business.xml',
    'https://www.wsj.com/xml/rss/3_7085.xml',
    'https://feeds.finance.yahoo.com/rss/2.0/headline?s=^GSPC&region=US&lang=en-US',
  ],
  sports: [
    'https://www.espn.com/espn/rss/news',
    'https://feeds.bbci.co.uk/sport/rss.xml',
    'https://sports.yahoo.com/top/rss.xml',
    'https://www.si.com/rss/si_all.xml',
    'https://www.cbssports.com/rss/headlines',
  ],
};

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'GET') {
    const { category = 'general', id } = req.query;

    // Single article by ID (originalUrl)
    if (id) {
      try {
        const article = await News.findOne({ originalUrl: decodeURIComponent(id) });
        if (article) return res.status(200).json(article);
        return res.status(404).json({ error: 'Article not found' });
      } catch (err) {
        return res.status(500).json({ error: err.message });
      }
    }

    // Return articles from database
    try {
      const query = category !== 'general' ? { category } : {};
      let articles = await News.find(query).sort({ publishedAt: -1 }).limit(30).lean();
      
      // If database is empty, fetch fresh from RSS and store
      if (articles.length === 0) {
        articles = await fetchAndStoreNews(category);
      }
      return res.status(200).json(articles);
    } catch (err) {
      console.error(err);
      // Fallback mock news (should rarely happen)
      const mock = [
        { _id: '1', title: 'Bitcoin Surges Past $75,000', summary: 'Bitcoin hits new all-time high.', source: 'Reuters', category: 'finance', imageUrl: '', publishedAt: new Date().toISOString() },
        { _id: '2', title: 'Real Madrid Advances to Final', summary: 'Late goal secures victory.', source: 'BBC Sport', category: 'sports', imageUrl: '', publishedAt: new Date().toISOString() },
      ];
      return res.status(200).json(mock);
    }
  }

  if (req.method === 'POST') {
    // Manual refresh: fetch from RSS and store
    const { category = 'general' } = req.body;
    const articles = await fetchAndStoreNews(category);
    return res.status(200).json({ message: `Fetched ${articles.length} articles` });
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}

async function fetchAndStoreNews(category) {
  let feedList;
  if (category === 'finance') feedList = feedUrls.finance;
  else if (category === 'sports') feedList = feedUrls.sports;
  else feedList = [...feedUrls.finance, ...feedUrls.sports];

  const allArticles = [];

  for (const url of feedList) {
    try {
      const feed = await parser.parseURL(url);
      // Take up to 8 articles per feed
      const articles = feed.items.slice(0, 8).map(item => ({
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
      console.error(`RSS error for ${url}:`, err.message);
    }
  }

  // Store in MongoDB (upsert)
  for (const article of allArticles) {
    await News.findOneAndUpdate(
      { originalUrl: article.originalUrl },
      article,
      { upsert: true }
    );
  }
  return allArticles;
}