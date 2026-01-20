import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function MarketDataIntegration({ marketData = [] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {marketData.map((asset, i) => {
        const isPositive = asset.price_data?.change_percentage > 0;
        
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className={`bg-gradient-to-br ${
              isPositive ? 'from-green-900/50 to-emerald-900/50 border-green-400/50' : 'from-red-900/50 to-pink-900/50 border-red-400/50'
            } backdrop-blur-md`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-lg">{asset.symbol}</CardTitle>
                  <Badge className={isPositive ? 'bg-green-600' : 'bg-red-600'}>
                    {asset.market_type}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-white text-2xl font-bold">
                    ${asset.price_data?.current_price?.toFixed(2)}
                  </div>
                  <div className={`flex items-center gap-1 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                    {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    <span className="text-sm font-semibold">
                      {asset.price_data?.change_percentage?.toFixed(2)}%
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-white/70">
                  <div>
                    <span className="text-white/50">High:</span> ${asset.price_data?.high?.toFixed(2)}
                  </div>
                  <div>
                    <span className="text-white/50">Low:</span> ${asset.price_data?.low?.toFixed(2)}
                  </div>
                </div>

                {asset.ai_prediction && (
                  <div className="pt-2 border-t border-white/10">
                    <div className="flex items-center gap-2 text-xs">
                      <Activity className="w-3 h-3 text-purple-400" />
                      <span className="text-white/60">AI Prediction:</span>
                      <span className="text-purple-300 font-semibold">
                        ${asset.ai_prediction.predicted_price?.toFixed(2)}
                      </span>
                      <Badge className="bg-purple-600 text-xs">
                        {(asset.ai_prediction.confidence * 100).toFixed(0)}%
                      </Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}