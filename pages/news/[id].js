import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import AdManager from '../../components/ads/AdManager';

const fallbackSuggestions = [
  { _id: 'fs1', title: 'Bitcoin Surges Past $75,000', summary: 'Bitcoin reaches new all-time high.', originalUrl: 'https://www.reuters.com', category: 'finance' },
  { _id: 'fs2', title: 'Real Madrid Advances to Final', summary: 'Late goal secures victory.', originalUrl: 'https://www.bbc.com/sport', category: 'sports' },
  { _id: 'fs3', title: 'Fed Signals Rate Cuts', summary: 'Powell hints at easing.', originalUrl: 'https://www.bloomberg.com', category: 'finance' },
  { _id: 'fs4', title: 'Lakers Take Game 1', summary: 'LeBron scores 35 points.', originalUrl: 'https://www.espn.com', category: 'sports' },
];

function makeAbsoluteUrl(url, base) {
  try {
    return new URL(url, base).href;
  } catch {
    return url;
  }
}

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
        const originalUrl = decodeURIComponent(id);
        const dbRes = await fetch(`/api/news?id=${encodeURIComponent(originalUrl)}`);
        let articleData = null;
        let imageUrl = '';

        if (dbRes.ok) {
          articleData = await dbRes.json();
          imageUrl = articleData.imageUrl;
        } else {
          const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(originalUrl)}`;
          const proxyRes = await fetch(proxyUrl);
          const html = await proxyRes.text();
          
          const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
          let title = titleMatch ? titleMatch[1].replace(/&#?\w+;/g, '').trim() : 'Article';
          
          let summary = '';
          const descMatch = html.match(/<meta name="description" content="([^"]*)"/i);
          if (descMatch) summary = descMatch[1];
          if (!summary) {
            const ogDescMatch = html.match(/<meta property="og:description" content="([^"]*)"/i);
            if (ogDescMatch) summary = ogDescMatch[1];
          }
          if (!summary) {
            const pMatch = html.match(/<p[^>]*>([^<]+)<\/p>/i);
            summary = pMatch ? pMatch[1].substring(0, 500) : 'Read the full article on the original website.';
          }
          
          const ogImageMatch = html.match(/<meta property="og:image" content="([^"]*)"/i);
          if (ogImageMatch) imageUrl = makeAbsoluteUrl(ogImageMatch[1], originalUrl);
          if (!imageUrl) {
            const twitterImageMatch = html.match(/<meta name="twitter:image" content="([^"]*)"/i);
            if (twitterImageMatch) imageUrl = makeAbsoluteUrl(twitterImageMatch[1], originalUrl);
          }
          if (!imageUrl) {
            const imgMatches = html.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi);
            if (imgMatches) {
              for (let imgTag of imgMatches) {
                const srcMatch = imgTag.match(/src=["']([^"']+)["']/i);
                if (srcMatch) {
                  imageUrl = makeAbsoluteUrl(srcMatch[1], originalUrl);
                  break;
                }
              }
            }
          }
          
          articleData = {
            originalUrl,
            title,
            summary: summary.substring(0, 1000),
            source: new URL(originalUrl).hostname.replace('www.', ''),
            imageUrl: imageUrl || '',
            publishedAt: new Date(),
            category: 'general',
          };
        }
        setArticle(articleData);
        
        try {
          const suggestionsRes = await fetch(`/api/news?category=${articleData.category || 'general'}&limit=6`);
          if (suggestionsRes.ok) {
            const suggestionsData = await suggestionsRes.json();
            const filtered = suggestionsData.filter(s => s.originalUrl !== articleData.originalUrl).slice(0, 4);
            setSuggestions(filtered.length ? filtered : fallbackSuggestions);
          } else {
            setSuggestions(fallbackSuggestions);
          }
        } catch (err) {
          setSuggestions(fallbackSuggestions);
        }
      } catch (err) {
        console.error(err);
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
            <h1 className="text-2xl font-bold text-white mb-4">Unable to load preview</h1>
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
          <div className="text-gray-200 leading-relaxed text-lg mb-6 whitespace-pre-line">
            {article.summary}
          </div>
          <div className="flex justify-between items-center mb-8">
            <a href={article.originalUrl} target="_blank" rel="noopener noreferrer" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition">Read full article on {article.source} ↗</a>
            <button onClick={() => router.back()} className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg transition">← Back</button>
          </div>
        </article>

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
        <AdManager position="bottom" />
      </main>
      <Footer />
    </>
  );
}