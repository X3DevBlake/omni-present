import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, X, Settings, Activity, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import GlassCard from './GlassCard';

export default function DeploymentManager({ blueprint, onClose }) {
  const [deploymentConfig, setDeploymentConfig] = useState({
    name: '',
    replicas: 3,
    autoScaling: true,
    minReplicas: 2,
    maxReplicas: 10,
    cpuThreshold: 70,
    memoryThreshold: 80,
    cicdEnabled: true,
    monitoringEnabled: true,
    environment: 'production'
  });
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentStatus, setDeploymentStatus] = useState(null);

  const handleDeploy = async () => {
    setIsDeploying(true);
    
    // Simulate deployment
    setTimeout(() => {
      setDeploymentStatus({
        endpoint: `https://${deploymentConfig.name}.ai-service.cloud`,
        status: 'running',
        replicas: deploymentConfig.replicas,
        health: 'healthy',
        deployedAt: new Date().toISOString()
      });
      setIsDeploying(false);
      toast.success('Blueprint deployed successfully');
    }, 3000);
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
        className="w-full max-w-3xl max-h-[90vh] overflow-y-auto"
      >
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Rocket className="w-6 h-6 text-cyan-400" />
              <h2 className="text-2xl font-bold text-white">Deploy Blueprint</h2>
            </div>
            <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Basic Config */}
            <div>
              <label className="text-white text-sm mb-2 block">Service Name</label>
              <input
                type="text"
                value={deploymentConfig.name}
                onChange={(e) => setDeploymentConfig(prev => ({ ...prev, name: e.target.value }))}
                placeholder="my-ai-service"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Auto-Scaling */}
            <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-purple-400" />
                  <h3 className="text-white font-semibold">Auto-Scaling</h3>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={deploymentConfig.autoScaling}
                    onChange={(e) => setDeploymentConfig(prev => ({ ...prev, autoScaling: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                </label>
              </div>

              {deploymentConfig.autoScaling && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-white/60 text-xs mb-1 block">Min Replicas</label>
                    <input
                      type="number"
                      value={deploymentConfig.minReplicas}
                      onChange={(e) => setDeploymentConfig(prev => ({ ...prev, minReplicas: Number(e.target.value) }))}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-white/60 text-xs mb-1 block">Max Replicas</label>
                    <input
                      type="number"
                      value={deploymentConfig.maxReplicas}
                      onChange={(e) => setDeploymentConfig(prev => ({ ...prev, maxReplicas: Number(e.target.value) }))}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-white/60 text-xs mb-1 block">CPU Threshold %</label>
                    <input
                      type="number"
                      value={deploymentConfig.cpuThreshold}
                      onChange={(e) => setDeploymentConfig(prev => ({ ...prev, cpuThreshold: Number(e.target.value) }))}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-white/60 text-xs mb-1 block">Memory Threshold %</label>
                    <input
                      type="number"
                      value={deploymentConfig.memoryThreshold}
                      onChange={(e) => setDeploymentConfig(prev => ({ ...prev, memoryThreshold: Number(e.target.value) }))}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* CI/CD & Monitoring */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={deploymentConfig.cicdEnabled}
                    onChange={(e) => setDeploymentConfig(prev => ({ ...prev, cicdEnabled: e.target.checked }))}
                    className="w-4 h-4 rounded bg-white/10 border-white/20"
                  />
                  <span className="text-white text-sm">Enable CI/CD Pipeline</span>
                </label>
                <p className="text-white/50 text-xs mt-2">Automated testing & deployment</p>
              </div>
              <div className="p-4 rounded-xl bg-pink-500/10 border border-pink-500/30">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={deploymentConfig.monitoringEnabled}
                    onChange={(e) => setDeploymentConfig(prev => ({ ...prev, monitoringEnabled: e.target.checked }))}
                    className="w-4 h-4 rounded bg-white/10 border-white/20"
                  />
                  <span className="text-white text-sm">Enable Monitoring</span>
                </label>
                <p className="text-white/50 text-xs mt-2">Real-time metrics & alerts</p>
              </div>
            </div>

            {/* Deploy Button */}
            <button
              onClick={handleDeploy}
              disabled={isDeploying || !deploymentConfig.name}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-medium disabled:opacity-50"
            >
              {isDeploying ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Deploying...
                </>
              ) : (
                <>
                  <Rocket className="w-5 h-5" />
                  Deploy Service
                </>
              )}
            </button>

            {/* Deployment Status */}
            <AnimatePresence>
              {deploymentStatus && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-xl bg-green-500/10 border border-green-500/30"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Activity className="w-5 h-5 text-green-400" />
                    <span className="text-white font-semibold">Deployment Active</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div><span className="text-white/50">Endpoint:</span> <span className="text-cyan-400">{deploymentStatus.endpoint}</span></div>
                    <div><span className="text-white/50">Status:</span> <span className="text-green-400">{deploymentStatus.status}</span></div>
                    <div><span className="text-white/50">Replicas:</span> <span className="text-white">{deploymentStatus.replicas}</span></div>
                    <div><span className="text-white/50">Health:</span> <span className="text-green-400">{deploymentStatus.health}</span></div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}