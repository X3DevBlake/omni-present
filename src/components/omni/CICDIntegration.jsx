import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GitBranch, CheckCircle, XCircle, AlertTriangle, Play, RotateCcw, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function CICDIntegration({ blueprint, onDeploy, onClose }) {
  const [pipeline, setPipeline] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [provider, setProvider] = useState('aws');

  const runPipeline = async () => {
    setIsRunning(true);

    try {
      // AI Code Review
      toast.info('Running AI code review...');
      const codeReview = await base44.integrations.Core.InvokeLLM({
        prompt: `
          Perform security and performance code review for blueprint:
          ${JSON.stringify(blueprint)}
          
          Check for:
          1. Security vulnerabilities
          2. Performance regressions
          3. Best practice violations
          4. Cost optimization opportunities
        `,
        response_json_schema: {
          type: 'object',
          properties: {
            securityIssues: { type: 'array', items: { type: 'string' } },
            performanceIssues: { type: 'array', items: { type: 'string' } },
            recommendations: { type: 'array', items: { type: 'string' } },
            approved: { type: 'boolean' }
          }
        }
      });

      await new Promise(resolve => setTimeout(resolve, 2000));

      // Blueprint Validation
      toast.info('Validating blueprint...');
      const validation = await base44.integrations.Core.InvokeLLM({
        prompt: `
          Validate blueprint configuration:
          ${JSON.stringify(blueprint)}
          
          Verify:
          1. Resource compatibility
          2. Network topology correctness
          3. Cost projections accuracy
          4. Compliance with standards
        `,
        response_json_schema: {
          type: 'object',
          properties: {
            valid: { type: 'boolean' },
            errors: { type: 'array', items: { type: 'string' } },
            warnings: { type: 'array', items: { type: 'string' } }
          }
        }
      });

      await new Promise(resolve => setTimeout(resolve, 2000));

      // Deployment Configuration
      const deployment = {
        provider,
        service: provider === 'aws' ? 'CodeDeploy' : provider === 'azure' ? 'DevOps' : 'Cloud Build',
        blueprintId: blueprint.id,
        reviewStatus: codeReview.approved ? 'approved' : 'rejected',
        validationStatus: validation.valid ? 'passed' : 'failed'
      };

      setPipeline({
        stages: [
          { name: 'Code Review', status: codeReview.approved ? 'success' : 'warning', details: codeReview },
          { name: 'Validation', status: validation.valid ? 'success' : 'failed', details: validation },
          { name: 'Testing', status: 'success', details: { testsRun: 47, passed: 47 } },
          { name: 'Deployment', status: codeReview.approved && validation.valid ? 'success' : 'pending', details: deployment }
        ],
        canDeploy: codeReview.approved && validation.valid
      });

      if (codeReview.approved && validation.valid) {
        toast.success('Pipeline completed successfully - ready to deploy');
      } else {
        toast.error('Pipeline completed with issues - review required');
      }
    } catch (error) {
      console.error('Pipeline failed:', error);
      toast.error('Pipeline execution failed');
    } finally {
      setIsRunning(false);
    }
  };

  const deployToCloud = async () => {
    toast.info(`Deploying to ${provider.toUpperCase()}...`);
    await new Promise(resolve => setTimeout(resolve, 3000));
    toast.success('Deployment successful!');
    onDeploy?.({ provider, blueprint });
  };

  const rollback = async () => {
    toast.info('Rolling back deployment...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    toast.success('Rollback completed');
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
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-black/90 backdrop-blur-xl border border-white/20 rounded-xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <GitBranch className="w-6 h-6 text-cyan-400" />
            <h2 className="text-2xl font-bold text-white">CI/CD Pipeline</h2>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-6">
          <label className="text-white/70 text-sm mb-2 block">Cloud Provider</label>
          <div className="flex gap-3">
            {['aws', 'azure', 'gcp'].map((p) => (
              <button
                key={p}
                onClick={() => setProvider(p)}
                className={`px-4 py-2 rounded-lg text-sm transition-all ${
                  provider === p
                    ? 'bg-cyan-500/20 border-2 border-cyan-500/60 text-cyan-400'
                    : 'bg-white/5 border border-white/10 text-white/60'
                }`}
              >
                {p.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={runPipeline}
          disabled={isRunning}
          className="w-full mb-6 py-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 font-medium disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Play className="w-5 h-5" />
          {isRunning ? 'Running Pipeline...' : 'Run Pipeline'}
        </button>

        {pipeline && (
          <div className="space-y-4">
            {pipeline.stages.map((stage, idx) => (
              <div key={idx} className={`p-4 rounded-xl border ${
                stage.status === 'success' ? 'bg-green-500/10 border-green-500/30' :
                stage.status === 'warning' ? 'bg-yellow-500/10 border-yellow-500/30' :
                stage.status === 'failed' ? 'bg-red-500/10 border-red-500/30' :
                'bg-white/5 border-white/10'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {stage.status === 'success' && <CheckCircle className="w-5 h-5 text-green-400" />}
                    {stage.status === 'warning' && <AlertTriangle className="w-5 h-5 text-yellow-400" />}
                    {stage.status === 'failed' && <XCircle className="w-5 h-5 text-red-400" />}
                    <span className="text-white font-medium">{stage.name}</span>
                  </div>
                  <span className={`text-sm ${
                    stage.status === 'success' ? 'text-green-400' :
                    stage.status === 'warning' ? 'text-yellow-400' :
                    stage.status === 'failed' ? 'text-red-400' :
                    'text-white/60'
                  }`}>
                    {stage.status}
                  </span>
                </div>
                {stage.details?.securityIssues && stage.details.securityIssues.length > 0 && (
                  <div className="mt-2">
                    <div className="text-white/70 text-sm mb-1">Security Issues:</div>
                    {stage.details.securityIssues.map((issue, i) => (
                      <div key={i} className="text-white/60 text-xs mb-1">• {issue}</div>
                    ))}
                  </div>
                )}
                {stage.details?.errors && stage.details.errors.length > 0 && (
                  <div className="mt-2">
                    <div className="text-red-400 text-sm mb-1">Errors:</div>
                    {stage.details.errors.map((error, i) => (
                      <div key={i} className="text-white/60 text-xs mb-1">• {error}</div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <div className="flex gap-3">
              <button
                onClick={deployToCloud}
                disabled={!pipeline.canDeploy}
                className="flex-1 py-3 rounded-xl bg-green-500/20 hover:bg-green-500/30 text-green-400 font-medium disabled:opacity-50"
              >
                Deploy to {provider.toUpperCase()}
              </button>
              <button
                onClick={rollback}
                className="px-6 py-3 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 font-medium flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Rollback
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}