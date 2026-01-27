import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Radar, AlertTriangle, ArrowRight } from 'lucide-react';

export default function MissionForecasterDashboard() {
  const { data } = useQuery({
    queryKey: ['mission-forecast'],
    queryFn: async () => {
      const res = await base44.functions.invoke('forecastMissionOutcome', {});
      return res.data;
    }
  });

  return (
    <Card className="bg-black/60 border-emerald-500/30 backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Radar className="w-5 h-5 text-emerald-400" />
          Predictive Mission Forecaster
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {data?.global_strategy && (
          <div className="bg-emerald-900/20 p-3 rounded border border-emerald-500/30 mb-4">
            <h4 className="text-emerald-400 text-xs font-bold uppercase mb-1">Global Strategy Recommendation</h4>
            <p className="text-white/80 text-sm">{data.global_strategy}</p>
          </div>
        )}

        <div className="space-y-4">
          {data?.forecasts?.map((forecast, i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between text-sm text-white">
                <span>Mission: {forecast.mission_id.substring(0,8)}...</span>
                <span className={forecast.success_probability > 0.7 ? "text-green-400" : "text-red-400"}>
                  {(forecast.success_probability * 100).toFixed(0)}% Success Prob.
                </span>
              </div>
              <Progress value={forecast.success_probability * 100} className="h-2 bg-white/10" />
              
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="bg-white/5 p-2 rounded">
                  <div className="text-[10px] text-white/40 mb-1">CRITICAL RISKS</div>
                  {forecast.risk_factors.map((risk, j) => (
                    <div key={j} className="flex items-center gap-1 text-red-300 text-xs">
                      <AlertTriangle className="w-3 h-3" /> {risk}
                    </div>
                  ))}
                </div>
                <div className="bg-white/5 p-2 rounded">
                  <div className="text-[10px] text-white/40 mb-1">AI SUGGESTION</div>
                  <div className="flex items-start gap-1 text-emerald-300 text-xs">
                    <ArrowRight className="w-3 h-3 mt-0.5" /> {forecast.strategic_suggestion}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}