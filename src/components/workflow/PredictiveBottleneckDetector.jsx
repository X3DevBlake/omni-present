import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, TrendingDown, Zap, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PredictiveBottleneckDetector() {
  const { data: bottlenecks, isLoading } = useQuery({
    queryKey: ['workflow-bottlenecks'],
    queryFn: async () => {
      const workflows = await base44.entities.Workflow.list();
      
      // Simulate bottleneck detection
      const detected = [
        {
          workflow: 'Data Processing Pipeline',
          bottleneck: 'API Rate Limiting',
          impact: 'high',
          eta: '2 hours until critical',
          suggestion: 'Implement request batching or upgrade API tier'
        },
        {
          workflow: 'Agent Training Loop',
          bottleneck: 'Memory Allocation',
          impact: 'medium',
          eta: '6 hours until critical',
          suggestion: 'Increase agent memory limits or optimize data structures'
        },
        {
          workflow: 'Real-time Analytics',
          bottleneck: 'Database Query Performance',
          impact: 'low',
          eta: '12 hours until critical',
          suggestion: 'Add database indexes or implement query caching'
        }
      ];
      
      return detected;
    },
    refetchInterval: 60000
  });

  const getImpactColor = (impact) => {
    switch (impact) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) return <div>Analyzing workflows...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingDown className="w-6 h-6 text-orange-500" />
          Predictive Bottleneck Detection
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {bottlenecks?.length === 0 ? (
          <div className="text-center py-6">
            <Zap className="w-12 h-12 text-green-500 mx-auto mb-2" />
            <p className="text-lg font-semibold text-green-600">All Systems Optimal</p>
            <p className="text-sm text-gray-500">No bottlenecks detected</p>
          </div>
        ) : (
          bottlenecks?.map((item, idx) => item ? (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="p-4 rounded-lg border bg-gradient-to-r from-orange-50 to-red-50"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">{item?.workflow}</p>
                    <p className="text-sm text-gray-600">Issue: {item?.bottleneck}</p>
                  </div>
                </div>
                <Badge className={getImpactColor(item?.impact)}>
                  {item?.impact}
                </Badge>
              </div>
              
              <div className="mt-3 space-y-2">
                <p className="text-xs text-gray-500">⏱️ {item?.eta}</p>
                <div className="flex items-start gap-2 p-2 bg-white rounded border">
                  <Zap className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm">{item?.suggestion}</p>
                </div>
              </div>
              
              <Button size="sm" className="w-full mt-3" variant="outline">
                Apply Optimization <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>
          ) : null)
        )}
      </CardContent>
    </Card>
  );
}