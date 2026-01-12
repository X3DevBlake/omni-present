import React from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Brain, Zap, TrendingUp, Shield, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

const RULE_TYPE_ICONS = {
  workflow_automation: Zap,
  resource_allocation: TrendingUp,
  bottleneck_resolution: Brain,
  performance_optimization: TrendingUp,
  cost_optimization: DollarSign,
  security_enforcement: Shield
};

export default function DynamicRulesManager({ rules }) {
  const queryClient = useQueryClient();

  const toggleRuleMutation = useMutation({
    mutationFn: ({ id, active }) => 
      base44.entities.DynamicRuleSet.update(id, { active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dynamic-rules'] });
      toast.success('Rule updated');
    }
  });

  return (
    <Card className="bg-white/10 backdrop-blur-lg border-white/20">
      <CardHeader>
        <CardTitle className="text-white">AI-Generated Dynamic Rules</CardTitle>
        <p className="text-sm text-gray-400">
          Automated rules created by AI to optimize system performance
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {rules?.map(rule => {
            const Icon = RULE_TYPE_ICONS[rule.rule_type] || Brain;
            
            return (
              <div key={rule.id} className="p-4 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    <Icon className="w-5 h-5 text-purple-400 mt-1" />
                    <div className="flex-1">
                      <h3 className="text-white font-semibold mb-1">{rule.rule_name}</h3>
                      <div className="flex flex-wrap gap-2 mb-2">
                        <Badge variant="outline" className="text-blue-400">
                          {rule.rule_type}
                        </Badge>
                        {rule.ai_generated && (
                          <Badge className="bg-purple-500/20 text-purple-300">
                            <Brain className="w-3 h-3 mr-1" />
                            AI Generated
                          </Badge>
                        )}
                        <Badge variant="secondary">
                          Confidence: {rule.confidence_score}%
                        </Badge>
                      </div>
                      
                      {rule.actions && rule.actions.length > 0 && (
                        <div className="text-sm text-gray-300 mt-2">
                          <p className="font-semibold mb-1">Actions:</p>
                          <ul className="list-disc list-inside space-y-1">
                            {rule.actions.slice(0, 3).map((action, idx) => (
                              <li key={idx} className="text-gray-400">
                                {action.action_type}: {action.parameters?.command || 'Execute'}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {rule.execution_count > 0 && (
                        <div className="text-xs text-gray-400 mt-2">
                          Executed {rule.execution_count} times • {rule.success_rate?.toFixed(1)}% success rate
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">
                      {rule.active ? 'Active' : 'Inactive'}
                    </span>
                    <Switch
                      checked={rule.active}
                      onCheckedChange={(checked) => 
                        toggleRuleMutation.mutate({ id: rule.id, active: checked })
                      }
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span>Priority: {rule.priority}</span>
                  {rule.last_executed && (
                    <span>Last run: {new Date(rule.last_executed).toLocaleString()}</span>
                  )}
                </div>
              </div>
            );
          })}

          {(!rules || rules.length === 0) && (
            <div className="text-center py-8">
              <Brain className="w-12 h-12 text-gray-500 mx-auto mb-3" />
              <p className="text-gray-400">No AI rules generated yet</p>
              <p className="text-sm text-gray-500">Run AI analysis to generate optimization rules</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}