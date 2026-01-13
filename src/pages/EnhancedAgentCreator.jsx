import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import BehaviorTreeEditor from '../components/agents/BehaviorTreeEditor';
import { Sparkles, Save } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function EnhancedAgentCreator() {
  const [agentData, setAgentData] = useState({
    name: '',
    skills: [],
    omni_budget: 0,
    status: 'idle'
  });
  const [createdAgentId, setCreatedAgentId] = useState(null);
  const queryClient = useQueryClient();

  const createAgent = useMutation({
    mutationFn: (data) => base44.entities.Agent.create(data),
    onSuccess: (agent) => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      setCreatedAgentId(agent.id);
      toast.success('Agent created successfully! Now configure its behavior.');
    }
  });

  const handleCreateAgent = () => {
    if (!agentData.name) {
      toast.error('Please enter an agent name');
      return;
    }
    createAgent.mutate(agentData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <Sparkles className="w-10 h-10 text-purple-500" />
            Enhanced Agent Creator
          </h1>
          <p className="text-gray-600">
            Create intelligent agents with custom personalities, ethical guidelines, and learning preferences
          </p>
        </motion.div>

        {!createdAgentId ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Step 1: Basic Agent Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-semibold mb-2 block">Agent Name</label>
                  <Input
                    value={agentData.name}
                    onChange={(e) => setAgentData({ ...agentData, name: e.target.value })}
                    placeholder="e.g., Financial Analyst, Research Assistant"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold mb-2 block">Skills (comma-separated)</label>
                  <Textarea
                    value={agentData.skills?.join(', ')}
                    onChange={(e) => setAgentData({
                      ...agentData,
                      skills: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                    })}
                    placeholder="data analysis, market research, report generation"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold mb-2 block">Initial Omni Budget</label>
                  <Input
                    type="number"
                    value={agentData.omni_budget}
                    onChange={(e) => setAgentData({ ...agentData, omni_budget: parseFloat(e.target.value) })}
                    placeholder="1000"
                  />
                </div>

                <Button
                  onClick={handleCreateAgent}
                  disabled={createAgent.isPending}
                  className="w-full"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {createAgent.isPending ? 'Creating...' : 'Create Agent & Configure Behavior'}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <BehaviorTreeEditor agentId={createdAgentId} />
            
            <Card className="mt-6">
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-lg font-semibold text-green-600 mb-2">
                    ✓ Agent Created Successfully!
                  </p>
                  <p className="text-gray-600 mb-4">
                    Configure the behavior tree, personality, ethics, and learning preferences above, then save.
                  </p>
                  <Button onClick={() => {
                    setCreatedAgentId(null);
                    setAgentData({ name: '', skills: [], omni_budget: 0, status: 'idle' });
                  }}>
                    Create Another Agent
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}