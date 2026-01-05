import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Network, Shield, TrendingUp, AlertTriangle, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function AIAPIGateway({ deployedServices, onClose }) {
  const [routingMetrics, setRoutingMetrics] = useState(null);
  const [trafficAnomalies, setTrafficAnomalies] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    analyzeRouting();
    const interval = setInterval(analyzeRouting, 10000);
    return () => clearInterval(interval);
  }, []);

  const analyzeRouting = async () => {
    setIsAnalyzing(true);

    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `
          Analyze API Gateway routing for deployed services:
          
          Services: ${JSON.stringify(deployedServices)}
          
          Provide:
          1. INTELLIGENT ROUTING: Best service selection based on performance, cost, availability
          2. LOAD BALANCING: Distribution strategy across instances
          3. SECURITY CHECKS: Rate limiting, validation rules
          4. ANOMALY DETECTION: Unusual traffic patterns or threats
          5. API VERSIONING: Compatibility and migration strategies
        `,
        response_json_schema: {
          type: 'object',
          properties: {
            routingRules: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  path: { type: 'string' },
                  targetService: { type: 'string' },
                  method: { type: 'string' },
                  priority: { type: 'string' }
                }
              }
            },
            loadBalancing: {
              type: 'object',
              properties: {
                strategy: { type: 'string' },
                healthChecks: { type: 'array', items: { type: 'string' } },
                distribution: { type: 'object' }
              }
            },
            securityRules: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  rule: { type: 'string' },
                  limit: { type: 'string' },
                  action: { type: 'string' }
                }
              }
            },
            anomalies: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  type: { type: 'string' },
                  severity: { type: 'string' },
                  description: { type: 'string' },
                  recommendation: { type: 'string' }
                }
              }
            }
          }
        }
      });

      setRoutingMetrics(result);
      setTrafficAnomalies(result.anomalies || []);
      
      if (result.anomalies?.length > 0) {
        const critical = result.anomalies.filter(a => a.severity === 'high');
        if (critical.length > 0) {
          toast.error(`${critical.length} critical anomalies detected`);
        }
      }
    } catch (error) {
      console.error('Routing analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
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
        className="w-full max-w-6xl max-h-[90vh] overflow-y-auto bg-black/90 backdrop-blur-xl border border-white/20 rounded-xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Network className="w-6 h-6 text-cyan-400" />
            <h2 className="text-2xl font-bold text-white">AI API Gateway</h2>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {routingMetrics && (
          <div className="space-y-6">
            {/* Routing Rules */}
            <div>
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Intelligent Routing Rules
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {routingMetrics.routingRules?.map((rule, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-medium text-sm">{rule.method} {rule.path}</span>
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        rule.priority === 'high' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {rule.priority}
                      </span>
                    </div>
                    <div className="text-cyan-400 text-xs">→ {rule.targetService}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Load Balancing */}
            <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30">
              <h3 className="text-purple-400 font-semibold mb-3">Load Balancing Strategy</h3>
              <div className="mb-3">
                <div className="text-white text-sm mb-1">Strategy: {routingMetrics.loadBalancing?.strategy}</div>
                <div className="text-white/60 text-xs">
                  Health checks: {routingMetrics.loadBalancing?.healthChecks?.join(', ')}
                </div>
              </div>
              {routingMetrics.loadBalancing?.distribution && (
                <div>
                  <div className="text-white/70 text-sm mb-2">Traffic Distribution:</div>
                  {Object.entries(routingMetrics.loadBalancing.distribution).map(([service, percent]) => (
                    <div key={service} className="mb-2">
                      <div className="flex justify-between text-xs text-white/70 mb-1">
                        <span>{service}</span>
                        <span>{percent}%</span>
                      </div>
                      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500" style={{ width: `${percent}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Security Rules */}
            <div>
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Security & Rate Limiting
              </h3>
              <div className="space-y-2">
                {routingMetrics.securityRules?.map((rule, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="text-white font-medium text-sm mb-1">{rule.rule}</div>
                        <div className="text-white/60 text-xs">Limit: {rule.limit}</div>
                      </div>
                      <div className="text-green-400 text-xs">{rule.action}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Traffic Anomalies */}
            {trafficAnomalies.length > 0 && (
              <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/30">
                <h3 className="text-orange-400 font-semibold mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Traffic Anomalies Detected
                </h3>
                <div className="space-y-2">
                  {trafficAnomalies.map((anomaly, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-black/30">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="text-white font-medium text-sm mb-1">{anomaly.type}</div>
                          <div className="text-white/70 text-xs mb-2">{anomaly.description}</div>
                          <div className="text-orange-400 text-xs">→ {anomaly.recommendation}</div>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          anomaly.severity === 'high' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {anomaly.severity}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}