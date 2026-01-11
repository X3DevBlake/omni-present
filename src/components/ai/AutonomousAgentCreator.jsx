import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Sparkles, Zap, Brain, CheckCircle, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function AutonomousAgentCreator({ userEmail }) {
  const [agentGoal, setAgentGoal] = useState('');
  const [agentContext, setAgentContext] = useState('');
  const [generatedAgent, setGeneratedAgent] = useState(null);
  const queryClient = useQueryClient();

  const createAgent = useMutation({
    mutationFn: async () => {
      const agentSpec = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an AI agent architect. Create a comprehensive agent specification based on:

Goal: ${agentGoal}
Context: ${agentContext}

Generate a complete agent configuration including:
1. Agent name and type (trader, analyst, explorer, strategist, etc.)
2. Personality traits (risk tolerance, decision style, communication approach)
3. Initial skills (3-5 relevant skills with categories)
4. Behavior tree structure (goals, decision nodes)
5. Memory configuration (what to remember, importance weights)
6. Training recommendations
7. Recommended integrations and tools

Return ONLY valid JSON matching this schema.`,
        response_json_schema: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            agent_type: { type: 'string' },
            personality: {
              type: 'object',
              properties: {
                risk_tolerance: { type: 'string' },
                decision_style: { type: 'string' },
                communication_style: { type: 'string' }
              }
            },
            skills: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  skill_name: { type: 'string' },
                  category: { type: 'string' },
                  proficiency: { type: 'number' }
                }
              }
            },
            behavior_tree: {
              type: 'object',
              properties: {
                goals: { type: 'array', items: { type: 'string' } },
                decision_nodes: { type: 'array', items: { type: 'object' } }
              }
            },
            memory_config: {
              type: 'object',
              properties: {
                focus_areas: { type: 'array', items: { type: 'string' } },
                importance_weights: { type: 'object' }
              }
            },
            training_plan: { type: 'array', items: { type: 'string' } },
            recommended_tools: { type: 'array', items: { type: 'string' } }
          }
        }
      });

      // Create the agent entity
      const agent = await base44.entities.Agent.create({
        user_email: userEmail,
        name: agentSpec.name,
        agent_type: agentSpec.agent_type || 'custom',
        personality: agentSpec.personality,
        status: 'active'
      });

      // Create agent skills
      if (agentSpec.skills && agentSpec.skills.length > 0) {
        await Promise.all(agentSpec.skills.map(skill =>
          base44.entities.AgentSkill.create({
            agent_id: agent.id,
            skill_name: skill.skill_name,
            category: skill.category,
            proficiency: skill.proficiency || 0
          })
        ));
      }

      // Create behavior tree
      if (agentSpec.behavior_tree) {
        await base44.entities.AgentBehaviorTree.create({
          agent_id: agent.id,
          tree_name: `${agentSpec.name}_behavior`,
          tree_structure: agentSpec.behavior_tree
        });
      }

      // Create agent memory store
      await base44.entities.AgentMemoryStore.create({
        agent_id: agent.id,
        memory_content: agentSpec.memory_config || {},
        memory_type: 'system',
        importance: 1.0
      });

      // Create agent goals
      if (agentSpec.behavior_tree?.goals) {
        await Promise.all(agentSpec.behavior_tree.goals.slice(0, 3).map((goal, idx) =>
          base44.entities.AgentGoal.create({
            agent_id: agent.id,
            goal_description: goal,
            priority: idx + 1,
            status: 'active'
          })
        ));
      }

      return { agent, spec: agentSpec };
    },
    onSuccess: (data) => {
      setGeneratedAgent(data);
      queryClient.invalidateQueries({ queryKey: ['agents'] });
    }
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3 mb-4">
        <Sparkles className="w-6 h-6 text-purple-400" />
        <h3 className="text-2xl font-bold text-white">Autonomous Agent Creator</h3>
      </div>

      <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-500/30 rounded-xl p-6 space-y-4">
        <div className="space-y-2">
          <label className="text-white font-bold flex items-center gap-2">
            <Target className="w-4 h-4" />
            Agent Goal
          </label>
          <Input
            placeholder="What should this agent accomplish? (e.g., 'Analyze crypto markets and execute trades')"
            value={agentGoal}
            onChange={(e) => setAgentGoal(e.target.value)}
            className="bg-white/5 border-white/10 text-white"
          />
        </div>

        <div className="space-y-2">
          <label className="text-white font-bold flex items-center gap-2">
            <Brain className="w-4 h-4" />
            Context & Preferences
          </label>
          <Textarea
            placeholder="Additional context, preferences, constraints... (e.g., 'Conservative risk profile, focus on long-term growth, integrate with market data feeds')"
            value={agentContext}
            onChange={(e) => setAgentContext(e.target.value)}
            className="bg-white/5 border-white/10 text-white min-h-[120px]"
          />
        </div>

        <Button
          onClick={() => createAgent.mutate()}
          disabled={!agentGoal.trim() || createAgent.isPending}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          size="lg"
        >
          {createAgent.isPending ? (
            <>
              <Sparkles className="w-5 h-5 mr-2 animate-spin" />
              Creating Agent...
            </>
          ) : (
            <>
              <Zap className="w-5 h-5 mr-2" />
              Generate Agent
            </>
          )}
        </Button>
      </div>

      {generatedAgent && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border border-green-500/30 rounded-xl p-6 space-y-4"
        >
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="w-6 h-6 text-green-400" />
            <h4 className="text-xl font-bold text-white">Agent Created Successfully!</h4>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-black/30 rounded-lg p-4">
              <p className="text-white/60 text-xs mb-1">Name</p>
              <p className="text-white font-bold">{generatedAgent.spec.name}</p>
            </div>
            <div className="bg-black/30 rounded-lg p-4">
              <p className="text-white/60 text-xs mb-1">Type</p>
              <p className="text-white font-bold">{generatedAgent.spec.agent_type}</p>
            </div>
          </div>

          <div className="bg-black/30 rounded-lg p-4">
            <p className="text-white font-bold mb-2">Personality</p>
            <div className="space-y-1 text-sm">
              <p className="text-white/70">Risk: {generatedAgent.spec.personality?.risk_tolerance}</p>
              <p className="text-white/70">Style: {generatedAgent.spec.personality?.decision_style}</p>
              <p className="text-white/70">Communication: {generatedAgent.spec.personality?.communication_style}</p>
            </div>
          </div>

          <div className="bg-black/30 rounded-lg p-4">
            <p className="text-white font-bold mb-2">Skills ({generatedAgent.spec.skills?.length || 0})</p>
            <div className="flex flex-wrap gap-2">
              {generatedAgent.spec.skills?.slice(0, 5).map((skill, idx) => (
                <span key={idx} className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs">
                  {skill.skill_name}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-black/30 rounded-lg p-4">
            <p className="text-white font-bold mb-2">Recommended Tools</p>
            <div className="flex flex-wrap gap-2">
              {generatedAgent.spec.recommended_tools?.slice(0, 4).map((tool, idx) => (
                <span key={idx} className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
                  {tool}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-black/30 rounded-lg p-4">
            <p className="text-white font-bold mb-2">Training Plan</p>
            <ul className="space-y-1 text-sm text-white/70">
              {generatedAgent.spec.training_plan?.slice(0, 3).map((step, idx) => (
                <li key={idx}>• {step}</li>
              ))}
            </ul>
          </div>

          <Button
            onClick={() => setGeneratedAgent(null)}
            variant="outline"
            className="w-full"
          >
            Create Another Agent
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}