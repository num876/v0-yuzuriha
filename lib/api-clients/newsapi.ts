import axios from 'axios';

const NEWS_API = 'https://newsapi.org/v2';
const NEWS_API_KEY = process.env.NEWS_API_KEY || 'demo';

export interface NewsArticle {
  title: string;
  description: string;
  source: {
    name: string;
  };
  publishedAt: string;
  url: string;
  image?: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
}

// Simple sentiment analysis - can be replaced with ML
export function analyzeSentiment(text: string): 'positive' | 'negative' | 'neutral' {
  const positiveKeywords = ['surge', 'rally', 'pump', 'bullish', 'gain', 'up', 'growth', 'launch'];
  const negativeKeywords = ['crash', 'dump', 'bearish', 'loss', 'down', 'decline', 'hack', 'ban'];

  const lowerText = text.toLowerCase();
  let positiveScore = 0;
  let negativeScore = 0;

  positiveKeywords.forEach((kw) => {
    if (lowerText.includes(kw)) positiveScore++;
  });

  negativeKeywords.forEach((kw) => {
    if (lowerText.includes(kw)) negativeScore++;
  });

  if (positiveScore > negativeScore) return 'positive';
  if (negativeScore > positiveScore) return 'negative';
  return 'neutral';
}

export async function getNews(query: string): Promise<NewsArticle[]> {
  try {
    if (NEWS_API_KEY === 'demo') {
      // Return mock data for demo
      return getMockNews();
    }

    const response = await axios.get(`${NEWS_API}/everything`, {
      params: {
        q: query,
        sortBy: 'publishedAt',
        language: 'en',
        pageSize: 10,
        apiKey: NEWS_API_KEY,
      },
    });

    return response.data.articles.map((article: any) => ({
      title: article.title,
      description: article.description,
      source: article.source,
      publishedAt: article.publishedAt,
      url: article.url,
      image: article.urlToImage,
      sentiment: analyzeSentiment(article.title + ' ' + (article.description || '')),
    }));
  } catch (error) {
    console.error('[v0] NewsAPI error:', error);
    return getMockNews();
  }
}

function getMockNews(): NewsArticle[] {
  return [];
}
