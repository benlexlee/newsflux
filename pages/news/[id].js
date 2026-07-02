import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import AdManager from '../../components/ads/AdManager';

export default function NewsArticle() {
  const router = useRouter();
  const { id } = router.query;
  const [article, setArticle] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        const originalUrl = decodeURIComponent(id);
        // Fetch the main article
        const articleRes = await fetch(`/api/news?id=${encodeURIComponent(originalUrl)}`);
        if (articleRes.ok) {
          const data = await articleRes.json();
          setArticle(data);
          // Fetch suggestions (same category, limit 4, exclude current article)
          const suggRes = await fetch(`/api/news?category=${data.category || 'general'}`);
          if (suggRes.ok) {
            const all = await suggRes.json();
            const filtered = all.filter(a => a.originalUrl !== data.originalUrl).slice(0, 4);
            setSuggestions(filtered);
          }
        } else {
          setArticle(null);
        }
      } catch (err) {
        console.error(err);
        setArticle(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <>
        <Header />
        <main className="container mx-auto px-4 py-20 text-center text-gray-400">Loading article...</main>
        <Footer />
      </>
    );
  }

  // Fallback when article not found
  if (!article) {
    const originalUrl = decodeURIComponent(id || '');
    return (
      <>
        <Header />
        <AdManager position="video" />
        <AdManager position="interstitial" />
        <main className="container mx-auto px-4 py-6">
          <AdManager position="top" />
          <div className="max-w-3xl mx-auto bg-gray-800 rounded-xl shadow-md p-6 border border-gray-700 text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Article not available</h1>
            <p className="text-gray-300 mb-6">You can read the original article directly.</p>
            <a href={originalUrl} target="_blank" rel="noopener noreferrer" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg inline-block">Read original article ↗</a>
            <button onClick={() => router.back()} className="ml-4 bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg">← Back</button>
          </div>
          <AdManager position="bottom" />
        </main>
        <Footer />
      </>
    );
  }

  const imageUrl = article.imageUrl || 'https://placehold.co/800x400/1e293b/white?text=News+Image';

  return (
    <>
      <Head><title>{article.title} - NewsFlux</title></Head>
      <Header />
      <AdManager position="video" />
      <AdManager position="interstitial" />
      <main className="container mx-auto px-4 py-6">
        <AdManager position="top" />
        <article className="max-w-3xl mx-auto bg-gray-800 rounded-xl shadow-md p-6 border border-gray-700">
          <img
            src={imageUrl}
            alt={article.title}
            className="w-full rounded-lg mb-4 object-cover max-h-96"
            onError={(e) => { e.target.src = 'https://placehold.co/800x400/1e293b/white?text=News+Image'; }}
          />
          <h1 className="text-3xl font-bold mb-2 text-white">{article.title}</h1>
          <div className="text-gray-400 text-sm mb-4">
            Source: {article.source} | {new Date(article.publishedAt).toLocaleDateString()}
          </div>
          <div className="text-gray-200 leading-relaxed text-lg mb-6 whitespace-pre-line">
            {article.summary}
          </div>
          <div className="flex justify-between items-center">
            <a
              href={article.originalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
            >
              Read full article on {article.source} ↗
            </a>
            <button onClick={() => router.back()} className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg transition">
              ← Back
            </button>
          </div>
        </article>

        {suggestions.length > 0 && (
          <div className="max-w-3xl mx-auto mt-10">
            <h3 className="text-xl font-bold text-white mb-4 border-l-4 border-blue-500 pl-3">You might also like</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {suggestions.map(sug => (
                <Link key={sug._id} href={`/news/${encodeURIComponent(sug.originalUrl)}`} className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:bg-gray-700 transition">
                  <h4 className="font-bold text-white text-md mb-1 line-clamp-2">{sug.title}</h4>
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