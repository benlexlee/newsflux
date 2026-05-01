import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import AdManager from '../../components/ads/AdManager';
import Parser from 'rss-parser';

const parser = new Parser();
const feeds = [
  'https://feeds.bbci.co.uk/news/rss.xml',
  'https://feeds.reuters.com/reuters/businessNews',
  'https://www.espn.com/espn/rss/news',
  'https://feeds.bloomberg.com/markets/news.rss',
];

export default function NewsArticle() {
  const router = useRouter();
  const { id } = router.query;
  const [article, setArticle] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchArticle = async () => {
      try {
        const targetUrl = decodeURIComponent(id);
        let foundArticle = null;
        let allArticles = [];

        // Fetch all RSS feeds to find the article and collect suggestions
        for (const feedUrl of feeds) {
          try {
            const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(feedUrl)}`;
            const res = await fetch(proxyUrl);
            const xml = await res.text();
            const parsed = await parser.parseString(xml);
            for (const item of parsed.items.slice(0, 15)) {
              if (item.link === targetUrl) {
                foundArticle = {
                  id: item.link,
                  title: item.title,
                  summary: (item.contentSnippet || item.description || '').substring(0, 800),
                  source: new URL(feedUrl).hostname.replace('www.', ''),
                  imageUrl: item.enclosure?.url || '',
                  link: item.link,
                  fullContent: item.content || item.description || '',
                };
              } else {
                allArticles.push({
                  id: item.link,
                  title: item.title,
                  summary: (item.contentSnippet || item.description || '').substring(0, 150),
                  source: new URL(feedUrl).hostname.replace('www.', ''),
                  link: item.link,
                });
              }
            }
          } catch (err) { console.error(err); }
        }

        if (foundArticle) {
          setArticle(foundArticle);
          // Suggestions: other articles from same source or random
          const sameSource = allArticles.filter(a => a.source === foundArticle.source && a.id !== foundArticle.id);
          const randomOthers = allArticles.filter(a => a.source !== foundArticle.source);
          const combined = [...sameSource, ...randomOthers].slice(0, 4);
          setSuggestions(combined);
        } else {
          // Fallback: article not found in feeds – still show a friendly message
          setArticle({
            id: targetUrl,
            title: 'Article',
            summary: 'This article could not be loaded. Click the button below to read it on the original website.',
            source: new URL(targetUrl).hostname,
            imageUrl: '',
            link: targetUrl,
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchArticle();
  }, [id]);

  if (loading) return <div className="text-center py-20">Loading article...</div>;
  if (!article) return <div className="text-center py-20">Article not found.</div>;

  const imageUrl = article.imageUrl || 'https://placehold.co/800x400/1e293b/white?text=News+Image';

  return (
    <>
      <Head><title>{article.title} - NewsFlux</title></Head>
      <Header />
      <AdManager position="video" />
      <AdManager position="interstitial" />
      <main className="container mx-auto px-4 py-6">
        <AdManager position="top" />
        <article className="max-w-3xl mx-auto bg-gray-800 rounded-xl p-6">
          <img src={imageUrl} className="w-full rounded-lg mb-4 object-cover max-h-96" />
          <h1 className="text-3xl font-bold mb-2 text-white">{article.title}</h1>
          <div className="text-gray-400 text-sm mb-4">Source: {article.source}</div>
          <div className="text-gray-200 leading-relaxed text-lg mb-6 whitespace-pre-line">
            {article.summary}
          </div>
          <a href={article.link} target="_blank" rel="noopener noreferrer" className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded inline-block">Read full article on {article.source} →</a>
        </article>

        {suggestions.length > 0 && (
          <div className="max-w-3xl mx-auto mt-10">
            <h3 className="text-xl font-bold text-white mb-4">You might also like</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {suggestions.map(sug => (
                <Link key={sug.id} href={`/news/${encodeURIComponent(sug.id)}`} className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:bg-gray-700">
                  <h4 className="font-bold text-white mb-1 line-clamp-2">{sug.title}</h4>
                  <p className="text-gray-400 text-sm line-clamp-2">{sug.summary}</p>
                  <span className="text-blue-400 text-xs mt-2 inline-block">Read more →</span>
                </Link>
              ))}
            </div>
          </div>
        )}
        <AdManager position="bottom" />
      </main>
      <Footer />
    </>
  );
}