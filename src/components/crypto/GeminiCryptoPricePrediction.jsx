import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, AlertCircle, Zap } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function GeminiCryptoPricePrediction() {
  const [cryptos, setCryptos] = useState([]);
  const [predictions, setPredictions] = useState({});
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    loadCryptos();
  }, []);

  const loadCryptos = async () => {
    try {
      const cryptoData = await base44.entities.CryptoAsset.list('-price_change_24h', 5);
      setCryptos(cryptoData || []);
      if (cryptoData?.length > 0) {
        predictPrices(cryptoData);
      }
    } catch (error) {
      console.error('Error loading cryptos:', error);
    }
  };

  const predictPrices = async (cryptoList) => {
    setAnalyzing(true);
    try {
      const cryptoSummary = cryptoList.map(c => ({
        symbol: c.symbol,
        price: c.current_price,
        change24h: c.price_change_24h,
        marketCap: c.market_cap,
        volume: c.volume_24h,
      }));

      const pred = await base44.integrations.Core.InvokeLLM({
        prompt: `Predict crypto price movements (next 7 days):
        
Assets: ${JSON.stringify(cryptoSummary)}

Analyze:
1. Price prediction (bullish/bearish/neutral)
2. Confidence level
3. Key support/resistance levels
4. Trading signals
5. Risk assessment
6. Buy/sell recommendations`,
        add_context_from_internet: true,
        response_json_schema: {
          type: 'object',
          properties: {
            predictions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  symbol: { type: 'string' },
                  sentiment: { type: 'string' },
                  confidence: { type: 'number' },
                  target: { type: 'number' },
                  signal: { type: 'string' },
                },
              },
            },
          },
        },
      });

      const predMap = {};
      pred.predictions?.forEach(p => {
        predMap[p.symbol] = p;
      });
      setPredictions(predMap);
    } catch (error) {
      console.error('Error predicting:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-3">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center gap-2 mb-3"
      >
        {analyzing && <Zap className="w-4 h-4 text-cyan-400 animate-spin" />}
        <p className="text-white font-bold text-sm">Crypto Predictions (7-day)</p>
      </motion.div>

      {cryptos.map((crypto, idx) => {
        const pred = predictions[crypto.symbol];
        return (
          <motion.div
            key={crypto.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`border rounded p-3 ${
              pred?.sentiment === 'bullish'
                ? 'bg-green-500/10 border-green-400/30'
                : pred?.sentiment === 'bearish'
                ? 'bg-red-500/10 border-red-400/30'
                : 'bg-white/5 border-white/10'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-white font-bold">{crypto.symbol}</p>
                <p className="text-white/60 text-xs">${crypto.current_price.toFixed(2)}</p>
              </div>
              <div className="text-right">
                <p className={`text-sm font-bold ${
                  pred?.sentiment === 'bullish' ? 'text-green-400' : 
                  pred?.sentiment === 'bearish' ? 'text-red-400' : 
                  'text-yellow-400'
                }`}>
                  {pred?.sentiment?.toUpperCase()}
                </p>
                <p className="text-white/60 text-xs">
                  Target: ${pred?.target?.toFixed(2)}
                </p>
              </div>
            </div>

            {pred && (
              <div className="space-y-1 text-xs text-white/70">
                <p>📊 Confidence: {(pred.confidence * 100).toFixed(0)}%</p>
                <p>🎯 Signal: {pred.signal}</p>
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}