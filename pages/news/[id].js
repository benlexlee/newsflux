import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import AdManager from '../../components/ads/AdManager';

export default function NewsArticle() {
  const router = useRouter();
  const { id } = router.query;
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchArticle = async () => {
      try {
        const res = await fetch(`/api/news?id=${encodeURIComponent(id)}`);
        if (res.ok) {
          const data = await res.json();
          setArticle(data);
        } else {
          // If not found, redirect to original URL
          const originalUrl = decodeURIComponent(id);
          window.location.href = originalUrl;
          return;
        }
      } catch (err) {
        // On error, also redirect to original
        const originalUrl = decodeURIComponent(id);
        window.location.href = originalUrl;
        return;
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

  if (!article) {
    // Should not happen because of redirect, but just in case
    return (
      <>
        <Header />
        <main className="container mx-auto px-4 py-20 text-center text-red-400">
          <p>Redirecting to original article...</p>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{article.title} - NewsFlux</title>
        <meta name="description" content={article.summary} />
      </Head>
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
          {article.imageUrl && (
            <img src={article.imageUrl} alt={article.title} className="w-full rounded-lg mb-4" />
          )}
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
              Read original article ↗
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