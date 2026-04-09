import { useRouter } from 'next/router';
import Head from 'next/head';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import AdManager from '../../components/ads/AdManager';

// Mock news data (same as homepage)
const mockNews = {
  '1': {
    title: 'Bitcoin Surges Past $70,000 Amid Institutional Demand',
    summary: 'Bitcoin reached a new all-time high as major financial institutions increase their exposure to cryptocurrency ETFs. Analysts predict further gains as institutional adoption accelerates.',
    source: 'Reuters',
    category: 'finance',
    publishedAt: new Date().toISOString(),
  },
  '2': {
    title: 'Champions League: Real Madrid Advances to Semifinals',
    summary: 'A late goal secures victory for Real Madrid in a thrilling match against Manchester City. The final minutes saw dramatic turns that will be remembered for years.',
    source: 'BBC Sport',
    category: 'sports',
    publishedAt: new Date().toISOString(),
  },
  '3': {
    title: 'Federal Reserve Signals Rate Cuts Later This Year',
    summary: 'Chairman Powell hints at potential rate reductions as inflation shows signs of cooling. Markets rallied on the news, with investors pricing in a September cut.',
    source: 'Bloomberg',
    category: 'finance',
    publishedAt: new Date().toISOString(),
  },
  '4': {
    title: 'NBA Playoffs: Lakers Take Game 1 Against Warriors',
    summary: 'LeBron James scores 35 points as Los Angeles defeats Golden State in overtime. The series promises to be one of the most competitive in recent memory.',
    source: 'ESPN',
    category: 'sports',
    publishedAt: new Date().toISOString(),
  },
};

export default function NewsArticle() {
  const router = useRouter();
  const { id } = router.query;
  const article = mockNews[id];

  if (router.isFallback || !article) return <div className="text-center py-20">Loading...</div>;

  return (
    <>
      <Head><title>{article.title} - NewsFlux</title></Head>
      <Header />
      <AdManager position="video" />
      <AdManager position="interstitial" />
      <main className="container mx-auto px-4 py-6">
        <AdManager position="top" />
        <article className="max-w-3xl mx-auto bg-white rounded-xl shadow-md p-8">
          <h1 className="text-4xl font-bold mb-4">{article.title}</h1>
          <div className="text-gray-500 text-sm mb-6">Source: {article.source} | {new Date(article.publishedAt).toLocaleDateString()}</div>
          <p className="text-gray-700 leading-relaxed text-lg">{article.summary}</p>
          <p className="text-gray-700 leading-relaxed text-lg mt-4">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.</p>
        </article>
        <AdManager position="bottom" />
      </main>
      <Footer />
    </>
  );
}