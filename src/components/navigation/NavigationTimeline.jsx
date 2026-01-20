import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

export default function NavigationTimeline({ navigationSequence = [] }) {
  return (
    <Card className="bg-white/10 border-white/20 backdrop-blur-md">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Clock className="w-5 h-5 text-cyan-400" />
          Your Journey Today
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {navigationSequence.slice(0, 10).map((seq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center gap-3 relative"
            >
              {index < navigationSequence.length - 1 && (
                <div className="absolute left-2 top-8 bottom-0 w-0.5 bg-cyan-400/30" />
              )}
              
              <div className="w-4 h-4 rounded-full bg-cyan-400 shrink-0 z-10" />
              
              <div className="flex-1 bg-white/5 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-white text-sm font-medium">
                    {seq.page_name?.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <span className="text-white/40 text-xs">
                    {new Date(seq.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                {seq.duration_seconds > 0 && (
                  <span className="text-white/60 text-xs">
                    Spent {seq.duration_seconds}s
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}