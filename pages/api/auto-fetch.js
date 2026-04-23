import dbConnect, { News } from '../../lib/db';

export default async function handler(req, res) {
  await dbConnect();
  
  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'NEWS_API_KEY not set in environment variables' });
  }

  const categories = [
    { name: 'business', ourCategory: 'finance' },
    { name: 'sports', ourCategory: 'sports' },
    { name: 'technology', ourCategory: 'general' },
    { name: 'science', ourCategory: 'general' },
  ];
  
  let totalArticles = 0;

  for (const cat of categories) {
    const url = `https://newsapi.org/v2/top-headlines?country=us&category=${cat.name}&pageSize=25&apiKey=${apiKey}`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.status === 'ok' && data.articles) {
        for (const article of data.articles) {
          if (!article.url || !article.title) continue;
          
          const result = await News.findOneAndUpdate(
            { originalUrl: article.url },
            {
              originalUrl: article.url,
              title: article.title || 'No title',
              summary: article.description || article.content?.substring(0, 500) || 'Read more...',
              source: article.source?.name || 'Unknown',
              category: cat.ourCategory,
              imageUrl: article.urlToImage || '',
              publishedAt: article.publishedAt ? new Date(article.publishedAt) : new Date(),
              updatedAt: new Date(),
            },
            { upsert: true, new: true }
          );
          totalArticles++;
        }
      }
    } catch (err) {
      console.error(`Error fetching ${cat.name}:`, err);
    }
  }

  // Also delete articles older than 7 days
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const deleted = await News.deleteMany({ publishedAt: { $lt: oneWeekAgo } });

  res.status(200).json({ 
    message: `Auto-fetched/updated ${totalArticles} articles, deleted ${deleted.deletedCount} old articles`,
    total: totalArticles,
    deleted: deleted.deletedCount
  });
}