import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Map, Maximize2, Minimize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';

export default function FloatingMiniMap({ hubs = [], currentPage }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const hubCategories = {
    'ai_ml': { color: '#00f5ff', label: 'AI & ML' },
    'finance': { color: '#44ff44', label: 'Finance' },
    'collaboration': { color: '#a855f7', label: 'Collaboration' },
    'security': { color: '#ff4444', label: 'Security' },
    'analytics': { color: '#ffaa00', label: 'Analytics' },
    'infrastructure': { color: '#3b82f6', label: 'Infrastructure' }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed bottom-6 right-6 z-40"
    >
      <Card className="bg-black/90 border-white/20 backdrop-blur-md shadow-2xl">
        <CardContent className="p-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Map className="w-4 h-4 text-cyan-400" />
              <span className="text-white text-sm font-semibold">Site Map</span>
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6 text-white/60 hover:text-white"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
            </Button>
          </div>

          <AnimatePresence>
            {isExpanded ? (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="space-y-2 max-h-96 overflow-y-auto"
              >
                {Object.entries(hubCategories).map(([key, cat]) => {
                  const categoryHubs = hubs.filter(h => h.hub_category === key);
                  if (categoryHubs.length === 0) return null;

                  return (
                    <div key={key} className="space-y-1">
                      <div className="text-xs text-white/60 font-medium flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: cat.color }}
                        />
                        {cat.label}
                      </div>
                      {categoryHubs.map(hub => (
                        <Link key={hub.id} to={createPageUrl(hub.target_page)}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`w-full justify-start text-xs ${
                              hub.target_page === currentPage
                                ? 'bg-white/20 text-white'
                                : 'text-white/70 hover:text-white hover:bg-white/10'
                            }`}
                          >
                            {hub.display_name}
                          </Button>
                        </Link>
                      ))}
                    </div>
                  );
                })}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-3 gap-1"
              >
                {Object.entries(hubCategories).map(([key, cat]) => (
                  <div
                    key={key}
                    className="w-6 h-6 rounded"
                    style={{ backgroundColor: `${cat.color}40` }}
                    title={cat.label}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}