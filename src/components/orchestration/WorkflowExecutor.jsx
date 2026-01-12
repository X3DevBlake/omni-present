import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Trash2, Eye, Loader, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { executeWorkflow, getWorkflowHistory } from '../../functions/orchestration/zapier-workflow-executor';

export default function WorkflowExecutor({ workflow, onUpdate }) {
  const [executing, setExecuting] = useState(false);
  const [executions, setExecutions] = useState([]);
  const [selectedExecution, setSelectedExecution] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExecutionHistory();
  }, [workflow.id]);

  const loadExecutionHistory = async () => {
    setLoading(true);
    try {
      const history = await getWorkflowHistory(workflow.id, 20);
      setExecutions(history);
    } catch (error) {
      console.error('Error loading execution history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExecute = async () => {
    setExecuting(true);
    try {
      const result = await executeWorkflow(workflow.id, {
        workflow_name: workflow.name,
        triggered_at: new Date().toISOString()
      });

      await loadExecutionHistory();
      alert(`Workflow executed in ${result.duration}ms`);
    } catch (error) {
      console.error('Error executing workflow:', error);
      alert(`Execution failed: ${error.message}`);
    } finally {
      setExecuting(false);
    }
  };

  const handleToggleEnabled = async () => {
    try {
      await base44.entities.Workflow.update(workflow.id, {
        enabled: !workflow.enabled
      });
      onUpdate?.();
    } catch (error) {
      console.error('Error toggling workflow:', error);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this workflow? This cannot be undone.')) return;
    try {
      await base44.entities.Workflow.delete(workflow.id);
      onUpdate?.();
    } catch (error) {
      console.error('Error deleting workflow:', error);
    }
  };

  return (
    <div className="space-y-4">
      {/* Workflow Header */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-white font-bold">{workflow.name}</h3>
            <p className="text-white/60 text-sm">{workflow.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                workflow.enabled ? 'bg-green-500' : 'bg-gray-500'
              }`}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={handleExecute}
            disabled={executing || !workflow.enabled}
            className="px-3 py-2 bg-cyan-500/20 border border-cyan-400 text-cyan-300 rounded text-sm font-semibold hover:bg-cyan-500/30 disabled:opacity-50 flex items-center gap-2"
          >
            {executing ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Executing...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Execute Now
              </>
            )}
          </motion.button>

          <button
            onClick={handleToggleEnabled}
            className={`px-3 py-2 rounded text-sm font-semibold flex items-center gap-2 ${
              workflow.enabled
                ? 'bg-yellow-500/20 border border-yellow-400 text-yellow-300'
                : 'bg-gray-500/20 border border-gray-400 text-gray-300'
            }`}
          >
            {workflow.enabled ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {workflow.enabled ? 'Pause' : 'Enable'}
          </button>

          <button
            onClick={handleDelete}
            className="px-3 py-2 bg-red-500/20 border border-red-400 text-red-300 rounded text-sm font-semibold hover:bg-red-500/30 flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>

      {/* Execution History */}
      <div className="space-y-3">
        <h4 className="text-white font-semibold text-sm flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyan-400" />
          Recent Executions ({executions.length})
        </h4>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader className="w-6 h-6 animate-spin text-cyan-400" />
          </div>
        ) : executions.length === 0 ? (
          <p className="text-white/40 text-sm text-center py-8">No executions yet</p>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {executions.map((exec, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`bg-white/5 border rounded p-3 cursor-pointer hover:bg-white/10 transition-all ${
                  exec.status === 'completed' ? 'border-green-400/30' : 'border-red-400/30'
                }`}
                onClick={() => setSelectedExecution(selectedExecution === idx ? null : idx)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {exec.status === 'completed' ? (
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-400" />
                      )}
                      <span className="text-white text-xs font-semibold capitalize">
                        {exec.status}
                      </span>
                    </div>
                    <p className="text-white/60 text-xs">
                      {new Date(exec.created_date).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-white/70 text-xs">{exec.duration_ms}ms</p>
                  </div>
                </div>

                {selectedExecution === idx && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="border-t border-white/10 mt-3 pt-3 space-y-2"
                  >
                    {exec.actions_executed?.map((action, aIdx) => (
                      <div key={aIdx} className="bg-white/5 rounded p-2 text-xs">
                        <p className="text-white font-semibold">{action.service}</p>
                        <p className="text-white/60">{action.status}</p>
                        {action.error && (
                          <p className="text-red-400 mt-1">{action.error}</p>
                        )}
                      </div>
                    ))}
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}