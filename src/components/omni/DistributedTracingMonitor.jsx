import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, GitBranch, AlertCircle, Search, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function DistributedTracingMonitor({ onClose }) {
  const [traces, setTraces] = useState([]);
  const [selectedTrace, setSelectedTrace] = useState(null);
  const [rootCauseAnalysis, setRootCauseAnalysis] = useState(null);

  useEffect(() => {
    generateTraces();
  }, []);

  const generateTraces = async () => {
    const mockTraces = [
      {
        id: 'trace-1',
        service: 'API Gateway',
        duration: 245,
        status: 'success',
        spans: [
          { service: 'API Gateway', duration: 15, status: 'success' },
          { service: 'Auth Service', duration: 45, status: 'success' },
          { service: 'Blueprint Service', duration: 120, status: 'success' },
          { service: 'Database', duration: 65, status: 'success' }
        ]
      },
      {
        id: 'trace-2',
        service: 'Model Inference',
        duration: 1850,
        status: 'slow',
        spans: [
          { service: 'API Gateway', duration: 12, status: 'success' },
          { service: 'Model Service', duration: 1750, status: 'slow' },
          { service: 'Cache', duration: 88, status: 'success' }
        ]
      },
      {
        id: 'trace-3',
        service: 'Training Pipeline',
        duration: 320,
        status: 'error',
        spans: [
          { service: 'API Gateway', duration: 10, status: 'success' },
          { service: 'Training Service', duration: 250, status: 'error' },
          { service: 'Storage', duration: 60, status: 'success' }
        ]
      }
    ];

    setTraces(mockTraces);
  };

  const analyzeRootCause = async (trace) => {
    setSelectedTrace(trace);

    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `
          Perform root cause analysis for distributed trace:
          
          Trace: ${JSON.stringify(trace)}
          
          Analyze:
          1. PERFORMANCE BOTTLENECKS: Which services are slow and why
          2. ERROR PROPAGATION: How failures cascade through services
          3. DEPENDENCIES: Service dependencies and their impact
          4. REMEDIATION: Specific fixes to resolve issues
          5. CRITICAL EVENTS: Key moments that need attention
        `,
        response_json_schema: {
          type: 'object',
          properties: {
            bottlenecks: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  service: { type: 'string' },
                  issue: { type: 'string' },
                  impact: { type: 'string' }
                }
              }
            },
            rootCause: { type: 'string' },
            errorChain: { type: 'array', items: { type: 'string' } },
            remediation: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  action: { type: 'string' },
                  priority: { type: 'string' }
                }
              }
            },
            criticalEvents: { type: 'array', items: { type: 'string' } }
          }
        }
      });

      setRootCauseAnalysis(result);
    } catch (error) {
      console.error('Root cause analysis failed:', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-7xl max-h-[90vh] overflow-y-auto bg-black/90 backdrop-blur-xl border border-white/20 rounded-xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Activity className="w-6 h-6 text-cyan-400" />
            <h2 className="text-2xl font-bold text-white">Distributed Tracing & Observability</h2>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="text-white font-semibold mb-3">Request Traces</h3>
            <div className="space-y-2">
              {traces.map((trace) => (
                <div
                  key={trace.id}
                  onClick={() => analyzeRootCause(trace)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    trace.status === 'success' ? 'bg-green-500/10 border-green-500/30' :
                    trace.status === 'slow' ? 'bg-yellow-500/10 border-yellow-500/30' :
                    'bg-red-500/10 border-red-500/30'
                  } ${selectedTrace?.id === trace.id ? 'ring-2 ring-cyan-500' : ''}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium">{trace.service}</span>
                    <span className="text-white/60 text-sm">{trace.duration}ms</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <GitBranch className="w-3 h-3 text-white/40" />
                    <span className="text-white/60 text-xs">{trace.spans.length} spans</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            {selectedTrace && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <h3 className="text-white font-semibold mb-3">Trace Timeline</h3>
                  {selectedTrace.spans.map((span, idx) => (
                    <div key={idx} className="mb-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-white">{span.service}</span>
                        <span className="text-white/60">{span.duration}ms</span>
                      </div>
                      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${
                            span.status === 'error' ? 'bg-red-500' :
                            span.status === 'slow' ? 'bg-yellow-500' :
                            'bg-green-500'
                          }`}
                          style={{ width: `${(span.duration / selectedTrace.duration) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {rootCauseAnalysis && (
                  <div className="space-y-3">
                    <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/30">
                      <h3 className="text-orange-400 font-semibold mb-2 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        Root Cause
                      </h3>
                      <p className="text-white/80 text-sm">{rootCauseAnalysis.rootCause}</p>
                    </div>

                    {rootCauseAnalysis.bottlenecks?.length > 0 && (
                      <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
                        <h3 className="text-yellow-400 font-semibold mb-2">Performance Bottlenecks</h3>
                        {rootCauseAnalysis.bottlenecks.map((bottleneck, idx) => (
                          <div key={idx} className="mb-2">
                            <div className="text-white text-sm font-medium">{bottleneck.service}</div>
                            <div className="text-white/70 text-xs mb-1">{bottleneck.issue}</div>
                            <div className="text-yellow-400 text-xs">Impact: {bottleneck.impact}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
                      <h3 className="text-cyan-400 font-semibold mb-2">Remediation Steps</h3>
                      {rootCauseAnalysis.remediation?.map((action, idx) => (
                        <div key={idx} className="mb-2 flex items-start gap-2">
                          <span className={`px-2 py-0.5 rounded text-xs mt-0.5 ${
                            action.priority === 'high' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'
                          }`}>
                            {action.priority}
                          </span>
                          <span className="text-white/80 text-sm flex-1">{action.action}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}