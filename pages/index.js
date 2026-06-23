import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import AdManager from '../components/ads/AdManager';
import MarketTicker from '../components/market/Ticker';
import HeadlineTicker from '../components/HeadlineTicker';
import { incrementPageViews } from '../lib/ads';

const initialNews = [
  { _id: 'f1', title: 'Bitcoin Surges Past $75,000', summary: 'Bitcoin reaches new all-time high amid institutional demand. ETFs see record inflows.', source: 'Reuters', category: 'finance', link: 'https://www.reuters.com', imageUrl: '' },
  { _id: 'f2', title: 'Federal Reserve Signals Rate Cuts', summary: 'Chairman Powell hints at easing later this year as inflation cools.', source: 'Bloomberg', category: 'finance', link: 'https://www.bloomberg.com', imageUrl: '' },
  { _id: 'f3', title: 'Gold Prices Surge to Record High', summary: 'Gold hits $2,400 per ounce amid global uncertainty.', source: 'Reuters', category: 'finance', link: 'https://www.reuters.com', imageUrl: '' },
  { _id: 'f4', title: 'Tesla Announces New Battery Technology', summary: 'Next-gen batteries promise 50% more range, 30% lower cost.', source: 'Bloomberg', category: 'finance', link: 'https://www.bloomberg.com', imageUrl: '' },
  { _id: 'f5', title: 'AI Revolution: New Model Outperforms GPT-5', summary: 'Breakthrough in reasoning capabilities sparks industry race.', source: 'Reuters', category: 'finance', link: 'https://www.reuters.com', imageUrl: '' },
  { _id: 'f6', title: 'Oil Prices Drop as OPEC+ Increases Supply', summary: 'Brent crude falls below $80 per barrel.', source: 'Bloomberg', category: 'finance', link: 'https://www.bloomberg.com', imageUrl: '' },
  { _id: 'f7', title: 'Apple Unveils New AI Features', summary: 'Company integrates generative AI across iOS and macOS.', source: 'Reuters', category: 'finance', link: 'https://www.reuters.com', imageUrl: '' },
  { _id: 'f8', title: 'Housing Market Shows Signs of Recovery', summary: 'Sales rise for third consecutive month.', source: 'Bloomberg', category: 'finance', link: 'https://www.bloomberg.com', imageUrl: '' },
  { _id: 's1', title: 'Real Madrid Advances to Champions League Final', summary: 'Late goal secures dramatic victory over Manchester City.', source: 'BBC Sport', category: 'sports', link: 'https://www.bbc.com/sport', imageUrl: '' },
  { _id: 's2', title: 'Lakers Take Game 1 Against Warriors', summary: 'LeBron James scores 35 points in overtime thriller.', source: 'ESPN', category: 'sports', link: 'https://www.espn.com', imageUrl: '' },
  { _id: 's3', title: 'NBA Playoffs: Celtics Sweep Heat', summary: 'Boston advances to second round after dominant defense.', source: 'ESPN', category: 'sports', link: 'https://www.espn.com', imageUrl: '' },
  { _id: 's4', title: 'Premier League: Arsenal Top of Table', summary: 'Gunners secure crucial win against Chelsea.', source: 'BBC Sport', category: 'sports', link: 'https://www.bbc.com/sport', imageUrl: '' },
  { _id: 's5', title: 'US Open: Djokovic Advances to Quarters', summary: 'Serbian star overcomes five-set battle.', source: 'ESPN', category: 'sports', link: 'https://www.espn.com', imageUrl: '' },
  { _id: 's6', title: 'F1: Verstappen Wins Monaco GP', summary: 'Red Bull driver extends championship lead.', source: 'BBC Sport', category: 'sports', link: 'https://www.bbc.com/sport', imageUrl: '' },
  { _id: 's7', title: 'WNBA: Liberty Beat Aces in Overtime', summary: 'Breanna Stewart scores game-winning shot.', source: 'ESPN', category: 'sports', link: 'https://www.espn.com', imageUrl: '' },
  { _id: 's8', title: 'Rory McIlroy Wins PGA Tour Event', summary: 'Northern Irishman claims first title of the season.', source: 'BBC Sport', category: 'sports', link: 'https://www.bbc.com/sport', imageUrl: '' },
  { _id: 'g1', title: 'SpaceX Successfully Launches Starship', summary: 'Fully reusable rocket completes orbital test flight.', source: 'Reuters', category: 'general', link: 'https://www.reuters.com', imageUrl: '' },
  { _id: 'g2', title: 'New COVID Variant Detected', summary: 'Health officials monitoring spread.', source: 'Bloomberg', category: 'general', link: 'https://www.bloomberg.com', imageUrl: '' },
  { _id: 'g3', title: 'Hollywood Writers Strike Ends', summary: 'Union reaches tentative agreement with studios.', source: 'Reuters', category: 'general', link: 'https://www.reuters.com', imageUrl: '' },
];

export default function Home() {
  const router = useRouter();
  const { category } = router.query;
  const [news, setNews] = useState(initialNews);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    incrementPageViews();
  }, []);

  useEffect(() => {
    const fetchFreshNews = async () => {
      setLoading(true);
      try {
        let query = 'general';
        if (category === 'finance') query = 'business';
        else if (category === 'sports') query = 'sports';
        const url = `https://gnews.io/api/v4/search?q=${query}&lang=en&max=25&country=us`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.articles && data.articles.length > 0) {
          const freshArticles = data.articles.map((item, idx) => ({
            _id: item.url || idx,
            title: item.title,
            summary: (item.description || item.content || '').substring(0, 200),
            source: item.source.name,
            category: category === 'finance' ? 'finance' : category === 'sports' ? 'sports' : 'general',
            imageUrl: item.image || '',
            link: item.url,
          }));
          const all = [...initialNews, ...freshArticles];
          const unique = {};
          for (const a of all) unique[a.link] = a;
          setNews(Object.values(unique).slice(0, 35));
        }
      } catch (error) {
        console.error('Fresh news error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFreshNews();
  }, [category]);

  let displayedNews = news;
  if (category === 'finance') displayedNews = news.filter(item => item.category === 'finance');
  else if (category === 'sports') displayedNews = news.filter(item => item.category === 'sports');

  return (
    <>
      <Head>
        <title>NewsFlux - Latest Financial & Sports News</title>
        <meta name="description" content="Aggregated financial and sports news from top sources" />
      </Head>
      <Header />
      <AdManager position="video" />
      <AdManager position="interstitial" />
      <main className="container mx-auto px-4 py-4 md:py-6">
        <AdManager position="top" />
        <MarketTicker />
        <HeadlineTicker />
        <div className="flex flex-wrap gap-2 md:gap-4 mb-6 md:mb-8 border-b border-gray-700 pb-2 mt-4 md:mt-6">
          <Link href="/" className={`px-3 py-1.5 md:px-4 md:py-2 rounded-full text-sm md:text-base font-semibold ${!category ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}>All</Link>
          <Link href="/?category=finance" className={`px-3 py-1.5 md:px-4 md:py-2 rounded-full text-sm md:text-base font-semibold ${category === 'finance' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}>Finance</Link>
          <Link href="/?category=sports" className={`px-3 py-1.5 md:px-4 md:py-2 rounded-full text-sm md:text-base font-semibold ${category === 'sports' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}>Sports</Link>
        </div>
        {loading && <div className="text-center py-2 text-gray-400 text-sm">Refreshing news...</div>}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {displayedNews.map((item, index) => (
            <div key={item._id} className="news-card">
              {item.imageUrl && <img src={item.imageUrl} alt={item.title} className="w-full h-48 object-cover" />}
              <div className="p-4 md:p-5">
                <div className="text-sm text-blue-600 font-medium mb-2">{item.source}</div>
                <h2 className="text-lg md:text-xl font-bold mb-2 line-clamp-2">{item.title}</h2>
                <p className="text-gray-600 mb-4 line-clamp-3 text-sm md:text-base">{item.summary}</p>
                <Link href={`/news/${encodeURIComponent(item.link)}`} className="text-blue-600 hover:underline font-medium text-sm md:text-base">Read more →</Link>
              </div>
              {index === 1 && <AdManager position="middle" />}
            </div>
          ))}
        </div>
        <AdManager position="bottom" />
      </main>
      <Footer />
    </>
  );
}