import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, AlertTriangle, TrendingDown, Shield, Minimize2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function AIProactiveMonitor({ 
  apiGatewayMetrics,
  tracingData,
  marketplaceActivity,
  deployedServices,
  onPreventativeAction 
}) {
  const [alerts, setAlerts] = useState([]);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    analyzeSystemHealth();
    const interval = setInterval(analyzeSystemHealth, 20000); // Every 20 seconds
    return () => clearInterval(interval);
  }, [apiGatewayMetrics, tracingData, marketplaceActivity]);

  const analyzeSystemHealth = async () => {
    setIsAnalyzing(true);

    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `
          Act as a proactive AI monitoring system. Continuously analyze system health.
          
          API Gateway Metrics: ${JSON.stringify(apiGatewayMetrics)}
          Distributed Tracing Data: ${JSON.stringify(tracingData)}
          Model Marketplace Activity: ${JSON.stringify(marketplaceActivity)}
          Deployed Services: ${JSON.stringify(deployedServices)}
          
          Analyze and predict:
          1. PERFORMANCE DEGRADATION: Early signs of slowdowns before user impact
          2. COST ANOMALIES: Unexpected cost increases or resource waste
          3. AVAILABILITY RISKS: Services approaching failure thresholds
          4. SECURITY THREATS: Unusual traffic patterns or access attempts
          5. MODEL DRIFT: ML models showing accuracy decline
          
          For each potential issue:
          - Severity: critical/high/medium/low
          - Confidence: 0-100% prediction accuracy
          - Time to impact: When will users be affected
          - Root cause analysis: Why is this happening
          - Preventative actions: Steps to avoid the issue
          - Automated rollback option: Yes/No
        `,
        response_json_schema: {
          type: 'object',
          properties: {
            alerts: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  type: { type: 'string' },
                  severity: { type: 'string' },
                  confidence: { type: 'number' },
                  timeToImpact: { type: 'string' },
                  rootCause: { type: 'string' },
                  preventativeActions: { type: 'array', items: { type: 'string' } },
                  canAutoRollback: { type: 'boolean' },
                  affectedServices: { type: 'array', items: { type: 'string' } }
                }
              }
            },
            systemHealth: { type: 'number' },
            recommendations: { type: 'array', items: { type: 'string' } }
          }
        }
      });

      // Update alerts
      setAlerts(result.alerts || []);

      // Show critical alerts immediately
      const criticalAlerts = result.alerts?.filter(a => a.severity === 'critical') || [];
      if (criticalAlerts.length > 0) {
        criticalAlerts.forEach(alert => {
          toast.error(`Critical: ${alert.type} - ${alert.timeToImpact}`, {
            duration: 10000,
          });
        });
      }

    } catch (error) {
      console.error('Proactive monitoring failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const executePreventativeAction = async (alert, actionIndex) => {
    const action = alert.preventativeActions[actionIndex];
    await onPreventativeAction?.({ alert, action });
    toast.success('Preventative action executed');
    
    // Re-analyze after action
    setTimeout(analyzeSystemHealth, 2000);
  };

  const executeAutoRollback = async (alert) => {
    toast.info('Initiating automated rollback...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    await onPreventativeAction?.({ alert, action: 'automated_rollback' });
    toast.success('Automated rollback completed');
    
    // Remove the alert
    setAlerts(prev => prev.filter(a => a !== alert));
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'from-red-500/20 to-red-500/5 border-red-500/40';
      case 'high': return 'from-orange-500/20 to-orange-500/5 border-orange-500/40';
      case 'medium': return 'from-yellow-500/20 to-yellow-500/5 border-yellow-500/40';
      default: return 'from-blue-500/20 to-blue-500/5 border-blue-500/40';
    }
  };

  if (isMinimized) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed bottom-6 left-6 z-40"
      >
        <button
          onClick={() => setIsMinimized(false)}
          className="relative p-4 rounded-full bg-gradient-to-r from-red-500/20 to-orange-500/20 border-2 border-red-500/40 hover:border-red-500/60 transition-all"
        >
          <Bell className="w-6 h-6 text-red-400" />
          {alerts.length > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
              {alerts.length}
            </span>
          )}
          {isAnalyzing && (
            <span className="absolute inset-0 rounded-full border-2 border-red-400 animate-ping" />
          )}
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-6 left-6 z-40 w-96 max-h-[600px] overflow-hidden"
    >
      <div className="bg-black/90 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-cyan-400" />
            <span className="text-white font-semibold">Proactive Monitor</span>
            {isAnalyzing && (
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
            )}
          </div>
          <button
            onClick={() => setIsMinimized(true)}
            className="text-white/60 hover:text-white"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-[520px] overflow-y-auto p-4 space-y-3">
          {alerts.length === 0 ? (
            <div className="text-center py-8">
              <Shield className="w-12 h-12 text-green-400 mx-auto mb-3" />
              <div className="text-white/70 text-sm">All systems healthy</div>
              <div className="text-white/50 text-xs mt-1">No issues predicted</div>
            </div>
          ) : (
            alerts.map((alert, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`p-4 rounded-xl bg-gradient-to-r border ${getSeverityColor(alert.severity)}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle className={`w-4 h-4 ${
                        alert.severity === 'critical' ? 'text-red-400' :
                        alert.severity === 'high' ? 'text-orange-400' :
                        alert.severity === 'medium' ? 'text-yellow-400' : 'text-blue-400'
                      }`} />
                      <span className="text-white font-medium text-sm">{alert.type}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs mb-2">
                      <span className={`px-2 py-0.5 rounded ${
                        alert.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                        alert.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                        alert.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {alert.severity}
                      </span>
                      <span className="text-white/60">
                        Confidence: {alert.confidence}%
                      </span>
                    </div>
                  </div>
                  {alert.canAutoRollback && (
                    <button
                      onClick={() => executeAutoRollback(alert)}
                      className="px-3 py-1 rounded bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs"
                    >
                      Auto Rollback
                    </button>
                  )}
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-white/60">
                    <TrendingDown className="w-3 h-3" />
                    Impact in: <span className="text-orange-400">{alert.timeToImpact}</span>
                  </div>

                  <div className="p-2 rounded bg-black/30">
                    <div className="text-white/50 mb-1">Root Cause:</div>
                    <div className="text-white/80">{alert.rootCause}</div>
                  </div>

                  {alert.affectedServices?.length > 0 && (
                    <div>
                      <div className="text-white/50 mb-1">Affected Services:</div>
                      <div className="flex flex-wrap gap-1">
                        {alert.affectedServices.map((service, i) => (
                          <span key={i} className="px-2 py-0.5 rounded bg-white/10 text-white/70">
                            {service}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <div className="text-white/50 mb-1">Preventative Actions:</div>
                    <div className="space-y-1">
                      {alert.preventativeActions?.map((action, i) => (
                        <button
                          key={i}
                          onClick={() => executePreventativeAction(alert, i)}
                          className="w-full text-left p-2 rounded bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-xs transition-colors"
                        >
                          {i + 1}. {action}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </motion.div>
  );
}