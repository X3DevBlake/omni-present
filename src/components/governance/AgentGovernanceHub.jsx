import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, Ban, GitBranch, AlertTriangle, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function AgentGovernanceHub() {
  const [selectedAgents, setSelectedAgents] = useState([]);
  const queryClient = useQueryClient();

  const { data: agents } = useQuery({
    queryKey: ['agents'],
    queryFn: () => base44.entities.Agent.list()
  });

  const { data: rules } = useQuery({
    queryKey: ['governance-rules'],
    queryFn: () => base44.entities.AgentGovernanceRule.list()
  });

  const { data: violations } = useQuery({
    queryKey: ['governance-violations'],
    queryFn: async () => {
      // Simulate checking for violations
      return [
        { agent_id: 'agent1', rule: 'ethical_constraint', severity: 'medium', description: 'Attempted unauthorized data access' },
        { agent_id: 'agent2', rule: 'no_interaction', severity: 'low', description: 'Tried to communicate with restricted agent' }
      ];
    }
  });

  const createRule = useMutation({
    mutationFn: (data) => base44.entities.AgentGovernanceRule.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['governance-rules'] });
      toast.success('Governance rule created');
    }
  });

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-700/10 border-blue-500/30">
          <CardContent className="p-4">
            <Shield className="w-8 h-8 text-blue-500 mb-2" />
            <p className="text-2xl font-bold">{rules?.length || 0}</p>
            <p className="text-sm text-gray-600">Active Rules</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-500/10 to-red-700/10 border-red-500/30">
          <CardContent className="p-4">
            <AlertTriangle className="w-8 h-8 text-red-500 mb-2" />
            <p className="text-2xl font-bold">{violations?.length || 0}</p>
            <p className="text-sm text-gray-600">Violations</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500/10 to-green-700/10 border-green-500/30">
          <CardContent className="p-4">
            <CheckCircle className="w-8 h-8 text-green-500 mb-2" />
            <p className="text-2xl font-bold">98%</p>
            <p className="text-sm text-gray-600">Compliance Rate</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-700/10 border-purple-500/30">
          <CardContent className="p-4">
            <GitBranch className="w-8 h-8 text-purple-500 mb-2" />
            <p className="text-2xl font-bold">5</p>
            <p className="text-sm text-gray-600">Hierarchies</p>
          </CardContent>
        </Card>
      </div>

      {/* Create Rule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-500" />
            Create Governance Rule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <GovernanceRuleBuilder agents={agents} onCreate={(data) => createRule.mutate(data)} />
        </CardContent>
      </Card>

      {/* Active Rules */}
      <Card>
        <CardHeader>
          <CardTitle>Active Governance Rules</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {rules?.map((rule) => (
            <motion.div
              key={rule.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-lg border bg-gradient-to-r from-blue-50 to-purple-50"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold mb-1">{rule.rule_name}</h4>
                  <div className="flex gap-2 mb-2">
                    <Badge variant="secondary">{rule.rule_type}</Badge>
                    <Badge variant="outline">{rule.enforcement_level}</Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    Affects {rule.agent_ids?.length} agent(s)
                  </p>
                </div>
                <Badge variant={rule.is_active ? 'default' : 'secondary'}>
                  {rule.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </motion.div>
          ))}
        </CardContent>
      </Card>

      {/* Violations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-red-500" />
            Recent Violations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {violations?.map((violation, idx) => (
            <div key={idx} className="p-3 rounded-lg border bg-red-50">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-sm">{violation.description}</p>
                  <p className="text-xs text-gray-500">Agent: {violation.agent_id}</p>
                </div>
                <Badge variant="destructive">{violation.severity}</Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function GovernanceRuleBuilder({ agents, onCreate }) {
  const [ruleData, setRuleData] = useState({
    rule_name: '',
    rule_type: 'no_interaction',
    agent_ids: [],
    restricted_agents: [],
    enforcement_level: 'moderate'
  });

  const handleSubmit = () => {
    if (!ruleData.rule_name || ruleData.agent_ids.length === 0) {
      toast.error('Rule name and at least one agent required');
      return;
    }
    onCreate(ruleData);
    setRuleData({
      rule_name: '',
      rule_type: 'no_interaction',
      agent_ids: [],
      restricted_agents: [],
      enforcement_level: 'moderate'
    });
  };

  return (
    <div className="space-y-4 p-4 rounded-lg bg-blue-50 border border-blue-200">
      <Input
        value={ruleData.rule_name}
        onChange={(e) => setRuleData({ ...ruleData, rule_name: e.target.value })}
        placeholder="Rule name"
      />

      <Select value={ruleData.rule_type} onValueChange={(val) => setRuleData({ ...ruleData, rule_type: val })}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="no_interaction">🚫 No Interaction Rule</SelectItem>
          <SelectItem value="hierarchy">📊 Hierarchy Structure</SelectItem>
          <SelectItem value="ethical_constraint">⚖️ Ethical Constraint</SelectItem>
          <SelectItem value="resource_limit">💰 Resource Limit</SelectItem>
        </SelectContent>
      </Select>

      <Select value={ruleData.enforcement_level} onValueChange={(val) => setRuleData({ ...ruleData, enforcement_level: val })}>
        <SelectTrigger>
          <SelectValue placeholder="Enforcement Level" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="strict">Strict</SelectItem>
          <SelectItem value="moderate">Moderate</SelectItem>
          <SelectItem value="advisory">Advisory</SelectItem>
        </SelectContent>
      </Select>

      <Button onClick={handleSubmit} className="w-full">
        Create Rule
      </Button>
    </div>
  );
}