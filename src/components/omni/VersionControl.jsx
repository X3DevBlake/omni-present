import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GitBranch, GitMerge, RotateCcw, Save, X, Clock, CheckCircle, GitCommit } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import GlassCard from './GlassCard';

export default function VersionControl({ currentBlueprint, onRevert, onClose }) {
  const queryClient = useQueryClient();
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [branchName, setBranchName] = useState('');
  const [showBranchDialog, setShowBranchDialog] = useState(false);
  const [showMergeDialog, setShowMergeDialog] = useState(false);
  const [mergeSource, setMergeSource] = useState(null);

  const { data: versions } = useQuery({
    queryKey: ['blueprint-versions', currentBlueprint?.id],
    queryFn: async () => {
      if (!currentBlueprint?.parent_id && !currentBlueprint?.id) return [];
      
      const allVersions = await base44.entities.Blueprint.list('-created_date');
      
      // Build version tree
      const rootId = currentBlueprint.parent_id || currentBlueprint.id;
      return allVersions.filter(v => 
        v.id === rootId || v.parent_id === rootId || v.parent_id === currentBlueprint.id
      );
    },
    enabled: !!currentBlueprint,
  });

  const saveMutation = useMutation({
    mutationFn: async (commitMessage) => {
      return base44.entities.Blueprint.create({
        name: `${currentBlueprint.name} v${(currentBlueprint.version || 1) + 1}`,
        configuration: currentBlueprint.configuration,
        constraints: currentBlueprint.constraints,
        version: (currentBlueprint.version || 1) + 1,
        parent_id: currentBlueprint.id,
        metadata: {
          commitMessage,
          timestamp: Date.now()
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blueprint-versions'] });
      toast.success('New version saved');
    },
  });

  const branchMutation = useMutation({
    mutationFn: async (name) => {
      return base44.entities.Blueprint.create({
        name: `${currentBlueprint.name} - ${name}`,
        configuration: currentBlueprint.configuration,
        constraints: currentBlueprint.constraints,
        version: 1,
        parent_id: currentBlueprint.id,
        metadata: {
          branch: name,
          branchedFrom: currentBlueprint.id,
          timestamp: Date.now()
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blueprint-versions'] });
      toast.success('Branch created');
      setShowBranchDialog(false);
      setBranchName('');
    },
  });

  const mergeMutation = useMutation({
    mutationFn: async ({ sourceId, targetId }) => {
      const source = versions.find(v => v.id === sourceId);
      const target = versions.find(v => v.id === targetId);
      
      // Merge configurations (simple merge strategy)
      const mergedConfig = {
        ...target.configuration,
        components: [
          ...target.configuration.components,
          ...source.configuration.components.filter(sc => 
            !target.configuration.components.some(tc => tc.id === sc.id)
          )
        ]
      };
      
      return base44.entities.Blueprint.create({
        name: `${target.name} (merged)`,
        configuration: mergedConfig,
        constraints: target.constraints,
        version: (target.version || 1) + 1,
        parent_id: targetId,
        metadata: {
          mergedFrom: sourceId,
          timestamp: Date.now()
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blueprint-versions'] });
      toast.success('Branches merged successfully');
      setShowMergeDialog(false);
    },
  });

  const revertMutation = useMutation({
    mutationFn: async (versionId) => {
      const version = versions.find(v => v.id === versionId);
      onRevert?.(version);
      return version;
    },
    onSuccess: () => {
      toast.success('Reverted to selected version');
    },
  });

  const handleSaveVersion = () => {
    const commitMessage = prompt('Enter commit message:');
    if (commitMessage) {
      saveMutation.mutate(commitMessage);
    }
  };

  const handleCreateBranch = () => {
    if (branchName.trim()) {
      branchMutation.mutate(branchName);
    }
  };

  const handleMerge = () => {
    if (mergeSource && selectedVersion) {
      mergeMutation.mutate({
        sourceId: mergeSource,
        targetId: selectedVersion
      });
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
              <GitBranch className="w-6 h-6 text-cyan-400" />
              <h2 className="text-2xl font-bold text-white">Version Control</h2>
            </div>
            <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3 mb-6">
            <button
              onClick={handleSaveVersion}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 transition-colors"
            >
              <Save className="w-4 h-4" />
              Save Version
            </button>
            <button
              onClick={() => setShowBranchDialog(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 transition-colors"
            >
              <GitBranch className="w-4 h-4" />
              Create Branch
            </button>
            <button
              onClick={() => setShowMergeDialog(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-pink-500/20 hover:bg-pink-500/30 text-pink-400 transition-colors"
            >
              <GitMerge className="w-4 h-4" />
              Merge Branches
            </button>
          </div>

          {/* Version Timeline */}
          <div className="space-y-3">
            <h3 className="text-white font-semibold mb-4">Version History</h3>
            {versions?.map((version, idx) => {
              const isSelected = selectedVersion === version.id;
              const isCurrent = version.id === currentBlueprint?.id;
              const isBranch = version.metadata?.branch;
              
              return (
                <motion.div
                  key={version.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected ? 'border-cyan-500/60 bg-cyan-500/10' :
                    isCurrent ? 'border-green-500/60 bg-green-500/10' :
                    'border-white/20 bg-white/5 hover:border-white/40'
                  }`}
                  onClick={() => setSelectedVersion(version.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <GitCommit className="w-4 h-4 text-cyan-400" />
                        <span className="text-white font-medium">{version.name}</span>
                        {isCurrent && (
                          <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-xs">
                            CURRENT
                          </span>
                        )}
                        {isBranch && (
                          <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 text-xs">
                            {isBranch}
                          </span>
                        )}
                      </div>
                      <div className="text-white/60 text-sm mb-2">
                        Version {version.version || 1} • 
                        {version.metadata?.commitMessage && ` ${version.metadata.commitMessage} •`}
                        <span className="text-white/40 text-xs ml-1">
                          {new Date(version.created_date).toLocaleString()}
                        </span>
                      </div>
                      {version.estimatedCost && (
                        <div className="text-xs text-white/50">
                          Est. Cost: ${version.estimatedCost.toLocaleString()} | 
                          Performance: {version.estimatedPerformance?.toFixed(0)} TFLOPS
                        </div>
                      )}
                    </div>
                    {!isCurrent && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          revertMutation.mutate(version.id);
                        }}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 text-sm transition-colors"
                      >
                        <RotateCcw className="w-3 h-3" />
                        Rollback
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Branch Dialog */}
          <AnimatePresence>
            {showBranchDialog && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-10 flex items-center justify-center bg-black/60"
                onClick={() => setShowBranchDialog(false)}
              >
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.9 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-black/90 border border-white/20 rounded-xl p-6 w-96"
                >
                  <h3 className="text-white font-semibold mb-4">Create New Branch</h3>
                  <input
                    type="text"
                    value={branchName}
                    onChange={(e) => setBranchName(e.target.value)}
                    placeholder="e.g., experimental-config"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white mb-4 focus:outline-none focus:border-purple-500"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleCreateBranch}
                      disabled={!branchName.trim()}
                      className="flex-1 py-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 disabled:opacity-50"
                    >
                      Create
                    </button>
                    <button
                      onClick={() => setShowBranchDialog(false)}
                      className="px-4 py-2 rounded-lg bg-white/5 text-white/60 hover:text-white"
                    >
                      Cancel
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Merge Dialog */}
          <AnimatePresence>
            {showMergeDialog && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-10 flex items-center justify-center bg-black/60"
                onClick={() => setShowMergeDialog(false)}
              >
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.9 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-black/90 border border-white/20 rounded-xl p-6 w-96"
                >
                  <h3 className="text-white font-semibold mb-4">Merge Branches</h3>
                  <div className="space-y-3 mb-4">
                    <div>
                      <label className="text-white/60 text-sm mb-2 block">Source Branch</label>
                      <select
                        value={mergeSource || ''}
                        onChange={(e) => setMergeSource(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none"
                      >
                        <option value="">Select source...</option>
                        {versions?.map(v => (
                          <option key={v.id} value={v.id}>{v.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-white/60 text-sm mb-2 block">Target Branch</label>
                      <select
                        value={selectedVersion || ''}
                        onChange={(e) => setSelectedVersion(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none"
                      >
                        <option value="">Select target...</option>
                        {versions?.map(v => (
                          <option key={v.id} value={v.id}>{v.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleMerge}
                      disabled={!mergeSource || !selectedVersion}
                      className="flex-1 py-2 rounded-lg bg-pink-500/20 hover:bg-pink-500/30 text-pink-400 disabled:opacity-50"
                    >
                      Merge
                    </button>
                    <button
                      onClick={() => setShowMergeDialog(false)}
                      className="px-4 py-2 rounded-lg bg-white/5 text-white/60 hover:text-white"
                    >
                      Cancel
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}