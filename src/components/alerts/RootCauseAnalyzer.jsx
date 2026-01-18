import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';

export default function RootCauseAnalyzer({ selectedRuleId }) {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedRuleId) {
      analyzeRootCause();
    }
  }, [selectedRuleId]);

  const analyzeRootCause = async () => {
    setLoading(true);
    try {
      const response = await base44.functions.invoke('analyzeAlertRootCause', {
        ruleId: selectedRuleId
      });
      setAnalysis(response.data);
    } catch (error) {
      console.error('Failed to analyze root cause:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!selectedRuleId) {
    return (
      <Card className="bg-slate-900/60 border-slate-700 backdrop-blur-xl">
        <CardContent className="pt-6 text-center text-slate-400">
          Select an alert rule to analyze root causes
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-900/60 border-slate-700 backdrop-blur-xl">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-white flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          Root Cause Analysis
        </CardTitle>
        <Button onClick={analyzeRootCause} disabled={loading} size="sm" className="bg-blue-600 hover:bg-blue-700">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Analyze'}
        </Button>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
          </div>
        )}

        {!loading && analysis && (
          <>
            {/* Primary Cause */}
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-sm text-slate-300 mb-2">Primary Root Cause</p>
              <h3 className="text-lg font-semibold text-white mb-2">{analysis.primaryCause}</h3>
              <p className="text-sm text-slate-300">{analysis.primaryExplanation}</p>
              <Badge className="mt-2 bg-red-500/20 text-red-300">
                {Math.round(analysis.confidence * 100)}% confidence
              </Badge>
            </div>

            {/* Contributing Factors */}
            {analysis.factors?.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-semibold text-slate-300">Contributing Factors</p>
                {analysis.factors.map((factor, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="p-3 bg-slate-800/50 rounded-lg border border-slate-700"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">{factor.name}</p>
                        <p className="text-xs text-slate-400 mt-1">{factor.description}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {Math.round(factor.impact * 100)}%
                      </Badge>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Recommended Actions */}
            {analysis.recommendations?.length > 0 && (
              <div className="space-y-2 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <p className="text-sm font-semibold text-blue-300 flex items-center gap-2">
                  <TrendingDown className="w-4 h-4" />
                  Recommended Actions
                </p>
                <ul className="space-y-2">
                  {analysis.recommendations.map((rec, idx) => (
                    <li key={idx} className="text-sm text-slate-300 flex gap-2">
                      <span className="text-blue-400">•</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recurring Pattern Info */}
            {analysis.recurringPattern && (
              <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <p className="text-xs text-yellow-300 font-medium mb-1">⚠️ Recurring Pattern Detected</p>
                <p className="text-sm text-slate-300">{analysis.recurringPattern}</p>
              </div>
            )}
          </>
        )}

        {!loading && !analysis && (
          <p className="text-sm text-slate-400 text-center py-8">
            Click "Analyze" to perform root cause analysis
          </p>
        )}
      </CardContent>
    </Card>
  );
}