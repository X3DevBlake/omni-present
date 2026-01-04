import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GitBranch, RotateCcw, Clock, Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function VersionControl({ blueprintId, onRevert }) {
  const queryClient = useQueryClient();

  const { data: versions } = useQuery({
    queryKey: ['blueprint-versions', blueprintId],
    queryFn: () => base44.entities.Blueprint.filter({ parent_id: blueprintId }, '-created_date'),
    enabled: !!blueprintId,
  });

  const revertMutation = useMutation({
    mutationFn: (versionId) => {
      // In production, this would create a new version from the old one
      return base44.entities.Blueprint.update(blueprintId, { version: versionId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blueprints'] });
      toast.success('Reverted to previous version');
      onRevert?.();
    },
  });

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-3">
        <GitBranch className="w-4 h-4 text-purple-400" />
        <span className="text-white font-medium text-sm">Version History</span>
      </div>

      {versions?.length > 0 ? (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {versions.map((version, index) => (
            <motion.div
              key={version.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-3 h-3 text-cyan-400" />
                  <span className="text-white text-xs font-medium">
                    Version {version.version || index + 1}
                  </span>
                  {index === 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-[10px]">
                      Current
                    </span>
                  )}
                </div>
                <span className="text-white/40 text-[10px]">
                  {new Date(version.created_date).toLocaleDateString()}
                </span>
              </div>

              {index > 0 && (
                <button
                  onClick={() => revertMutation.mutate(version.id)}
                  disabled={revertMutation.isPending}
                  className="flex items-center gap-1 px-2 py-1 rounded bg-purple-500/20 text-purple-300 text-xs hover:bg-purple-500/30 transition-colors disabled:opacity-50"
                >
                  <RotateCcw className="w-3 h-3" />
                  Revert
                </button>
              )}
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center text-white/40 text-xs py-6">
          No version history yet
        </div>
      )}
    </div>
  );
}