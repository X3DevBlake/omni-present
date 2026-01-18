import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, Sparkles, ArrowRight, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function AIStrategyAdvisor() {
  const queryClient = useQueryClient();

  const { data: strategies, isLoading } = useQuery({
    queryKey: ['ai-strategies'],
    queryFn: async () => {
      const agents = await base44.entities.Agent.list();
      const workflows = await base44.entities.Workflow.list();
      
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Based on this AI ecosystem data:
        - ${agents.length} active agents
        - ${workflows.length} workflows configured
        
        Generate 3 strategic recommendations to improve the AI ecosystem. For each recommendation, provide:
        1. A clear title
        2. Expected impact (high/medium/low)
        3. Implementation complexity (easy/moderate/complex)
        4. Specific actionable steps`,
        response_json_schema: {
          type: "object",
          properties: {
            strategies: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  impact: { type: "string" },
                  complexity: { type: "string" },
                  description: { type: "string" },
                  steps: { type: "array", items: { type: "string" } }
                }
              }
            }
          }
        }
      });
      
      return result?.strategies || [];
    }
  });

  const implementStrategy = useMutation({
    mutationFn: async (strategy) => {
      // Simulate implementation
      await new Promise(resolve => setTimeout(resolve, 1500));
      return strategy;
    },
    onSuccess: (strategy) => {
      toast.success(`Strategy "${strategy.title}" implementation started!`);
      queryClient.invalidateQueries({ queryKey: ['ai-strategies'] });
    }
  });

  const getImpactColor = (impact) => {
    switch (impact?.toLowerCase()) {
      case 'high':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getComplexityColor = (complexity) => {
    switch (complexity?.toLowerCase()) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800';
      case 'complex':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) return <div>Analyzing your AI ecosystem...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-6 h-6 text-purple-500" />
          AI Strategy Advisor
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {strategies?.map((strategy, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.15 }}
            className="p-4 rounded-lg border bg-gradient-to-br from-purple-50 to-blue-50"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-500" />
                <h3 className="font-semibold">{strategy.title}</h3>
              </div>
              <div className="flex gap-2">
                <Badge className={getImpactColor(strategy.impact)}>
                  {strategy.impact} impact
                </Badge>
                <Badge className={getComplexityColor(strategy.complexity)}>
                  {strategy.complexity}
                </Badge>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mb-3">{strategy.description}</p>
            
            <div className="space-y-2 mb-4">
              {strategy?.steps?.map((step, stepIdx) => (
                <div key={stepIdx} className="flex items-start gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>{step}</span>
                </div>
              ))}
            </div>
            
            <Button
              size="sm"
              className="w-full"
              onClick={() => implementStrategy.mutate(strategy)}
              disabled={implementStrategy.isPending}
            >
              {implementStrategy.isPending ? 'Implementing...' : 'Implement Strategy'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
}