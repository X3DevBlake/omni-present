import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, Zap, Play } from 'lucide-react';

export default function AnimationLibrary() {
  const { data: animations = [] } = useQuery({
    queryKey: ['animation-assets'],
    queryFn: () => base44.entities.AnimationAsset.list('-created_date', 100),
    initialData: []
  });

  const categories = {
    micro_interaction: { count: 0, color: 'bg-blue-500/30 text-blue-300', target: 200 },
    feature_specific: { count: 0, color: 'bg-purple-500/30 text-purple-300', target: 250 },
    environmental: { count: 0, color: 'bg-green-500/30 text-green-300', target: 150 },
    gamification: { count: 0, color: 'bg-yellow-500/30 text-yellow-300', target: 50 },
    ai_feedback: { count: 0, color: 'bg-pink-500/30 text-pink-300', target: 50 }
  };

  animations.forEach(anim => {
    if (categories[anim.category]) {
      categories[anim.category].count++;
    }
  });

  return (
    <Card className="bg-black/40 border-indigo-500/50">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-3 text-2xl">
          <Sparkles className="w-8 h-8 text-indigo-400 animate-pulse" />
          Animation Library
          <Badge className="bg-indigo-500/30 text-indigo-300">
            {animations.length} / 700 ANIMATIONS
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-5 gap-3 mb-6">
          {Object.entries(categories).map(([key, data]) => (
            <div key={key} className="bg-black/60 p-3 rounded-lg border border-indigo-500/30">
              <div className="text-white/60 text-xs mb-1">{key.replace('_', ' ')}</div>
              <div className="text-white text-2xl font-bold">{data.count}</div>
              <div className="text-white/40 text-xs">/ {data.target} target</div>
              <Badge className={data.color + ' mt-2'}>
                {((data.count / data.target) * 100).toFixed(0)}%
              </Badge>
            </div>
          ))}
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-6 bg-black/60">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="micro">Micro</TabsTrigger>
            <TabsTrigger value="feature">Feature</TabsTrigger>
            <TabsTrigger value="env">Environmental</TabsTrigger>
            <TabsTrigger value="game">Gamification</TabsTrigger>
            <TabsTrigger value="ai">AI Feedback</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
              {animations.map((anim, idx) => (
                <div
                  key={anim.id || idx}
                  className="bg-black/60 p-3 rounded-lg border border-indigo-500/30 hover:border-indigo-500/60 transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Zap className="w-4 h-4 text-indigo-400" />
                    <Badge className={categories[anim.category]?.color || 'bg-gray-500/30'}>
                      {anim.type}
                    </Badge>
                  </div>
                  <div className="text-white font-bold text-sm mb-1">{anim.name}</div>
                  <div className="flex gap-1 flex-wrap">
                    {anim.tags?.slice(0, 3).map((tag, i) => (
                      <Badge key={i} variant="outline" className="text-xs text-white/60">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {['micro', 'feature', 'env', 'game', 'ai'].map((cat) => (
            <TabsContent key={cat} value={cat} className="mt-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {animations
                  .filter(a => a.category === `${cat}${cat === 'micro' ? '_interaction' : cat === 'feature' ? '_specific' : cat === 'env' ? 'ironmental' : cat === 'game' ? 'ification' : '_feedback'}`)
                  .map((anim, idx) => (
                    <div
                      key={anim.id || idx}
                      className="bg-black/60 p-3 rounded-lg border border-indigo-500/30"
                    >
                      <div className="text-white font-bold text-sm">{anim.name}</div>
                      <div className="text-white/60 text-xs">{anim.type}</div>
                    </div>
                  ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}