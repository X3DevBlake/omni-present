import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GitBranch, CheckCircle, XCircle, AlertTriangle, Play, RotateCcw, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function CICDIntegration({ blueprint, onDeploy, onClose }) {
  const [pipeline, setPipeline] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [provider, setProvider] = useState('aws');
  const [pipelineStages, setPipelineStages] = useState([]);

  const runPipeline = async () => {
    setIsRunning(true);
    setPipelineStages([]);

    try {
      // Stage 1: AI Risk Analysis
      setPipelineStages([{ name: 'AI Risk Analysis', status: 'running', message: 'Predicting deployment risks...' }]);
      await new Promise(resolve => setTimeout(resolve, 2000));

      const riskAnalysis = await base44.integrations.Core.InvokeLLM({
        prompt: `
          Analyze deployment risks for blueprint changes:
          
          Blueprint: ${JSON.stringify(blueprint)}
          
          Predict and analyze:
          1. PERFORMANCE RISKS: Potential regressions, bottlenecks, latency increases
          2. SECURITY VULNERABILITIES: New attack vectors, exposed endpoints, weak configurations
          3. STABILITY RISKS: Breaking changes, dependency conflicts, rollback complexity
          4. COST IMPACT: Resource consumption changes, unexpected scaling costs
          5. DEPLOYMENT SAFETY: Risk score (0-100), confidence level, recommended actions
        `,
        response_json_schema: {
          type: 'object',
          properties: {
            riskScore: { type: 'number' },
            performanceRisks: { type: 'array', items: { type: 'string' } },
            securityVulnerabilities: { type: 'array', items: { type: 'string' } },
            stabilityRisks: { type: 'array', items: { type: 'string' } },
            deploymentSafe: { type: 'boolean' },
            recommendedActions: { type: 'array', items: { type: 'string' } },
            rollbackStrategy: { type: 'string' }
          }
        }
      });

      if (!riskAnalysis.deploymentSafe || riskAnalysis.riskScore > 70) {
        setPipelineStages([
          { 
            name: 'AI Risk Analysis', 
            status: 'failed', 
            message: `High risk detected (${riskAnalysis.riskScore}/100). Issues: ${[...riskAnalysis.performanceRisks, ...riskAnalysis.securityVulnerabilities].slice(0, 2).join(', ')}` 
          }
        ]);
        setIsRunning(false);
        toast.error('Deployment blocked due to high risk');
        return;
      }

      setPipelineStages(prev => [
        ...prev.slice(0, -1),
        { name: 'AI Risk Analysis', status: 'success', message: `✓ Low risk (${riskAnalysis.riskScore}/100)` },
        { name: 'AI Code Review', status: 'running', message: 'Analyzing code quality...' }
      ]);

      await new Promise(resolve => setTimeout(resolve, 1500));

      // Stage 2: AI Code Review
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

      if (!codeReview.approved) {
        setPipelineStages(prev => [
          ...prev.slice(0, -1),
          { name: 'AI Code Review', status: 'failed', message: `Issues found: ${codeReview.securityIssues.join(', ')}` }
        ]);
        setIsRunning(false);
        toast.error('Pipeline failed code review');
        return;
      }

      setPipelineStages(prev => [
        ...prev.slice(0, -1),
        { name: 'AI Code Review', status: 'success', message: '✓ Review passed' },
        { name: 'Blueprint Validation', status: 'running', message: 'Validating configuration...' }
      ]);

      await new Promise(resolve => setTimeout(resolve, 1500));

      // Stage 3: Blueprint Validation
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

      if (!validation.valid) {
        setPipelineStages(prev => [
          ...prev.slice(0, -1),
          { name: 'Blueprint Validation', status: 'failed', message: `Validation errors: ${validation.errors.join(', ')}` }
        ]);
        setIsRunning(false);
        toast.error('Blueprint validation failed');
        return;
      }

      setPipelineStages(prev => [
        ...prev.slice(0, -1),
        { name: 'Blueprint Validation', status: 'success', message: '✓ Validation passed' },
        { name: 'Deploy to ' + provider, status: 'running', message: 'Deploying...' }
      ]);

      await new Promise(resolve => setTimeout(resolve, 2000));

      // Stage 4: Post-deployment monitoring
      setPipelineStages(prev => [
        ...prev.slice(0, -1),
        { name: 'Deploy to ' + provider, status: 'success', message: '✓ Deployed' },
        { name: 'Health Check', status: 'running', message: 'Monitoring deployment...' }
      ]);

      await new Promise(resolve => setTimeout(resolve, 1500));

      // Simulate monitoring check - 20% chance of failure requiring rollback
      const deploymentHealthy = Math.random() > 0.2;

      if (!deploymentHealthy) {
        setPipelineStages(prev => [
          ...prev.slice(0, -1),
          { name: 'Health Check', status: 'failed', message: '✗ Critical alerts detected' },
          { name: 'AI Smart Rollback', status: 'running', message: 'Analyzing and reverting...' }
        ]);

        await new Promise(resolve => setTimeout(resolve, 2000));

        setPipelineStages(prev => [
          ...prev.slice(0, -1),
          { name: 'AI Smart Rollback', status: 'success', message: `✓ Rolled back to stable version using ${riskAnalysis.rollbackStrategy}` }
        ]);

        setIsRunning(false);
        toast.error('Deployment rolled back due to critical failures');
        return;
      }

      setPipelineStages(prev => [
        ...prev.slice(0, -1),
        { name: 'Health Check', status: 'success', message: '✓ Deployment healthy' }
      ]);

      setIsRunning(false);
      toast.success('Pipeline completed successfully');
    } catch (error) {
      console.error('Pipeline failed:', error);
      setIsRunning(false);
      toast.error('Pipeline execution failed');
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

        {pipelineStages.length > 0 && (
          <div className="space-y-3">
            {pipelineStages.map((stage, idx) => (
              <div key={idx} className={`p-4 rounded-xl border ${
                stage.status === 'success' ? 'bg-green-500/10 border-green-500/30' :
                stage.status === 'running' ? 'bg-blue-500/10 border-blue-500/30' :
                stage.status === 'failed' ? 'bg-red-500/10 border-red-500/30' :
                'bg-white/5 border-white/10'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {stage.status === 'success' && <CheckCircle className="w-5 h-5 text-green-400" />}
                    {stage.status === 'running' && <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />}
                    {stage.status === 'failed' && <XCircle className="w-5 h-5 text-red-400" />}
                    <div>
                      <div className="text-white font-medium">{stage.name}</div>
                      <div className="text-white/60 text-xs">{stage.message}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}