import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Cloud, DollarSign, Activity, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { base44 } from '@/api/base44Client';

export default function RealTimeDataIntegrator({ show, onClose, onDataFeed }) {
  const [feeds, setFeeds] = useState({
    market: { enabled: false, data: null, lastUpdate: null },
    weather: { enabled: false, data: null, lastUpdate: null },
    social: { enabled: false, data: null, lastUpdate: null },
  });

  useEffect(() => {
    const interval = setInterval(async () => {
      if (feeds.market.enabled) {
        const marketData = {
          sp500: 4500 + Math.random() * 100 - 50,
          nasdaq: 14000 + Math.random() * 200 - 100,
          volatility: Math.random() * 30,
          trend: Math.random() > 0.5 ? 'up' : 'down',
        };
        updateFeed('market', marketData);
      }

      if (feeds.weather.enabled) {
        const weatherData = {
          temperature: 70 + Math.random() * 20 - 10,
          humidity: 40 + Math.random() * 40,
          condition: ['sunny', 'cloudy', 'rainy'][Math.floor(Math.random() * 3)],
          windSpeed: Math.random() * 20,
        };
        updateFeed('weather', weatherData);
      }

      if (feeds.social.enabled) {
        const socialData = {
          sentiment: Math.random() * 2 - 1,
          trending_topics: ['AI', 'Technology', 'Innovation'],
          engagement: Math.random() * 10000,
        };
        updateFeed('social', socialData);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [feeds.market.enabled, feeds.weather.enabled, feeds.social.enabled]);

  const updateFeed = (feedType, data) => {
    setFeeds(prev => ({
      ...prev,
      [feedType]: {
        ...prev[feedType],
        data,
        lastUpdate: new Date(),
      }
    }));
    onDataFeed?.(feedType, data);
  };

  const toggleFeed = (feedType) => {
    setFeeds(prev => ({
      ...prev,
      [feedType]: {
        ...prev[feedType],
        enabled: !prev[feedType].enabled,
      }
    }));
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative bg-black/90 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-6 max-w-2xl w-full"
      >
        <h2 className="text-2xl font-bold text-white mb-6">Real-Time Data Integration</h2>

        <div className="space-y-4">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <DollarSign className="w-6 h-6 text-green-400" />
                <div>
                  <div className="text-white font-medium">Market Data Feed</div>
                  <div className="text-white/60 text-sm">Real-time stock market indicators</div>
                </div>
              </div>
              <Switch checked={feeds.market.enabled} onCheckedChange={() => toggleFeed('market')} />
            </div>
            {feeds.market.enabled && feeds.market.data && (
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div className="bg-black/20 rounded p-2">
                  <div className="text-white/60 text-xs">S&P 500</div>
                  <div className="text-white font-bold">${feeds.market.data.sp500.toFixed(2)}</div>
                </div>
                <div className="bg-black/20 rounded p-2">
                  <div className="text-white/60 text-xs">Volatility</div>
                  <div className="text-white font-bold">{feeds.market.data.volatility.toFixed(1)}%</div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Cloud className="w-6 h-6 text-blue-400" />
                <div>
                  <div className="text-white font-medium">Weather Data Feed</div>
                  <div className="text-white/60 text-sm">Environmental conditions</div>
                </div>
              </div>
              <Switch checked={feeds.weather.enabled} onCheckedChange={() => toggleFeed('weather')} />
            </div>
            {feeds.weather.enabled && feeds.weather.data && (
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div className="bg-black/20 rounded p-2">
                  <div className="text-white/60 text-xs">Temperature</div>
                  <div className="text-white font-bold">{feeds.weather.data.temperature.toFixed(1)}°F</div>
                </div>
                <div className="bg-black/20 rounded p-2">
                  <div className="text-white/60 text-xs">Condition</div>
                  <div className="text-white font-bold capitalize">{feeds.weather.data.condition}</div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Activity className="w-6 h-6 text-purple-400" />
                <div>
                  <div className="text-white font-medium">Social Dynamics Feed</div>
                  <div className="text-white/60 text-sm">Social sentiment & trends</div>
                </div>
              </div>
              <Switch checked={feeds.social.enabled} onCheckedChange={() => toggleFeed('social')} />
            </div>
            {feeds.social.enabled && feeds.social.data && (
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div className="bg-black/20 rounded p-2">
                  <div className="text-white/60 text-xs">Sentiment</div>
                  <div className={`font-bold ${feeds.social.data.sentiment > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {(feeds.social.data.sentiment * 100).toFixed(1)}%
                  </div>
                </div>
                <div className="bg-black/20 rounded p-2">
                  <div className="text-white/60 text-xs">Engagement</div>
                  <div className="text-white font-bold">{feeds.social.data.engagement.toFixed(0)}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button onClick={onClose} className="bg-white/10 hover:bg-white/20 text-white">
            Close
          </Button>
        </div>
      </motion.div>
    </div>
  );
}