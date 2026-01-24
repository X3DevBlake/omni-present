import React, { useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Sparkles, Plus, Brain, Award } from 'lucide-react';
import { toast } from 'sonner';

export default function ProactiveCollaboratorSuggester({ projectId }) {
  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      const projects = await base44.entities.ResearchProject.filter({ project_id: projectId });
      return projects[0];
    },
    enabled: !!projectId
  });

  const suggestCollaboratorsMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('aiResearchAssistantAgent', {
        action: 'suggest_research_collaborators',
        project_id: projectId
      });
      return response.data;
    }
  });

  const discoverPapersMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('aiResearchAssistantAgent', {
        action: 'literature_review',
        query: project?.title
      });
      return response.data;
    }
  });

  // Proactively suggest collaborators when project is active
  useEffect(() => {
    if (project && project.status === 'active' && !suggestCollaboratorsMutation.data) {
      const timer = setTimeout(() => {
        suggestCollaboratorsMutation.mutate();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [project]);

  const suggestions = suggestCollaboratorsMutation.data?.suggested_collaborators || [];
  const papers = discoverPapersMutation.data?.literature_review?.key_papers || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Suggested Collaborators */}
      <Card className="bg-white/10 backdrop-blur-xl border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-400" />
            AI-Suggested Collaborators
          </CardTitle>
        </CardHeader>
        <CardContent>
          {suggestCollaboratorsMutation.isPending ? (
            <div className="flex items-center gap-2 text-gray-400">
              <Sparkles className="w-4 h-4 animate-pulse" />
              <span className="text-sm">Analyzing research networks...</span>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {suggestions.map((collab, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-white/5 p-4 rounded-lg border border-white/10"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-semibold text-white">{collab.user_id}</div>
                        <div className="text-xs text-gray-400">
                          {collab.research_interests?.slice(0, 3).join(', ')}
                        </div>
                      </div>
                      <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                        <Plus className="w-3 h-3 mr-1" />
                        Invite
                      </Button>
                    </div>
                    <div className="flex gap-2 mt-2">
                      {collab.publications?.slice(0, 2).map((pub, i) => (
                        <Badge key={i} variant="outline" className="text-xs border-purple-400/30 text-purple-300">
                          <Award className="w-3 h-3 mr-1" />
                          {pub.title?.substring(0, 20)}...
                        </Badge>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {suggestions.length === 0 && !suggestCollaboratorsMutation.isPending && (
                <Button
                  onClick={() => suggestCollaboratorsMutation.mutate()}
                  variant="outline"
                  className="w-full border-white/20 text-white"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Find Collaborators
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Relevant Research Papers */}
      <Card className="bg-white/10 backdrop-blur-xl border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Brain className="w-5 h-5 text-blue-400" />
            Relevant Research Papers
          </CardTitle>
        </CardHeader>
        <CardContent>
          {discoverPapersMutation.isPending ? (
            <div className="flex items-center gap-2 text-gray-400">
              <Sparkles className="w-4 h-4 animate-pulse" />
              <span className="text-sm">Discovering relevant papers...</span>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {papers.map((paper, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-white/5 p-4 rounded-lg border border-white/10"
                  >
                    <div className="font-semibold text-white text-sm mb-1">
                      {paper.title}
                    </div>
                    <div className="text-xs text-gray-400 mb-2">
                      {paper.authors} ({paper.year})
                    </div>
                    <p className="text-xs text-gray-300">{paper.key_findings}</p>
                  </motion.div>
                ))}
              </AnimatePresence>

              {papers.length === 0 && !discoverPapersMutation.isPending && (
                <Button
                  onClick={() => discoverPapersMutation.mutate()}
                  variant="outline"
                  className="w-full border-white/20 text-white"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Discover Papers
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}