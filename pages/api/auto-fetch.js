import dbConnect, { News } from '../../lib/db';
import Parser from 'rss-parser';

const parser = new Parser();
const fallbackFeeds = [
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Business.xml', category: 'finance' },
  { url: 'https://www.espn.com/espn/rss/news', category: 'sports' },
  { url: 'https://feeds.bbci.co.uk/sport/rss.xml', category: 'sports' },
  { url: 'https://feeds.bloomberg.com/markets/news.rss', category: 'finance' },
];

export default async function handler(req, res) {
  // Respond immediately to avoid timeout
  res.status(202).json({ message: 'Fetch started' });

  (async () => {
    try {
      await dbConnect();
      let total = 0;
      for (const feed of fallbackFeeds) {
        try {
          const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(feed.url)}`;
          const response = await fetch(proxyUrl, { signal: AbortSignal.timeout(10000) });
          if (!response.ok) continue;
          const xml = await response.text();
          const parsed = await parser.parseString(xml);
          if (parsed.items) {
            for (const item of parsed.items.slice(0, 10)) {
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
              total++;
            }
          }
        } catch (err) {
          console.error(`Feed error ${feed.url}:`, err.message);
        }
      }
      // Delete old articles (>7 days)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      await News.deleteMany({ publishedAt: { $lt: weekAgo } });
      console.log(`Auto-fetch completed: ${total} articles`);
    } catch (err) {
      console.error('Auto-fetch error:', err);
    }
  })();
}