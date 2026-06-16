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
  const [fullContent, setFullContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchArticle = async () => {
      try {
        const originalUrl = decodeURIComponent(id);
        let summary = '';
        let source = '';
        let imageUrl = '';

        // 1. Try to get from database first
        try {
          const dbRes = await fetch(`/api/news?id=${encodeURIComponent(originalUrl)}`);
          if (dbRes.ok) {
            const data = await dbRes.json();
            summary = data.summary || '';
            source = data.source || '';
            imageUrl = data.imageUrl || '';
          }
        } catch (dbErr) { /* ignore */ }

        // 2. Try to fetch full content via proxy
        let fullText = summary;
        let title = 'Article';
        const proxies = [
          `https://api.allorigins.win/raw?url=${encodeURIComponent(originalUrl)}`,
          `https://corsproxy.io/?url=${encodeURIComponent(originalUrl)}`,
        ];

        for (const proxy of proxies) {
          try {
            const res = await fetch(proxy);
            if (!res.ok) continue;
            const html = await res.text();

            // Extract title
            const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
            if (titleMatch) title = titleMatch[1].replace(/&#?\w+;/g, '').trim();

            // Extract image
            const ogImage = html.match(/<meta property="og:image" content="([^"]*)"/i);
            if (ogImage) imageUrl = ogImage[1];

            // Extract content – try <article> first, then <main>, then all <p> tags
            let content = '';
            const articleMatch = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
            if (articleMatch) {
              content = articleMatch[1];
            } else {
              const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
              if (mainMatch) content = mainMatch[1];
            }
            if (!content) {
              const pMatches = html.match(/<p[^>]*>([\s\S]*?)<\/p>/gi);
              if (pMatches) {
                content = pMatches.slice(0, 20).join(' ');
              }
            }

            // Clean up
            content = content.replace(/<script[\s\S]*?<\/script>/gi, '');
            content = content.replace(/<style[\s\S]*?<\/style>/gi, '');
            content = content.replace(/<nav[\s\S]*?<\/nav>/gi, '');
            content = content.replace(/<header[\s\S]*?<\/header>/gi, '');
            content = content.replace(/<footer[\s\S]*?<\/footer>/gi, '');

            if (content.length > 100) {
              fullText = content;
              break;
            }
          } catch (proxyErr) {
            console.warn('Proxy failed, trying next...');
          }
        }

        // If no content was fetched, use summary from DB
        if (!fullText || fullText.length < 50) {
          fullText = summary || 'Full content could not be loaded. You can read the original article below.';
        }

        setArticle({
          originalUrl,
          title,
          summary: summary || fullText.substring(0, 300),
          source: source || new URL(originalUrl).hostname.replace('www.', ''),
          imageUrl: imageUrl || '',
          publishedAt: new Date(),
        });
        setFullContent(fullText);
      } catch (err) {
        console.error(err);
        setError(true);
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

  if (error || !article) {
    const originalUrl = decodeURIComponent(id || '');
    return (
      <>
        <Header />
        <AdManager position="video" />
        <AdManager position="interstitial" />
        <main className="container mx-auto px-4 py-6">
          <AdManager position="top" />
          <div className="max-w-3xl mx-auto bg-gray-800 rounded-xl shadow-md p-6 border border-gray-700 text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Unable to load article</h1>
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

  const displayImage = article.imageUrl || 'https://placehold.co/800x400/1e293b/white?text=News+Image';

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
            src={displayImage}
            alt={article.title}
            className="w-full rounded-lg mb-4 object-cover max-h-96"
            onError={(e) => { e.target.src = 'https://placehold.co/800x400/1e293b/white?text=News+Image'; }}
          />
          <h1 className="text-3xl font-bold mb-2 text-white">{article.title}</h1>
          <div className="text-gray-400 text-sm mb-4">
            Source: {article.source} | {new Date(article.publishedAt).toLocaleDateString()}
          </div>
          <div
            className="text-gray-200 leading-relaxed text-lg mb-6 prose prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: fullContent }}
          />
          <div className="flex justify-between items-center">
            <a
              href={article.originalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
            >
              Read original article on {article.source} ↗
            </a>
            <button onClick={() => router.back()} className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg transition">
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