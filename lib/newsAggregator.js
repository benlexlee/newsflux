import axios from 'axios';
import cheerio from 'cheerio';
import { News } from './db';

const SOURCES = {
  finance: [
    { name: 'Reuters', url: 'https://www.reuters.com/finance/' },
    { name: 'BBC', url: 'https://www.bbc.com/news/business' },
    { name: 'Bloomberg', url: 'https://www.bloomberg.com/markets' },
  ],
  sports: [
    { name: 'ESPN', url: 'https://www.espn.com/' },
    { name: 'BBC Sport', url: 'https://www.bbc.com/sport' },
  ],
};

async function fetchAndSummarize(url, source) {
  try {
    const response = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      timeout: 10000,
    });
    const $ = cheerio.load(response.data);
    const title = $('h1').first().text().trim() || 'Breaking News';
    const paragraphs = $('p').slice(0, 5).map((i, el) => $(el).text()).get();
    let summary = paragraphs.join(' ').substring(0, 500);
    const sentences = summary.split(/[.!?]+/);
    summary = sentences.slice(0, 2).join('. ') + '.';
    return { title: title.substring(0, 200), summary, source, originalUrl: url };
  } catch (error) {
    console.error(`Error fetching from ${url}:`, error.message);
    return null;
  }
}

export async function aggregateNews() {
  const allNews = [];
  for (const source of SOURCES.finance) {
    const news = await fetchAndSummarize(source.url, source.name);
    if (news) { news.category = 'finance'; allNews.push(news); }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  for (const source of SOURCES.sports) {
    const news = await fetchAndSummarize(source.url, source.name);
    if (news) { news.category = 'sports'; allNews.push(news); }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  for (const news of allNews) {
    await News.findOneAndUpdate({ originalUrl: news.originalUrl }, news, { upsert: true });
  }
  return allNews;
}