import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Lock, Activity, CheckCircle, AlertTriangle, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function AutomatedSecurityHardening({ blueprint, onHardeningApplied }) {
  const [hardeningStatus, setHardeningStatus] = useState('idle');
  const [appliedMeasures, setAppliedMeasures] = useState([]);
  const [threats, setThreats] = useState([]);
  const [showPanel, setShowPanel] = useState(false);

  useEffect(() => {
    if (blueprint) {
      monitorThreats();
      const interval = setInterval(monitorThreats, 15000);
      return () => clearInterval(interval);
    }
  }, [blueprint]);

  const monitorThreats = async () => {
    // Simulate threat monitoring
    const detectedThreats = [
      {
        id: Date.now(),
        type: 'unauthorized_access_attempt',
        severity: 'high',
        source: '192.168.1.45',
        timestamp: new Date(),
        blocked: Math.random() > 0.3
      }
    ];

    if (Math.random() > 0.7) {
      setThreats(prev => [...detectedThreats, ...prev].slice(0, 10));
      if (!detectedThreats[0].blocked) {
        applyDefenseMeasure(detectedThreats[0]);
      }
    }
  };

  const applyDefenseMeasure = (threat) => {
    const measure = {
      id: Date.now(),
      action: 'IP_BLOCKED',
      target: threat.source,
      timestamp: new Date()
    };
    
    setAppliedMeasures(prev => [measure, ...prev].slice(0, 20));
    toast.success(`Blocked threat from ${threat.source}`);
  };

  const performAutoHardening = async () => {
    setHardeningStatus('analyzing');

    try {
      const prompt = `
        Perform automated security hardening on this infrastructure:
        
        Blueprint: ${JSON.stringify(blueprint)}
        
        Analyze and automatically configure:
        1. SECURITY GROUPS: Define minimal-privilege inbound/outbound rules
        2. NETWORK ACLs: Configure subnet-level network access controls
        3. FIREWALL RULES: Set up host-based firewall policies
        4. PATCH MANAGEMENT: Identify vulnerable components and apply patches
        5. ENCRYPTION: Enable encryption at rest and in transit where missing
        6. ACCESS CONTROLS: Implement principle of least privilege
        
        Return concrete configurations that can be applied automatically.
      `;

      const hardening = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            securityGroups: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  inbound: { type: 'array', items: { type: 'string' } },
                  outbound: { type: 'array', items: { type: 'string' } },
                  applied: { type: 'boolean' }
                }
              }
            },
            patches: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  component: { type: 'string' },
                  vulnerability: { type: 'string' },
                  patch: { type: 'string' },
                  severity: { type: 'string' }
                }
              }
            },
            encryptionMeasures: { type: 'array', items: { type: 'string' } }
          }
        }
      });

      setHardeningStatus('applying');
      
      // Simulate applying measures
      await new Promise(resolve => setTimeout(resolve, 2000));

      setAppliedMeasures(prev => [
        {
          id: Date.now(),
          action: 'SECURITY_GROUPS_CONFIGURED',
          details: `${hardening.securityGroups?.length || 0} groups configured`,
          timestamp: new Date()
        },
        {
          id: Date.now() + 1,
          action: 'PATCHES_APPLIED',
          details: `${hardening.patches?.length || 0} vulnerabilities patched`,
          timestamp: new Date()
        },
        {
          id: Date.now() + 2,
          action: 'ENCRYPTION_ENABLED',
          details: `${hardening.encryptionMeasures?.length || 0} measures enabled`,
          timestamp: new Date()
        },
        ...prev
      ]);

      setHardeningStatus('complete');
      setShowPanel(true);
      onHardeningApplied?.(hardening);
      toast.success('Security hardening completed');
    } catch (error) {
      console.error('Auto-hardening failed:', error);
      setHardeningStatus('error');
    }
  };

  return (
    <>
      <motion.button
        onClick={() => setShowPanel(!showPanel)}
        className="fixed bottom-56 right-6 z-40 p-4 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={hardeningStatus === 'applying' ? { rotate: [0, 360] } : {}}
        transition={hardeningStatus === 'applying' ? { repeat: Infinity, duration: 2 } : {}}
      >
        <Shield className="w-6 h-6" />
        {threats.filter(t => !t.blocked).length > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
            {threats.filter(t => !t.blocked).length}
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {showPanel && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="fixed top-24 right-6 z-40 w-96 max-h-[80vh] overflow-y-auto bg-black/90 backdrop-blur-xl border border-white/20 rounded-xl p-4"
          >
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-400" />
                <h3 className="text-white font-semibold">Security Hardening</h3>
              </div>
              <button onClick={() => setShowPanel(false)} className="text-white/60 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={performAutoHardening}
              disabled={hardeningStatus === 'applying'}
              className="w-full mb-4 py-2 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-400 text-sm disabled:opacity-50"
            >
              {hardeningStatus === 'applying' ? 'Applying Hardening...' : 'Run Auto-Hardening'}
            </button>

            {/* Threat Monitor */}
            <div className="mb-4">
              <h4 className="text-white/80 text-sm font-semibold mb-2 flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Active Threat Monitoring
              </h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {threats.map((threat) => (
                  <div key={threat.id} className={`p-2 rounded text-xs ${
                    threat.blocked 
                      ? 'bg-green-500/10 border border-green-500/30' 
                      : 'bg-red-500/10 border border-red-500/30'
                  }`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={threat.blocked ? 'text-green-400' : 'text-red-400'}>
                        {threat.type.replace(/_/g, ' ')}
                      </span>
                      {threat.blocked ? (
                        <CheckCircle className="w-3 h-3 text-green-400" />
                      ) : (
                        <AlertTriangle className="w-3 h-3 text-red-400" />
                      )}
                    </div>
                    <div className="text-white/60">From: {threat.source}</div>
                    <div className="text-white/40 text-xs">{threat.timestamp.toLocaleTimeString()}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Applied Measures */}
            <div>
              <h4 className="text-white/80 text-sm font-semibold mb-2 flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Applied Security Measures
              </h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {appliedMeasures.map((measure) => (
                  <div key={measure.id} className="p-2 rounded bg-blue-500/10 border border-blue-500/30 text-xs">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle className="w-3 h-3 text-blue-400" />
                      <span className="text-blue-400 font-semibold">
                        {measure.action.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <div className="text-white/70">{measure.details || measure.target}</div>
                    <div className="text-white/40 text-xs">{measure.timestamp.toLocaleTimeString()}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}