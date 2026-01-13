import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Bot, Sparkles, Zap, Code, Terminal } from 'lucide-react';
import { toast } from 'sonner';

export default function MistralAgentGenerator() {
  const [prompt, setPrompt] = useState('');
  const queryClient = useQueryClient();

  const generateAgentMutation = useMutation({
    mutationFn: async () => {
      // 1. Generate Agent Specs using LLM (Mistral via Core Integration)
      const specs = await base44.integrations.Core.InvokeLLM({
        prompt: `Create a comprehensive AI agent specification based on this request: "${prompt}".
        Return a JSON object matching this schema:
        {
          "agent_name": "string",
          "role": "string",
          "description": "string",
          "personality": { "traits": ["string"], "voice_tone": "string" },
          "skills": ["string"],
          "system_prompt": "string"
        }`,
        response_json_schema: {
          type: "object",
          properties: {
            agent_name: { type: "string" },
            role: { type: "string" },
            description: { type: "string" },
            personality: { type: "object" },
            skills: { type: "array", items: { type: "string" } },
            system_prompt: { type: "string" }
          },
          required: ["agent_name", "role", "system_prompt"]
        }
      });

      // 2. Create the Agent Entity
      return await base44.entities.Agent.create({
        agent_name: specs.agent_name,
        role: specs.role,
        description: specs.description,
        personality: specs.personality,
        skills: specs.skills,
        status: 'idle',
        omni_budget: 100, // Default starter budget
        perception_rate: 'realtime'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['agents']);
      toast.success('Mistral has successfully generated and deployed your agent!');
      setPrompt('');
    },
    onError: (err) => {
      toast.error('Failed to generate agent: ' + err.message);
    }
  });

  return (
    <Card className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 border-indigo-500/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-cyan-400" />
          Mistral Agent Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-white/70 text-sm">
          Describe the agent you want. Mistral will architect its personality, skills, and system prompts automatically.
        </p>
        <div className="space-y-2">
          <Textarea
            placeholder="e.g., A sarcastic financial advisor who specializes in crypto arbitrage and quotes Shakespeare..."
            className="bg-black/30 border-white/10 text-white min-h-[120px]"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
        </div>
        <Button
          onClick={() => generateAgentMutation.mutate()}
          disabled={!prompt || generateAgentMutation.isPending}
          className="w-full bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white py-6"
        >
          {generateAgentMutation.isPending ? (
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 animate-spin" /> Generating Neural Pathways...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5" /> Generate Agent
            </div>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}