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
  const [showIframe, setShowIframe] = useState(false);
  const [iframeError, setIframeError] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchArticle = async () => {
      try {
        const res = await fetch(`/api/news?id=${encodeURIComponent(id)}`);
        if (res.ok) {
          const data = await res.json();
          setArticle(data);
        } else {
          setArticle(null);
        }
      } catch (err) {
        setArticle(null);
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

  // If article not found in database, show a helpful link
  if (!article) {
    return (
      <>
        <Header />
        <main className="container mx-auto px-4 py-20 text-center">
          <p className="text-red-400 mb-4">Article not available in our database.</p>
          <a href={decodeURIComponent(id)} target="_blank" rel="noopener noreferrer" className="bg-blue-600 text-white px-4 py-2 rounded">Read original article ↗</a>
        </main>
        <Footer />
      </>
    );
  }

  // Summary view (default)
  const SummaryView = () => (
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
        <p className="mt-4 text-sm text-gray-400">This is a summary. For the full story, use the buttons below.</p>
      </div>
      <div className="flex flex-wrap gap-3 justify-between items-center">
        <div className="flex gap-3">
          <a
            href={article.originalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
          >
            Read full article on {article.source} ↗
          </a>
          <button
            onClick={() => setShowIframe(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition"
          >
            Try embedded view (experimental)
          </button>
        </div>
        <button
          onClick={() => router.back()}
          className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg transition"
        >
          ← Back
        </button>
      </div>
    </article>
  );

  // Iframe view (experimental)
  const IframeView = () => (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">Embedded view: {article.source}</h2>
        <div className="flex gap-2">
          <button
            onClick={() => { setShowIframe(false); setIframeError(false); }}
            className="bg-gray-600 hover:bg-gray-500 text-white px-3 py-1 rounded"
          >
            Back to summary
          </button>
          <a
            href={article.originalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
          >
            Open in new tab
          </a>
        </div>
      </div>
      {iframeError ? (
        <div className="bg-yellow-800 border border-yellow-600 rounded-lg p-6 text-center">
          <p className="text-yellow-200 mb-3">This website does not allow embedding (it blocks iframes).</p>
          <a href={article.originalUrl} target="_blank" rel="noopener noreferrer" className="bg-blue-600 text-white px-4 py-2 rounded">Read directly on {article.source} →</a>
        </div>
      ) : (
        <iframe
          src={article.originalUrl}
          className="w-full h-[80vh] border-0 rounded-lg bg-white"
          title={article.title}
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          onError={() => setIframeError(true)}
          onLoad={() => {
            // Iframe loaded successfully (but we can't know if content is blocked; we assume success)
          }}
        />
      )}
      <div className="mt-4 text-center text-gray-400 text-sm">
        <button onClick={() => setShowIframe(false)} className="underline">← Return to summary view</button>
      </div>
    </div>
  );

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
        {showIframe ? <IframeView /> : <SummaryView />}
        <AdManager position="bottom" />
      </main>
      <Footer />
    </>
  );
}