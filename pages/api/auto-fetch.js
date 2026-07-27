import dbConnect, { News } from '../../lib/db';
import Parser from 'rss-parser';

const parser = new Parser();

const feedUrls = [
  { url: 'https://feeds.bloomberg.com/markets/news.rss', category: 'finance' },
  { url: 'https://feeds.reuters.com/reuters/businessNews', category: 'finance' },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Business.xml', category: 'finance' },
  { url: 'https://www.espn.com/espn/rss/news', category: 'sports' },
  { url: 'https://feeds.bbci.co.uk/sport/rss.xml', category: 'sports' },
  { url: 'https://sports.yahoo.com/top/rss.xml', category: 'sports' },
];

export default async function handler(req, res) {
  res.status(202).json({ message: 'Auto‑fetch started in background' });

  (async () => {
    try {
      await dbConnect();
      let totalArticles = 0;
      for (const feed of feedUrls) {
        try {
          const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(feed.url)}`;
          const response = await fetch(proxyUrl, { signal: AbortSignal.timeout(15000) });
          if (!response.ok) continue;
          const xml = await response.text();
          const parsed = await parser.parseString(xml);
          if (parsed.items) {
            for (const item of parsed.items.slice(0, 12)) {
              if (!item.link || !item.title) continue;
              const summary = (item.contentSnippet || item.description || '').substring(0, 600);
              await News.findOneAndUpdate(
                { originalUrl: item.link },
                {
                  originalUrl: item.link,
                  title: item.title,
                  summary,
                  source: new URL(feed.url).hostname.replace('www.', ''),
                  category: feed.category,
                  imageUrl: item.enclosure?.url || '',
                  publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
                  updatedAt: new Date(),
                },
                { upsert: true }
              );
              totalArticles++;
            }
          }
        } catch (err) {
          console.error(`Feed error ${feed.url}:`, err.message);
        }
      }
      // Delete old articles
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      await News.deleteMany({ publishedAt: { $lt: oneWeekAgo } });
      console.log(`Auto-fetch completed: ${totalArticles} articles`);
    } catch (err) {
      console.error('Auto-fetch error:', err);
    }
  })();
}