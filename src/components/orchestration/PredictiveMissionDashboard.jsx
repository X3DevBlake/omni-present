import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { AlertTriangle, TrendingDown, RefreshCw, Zap } from 'lucide-react';

export default function PredictiveMissionDashboard() {
  const { data, refetch, isRefetching } = useQuery({
    queryKey: ['mission-predictions'],
    queryFn: async () => {
      const response = await base44.functions.invoke('predictiveMissionMonitor', {});
      return response.data;
    },
    refetchInterval: 15000
  });

  return (
    <Card className="bg-gradient-to-br from-gray-900 to-black border-yellow-500/20">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-white">
          <Zap className="w-5 h-5 text-yellow-400" />
          Predictive Analytics & Health
        </CardTitle>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => refetch()}
          className={`text-white/50 hover:text-white ${isRefetching ? 'animate-spin' : ''}`}
        >
          <RefreshCw className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {(!data?.predictions || data.predictions.length === 0) && (
          <div className="text-center py-8 text-white/40 bg-white/5 rounded-lg border border-white/5">
            System Nominal. No imminent risks detected.
          </div>
        )}

        <div className="grid grid-cols-1 gap-3">
          {data?.predictions?.map((pred, i) => (
            <div 
              key={i} 
              className={`p-4 rounded-lg border ${
                pred.severity === 'high' 
                  ? 'bg-red-950/30 border-red-500/40' 
                  : 'bg-yellow-950/30 border-yellow-500/40'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  {pred.severity === 'high' ? (
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-yellow-500" />
                  )}
                  <h4 className="text-white font-medium text-sm">{pred.type.replace(/_/g, ' ').toUpperCase()}</h4>
                </div>
                <Badge className={pred.severity === 'high' ? 'bg-red-600' : 'bg-yellow-600'}>
                  {(pred.probability * 100).toFixed(0)}% Risk
                </Badge>
              </div>
              
              <p className="text-white/80 text-sm mb-1">
                Mission: <span className="text-white font-bold">{pred.mission_title}</span>
              </p>
              
              <div className="text-xs text-white/50 mb-3">
                Expected in: {pred.predicted_time}
              </div>

              <div className="bg-black/40 p-2 rounded border border-white/5">
                <div className="text-xs text-green-400 font-bold mb-1">AI Recommendation:</div>
                <p className="text-xs text-white/80">{pred.suggestion}</p>
                <Button size="sm" className="w-full mt-2 bg-green-600/20 text-green-400 hover:bg-green-600/30 h-7 text-xs border border-green-600/30">
                  Apply Fix
                </Button>
              </div>
            </div>
          ))}
        </div>

      </CardContent>
    </Card>
  );
}