import Parser from 'rss-parser';

const parser = new Parser();
const feeds = [
  { url: 'https://feeds.bbci.co.uk/news/rss.xml', source: 'BBC', category: 'general' },
  { url: 'https://feeds.reuters.com/reuters/businessNews', source: 'Reuters', category: 'finance' },
  { url: 'https://www.espn.com/espn/rss/news', source: 'ESPN', category: 'sports' },
  { url: 'https://feeds.bloomberg.com/markets/news.rss', source: 'Bloomberg', category: 'finance' },
];

export default async function handler(req, res) {
  try {
    const allArticles = [];
    for (const feed of feeds) {
      try {
        const parsed = await parser.parseURL(feed.url);
        const articles = parsed.items.slice(0, 10).map(item => ({
          id: item.link,
          title: item.title,
          summary: (item.contentSnippet || item.description || '').substring(0, 200),
          source: feed.source,
          category: feed.category,
          imageUrl: item.enclosure?.url || '',
          link: item.link,
          fullContent: item.content || item.description || '',
        }));
        allArticles.push(...articles);
      } catch (err) {
        console.error(`Error fetching ${feed.url}:`, err.message);
      }
    }
    const shuffled = allArticles.sort(() => 0.5 - Math.random());
    res.status(200).json(shuffled.slice(0, 20));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch news' });
  }
}