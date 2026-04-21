import dbConnect, { News } from '../../lib/db';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'GET') {
    const { category = 'general', id } = req.query;

    // Single article by ID
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
      
      if (articles.length === 0) {
        articles = await fetchFromNewsAPI(category);
      }
      return res.status(200).json(articles);
    } catch (err) {
      console.error(err);
      return res.status(200).json(getMockNews(category));
    }
  }

  if (req.method === 'POST') {
    const { category = 'general' } = req.body;
    const articles = await fetchFromNewsAPI(category);
    return res.status(200).json({ message: `Fetched ${articles.length} articles` });
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end();
}

async function fetchFromNewsAPI(category) {
  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey) {
    console.warn('NEWS_API_KEY not set, using mock news');
    return getMockNews(category);
  }

  // Map our categories to NewsAPI categories
  const categoryMap = {
    finance: 'business',
    sports: 'sports',
    general: 'general',
  };
  const newsCategory = categoryMap[category] || 'general';

  const url = `https://newsapi.org/v2/top-headlines?country=us&category=${newsCategory}&pageSize=30&apiKey=${apiKey}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status !== 'ok' || !data.articles) {
      console.error('NewsAPI error:', data);
      return getMockNews(category);
    }

    const articles = data.articles.map((article, idx) => ({
      originalUrl: article.url,
      title: article.title || 'No title',
      summary: article.description || article.content?.substring(0, 300) || 'Read more...',
      source: article.source?.name || 'News',
      category: category === 'finance' ? 'finance' : category === 'sports' ? 'sports' : 'general',
      imageUrl: article.urlToImage || '',
      publishedAt: article.publishedAt ? new Date(article.publishedAt) : new Date(),
    }));

    // Store in database (upsert)
    for (const article of articles) {
      await News.findOneAndUpdate(
        { originalUrl: article.originalUrl },
        article,
        { upsert: true }
      );
    }
    return articles;
  } catch (error) {
    console.error('NewsAPI fetch error:', error);
    return getMockNews(category);
  }
}

function getMockNews(category) {
  const allNews = [
    { _id: '1', title: 'Bitcoin Surges Past $75,000', summary: 'Bitcoin reaches new all-time high amid institutional demand.', source: 'Reuters', category: 'finance', imageUrl: '', publishedAt: new Date() },
    { _id: '2', title: 'Real Madrid Advances to Champions League Final', summary: 'Late goal secures dramatic victory.', source: 'BBC Sport', category: 'sports', imageUrl: '', publishedAt: new Date() },
    { _id: '3', title: 'Federal Reserve Signals Rate Cuts', summary: 'Chairman Powell hints at easing later this year.', source: 'Bloomberg', category: 'finance', imageUrl: '', publishedAt: new Date() },
    { _id: '4', title: 'Lakers Take Game 1 Against Warriors', summary: 'LeBron James scores 35 points in overtime thriller.', source: 'ESPN', category: 'sports', imageUrl: '', publishedAt: new Date() },
  ];
  if (category === 'finance') return allNews.filter(n => n.category === 'finance');
  if (category === 'sports') return allNews.filter(n => n.category === 'sports');
  return allNews;
}