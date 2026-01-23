import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GitFork, Copy, Star, TrendingUp } from 'lucide-react';

export default function TemplateForkManager({ templates = [], onFork, onLoadTemplate }) {
  return (
    <Card className="bg-black/40 border-cyan-500/50">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-3">
          <GitFork className="w-6 h-6 text-cyan-400" />
          Template Library & Forking
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {templates.map((template) => (
            <div key={template.id} className="bg-black/60 p-4 rounded-lg border border-cyan-500/30">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-white font-bold text-lg">{template.template_name}</div>
                  <Badge className="mt-1 bg-cyan-500/30 text-cyan-300">
                    {template.personality_archetype}
                  </Badge>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {template.is_public && (
                    <Badge className="bg-green-500/30 text-green-300">PUBLIC</Badge>
                  )}
                  <div className="flex items-center gap-1 text-yellow-400 text-xs">
                    <Star className="w-3 h-3" />
                    {template.usage_stats?.user_satisfaction_avg?.toFixed(1) || 'N/A'}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-3 text-xs">
                <div>
                  <div className="text-white/60">Proactiveness</div>
                  <div className="text-white font-bold">
                    {((template.behavioral_traits?.proactiveness || 0) * 100).toFixed(0)}%
                  </div>
                </div>
                <div>
                  <div className="text-white/60">Risk Tolerance</div>
                  <div className="text-white font-bold">
                    {((template.behavioral_traits?.risk_preference || 0) * 100).toFixed(0)}%
                  </div>
                </div>
                <div>
                  <div className="text-white/60">Used</div>
                  <div className="text-white font-bold">
                    {template.usage_stats?.times_applied || 0}x
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => onLoadTemplate?.(template)}
                  className="bg-cyan-600 hover:bg-cyan-700 flex-1"
                >
                  <Copy className="w-3 h-3 mr-1" />
                  Load
                </Button>
                <Button
                  size="sm"
                  onClick={() => onFork?.(template)}
                  variant="outline"
                  className="border-cyan-500 text-cyan-400 flex-1"
                >
                  <GitFork className="w-3 h-3 mr-1" />
                  Fork
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}