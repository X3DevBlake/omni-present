import React, { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { GitBranch, Download, Upload, Save, Plus, Trash } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function BehaviorTreeEditor({ agentId }) {
  const [treeData, setTreeData] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const queryClient = useQueryClient();

  const { data: behaviorTree } = useQuery({
    queryKey: ['behavior-tree', agentId],
    queryFn: async () => {
      const trees = await base44.entities.AgentBehaviorTree.list();
      return trees.find(t => t.agent_id === agentId) || null;
    },
    enabled: !!agentId
  });

  React.useEffect(() => {
    if (behaviorTree) {
      setTreeData(behaviorTree);
    } else {
      setTreeData({
        agent_id: agentId,
        tree_name: 'Default Behavior',
        nodes: [],
        personality_config: {
          traits: {
            curiosity: 50,
            friendliness: 70,
            confidence: 60,
            caution: 50,
            creativity: 60
          },
          communication_style: 'professional',
          decision_making_style: 'analytical'
        },
        ethical_guidelines: [],
        learning_preferences: {
          learning_rate: 0.5,
          exploration_vs_exploitation: 0.5,
          feedback_sensitivity: 'medium',
          preferred_learning_sources: []
        }
      });
    }
  }, [behaviorTree, agentId]);

  const saveBehaviorTree = useMutation({
    mutationFn: async (data) => {
      if (behaviorTree?.id) {
        return await base44.entities.AgentBehaviorTree.update(behaviorTree.id, data);
      } else {
        return await base44.entities.AgentBehaviorTree.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['behavior-tree', agentId] });
      toast.success('Behavior tree saved successfully');
    }
  });

  const exportConfig = () => {
    const dataStr = JSON.stringify(treeData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `agent-${agentId}-behavior.json`;
    link.click();
  };

  const importConfig = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const imported = JSON.parse(event.target.result);
          setTreeData({ ...imported, agent_id: agentId });
          toast.success('Configuration imported');
        } catch (err) {
          toast.error('Invalid configuration file');
        }
      };
      reader.readAsText(file);
    }
  };

  const addNode = () => {
    const newNode = {
      id: `node_${Date.now()}`,
      type: 'sequence',
      name: 'New Node',
      children: [],
      config: {}
    };
    setTreeData({
      ...treeData,
      nodes: [...(treeData.nodes || []), newNode]
    });
  };

  const updatePersonalityTrait = (trait, value) => {
    setTreeData({
      ...treeData,
      personality_config: {
        ...treeData.personality_config,
        traits: {
          ...treeData.personality_config.traits,
          [trait]: value[0]
        }
      }
    });
  };

  const addEthicalGuideline = () => {
    const newGuideline = {
      guideline: '',
      priority: 'medium',
      enforcement: 'flexible'
    };
    setTreeData({
      ...treeData,
      ethical_guidelines: [...(treeData.ethical_guidelines || []), newGuideline]
    });
  };

  if (!treeData) return <div>Loading...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitBranch className="w-6 h-6 text-purple-500" />
            Behavior Tree Editor
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={exportConfig}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <label>
              <Button size="sm" variant="outline" as="span">
                <Upload className="w-4 h-4 mr-2" />
                Import
              </Button>
              <input
                type="file"
                accept=".json"
                onChange={importConfig}
                className="hidden"
              />
            </label>
            <Button size="sm" onClick={() => saveBehaviorTree.mutate(treeData)}>
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="personality">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="personality">Personality</TabsTrigger>
            <TabsTrigger value="ethics">Ethics</TabsTrigger>
            <TabsTrigger value="learning">Learning</TabsTrigger>
            <TabsTrigger value="tree">Tree</TabsTrigger>
          </TabsList>

          <TabsContent value="personality" className="space-y-6">
            <div>
              <h3 className="font-semibold mb-4">Personality Traits</h3>
              <div className="space-y-4">
                {Object.entries(treeData.personality_config.traits).map(([trait, value]) => (
                  <div key={trait}>
                    <div className="flex justify-between mb-2">
                      <label className="text-sm font-medium capitalize">{trait}</label>
                      <span className="text-sm text-gray-600">{value}</span>
                    </div>
                    <Slider
                      value={[value]}
                      onValueChange={(val) => updatePersonalityTrait(trait, val)}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold mb-2 block">Communication Style</label>
                <Select
                  value={treeData.personality_config.communication_style}
                  onValueChange={(val) => setTreeData({
                    ...treeData,
                    personality_config: {
                      ...treeData.personality_config,
                      communication_style: val
                    }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="formal">Formal</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="friendly">Friendly</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-semibold mb-2 block">Decision Making</label>
                <Select
                  value={treeData.personality_config.decision_making_style}
                  onValueChange={(val) => setTreeData({
                    ...treeData,
                    personality_config: {
                      ...treeData.personality_config,
                      decision_making_style: val
                    }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="analytical">Analytical</SelectItem>
                    <SelectItem value="intuitive">Intuitive</SelectItem>
                    <SelectItem value="collaborative">Collaborative</SelectItem>
                    <SelectItem value="decisive">Decisive</SelectItem>
                    <SelectItem value="cautious">Cautious</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="ethics" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">Ethical Guidelines</h3>
              <Button size="sm" onClick={addEthicalGuideline}>
                <Plus className="w-4 h-4 mr-2" />
                Add Guideline
              </Button>
            </div>

            <div className="space-y-3">
              {treeData.ethical_guidelines?.map((guideline, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-lg border bg-gradient-to-r from-blue-50 to-purple-50"
                >
                  <Input
                    value={guideline.guideline}
                    onChange={(e) => {
                      const updated = [...treeData.ethical_guidelines];
                      updated[idx].guideline = e.target.value;
                      setTreeData({ ...treeData, ethical_guidelines: updated });
                    }}
                    placeholder="Describe ethical guideline..."
                    className="mb-3"
                  />
                  
                  <div className="flex gap-3">
                    <Select
                      value={guideline.priority}
                      onValueChange={(val) => {
                        const updated = [...treeData.ethical_guidelines];
                        updated[idx].priority = val;
                        setTreeData({ ...treeData, ethical_guidelines: updated });
                      }}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="critical">Critical</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select
                      value={guideline.enforcement}
                      onValueChange={(val) => {
                        const updated = [...treeData.ethical_guidelines];
                        updated[idx].enforcement = val;
                        setTreeData({ ...treeData, ethical_guidelines: updated });
                      }}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="strict">Strict</SelectItem>
                        <SelectItem value="flexible">Flexible</SelectItem>
                        <SelectItem value="advisory">Advisory</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        const updated = treeData.ethical_guidelines.filter((_, i) => i !== idx);
                        setTreeData({ ...treeData, ethical_guidelines: updated });
                      }}
                    >
                      <Trash className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="learning" className="space-y-4">
            <div>
              <label className="text-sm font-semibold mb-2 block">Learning Rate</label>
              <div className="flex items-center gap-4">
                <Slider
                  value={[treeData.learning_preferences.learning_rate * 100]}
                  onValueChange={(val) => setTreeData({
                    ...treeData,
                    learning_preferences: {
                      ...treeData.learning_preferences,
                      learning_rate: val[0] / 100
                    }
                  })}
                  max={100}
                  step={1}
                  className="flex-1"
                />
                <span className="text-sm w-12 text-right">
                  {(treeData.learning_preferences.learning_rate * 100).toFixed(0)}%
                </span>
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold mb-2 block">
                Exploration vs Exploitation
              </label>
              <div className="flex items-center gap-4">
                <span className="text-xs">Exploit</span>
                <Slider
                  value={[treeData.learning_preferences.exploration_vs_exploitation * 100]}
                  onValueChange={(val) => setTreeData({
                    ...treeData,
                    learning_preferences: {
                      ...treeData.learning_preferences,
                      exploration_vs_exploitation: val[0] / 100
                    }
                  })}
                  max={100}
                  step={1}
                  className="flex-1"
                />
                <span className="text-xs">Explore</span>
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold mb-2 block">Feedback Sensitivity</label>
              <Select
                value={treeData.learning_preferences.feedback_sensitivity}
                onValueChange={(val) => setTreeData({
                  ...treeData,
                  learning_preferences: {
                    ...treeData.learning_preferences,
                    feedback_sensitivity: val
                  }
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          <TabsContent value="tree" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">Behavior Nodes</h3>
              <Button size="sm" onClick={addNode}>
                <Plus className="w-4 h-4 mr-2" />
                Add Node
              </Button>
            </div>

            <div className="space-y-2">
              {treeData.nodes?.map((node, idx) => (
                <div key={node.id} className="p-3 rounded border bg-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <GitBranch className="w-4 h-4 text-purple-500" />
                    <span className="font-medium">{node.name}</span>
                    <Badge variant="secondary">{node.type}</Badge>
                  </div>
                  <Button size="sm" variant="ghost">
                    <Trash className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}