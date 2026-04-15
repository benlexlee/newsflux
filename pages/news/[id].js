import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import AdManager from '../../components/ads/AdManager';

export default function NewsArticle() {
  const router = useRouter();
  const { id } = router.query;
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchArticle = async () => {
      try {
        const res = await fetch(`/api/news?id=${encodeURIComponent(id)}`);
        if (res.ok) {
          const data = await res.json();
          setArticle(data);
        } else {
          setNotFound(true);
        }
      } catch (err) {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    fetchArticle();
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

  if (notFound || !article) {
    const originalUrl = decodeURIComponent(id || '');
    return (
      <>
        <Head><title>Article Preview - NewsFlux</title></Head>
        <Header />
        <AdManager position="video" />
        <AdManager position="interstitial" />
        <main className="container mx-auto px-4 py-6">
          <AdManager position="top" />
          <div className="max-w-3xl mx-auto bg-gray-800 rounded-xl shadow-md p-6 border border-gray-700 text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Article not yet in our database</h1>
            <p className="text-gray-300 mb-6">We are continuously adding articles. You can read the original now.</p>
            <a
              href={originalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg inline-block"
            >
              Read original article ↗ (opens in new tab)
            </a>
            <button
              onClick={() => router.back()}
              className="ml-4 bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg"
            >
              ← Back
            </button>
          </div>
          <AdManager position="bottom" />
        </main>
        <Footer />
      </>
    );
  }

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
          <div className="text-gray-400 text-sm mb-4">
            Source: {article.source} | {new Date(article.publishedAt).toLocaleDateString()}
          </div>
          {article.imageUrl && <img src={article.imageUrl} alt={article.title} className="w-full rounded-lg mb-4" />}
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
              Read full article on {article.source} ↗ (opens in new tab)
            </a>
            <button
              onClick={() => router.back()}
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