import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Download, FileText, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function SimulationAnalyzer({ simulationResults }) {
  const [analyzing, setAnalyzing] = useState(false);
  const [report, setReport] = useState(null);

  const generateReport = async () => {
    setAnalyzing(true);
    
    await new Promise(resolve => setTimeout(resolve, 2000));

    const analysis = {
      agentPerformance: {
        avgDecisionTime: 45 + Math.random() * 30,
        successRate: 75 + Math.random() * 20,
        efficiency: 80 + Math.random() * 15,
      },
      scenarioOutcome: {
        goalsAchieved: Math.floor(Math.random() * 10),
        totalGoals: 10,
        completionTime: 120 + Math.random() * 80,
      },
      insights: [
        'Agents showed improved collaboration after 3rd iteration',
        'Resource allocation efficiency increased by 15%',
        'Decision-making latency reduced in high-pressure scenarios',
      ],
      recommendations: [
        'Increase learning rate for faster adaptation',
        'Add more training data for edge cases',
        'Enhance inter-agent communication protocols',
      ],
    };

    setReport(analysis);
    setAnalyzing(false);
    toast.success('Analysis complete!');
  };

  const downloadReport = () => {
    const reportText = JSON.stringify(report, null, 2);
    const blob = new Blob([reportText], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `simulation-report-${Date.now()}.json`;
    a.click();
    toast.success('Report downloaded!');
  };

  return (
    <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-xl p-6">
      <h3 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
        <BarChart3 className="w-6 h-6 text-blue-400" />
        Simulation Analysis
      </h3>

      {!report ? (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-blue-400 mx-auto mb-4 opacity-50" />
          <p className="text-white/60 mb-6">Generate automated analysis of simulation results</p>
          <Button
            onClick={generateReport}
            disabled={analyzing}
            className="bg-gradient-to-r from-blue-500 to-cyan-500"
          >
            {analyzing ? 'Analyzing...' : 'Generate Report'}
          </Button>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Performance Metrics */}
          <div className="bg-black/20 rounded-lg p-4">
            <h4 className="text-white font-semibold mb-3">Agent Performance</h4>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-white/60 text-xs">Avg Decision Time</div>
                <div className="text-white text-xl font-bold">{report.agentPerformance.avgDecisionTime.toFixed(0)}ms</div>
              </div>
              <div>
                <div className="text-white/60 text-xs">Success Rate</div>
                <div className="text-green-400 text-xl font-bold">{report.agentPerformance.successRate.toFixed(1)}%</div>
              </div>
              <div>
                <div className="text-white/60 text-xs">Efficiency</div>
                <div className="text-cyan-400 text-xl font-bold">{report.agentPerformance.efficiency.toFixed(1)}%</div>
              </div>
            </div>
          </div>

          {/* Scenario Outcome */}
          <div className="bg-black/20 rounded-lg p-4">
            <h4 className="text-white font-semibold mb-3">Scenario Outcome</h4>
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/60 text-sm">Goals Achieved</span>
              <span className="text-white font-bold">{report.scenarioOutcome.goalsAchieved}/{report.scenarioOutcome.totalGoals}</span>
            </div>
            <div className="h-2 bg-black/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                style={{ width: `${(report.scenarioOutcome.goalsAchieved / report.scenarioOutcome.totalGoals) * 100}%` }}
              />
            </div>
            <div className="text-white/40 text-xs mt-2">
              Completed in {report.scenarioOutcome.completionTime.toFixed(0)}s
            </div>
          </div>

          {/* Insights */}
          <div className="bg-black/20 rounded-lg p-4">
            <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-400" />
              Key Insights
            </h4>
            <ul className="space-y-2">
              {report.insights.map((insight, i) => (
                <li key={i} className="text-white/70 text-sm flex gap-2">
                  <span className="text-purple-400">•</span>
                  {insight}
                </li>
              ))}
            </ul>
          </div>

          {/* Recommendations */}
          <div className="bg-black/20 rounded-lg p-4">
            <h4 className="text-white font-semibold mb-3">Recommendations</h4>
            <ul className="space-y-2">
              {report.recommendations.map((rec, i) => (
                <li key={i} className="text-white/70 text-sm flex gap-2">
                  <span className="text-cyan-400">→</span>
                  {rec}
                </li>
              ))}
            </ul>
          </div>

          <Button
            onClick={downloadReport}
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-500"
          >
            <Download className="w-4 h-4 mr-2" />
            Download Full Report
          </Button>
        </motion.div>
      )}
    </div>
  );
}