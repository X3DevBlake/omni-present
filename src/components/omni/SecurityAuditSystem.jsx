import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, AlertTriangle, CheckCircle, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function SecurityAuditSystem({ blueprint, onApplyFix }) {
  const [auditResults, setAuditResults] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [showPanel, setShowPanel] = useState(false);

  useEffect(() => {
    if (blueprint) {
      performSecurityAudit();
    }
  }, [blueprint]);

  const performSecurityAudit = async () => {
    setIsScanning(true);

    try {
      const prompt = `
        Perform a comprehensive security audit on this AI infrastructure blueprint:
        ${JSON.stringify(blueprint)}
        
        Analyze for:
        1. Network security vulnerabilities
        2. Access control weaknesses
        3. Data encryption gaps
        4. Compliance issues (GDPR, HIPAA, SOC2)
        5. Container/VM security
        6. API security
        
        Return structured findings with severity, remediation steps, and compliance impact.
      `;

      const audit = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            overallScore: { type: 'number' },
            findings: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  severity: { type: 'string' },
                  category: { type: 'string' },
                  issue: { type: 'string' },
                  remediation: { type: 'string' },
                  compliance: { type: 'array', items: { type: 'string' } }
                }
              }
            },
            recommendations: { type: 'array', items: { type: 'string' } }
          }
        }
      });

      setAuditResults(audit);
      const critical = audit.findings?.filter(f => f.severity === 'critical').length || 0;
      if (critical > 0) {
        toast.error(`${critical} critical security issues found`);
        setShowPanel(true);
      }
    } catch (error) {
      console.error('Security audit failed:', error);
    } finally {
      setIsScanning(false);
    }
  };

  const getSeverityColor = (severity) => {
    if (severity === 'critical') return 'text-red-400 bg-red-500/20 border-red-500/40';
    if (severity === 'high') return 'text-orange-400 bg-orange-500/20 border-orange-500/40';
    if (severity === 'medium') return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/40';
    return 'text-blue-400 bg-blue-500/20 border-blue-500/40';
  };

  return (
    <>
      <motion.button
        onClick={() => setShowPanel(!showPanel)}
        className="fixed bottom-24 right-6 z-40 p-4 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={isScanning ? { rotate: [0, 360] } : {}}
        transition={isScanning ? { repeat: Infinity, duration: 2 } : {}}
      >
        <Shield className="w-6 h-6" />
        {auditResults?.findings?.length > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
            {auditResults.findings.length}
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {showPanel && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowPanel(false)}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-black/90 backdrop-blur-xl border border-white/20 rounded-xl p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Shield className="w-6 h-6 text-indigo-400" />
                  <h2 className="text-2xl font-bold text-white">Security Audit</h2>
                </div>
                <button onClick={() => setShowPanel(false)} className="text-white/60 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {auditResults && (
                <>
                  <div className="mb-6 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/30">
                    <div className="text-indigo-400 text-sm mb-2">Overall Security Score</div>
                    <div className="flex items-center gap-4">
                      <div className="text-white text-4xl font-bold">{auditResults.overallScore}/100</div>
                      <div className="flex-1 h-3 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all ${
                            auditResults.overallScore > 80 ? 'bg-green-500' :
                            auditResults.overallScore > 60 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${auditResults.overallScore}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <h3 className="text-white font-semibold">Findings</h3>
                    {auditResults.findings?.map((finding, idx) => (
                      <div key={idx} className={`p-4 rounded-xl border ${getSeverityColor(finding.severity)}`}>
                        <div className="flex items-start gap-3 mb-3">
                          <AlertTriangle className="w-5 h-5 mt-0.5" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-semibold text-sm">{finding.category}</span>
                              <span className="px-2 py-0.5 rounded text-xs uppercase">{finding.severity}</span>
                            </div>
                            <p className="text-white/80 text-sm mb-3">{finding.issue}</p>
                            <div className="bg-white/10 rounded p-3 mb-2">
                              <div className="text-white/50 text-xs mb-1">Remediation:</div>
                              <div className="text-white text-sm">{finding.remediation}</div>
                            </div>
                            {finding.compliance?.length > 0 && (
                              <div className="flex gap-2 flex-wrap">
                                {finding.compliance.map((comp, i) => (
                                  <span key={i} className="px-2 py-1 rounded bg-white/10 text-white/60 text-xs">
                                    {comp}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            onApplyFix?.({ finding, blueprint });
                            toast.success('Security fix applied');
                          }}
                          className="w-full py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm"
                        >
                          Apply Fix
                        </button>
                      </div>
                    ))}
                  </div>

                  {auditResults.recommendations?.length > 0 && (
                    <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30">
                      <h4 className="text-green-400 font-semibold mb-2">Recommendations</h4>
                      <ul className="space-y-1">
                        {auditResults.recommendations.map((rec, idx) => (
                          <li key={idx} className="text-white/70 text-sm flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}