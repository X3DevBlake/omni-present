import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Zap, Shield, Users, Settings, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function DeploymentPipelineBuilder({ listingId, onComplete }) {
  const [pipelineName, setPipelineName] = useState('');
  const [config, setConfig] = useState({
    auto_governance: true,
    governance_rules: [
      { rule_type: 'ethical_constraint', enforcement: 'moderate' }
    ],
    orchestration_templates: [
      { template_name: 'Default Workflow', auto_add: true }
    ],
    integration_steps: [
      { step: 'Initialize Agent', auto_execute: true },
      { step: 'Apply Governance', auto_execute: true },
      { step: 'Join Orchestration', auto_execute: false }
    ],
    initial_training: false
  });
  const queryClient = useQueryClient();

  const createPipeline = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.DeploymentPipeline.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deployment-pipelines'] });
      toast.success('Deployment pipeline created');
    }
  });

  const deployAgent = useMutation({
    mutationFn: async (pipelineId) => {
      // Simulate deployment process
      const steps = config.integration_steps.filter(s => s.auto_execute);
      
      for (const step of steps) {
        await new Promise(resolve => setTimeout(resolve, 500));
        toast.info(`Executing: ${step.step}`);
      }
      
      // Create the agent
      const agent = await base44.entities.Agent.create({
        name: `Deployed Agent ${Date.now()}`,
        type: 'marketplace',
        status: 'active'
      });

      // Apply governance rules if enabled
      if (config.auto_governance) {
        for (const rule of config.governance_rules) {
          await base44.entities.AgentGovernanceRule.create({
            rule_name: `Auto-generated ${rule.rule_type}`,
            rule_type: rule.rule_type,
            agent_ids: [agent.id],
            enforcement_level: rule.enforcement
          });
        }
      }

      // Create orchestration workflows
      for (const template of config.orchestration_templates) {
        if (template.auto_add) {
          await base44.entities.TeamOrchestration.create({
            name: template.template_name,
            team_agents: [agent.id],
            status: 'draft'
          });
        }
      }

      return agent;
    },
    onSuccess: (agent) => {
      toast.success(`Agent deployed successfully!`);
      onComplete?.(agent);
    }
  });

  const handleCreateAndDeploy = async () => {
    if (!pipelineName) {
      toast.error('Pipeline name required');
      return;
    }

    const pipeline = await createPipeline.mutateAsync({
      pipeline_name: pipelineName,
      agent_listing_id: listingId,
      deployment_config: config,
      status: 'ready'
    });

    await deployAgent.mutateAsync(pipeline.id);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-purple-500" />
            Deployment Pipeline Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-semibold mb-2 block">Pipeline Name</label>
            <Input
              value={pipelineName}
              onChange={(e) => setPipelineName(e.target.value)}
              placeholder="e.g., Production Deployment"
            />
          </div>

          {/* Auto Governance */}
          <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-purple-500" />
                <h4 className="font-semibold">Auto-Setup Governance</h4>
              </div>
              <Switch
                checked={config.auto_governance}
                onCheckedChange={(val) => setConfig({ ...config, auto_governance: val })}
              />
            </div>
            {config.auto_governance && (
              <div className="space-y-2">
                {config.governance_rules.map((rule, i) => (
                  <div key={i} className="p-3 rounded border bg-white">
                    <Badge variant="secondary">{rule.rule_type}</Badge>
                    <Badge variant="outline" className="ml-2">{rule.enforcement}</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Orchestration Templates */}
          <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-5 h-5 text-blue-500" />
              <h4 className="font-semibold">Team Orchestration Setup</h4>
            </div>
            <div className="space-y-2">
              {config.orchestration_templates.map((template, i) => (
                <div key={i} className="p-3 rounded border bg-white flex justify-between items-center">
                  <span className="font-medium">{template.template_name}</span>
                  <Badge variant={template.auto_add ? 'default' : 'secondary'}>
                    {template.auto_add ? 'Auto-add' : 'Manual'}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Integration Steps */}
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <div className="flex items-center gap-2 mb-3">
              <Settings className="w-5 h-5 text-green-500" />
              <h4 className="font-semibold">Integration Steps</h4>
            </div>
            <div className="space-y-2">
              {config.integration_steps.map((step, i) => (
                <div key={i} className="p-3 rounded border bg-white flex justify-between items-center">
                  <span>{step.step}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant={step.auto_execute ? 'default' : 'outline'}>
                      {step.auto_execute ? 'Auto' : 'Manual'}
                    </Badge>
                    {step.auto_execute && <CheckCircle className="w-4 h-4 text-green-500" />}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Initial Training */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-orange-50 border border-orange-200">
            <div>
              <h4 className="font-semibold">Initial Training</h4>
              <p className="text-sm text-gray-600">Run training session after deployment</p>
            </div>
            <Switch
              checked={config.initial_training}
              onCheckedChange={(val) => setConfig({ ...config, initial_training: val })}
            />
          </div>

          <Button 
            onClick={handleCreateAndDeploy} 
            className="w-full"
            disabled={createPipeline.isPending || deployAgent.isPending}
          >
            <Zap className="w-4 h-4 mr-2" />
            {deployAgent.isPending ? 'Deploying...' : 'Create Pipeline & Deploy'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}