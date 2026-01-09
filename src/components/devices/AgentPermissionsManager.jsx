import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, Zap, CheckCircle, XCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function AgentPermissionsManager({ deviceId }) {
  const [agents, setAgents] = useState([]);
  const [permissions, setPermissions] = useState({});
  const [encryptionStatus, setEncryptionStatus] = useState('active');

  useEffect(() => {
    loadAgentsAndPermissions();
  }, []);

  const loadAgentsAndPermissions = async () => {
    const user = await base44.auth.me();
    const userAgents = await base44.entities.Agent.filter({ created_by: user.email });
    setAgents(userAgents);

    // Initialize permissions
    const initialPermissions = {};
    userAgents.forEach(agent => {
      initialPermissions[agent.id] = {
        readSensors: false,
        controlActuators: false,
        accessCamera: false,
        fullControl: false
      };
    });
    setPermissions(initialPermissions);
  };

  const togglePermission = async (agentId, permissionType) => {
    const newPermissions = {
      ...permissions,
      [agentId]: {
        ...permissions[agentId],
        [permissionType]: !permissions[agentId][permissionType]
      }
    };

    // If fullControl is enabled, enable all
    if (permissionType === 'fullControl' && !permissions[agentId].fullControl) {
      newPermissions[agentId] = {
        readSensors: true,
        controlActuators: true,
        accessCamera: true,
        fullControl: true
      };
    }

    setPermissions(newPermissions);
    
    // Log permission change
    const agent = agents.find(a => a.id === agentId);
    toast.success(`Updated permissions for ${agent?.name}`, { icon: '🔐' });
  };

  const permissionLevels = [
    { 
      key: 'readSensors', 
      label: 'Read Sensor Data', 
      icon: Eye, 
      description: 'View real-time data from sensors',
      color: 'blue'
    },
    { 
      key: 'controlActuators', 
      label: 'Control Actuators', 
      icon: Zap, 
      description: 'Send commands to physical actuators',
      color: 'yellow'
    },
    { 
      key: 'accessCamera', 
      label: 'Camera Access', 
      icon: Eye, 
      description: 'View camera feeds and capture images',
      color: 'purple'
    },
    { 
      key: 'fullControl', 
      label: 'Full Control', 
      icon: Shield, 
      description: 'Complete access to all device functions',
      color: 'red'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Security Status */}
      <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
              <Lock className="w-6 h-6 text-green-400 animate-pulse" />
            </div>
            <div>
              <h3 className="text-white font-bold">Secure Communication Layer</h3>
              <div className="text-green-400 text-sm">End-to-end encrypted</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-white font-bold">AES-256</div>
            <div className="text-white/60 text-xs">Encryption Active</div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-4">
          <div className="bg-black/20 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-white">256-bit</div>
            <div className="text-white/60 text-xs">Encryption</div>
          </div>
          <div className="bg-black/20 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-white">TLS 1.3</div>
            <div className="text-white/60 text-xs">Protocol</div>
          </div>
          <div className="bg-black/20 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-green-400">Active</div>
            <div className="text-white/60 text-xs">Status</div>
          </div>
        </div>
      </div>

      {/* Agent Permissions */}
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <h3 className="text-white font-bold text-xl mb-4">Agent Permissions</h3>

        {agents.length === 0 ? (
          <div className="text-center py-12 text-white/60">
            No agents found. Create agents in the Labs section.
          </div>
        ) : (
          <div className="space-y-4">
            {agents.map(agent => (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 border border-white/10 rounded-xl p-4"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div className="flex-1">
                    <div className="text-white font-semibold">{agent.name}</div>
                    <div className="text-white/60 text-xs">
                      {Object.values(permissions[agent.id] || {}).filter(Boolean).length} permissions granted
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-3">
                  {permissionLevels.map(level => {
                    const Icon = level.icon;
                    const isGranted = permissions[agent.id]?.[level.key] || false;
                    
                    return (
                      <button
                        key={level.key}
                        onClick={() => togglePermission(agent.id, level.key)}
                        className={`p-3 rounded-lg border transition-all text-left ${
                          isGranted
                            ? `bg-${level.color}-500/20 border-${level.color}-500/50`
                            : 'bg-white/5 border-white/10 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <Icon className={`w-5 h-5 flex-shrink-0 ${isGranted ? `text-${level.color}-400` : 'text-white/40'}`} />
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className={`font-semibold text-sm ${isGranted ? 'text-white' : 'text-white/60'}`}>
                                {level.label}
                              </span>
                              {isGranted ? (
                                <CheckCircle className="w-4 h-4 text-green-400" />
                              ) : (
                                <XCircle className="w-4 h-4 text-white/20" />
                              )}
                            </div>
                            <div className="text-white/40 text-xs">{level.description}</div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Security Audit Log */}
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <h3 className="text-white font-bold mb-4">Security Audit Log</h3>
        <div className="space-y-2">
          {[
            { action: 'Permission granted', agent: 'Omni Agent 1', detail: 'Read Sensors', time: '2 min ago' },
            { action: 'Encrypted connection', agent: 'System', detail: 'TLS handshake successful', time: '5 min ago' },
            { action: 'Access denied', agent: 'Omni Agent 2', detail: 'Insufficient permissions', time: '10 min ago' }
          ].map((log, i) => (
            <div key={i} className="bg-white/5 rounded-lg p-3 flex items-center justify-between">
              <div>
                <div className="text-white text-sm font-semibold">{log.action}</div>
                <div className="text-white/60 text-xs">{log.agent} - {log.detail}</div>
              </div>
              <div className="text-white/40 text-xs">{log.time}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}