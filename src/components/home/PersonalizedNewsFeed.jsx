import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Newspaper, ExternalLink, TrendingUp, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function PersonalizedNewsFeed() {
  const { data: news, isLoading } = useQuery({
    queryKey: ['ai-news'],
    queryFn: async () => {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: 'Get the latest 5 AI and machine learning news headlines with brief summaries. Include source and timestamp.',
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            articles: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  summary: { type: "string" },
                  source: { type: "string" },
                  category: { type: "string" },
                  url: { type: "string" }
                }
              }
            }
          }
        }
      });
      return response.articles || [];
    },
    refetchInterval: 300000
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Newspaper className="w-6 h-6 text-blue-400" />
        <h3 className="text-2xl font-bold text-white">AI News & Updates</h3>
        <Badge className="bg-blue-600 ml-auto">Live</Badge>
      </div>

      {isLoading ? (
        <div className="text-white/60">Loading latest news...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {news?.slice(0, 4).map((article, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-white/10 border-white/20 backdrop-blur-md hover:bg-white/15 transition-all h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-white text-sm line-clamp-2">
                      {article.title}
                    </CardTitle>
                    {article.category && (
                      <Badge className="bg-blue-600 text-xs shrink-0">
                        {article.category}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-white/70 text-xs line-clamp-3">
                    {article.summary}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-white/50">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {article.source}
                    </span>
                    {article.url && (
                      <a href={article.url} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="ghost" className="h-6 text-cyan-400">
                          Read
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </Button>
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}