import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, AlertCircle, Zap } from 'lucide-react';

export default function NewsSentimentDashboard() {
  const [selectedNews, setSelectedNews] = useState(null);

  const sentimentData = {
    overallSentiment: 0.62,
    sentimentTrend: 'bullish',
    articles: [
      {
        id: 1,
        title: 'Tech Stocks Rally on Strong Earnings Outlook',
        source: 'Bloomberg',
        publishedAt: '2 hours ago',
        sentiment: 0.85,
        relevance: 0.92,
        summary: 'Major tech companies report better-than-expected earnings, driving sector upward.',
        affectedSecurities: ['AAPL', 'MSFT', 'GOOGL'],
        portfolioImpact: '+$2,150 (estimated)',
      },
      {
        id: 2,
        title: 'Federal Reserve Signals Pause on Rate Hikes',
        source: 'Reuters',
        publishedAt: '4 hours ago',
        sentiment: 0.72,
        relevance: 0.88,
        summary: 'Fed commentary suggests potential end to aggressive rate hiking cycle.',
        affectedSecurities: ['Bond ETF', 'REITs'],
        portfolioImpact: '+$1,875 (estimated)',
      },
      {
        id: 3,
        title: 'Oil Prices Spike on Geopolitical Tensions',
        source: 'CNBC',
        publishedAt: '6 hours ago',
        sentiment: -0.55,
        relevance: 0.65,
        summary: 'Energy prices rise due to Middle East concerns, potential inflation impact.',
        affectedSecurities: ['XLE', 'CVX', 'EOG'],
        portfolioImpact: '+$450 (estimated)',
      },
      {
        id: 4,
        title: 'Healthcare Innovation Index Reaches New High',
        source: 'MarketWatch',
        publishedAt: '8 hours ago',
        sentiment: 0.78,
        relevance: 0.72,
        summary: 'Biotech and pharmaceutical companies benefit from positive clinical trial results.',
        affectedSecurities: ['XBI', 'IBB', 'AMGN'],
        portfolioImpact: '+$725 (estimated)',
      },
    ],
    opportunities: [
      {
        type: 'buy',
        security: 'Financial Services',
        reason: 'Fed pause signals favorable borrowing environment',
        confidence: 0.78,
      },
      {
        type: 'sell',
        security: 'Defensive Utilities',
        reason: 'Market rotation toward growth likely to continue',
        confidence: 0.65,
      },
      {
        type: 'watch',
        security: 'Energy Sector',
        reason: 'Monitor geopolitical developments closely',
        confidence: 0.72,
      },
    ],
  };

  const getSentimentColor = (score) => {
    if (score > 0.6) return { bg: 'from-green-500/10', border: 'border-green-400', text: 'text-green-400' };
    if (score > 0.3) return { bg: 'from-yellow-500/10', border: 'border-yellow-400', text: 'text-yellow-400' };
    return { bg: 'from-red-500/10', border: 'border-red-400', text: 'text-red-400' };
  };

  return (
    <div className="space-y-6">
      {/* Overall Sentiment */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-400/20 rounded-lg p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white">Market Sentiment</h3>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            <span className="px-3 py-1 bg-green-500/20 border border-green-400/50 rounded-full text-green-400 font-bold text-sm">
              {sentimentData.sentimentTrend}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/5 rounded-lg p-3">
            <p className="text-white/60 text-xs mb-1">Overall Score</p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-3xl font-bold text-cyan-400"
            >
              {(sentimentData.overallSentiment * 100).toFixed(0)}%
            </motion.p>
            <p className="text-white/50 text-xs mt-1">Positive sentiment</p>
          </div>
          <div className="bg-white/5 rounded-lg p-3">
            <p className="text-white/60 text-xs mb-1">Portfolio Impact</p>
            <p className="text-xl font-bold text-green-400">+$5,200</p>
            <p className="text-white/50 text-xs mt-1">Estimated today</p>
          </div>
          <div className="bg-white/5 rounded-lg p-3">
            <p className="text-white/60 text-xs mb-1">Key Themes</p>
            <p className="text-white text-sm">Tech strength, Fed pause, Energy watch</p>
          </div>
        </div>
      </motion.div>

      {/* News Articles */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h4 className="text-white font-bold mb-3">Portfolio-Relevant News</h4>
        <div className="space-y-2">
          {sentimentData.articles.map((article, idx) => {
            const sentiment = getSentimentColor(article.sentiment);
            return (
              <motion.div
                key={article.id}
                whileHover={{ x: 5 }}
                onClick={() => setSelectedNews(article)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`p-4 bg-white/5 border border-white/10 rounded-lg hover:border-white/30 cursor-pointer transition-all`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-white font-semibold text-sm mb-1">{article.title}</p>
                    <p className="text-white/60 text-xs mb-2">{article.source} • {article.publishedAt}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      {article.affectedSecurities.map((sec, i) => (
                        <span key={i} className="px-2 py-0.5 bg-white/10 rounded text-white/70 text-xs">
                          {sec}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <motion.div
                      className={`text-center ${sentiment.text} font-bold text-lg`}
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      {(article.sentiment * 100).toFixed(0)}%
                    </motion.div>
                    <p className="text-white/50 text-xs mt-1">Sentiment</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Selected Article Details */}
      {selectedNews && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-purple-500/10 to-cyan-500/10 border border-purple-400/20 rounded-lg p-6"
        >
          <h4 className="text-white font-bold mb-3">{selectedNews.title}</h4>
          <p className="text-white/80 mb-4">{selectedNews.summary}</p>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-white/60 text-xs mb-1">Portfolio Impact</p>
              <p className="text-green-400 font-bold">{selectedNews.portfolioImpact}</p>
            </div>
            <div>
              <p className="text-white/60 text-xs mb-1">Relevance Score</p>
              <p className="text-cyan-400 font-bold">{(selectedNews.relevance * 100).toFixed(0)}%</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white/80 hover:bg-white/20 transition-all text-sm"
          >
            Read Full Article
          </motion.button>
        </motion.div>
      )}

      {/* Opportunities & Threats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h4 className="text-white font-bold mb-3 flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-400" />
          Opportunities & Threats
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {sentimentData.opportunities.map((opp, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -2 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`p-3 rounded-lg border ${
                opp.type === 'buy'
                  ? 'bg-green-500/10 border-green-400/20'
                  : opp.type === 'sell'
                  ? 'bg-red-500/10 border-red-400/20'
                  : 'bg-yellow-500/10 border-yellow-400/20'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <p className="text-white font-semibold text-sm">{opp.security}</p>
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                  opp.type === 'buy'
                    ? 'bg-green-500/30 text-green-400'
                    : opp.type === 'sell'
                    ? 'bg-red-500/30 text-red-400'
                    : 'bg-yellow-500/30 text-yellow-400'
                }`}>
                  {opp.type}
                </span>
              </div>
              <p className="text-white/70 text-xs mb-2">{opp.reason}</p>
              <p className={`text-xs font-bold ${
                opp.type === 'buy'
                  ? 'text-green-400'
                  : opp.type === 'sell'
                  ? 'text-red-400'
                  : 'text-yellow-400'
              }`}>
                Confidence: {(opp.confidence * 100).toFixed(0)}%
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}