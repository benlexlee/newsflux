import dbConnect, { News } from '../../lib/db';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'GET') {
    const { category = 'general', id } = req.query;
    if (id) {
      const article = await News.findOne({ originalUrl: decodeURIComponent(id) });
      if (article) return res.status(200).json(article);
      return res.status(404).json({ error: 'Not found' });
    }
    let articles = await News.find(category !== 'general' ? { category } : {}).sort({ publishedAt: -1 }).limit(30).lean();
    return res.status(200).json(articles);
  }

  if (req.method === 'POST') {
    const { category = 'general' } = req.body;
    const articles = await fetchAndStoreNews(category);
    return res.status(200).json({ message: `Fetched ${articles.length} articles` });
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end();
}

async function fetchAndStoreNews(category) {
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
  let feedList = category === 'finance' ? feedUrls.finance : category === 'sports' ? feedUrls.sports : [...feedUrls.finance, ...feedUrls.sports];
  const allArticles = [];

  for (const url of feedList) {
    try {
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
      const response = await fetch(proxyUrl);
      const xml = await response.text();
      const items = xml.split('<item>').slice(1);
      for (const itemXml of items) {
        const title = (itemXml.match(/<title><!\[CDATA\[(.*?)\]\]>/)?.[1] || itemXml.match(/<title>(.*?)<\/title>/)?.[1] || '').trim();
        const link = (itemXml.match(/<link>(.*?)<\/link>/)?.[1] || '').trim();
        const description = (itemXml.match(/<description><!\[CDATA\[(.*?)\]\]>/)?.[1] || itemXml.match(/<description>(.*?)<\/description>/)?.[1] || '').substring(0, 800);
        const pubDate = itemXml.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || new Date().toUTCString();
        if (link && title) {
          allArticles.push({
            originalUrl: link,
            title,
            summary: description,
            source: new URL(url).hostname.replace('www.', ''),
            category: category === 'finance' ? 'finance' : category === 'sports' ? 'sports' : 'general',
            imageUrl: '',
            publishedAt: new Date(pubDate),
          });
        }
      }
    } catch (err) {
      console.error(`Error fetching ${url}:`, err);
    }
  }

  // Deduplicate
  const unique = {};
  for (const a of allArticles) unique[a.originalUrl] = a;
  const final = Object.values(unique);

  for (const article of final) {
    await News.findOneAndUpdate({ originalUrl: article.originalUrl }, article, { upsert: true });
  }
  return final;
}