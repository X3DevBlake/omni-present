import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, Clock, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';

export default function SmartQuickAccess({ mostVisited = [], recentPages = [] }) {
  const quickAccessItems = [
    ...mostVisited.slice(0, 3).map(p => ({
      name: p.page_name,
      type: 'frequent',
      count: p.visit_count
    })),
    ...recentPages.slice(0, 2).map(p => ({
      name: p.activity_details?.page_name,
      type: 'recent'
    }))
  ].filter(item => item.name).slice(0, 5);

  if (quickAccessItems.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-20 left-1/2 -translate-x-1/2 z-40"
    >
      <Card className="bg-black/90 border-white/20 backdrop-blur-md shadow-2xl">
        <CardContent className="p-3">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span className="text-white/80 text-xs font-medium">Quick Access</span>
          </div>
          
          <div className="flex gap-2 mt-2">
            {quickAccessItems.map((item, index) => (
              <Link key={index} to={createPageUrl(item.name)}>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-white/10 text-xs"
                >
                  {item.type === 'frequent' ? (
                    <Star className="w-3 h-3 mr-1 text-yellow-400" />
                  ) : (
                    <Clock className="w-3 h-3 mr-1 text-blue-400" />
                  )}
                  {item.name?.replace(/([A-Z])/g, ' $1').trim()}
                </Button>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}