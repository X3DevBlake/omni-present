import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, Users, AlertTriangle, CheckCircle2, TrendingUp } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function TaskAssignmentOptimizer({ missionId }) {
  const [optimizing, setOptimizing] = useState(false);
  const [results, setResults] = useState(null);

  const optimize = async () => {
    setOptimizing(true);
    try {
      // First run simulation
      const simResponse = await base44.functions.invoke('missionOutcomeSimulator', {
        mission_id: missionId,
        proposed_tasks: [],
        environmental_conditions: {}
      });

      // Then use results to optimize task assignment
      const assignResponse = await base44.functions.invoke('aiMissionCommander', {
        high_level_goal: 'Optimize task allocation based on simulation',
        environmental_scan: true,
        simulation_results: simResponse.data.simulation_results
      });

      setResults({
        simulation: simResponse.data,
        assignment: assignResponse.data
      });
    } catch (error) {
      console.error('Optimization failed:', error);
    } finally {
      setOptimizing(false);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-orange-950/30 via-black/40 to-red-950/30 backdrop-blur-lg border-orange-500/20">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-orange-400" />
            <span className="text-sm">AI Task Assignment Optimizer</span>
          </div>
          <Button
            onClick={optimize}
            disabled={optimizing}
            size="sm"
            className="bg-orange-600 hover:bg-orange-700"
          >
            {optimizing ? 'Optimizing...' : 'Optimize'}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {results && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-green-950/20 border border-green-500/20 rounded p-2">
                <div className="flex items-center gap-1 mb-1">
                  <CheckCircle2 className="w-3 h-3 text-green-400" />
                  <span className="text-gray-400 text-[10px]">Success Rate</span>
                </div>
                <div className="text-green-400 text-xl font-bold">
                  {Math.round(results.simulation.simulation_results.success_probability * 100)}%
                </div>
              </div>

              <div className="bg-blue-950/20 border border-blue-500/20 rounded p-2">
                <div className="flex items-center gap-1 mb-1">
                  <Users className="w-3 h-3 text-blue-400" />
                  <span className="text-gray-400 text-[10px]">Agents</span>
                </div>
                <div className="text-blue-400 text-xl font-bold">
                  {results.assignment.task_assignments?.length || 0}
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-white text-xs font-bold">Risk Mitigation:</div>
              {results.simulation.simulation_results.risk_factors?.slice(0, 2).map((risk, idx) => (
                <div key={idx} className="bg-red-950/20 border border-red-500/20 rounded p-2">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="w-3 h-3 text-red-400" />
                    <span className="text-red-300 text-xs font-bold">{risk.risk_type}</span>
                  </div>
                  <div className="text-gray-300 text-[10px]">{risk.mitigation}</div>
                </div>
              ))}
            </div>

            <div className="bg-orange-950/20 border border-orange-500/20 rounded p-2">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-3 h-3 text-orange-400" />
                <span className="text-orange-300 text-xs font-bold">Optimal Configuration</span>
              </div>
              <div className="text-gray-300 text-xs">
                Est. Duration: {results.simulation.simulation_results.optimal_configuration?.estimated_duration_hours || 0}h
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}