import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, MessageSquare, Zap, CheckCircle, FileText } from 'lucide-react';
import { toast } from 'sonner';

export default function MultiAgentResearchDialogue({ projectId }) {
  const [hypothesis, setHypothesis] = useState('');
  const [dialogue, setDialogue] = useState([]);
  const queryClient = useQueryClient();

  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      const projects = await base44.entities.ResearchProject.filter({ project_id: projectId });
      return projects[0];
    },
    enabled: !!projectId
  });

  const refineHypothesisMutation = useMutation({
    mutationFn: async () => {
      // Get agent perspectives
      const agentPerspectives = await Promise.all(
        (project?.ai_assistants || []).map(async (agentId) => {
          const response = await base44.integrations.Core.InvokeLLM({
            prompt: `As research AI agent ${agentId}, provide your perspective on this hypothesis:
            
            "${hypothesis}"
            
            Consider: methodology, feasibility, theoretical foundation, and potential impact.`
          });
          return response;
        })
      );

      // Refine through dialogue
      const response = await base44.functions.invoke('multiAgentResearchCollaborator', {
        action: 'refine_hypothesis_dialogue',
        current_hypothesis: hypothesis,
        agent_perspectives: agentPerspectives
      });
      
      return response.data;
    },
    onSuccess: (data) => {
      setDialogue([
        ...dialogue,
        { type: 'hypothesis', content: hypothesis, timestamp: new Date() },
        { type: 'refinement', content: data.refined_hypothesis, timestamp: new Date(), data }
      ]);
      setHypothesis(data.refined_hypothesis);
      toast.success('Hypothesis refined through multi-agent dialogue!');
    }
  });

  const coAuthorSectionMutation = useMutation({
    mutationFn: async (sectionTopic) => {
      const response = await base44.functions.invoke('multiAgentResearchCollaborator', {
        action: 'co_author_section',
        project_id: projectId,
        section_topic: sectionTopic,
        lead_agent_id: project?.ai_assistants?.[0],
        supporting_agent_ids: project?.ai_assistants?.slice(1),
        outline: 'Introduction, methodology, findings, discussion'
      });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(`Section co-authored by ${data.contributing_agents?.length} AI agents!`);
    }
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Hypothesis Refinement */}
      <Card className="bg-white/10 backdrop-blur-xl border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-400" />
            Multi-Agent Hypothesis Refinement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Textarea
              placeholder="Enter your research hypothesis..."
              value={hypothesis}
              onChange={(e) => setHypothesis(e.target.value)}
              className="bg-white/10 border-white/20 text-white min-h-[100px]"
            />

            <Button
              onClick={() => refineHypothesisMutation.mutate()}
              disabled={refineHypothesisMutation.isPending || !hypothesis.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <Zap className="w-4 h-4 mr-2" />
              {refineHypothesisMutation.isPending ? 'AI Agents Deliberating...' : 'Refine with AI Dialogue'}
            </Button>

            {/* Dialogue History */}
            <div className="bg-black/40 rounded-lg p-4 max-h-64 overflow-y-auto space-y-3">
              <AnimatePresence>
                {dialogue.map((entry, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-3 rounded-lg ${
                      entry.type === 'hypothesis' 
                        ? 'bg-blue-500/20 border border-blue-500/30' 
                        : 'bg-green-500/20 border border-green-500/30'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {entry.type === 'hypothesis' ? (
                        <Bot className="w-4 h-4 text-blue-400" />
                      ) : (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      )}
                      <span className="text-xs text-gray-400">
                        {entry.type === 'hypothesis' ? 'Original' : 'AI Refined'}
                      </span>
                    </div>
                    <p className="text-sm text-white">{entry.content}</p>
                    
                    {entry.data?.consensus_score && (
                      <Badge className="mt-2 bg-purple-500">
                        Consensus: {(entry.data.consensus_score * 100).toFixed(0)}%
                      </Badge>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Co-Authoring */}
      <Card className="bg-white/10 backdrop-blur-xl border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-400" />
            AI Co-Authoring System
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-300">
              AI agents can autonomously co-author sections of your research paper
            </p>

            <div className="space-y-2">
              {['Introduction', 'Literature Review', 'Methodology', 'Discussion'].map((section) => (
                <Button
                  key={section}
                  variant="outline"
                  className="w-full justify-start border-white/20 text-white hover:bg-white/10"
                  onClick={() => coAuthorSectionMutation.mutate(section)}
                  disabled={coAuthorSectionMutation.isPending}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Co-Author: {section}
                </Button>
              ))}
            </div>

            {coAuthorSectionMutation.data && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-500/10 border border-green-500/30 rounded-lg p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="font-semibold text-white">Section Generated!</span>
                </div>
                <p className="text-xs text-gray-300 mb-2">
                  Co-authored by {coAuthorSectionMutation.data.contributing_agents?.length} AI agents
                </p>
                <div className="bg-black/40 rounded p-3 max-h-40 overflow-y-auto">
                  <p className="text-sm text-white">
                    {coAuthorSectionMutation.data.final_section?.substring(0, 200)}...
                  </p>
                </div>
                <Button size="sm" className="mt-3 bg-purple-600 hover:bg-purple-700">
                  View Full Section
                </Button>
              </motion.div>
            )}

            {/* Agent Activity */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <h4 className="font-semibold text-white mb-2 text-sm">Active AI Agents</h4>
              <div className="space-y-2">
                {project?.ai_assistants?.map((agentId, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <span className="text-gray-300">{agentId.substring(0, 15)}...</span>
                    <Badge className="bg-green-500">Active</Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}