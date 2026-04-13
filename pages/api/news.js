import Parser from 'rss-parser';

const parser = new Parser();

// Multiple news sources (finance and sports)
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
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { category = 'general' } = req.query;
  let feedList;
  if (category === 'finance') feedList = feedUrls.finance;
  else if (category === 'sports') feedList = feedUrls.sports;
  else feedList = [...feedUrls.finance, ...feedUrls.sports];

  try {
    const allArticles = [];
    for (const url of feedList) {
      try {
        const feed = await parser.parseURL(url);
        const articles = feed.items.slice(0, 4).map(item => ({
          _id: item.guid || item.link,
          title: item.title,
          summary: (item.contentSnippet || item.description || '').substring(0, 200),
          source: new URL(url).hostname.replace('www.', ''),
          category: category === 'finance' ? 'finance' : category === 'sports' ? 'sports' : 'general',
          imageUrl: item.enclosure?.url || '',
          publishedAt: item.pubDate || new Date().toISOString(),
        }));
        allArticles.push(...articles);
      } catch (err) {
        console.error(`Feed error ${url}:`, err.message);
      }
    }
    // Shuffle and return top 15
    const shuffled = allArticles.sort(() => 0.5 - Math.random());
    const topArticles = shuffled.slice(0, 15);
    return res.status(200).json(topArticles);
  } catch (error) {
    console.error('News error:', error);
    // Fallback mock news (should rarely happen)
    const mock = [
      { _id: '1', title: 'Bitcoin Surges Past $70,000', summary: 'Bitcoin hits new all-time high.', source: 'Reuters', category: 'finance', imageUrl: '', publishedAt: new Date().toISOString() },
      { _id: '2', title: 'Real Madrid Advances to Semifinals', summary: 'Late goal secures victory.', source: 'BBC Sport', category: 'sports', imageUrl: '', publishedAt: new Date().toISOString() },
    ];
    return res.status(200).json(mock);
  }
}