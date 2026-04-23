import dbConnect, { News } from '../../lib/db';
import Parser from 'rss-parser';

const parser = new Parser();

export default async function handler(req, res) {
  try {
    await dbConnect();
  } catch (err) {
    console.error('DB connection error:', err);
    return res.status(500).json({ error: 'Database connection failed' });
  }
  
  const feedUrls = [
    { url: 'https://feeds.bloomberg.com/markets/news.rss', category: 'finance' },
    { url: 'https://feeds.reuters.com/reuters/businessNews', category: 'finance' },
    { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Business.xml', category: 'finance' },
    { url: 'https://www.espn.com/espn/rss/news', category: 'sports' },
    { url: 'https://feeds.bbci.co.uk/sport/rss.xml', category: 'sports' },
    { url: 'https://sports.yahoo.com/top/rss.xml', category: 'sports' },
  ];
  
  let totalArticles = 0;
  const errors = [];

  for (const feed of feedUrls) {
    try {
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(feed.url)}`;
      const response = await fetch(proxyUrl);
      if (!response.ok) {
        errors.push(`${feed.url}: HTTP ${response.status}`);
        continue;
      }
      const xml = await response.text();
      const parsed = await parser.parseString(xml);
      
      if (parsed.items) {
        for (const item of parsed.items.slice(0, 10)) {
          if (!item.link || !item.title) continue;
          
          const summary = (item.contentSnippet || item.description || '').substring(0, 800);
          
          try {
            await News.findOneAndUpdate(
              { originalUrl: item.link },
              {
                originalUrl: item.link,
                title: item.title || 'No title',
                summary: summary || 'Read more...',
                source: new URL(feed.url).hostname.replace('www.', ''),
                category: feed.category,
                imageUrl: item.enclosure?.url || '',
                publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
                updatedAt: new Date(),
              },
              { upsert: true }
            );
            totalArticles++;
          } catch (err) {
            errors.push(`DB error for ${item.link}: ${err.message}`);
          }
        }
      }
    } catch (err) {
      errors.push(`${feed.url}: ${err.message}`);
    }
  }

  // Delete articles older than 7 days
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  let deleted = 0;
  try {
    const result = await News.deleteMany({ publishedAt: { $lt: oneWeekAgo } });
    deleted = result.deletedCount;
  } catch (err) {
    errors.push(`Delete error: ${err.message}`);
  }

  res.status(200).json({ 
    message: `Fetched ${totalArticles} articles, deleted ${deleted} old articles`,
    total: totalArticles,
    deleted: deleted,
    errors: errors.length ? errors : undefined
  });
}