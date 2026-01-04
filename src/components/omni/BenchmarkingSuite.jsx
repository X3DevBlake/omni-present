import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Play, X, TrendingUp, Zap } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import GlassCard from './GlassCard';

const BENCHMARK_TESTS = {
  'dl-training': {
    name: 'Deep Learning Training',
    description: 'ResNet-50 training on ImageNet',
    metrics: ['throughput', 'latency', 'gpu_utilization', 'memory_bandwidth']
  },
  'inference': {
    name: 'Real-Time Inference',
    description: 'Batch inference with BERT-Large',
    metrics: ['latency', 'throughput', 'cpu_usage', 'response_time']
  },
  'data-processing': {
    name: 'Data Processing Pipeline',
    description: 'ETL workload with 100M records',
    metrics: ['throughput', 'memory_usage', 'io_bandwidth']
  },
  'multi-model': {
    name: 'Multi-Model Serving',
    description: '10 concurrent models',
    metrics: ['latency_p50', 'latency_p99', 'throughput', 'resource_efficiency']
  }
};

export default function BenchmarkingSuite({ blueprint, onClose, onBenchmarkComplete }) {
  const [selectedTest, setSelectedTest] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [currentResults, setCurrentResults] = useState(null);
  const queryClient = useQueryClient();

  const { data: historicalResults } = useQuery({
    queryKey: ['benchmark-results', blueprint?.id],
    queryFn: async () => {
      // In production, fetch from database
      return [];
    },
  });

  const runBenchmarkMutation = useMutation({
    mutationFn: async (testId) => {
      setIsRunning(true);
      
      // Simulate benchmark execution
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const results = {
        testId,
        blueprintId: blueprint?.id,
        timestamp: Date.now(),
        metrics: {}
      };

      // Generate realistic results based on blueprint
      const basePerf = blueprint?.estimatedPerformance || 1000;
      
      if (testId === 'dl-training') {
        results.metrics = {
          throughput: Math.round(basePerf / 10 + Math.random() * 100),
          latency: Math.round(50 + Math.random() * 20),
          gpu_utilization: 85 + Math.random() * 10,
          memory_bandwidth: Math.round(basePerf / 5)
        };
      } else if (testId === 'inference') {
        results.metrics = {
          latency: Math.round(5 + Math.random() * 3),
          throughput: Math.round(basePerf * 2 + Math.random() * 500),
          cpu_usage: 60 + Math.random() * 20,
          response_time: Math.round(8 + Math.random() * 4)
        };
      } else if (testId === 'data-processing') {
        results.metrics = {
          throughput: Math.round(basePerf * 5),
          memory_usage: 70 + Math.random() * 15,
          io_bandwidth: Math.round(basePerf / 2)
        };
      } else {
        results.metrics = {
          latency_p50: Math.round(10 + Math.random() * 5),
          latency_p99: Math.round(50 + Math.random() * 20),
          throughput: Math.round(basePerf * 1.5),
          resource_efficiency: 75 + Math.random() * 15
        };
      }

      return results;
    },
    onSuccess: (data) => {
      setCurrentResults(data);
      setIsRunning(false);
      toast.success('Benchmark completed');
      
      // AI analysis of results
      analyzeResults(data);
      
      // Notify parent component
      onBenchmarkComplete?.(data);
    },
  });

  const analyzeResults = async (results) => {
    try {
      const prompt = `
        Analyze these benchmark results and provide optimization recommendations:
        Test: ${BENCHMARK_TESTS[results.testId].name}
        Metrics: ${JSON.stringify(results.metrics)}
        Blueprint Performance: ${blueprint?.estimatedPerformance} TFLOPS
        
        Provide:
        1. Performance assessment (excellent/good/needs improvement)
        2. Specific bottlenecks identified
        3. 3 concrete optimization suggestions
        4. Comparison with industry benchmarks
      `;

      const analysis = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            assessment: { type: 'string' },
            bottlenecks: { type: 'array', items: { type: 'string' } },
            optimizations: { type: 'array', items: { type: 'string' } },
            industryComparison: { type: 'string' }
          }
        }
      });

      setCurrentResults(prev => ({ ...prev, analysis }));
    } catch (error) {
      console.error('AI analysis failed:', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-5xl max-h-[90vh] overflow-y-auto"
      >
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Activity className="w-6 h-6 text-cyan-400" />
              <h2 className="text-2xl font-bold text-white">Benchmarking Suite</h2>
            </div>
            <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Test Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {Object.entries(BENCHMARK_TESTS).map(([key, test]) => (
              <motion.div
                key={key}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedTest === key
                    ? 'border-cyan-500/60 bg-cyan-500/10'
                    : 'border-white/20 bg-white/5 hover:border-white/40'
                }`}
                onClick={() => setSelectedTest(key)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <h3 className="text-white font-semibold mb-2">{test.name}</h3>
                <p className="text-white/60 text-sm mb-3">{test.description}</p>
                <div className="flex flex-wrap gap-2">
                  {test.metrics.map(metric => (
                    <span key={metric} className="px-2 py-1 rounded bg-white/10 text-white/60 text-xs">
                      {metric}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Run Button */}
          <button
            onClick={() => runBenchmarkMutation.mutate(selectedTest)}
            disabled={!selectedTest || isRunning}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-medium disabled:opacity-50 mb-6"
          >
            {isRunning ? (
              <>
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                Running Benchmark...
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                Run Selected Test
              </>
            )}
          </button>

          {/* Results */}
          {currentResults && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <h3 className="text-white font-semibold text-lg">Results</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(currentResults.metrics).map(([key, value]) => (
                  <div key={key} className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
                    <div className="text-cyan-400 text-xs mb-1">{key.replace(/_/g, ' ')}</div>
                    <div className="text-white text-xl font-bold">
                      {typeof value === 'number' ? value.toFixed(1) : value}
                    </div>
                  </div>
                ))}
              </div>

              {currentResults.analysis && (
                <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-5 h-5 text-purple-400" />
                    <h4 className="text-white font-semibold">AI Analysis</h4>
                  </div>
                  
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-white/50">Assessment:</span>
                      <div className="text-white mt-1">{currentResults.analysis.assessment}</div>
                    </div>
                    
                    {currentResults.analysis.bottlenecks?.length > 0 && (
                      <div>
                        <span className="text-white/50">Bottlenecks:</span>
                        <ul className="mt-1 space-y-1">
                          {currentResults.analysis.bottlenecks.map((b, idx) => (
                            <li key={idx} className="text-yellow-400 text-xs">• {b}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {currentResults.analysis.optimizations?.length > 0 && (
                      <div>
                        <span className="text-white/50">Optimizations:</span>
                        <ul className="mt-1 space-y-1">
                          {currentResults.analysis.optimizations.map((o, idx) => (
                            <li key={idx} className="text-green-400 text-xs">• {o}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}