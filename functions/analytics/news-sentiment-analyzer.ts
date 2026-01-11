import { base44 } from '@/api/base44Client';

/**
 * AI-Powered Financial News & Market Sentiment Analysis
 * News summarization, opportunity/threat detection, sentiment scoring
 */

/**
 * Fetch and analyze financial news relevant to user's portfolio
 */
export async function analyzePortfolioRelevantNews(portfolio, limit = 10) {
  try {
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Find and analyze financial news relevant to user portfolio:
      
      Portfolio Assets: ${JSON.stringify(portfolio.assets)}
      Portfolio Sectors: ${JSON.stringify(portfolio.sectors)}
      
      Retrieve and analyze:
      1. News about held securities
      2. Sector-specific developments
      3. Macroeconomic news
      4. Regulatory changes
      5. Market trends
      
      For each article: summary, relevance score, impact on portfolio`,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          newsArticles: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                summary: { type: 'string' },
                source: { type: 'string' },
                publishedAt: { type: 'string' },
                relevanceScore: { type: 'number' },
                affectedSecurities: { type: 'array', items: { type: 'string' } },
                portfolioImpact: { type: 'string' },
              },
            },
          },
          keyThemes: { type: 'array', items: { type: 'string' } },
          overallSentiment: { type: 'string' },
        },
      },
    });

    return response;
  } catch (error) {
    console.error('Error analyzing news:', error);
    throw error;
  }
}

/**
 * Generate market sentiment score from multiple sources
 */
export async function calculateMarketSentiment() {
  try {
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Calculate overall market sentiment score:
      
      Analyze from multiple sources:
      1. News sentiment (positive/negative mentions)
      2. Social media trends
      3. Market indicators (VIX, breadth)
      4. Analyst ratings
      5. Economic data releases
      6. Sector rotation patterns
      
      Provide: overall sentiment (-1 to +1), components, confidence`,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          overallSentiment: { type: 'number' },
          sentiment: { type: 'string' },
          components: { type: 'object' },
          confidence: { type: 'number' },
          trendDirection: { type: 'string' },
          volatilityExpectation: { type: 'string' },
        },
      },
    });

    return response;
  } catch (error) {
    console.error('Error calculating sentiment:', error);
    throw error;
  }
}

/**
 * Identify opportunities and threats from market events
 */
export async function identifyMarketOpportunitiesThreats(portfolio, news, sentiment) {
  try {
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Identify market opportunities and threats:
      
      Portfolio: ${JSON.stringify(portfolio)}
      Recent News: ${JSON.stringify(news.slice(0, 5))}
      Market Sentiment: ${JSON.stringify(sentiment)}
      
      Identify:
      1. Buy opportunities (undervalued sectors/stocks)
      2. Sell signals (overvalued positions)
      3. Hedging needs
      4. Sector rotation opportunities
      5. Risk concentration areas
      6. Emerging threats to watch
      
      For each: confidence, expected timeline, recommended action`,
      response_json_schema: {
        type: 'object',
        properties: {
          opportunities: { type: 'array', items: { type: 'object' } },
          threats: { type: 'array', items: { type: 'object' } },
          urgencyLevel: { type: 'string' },
          recommendedActions: { type: 'array', items: { type: 'string' } },
        },
      },
    });

    return response;
  } catch (error) {
    console.error('Error identifying opportunities:', error);
    throw error;
  }
}

/**
 * Generate sentiment-based score for specific security
 */
export async function getSentimentScore(security) {
  try {
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate sentiment score for ${security}:
      
      Analyze:
      1. Recent news sentiment
      2. Analyst recommendations
      3. Social media sentiment
      4. Institutional activity
      5. Technical indicators
      
      Return: sentiment score (-1 to +1), trend, key drivers`,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          security: { type: 'string' },
          sentimentScore: { type: 'number' },
          trend: { type: 'string' },
          keyDrivers: { type: 'array', items: { type: 'string' } },
          confidence: { type: 'number' },
        },
      },
    });

    return response;
  } catch (error) {
    console.error('Error getting sentiment score:', error);
    throw error;
  }
}

export default {
  analyzePortfolioRelevantNews,
  calculateMarketSentiment,
  identifyMarketOpportunitiesThreats,
  getSentimentScore,
};