import { useRouter } from 'next/router';
import Head from 'next/head';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import AdManager from '../../components/ads/AdManager';
import { useEffect, useState } from 'react';

export default function NewsArticle() {
  const router = useRouter();
  const { id } = router.query;
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    // Fetch the article data from the API
    const fetchArticle = async () => {
      try {
        // Since we don't store full content, we need to fetch from the news API again
        const res = await fetch(`/api/news?category=general`);
        const allArticles = await res.json();
        const found = allArticles.find(a => a._id === decodeURIComponent(id));
        setArticle(found || null);
      } catch (err) {
        console.error(err);
        setArticle(null);
      } finally {
        setLoading(false);
      }
    };
    fetchArticle();
  }, [id]);

  if (loading) return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-6 text-center text-gray-400">Loading article...</main>
      <Footer />
    </>
  );

  if (!article) return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-6 text-center text-red-400">Article not found.</main>
      <Footer />
    </>
  );

  return (
    <>
      <Head><title>{article.title} - NewsFlux</title></Head>
      <Header />
      <AdManager position="video" />
      <AdManager position="interstitial" />
      <main className="container mx-auto px-4 py-6">
        <AdManager position="top" />
        <article className="max-w-3xl mx-auto bg-gray-800 rounded-xl shadow-md p-6 border border-gray-700">
          <h1 className="text-3xl font-bold mb-2 text-white">{article.title}</h1>
          <div className="text-gray-400 text-sm mb-4">Source: {article.source} | {new Date(article.publishedAt).toLocaleDateString()}</div>
          <p className="text-gray-200 leading-relaxed text-lg mb-6">{article.summary}</p>
          <div className="flex justify-between items-center">
            <a 
              href={article._id} 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
            >
              Read original article ↗
            </a>
            <button 
              onClick={() => window.history.back()}
              className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg transition"
            >
              ← Back
            </button>
          </div>
        </article>
        <AdManager position="bottom" />
      </main>
      <Footer />
    </>
  );
}