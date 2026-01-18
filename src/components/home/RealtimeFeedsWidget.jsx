import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { AlertCircle, TrendingUp, Bell, Zap, DollarSign } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function RealtimeFeedsWidget() {
  const [feeds, setFeeds] = useState([]);

  useEffect(() => {
    // Fetch real-time alerts and events
    const mockFeeds = [
      {
        id: 1,
        type: 'agent_activity',
        title: 'Agent "Market Analyzer" completed 5 tasks',
        timestamp: 'Now',
        icon: Zap,
        color: 'text-cyan-400',
      },
      {
        id: 2,
        type: 'financial_alert',
        title: 'Portfolio gained +$2,340 in last hour',
        timestamp: '5 mins ago',
        icon: TrendingUp,
        color: 'text-green-400',
      },
      {
        id: 3,
        type: 'system_notification',
        title: 'New community challenge available',
        timestamp: '12 mins ago',
        icon: Bell,
        color: 'text-purple-400',
      },
      {
        id: 4,
        type: 'anomaly_detection',
        title: 'Unusual network pattern detected - Monitor advised',
        timestamp: '22 mins ago',
        icon: AlertCircle,
        color: 'text-orange-400',
      },
    ];

    setFeeds(mockFeeds);
  }, []);

  return (
    <div className="space-y-3 max-h-[400px] overflow-y-auto">
      {feeds.map((feed, idx) => {
        const IconComponent = feed.icon;
        return (
          <motion.div
            key={feed.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="bg-black/40 border-white/10 p-3 hover:border-white/30 transition-all cursor-pointer">
              <div className="flex items-start gap-3">
                <IconComponent className={`w-5 h-5 ${feed.color} flex-shrink-0 mt-0.5`} />
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-semibold">{feed.title}</p>
                  <p className="text-white/40 text-xs">{feed.timestamp}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}