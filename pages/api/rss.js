import Parser from 'rss-parser';

const parser = new Parser();
const feeds = [
  { url: 'https://feeds.bbci.co.uk/news/business/rss.xml', source: 'BBC', category: 'finance' },
  { url: 'https://feeds.reuters.com/reuters/businessNews', source: 'Reuters', category: 'finance' },
  { url: 'https://www.espn.com/espn/rss/news', source: 'ESPN', category: 'sports' },
  { url: 'https://feeds.bbci.co.uk/sport/rss.xml', source: 'BBC Sport', category: 'sports' },
  { url: 'https://feeds.bloomberg.com/markets/news.rss', source: 'Bloomberg', category: 'finance' },
  { url: 'https://sports.yahoo.com/top/rss.xml', source: 'Yahoo Sports', category: 'sports' },
];

export default async function handler(req, res) {
  const { category } = req.query;
  try {
    let allArticles = [];
    for (const feed of feeds) {
      // Filter by category if specified
      if (category && feed.category !== category) {
        continue;
      }
      try {
        const parsed = await parser.parseURL(feed.url);
        const articles = parsed.items.slice(0, 12).map(item => ({
          id: item.link,
          title: item.title,
          summary: (item.contentSnippet || item.description || '').substring(0, 250),
          source: feed.source,
          category: feed.category,
          imageUrl: item.enclosure?.url || '',
          link: item.link,
          pubDate: item.pubDate,
        }));
        allArticles.push(...articles);
      } catch (err) {
        console.error(`Error fetching ${feed.url}:`, err.message);
      }
    }
    // Sort by date (newest first) and limit
    allArticles.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
    res.status(200).json(allArticles.slice(0, 24));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch news' });
  }
}