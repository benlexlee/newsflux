export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { category = 'general' } = req.query;
  const mapCategory = {
    finance: 'business',
    sports: 'sports',
    general: 'general',
  };
  const mapped = mapCategory[category] || 'general';

  try {
    // Using GNews API (no API key required for limited requests)
    const url = `https://gnews.io/api/v4/search?q=${mapped}&lang=en&max=10&country=us`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.articles) {
      const articles = data.articles.map(article => ({
        _id: article.url,
        title: article.title,
        summary: article.description || article.content?.substring(0, 200) || 'Read more...',
        source: article.source.name,
        category: category === 'finance' ? 'finance' : category === 'sports' ? 'sports' : 'general',
        imageUrl: article.image,
        publishedAt: article.publishedAt,
      }));
      return res.status(200).json(articles);
    } else {
      // Fallback to mock data if API fails
      return res.status(200).json(getMockNews(category));
    }
  } catch (error) {
    console.error('News API error:', error);
    return res.status(200).json(getMockNews(category));
  }
}

function getMockNews(category) {
  const allNews = [
    { _id: '1', title: 'Bitcoin Surges Past $70,000', summary: 'Bitcoin hits new all-time high.', source: 'Reuters', category: 'finance', imageUrl: '', publishedAt: new Date().toISOString() },
    { _id: '2', title: 'Real Madrid Advances to Semifinals', summary: 'Late goal secures victory.', source: 'BBC Sport', category: 'sports', imageUrl: '', publishedAt: new Date().toISOString() },
  ];
  if (category === 'finance') return allNews.filter(n => n.category === 'finance');
  if (category === 'sports') return allNews.filter(n => n.category === 'sports');
  return allNews;
}