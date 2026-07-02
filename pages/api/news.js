import dbConnect, { News } from '../../lib/db';
import Parser from 'rss-parser';

const parser = new Parser();

// Reliable RSS feeds (finance + sports)
const feedUrls = [
  { url: 'https://feeds.bloomberg.com/markets/news.rss', source: 'Bloomberg', category: 'finance' },
  { url: 'https://feeds.reuters.com/reuters/businessNews', source: 'Reuters', category: 'finance' },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Business.xml', source: 'NYT', category: 'finance' },
  { url: 'https://www.espn.com/espn/rss/news', source: 'ESPN', category: 'sports' },
  { url: 'https://feeds.bbci.co.uk/sport/rss.xml', source: 'BBC Sport', category: 'sports' },
  { url: 'https://sports.yahoo.com/top/rss.xml', source: 'Yahoo Sports', category: 'sports' },
];

export default async function handler(req, res) {
  await dbConnect();

  // GET request: return articles (with optional category filter)
  if (req.method === 'GET') {
    const { category = 'general', id } = req.query;

    // If an ID (originalUrl) is provided, return that single article
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

    // Otherwise return articles from DB, filtered by category if needed
    try {
      const query = category !== 'general' ? { category } : {};
      let articles = await News.find(query).sort({ publishedAt: -1 }).limit(30).lean();

      // If DB is empty, fetch fresh from RSS and store
      if (articles.length === 0) {
        articles = await fetchAndStoreNews();
      }
      return res.status(200).json(articles);
    } catch (err) {
      console.error(err);
      // Fallback hardcoded news (so homepage never empty)
      const fallback = getFallbackNews(category);
      return res.status(200).json(fallback);
    }
  }

  // POST request: manually refresh news
  if (req.method === 'POST') {
    const { category = 'general' } = req.body;
    const articles = await fetchAndStoreNews(category);
    return res.status(200).json({ message: `Fetched ${articles.length} articles` });
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}

// Fetch RSS feeds via proxy and store in DB
async function fetchAndStoreNews(category = 'general') {
  const allArticles = [];
  const feedList = category === 'finance' ? feedUrls.filter(f => f.category === 'finance')
    : category === 'sports' ? feedUrls.filter(f => f.category === 'sports')
    : feedUrls;

  for (const feed of feedList) {
    try {
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(feed.url)}`;
      const response = await fetch(proxyUrl);
      if (!response.ok) continue;
      const xml = await response.text();
      const parsed = await parser.parseString(xml);
      if (parsed.items) {
        const articles = parsed.items.slice(0, 10).map(item => ({
          originalUrl: item.link,
          title: item.title,
          summary: (item.contentSnippet || item.description || '').substring(0, 600),
          source: feed.source,
          category: feed.category,
          imageUrl: item.enclosure?.url || '',
          publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
        }));
        allArticles.push(...articles);
      }
    } catch (err) {
      console.error(`Error fetching ${feed.url}:`, err.message);
    }
  }

  // Store in DB (upsert)
  for (const article of allArticles) {
    await News.findOneAndUpdate(
      { originalUrl: article.originalUrl },
      article,
      { upsert: true }
    );
  }
  return allArticles;
}

// Fallback hardcoded news (always returns something)
function getFallbackNews(category) {
  const all = [
    { _id: '1', title: 'Bitcoin Surges Past $75,000', summary: 'Bitcoin reaches new all-time high.', source: 'Reuters', category: 'finance', imageUrl: '', publishedAt: new Date() },
    { _id: '2', title: 'Real Madrid Advances to Final', summary: 'Late goal secures victory.', source: 'BBC Sport', category: 'sports', imageUrl: '', publishedAt: new Date() },
    { _id: '3', title: 'Fed Signals Rate Cuts', summary: 'Powell hints at easing.', source: 'Bloomberg', category: 'finance', imageUrl: '', publishedAt: new Date() },
    { _id: '4', title: 'Lakers Take Game 1', summary: 'LeBron scores 35 points.', source: 'ESPN', category: 'sports', imageUrl: '', publishedAt: new Date() },
  ];
  if (category === 'finance') return all.filter(a => a.category === 'finance');
  if (category === 'sports') return all.filter(a => a.category === 'sports');
  return all;
}