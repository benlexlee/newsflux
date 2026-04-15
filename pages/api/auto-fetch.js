import dbConnect, { News } from '../../lib/db';
import Parser from 'rss-parser';

const parser = new Parser();

const feedUrls = {
  finance: [
    'https://feeds.bloomberg.com/markets/news.rss',
    'https://feeds.reuters.com/reuters/businessNews',
    'https://rss.nytimes.com/services/xml/rss/nyt/Business.xml',
  ],
  sports: [
    'https://www.espn.com/espn/rss/news',
    'https://feeds.bbci.co.uk/sport/rss.xml',
    'https://sports.yahoo.com/top/rss.xml',
  ],
};

export default async function handler(req, res) {
  // Secret key to prevent unauthorized access (optional)
  const secret = req.query.secret;
  if (secret !== process.env.CRON_SECRET && process.env.NODE_ENV === 'production') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  await dbConnect();
  const allArticles = [];

  for (const url of [...feedUrls.finance, ...feedUrls.sports]) {
    try {
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
      const response = await fetch(proxyUrl);
      const xml = await response.text();
      const feed = await parser.parseString(xml);
      const articles = feed.items.slice(0, 10).map(item => ({
        originalUrl: item.link,
        title: item.title,
        summary: (item.contentSnippet || item.description || '').substring(0, 1000),
        source: new URL(url).hostname.replace('www.', ''),
        category: url.includes('bloomberg') || url.includes('reuters') || url.includes('nytimes') ? 'finance' : 'sports',
        imageUrl: item.enclosure?.url || '',
        publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
      }));
      allArticles.push(...articles);
    } catch (err) {
      console.error(`Auto-fetch error for ${url}:`, err);
    }
  }

  // Deduplicate
  const unique = {};
  for (const a of allArticles) unique[a.originalUrl] = a;
  const final = Object.values(unique);

  for (const article of final) {
    await News.findOneAndUpdate({ originalUrl: article.originalUrl }, article, { upsert: true });
  }

  res.status(200).json({ message: `Auto-fetched and stored ${final.length} articles` });
}