import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Brain, Target, TrendingUp, BookOpen, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AgentTutoringDashboard({ agentId }) {
  const queryClient = useQueryClient();
  const [selectedSession, setSelectedSession] = useState(null);

  const { data: sessions } = useQuery({
    queryKey: ['tutoring-sessions', agentId],
    queryFn: () => base44.entities.AgentTutoringSession.filter({ agent_id: agentId }, '-created_date', 20)
  });

  const identifyGaps = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('identifySkillGaps', { agent_id: agentId });
      return response.data;
    }
  });

  const createSession = useMutation({
    mutationFn: async (skillGaps) => {
      const response = await base44.functions.invoke('generateTutoringSession', {
        agent_id: agentId,
        skill_gaps: skillGaps,
        session_name: `AI Tutoring - ${new Date().toLocaleDateString()}`
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tutoring-sessions'] });
    }
  });

  const handleStartTutoring = async () => {
    const gaps = await identifyGaps.mutateAsync();
    if (gaps.skill_gaps) {
      await createSession.mutateAsync(gaps.skill_gaps);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">AI Tutoring System</h2>
          <p className="text-white/60">Personalized agent development & skill enhancement</p>
        </div>
        <Button
          onClick={handleStartTutoring}
          disabled={identifyGaps.isPending || createSession.isPending}
          className="bg-gradient-to-r from-purple-600 to-pink-600"
        >
          <Brain className="w-4 h-4 mr-2" />
          Start New Session
        </Button>
      </div>

      {identifyGaps.isPending && (
        <Card className="bg-blue-500/20 border-blue-500/30">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="animate-spin w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full" />
              <span className="text-blue-300">Analyzing agent performance and identifying skill gaps...</span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/30">
          <CardContent className="p-4">
            <BookOpen className="w-6 h-6 text-purple-400 mb-2" />
            <p className="text-2xl font-bold text-white">{sessions?.length || 0}</p>
            <p className="text-white/60 text-sm">Total Sessions</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/30">
          <CardContent className="p-4">
            <CheckCircle2 className="w-6 h-6 text-green-400 mb-2" />
            <p className="text-2xl font-bold text-white">
              {sessions?.filter(s => s.session_status === 'completed').length || 0}
            </p>
            <p className="text-white/60 text-sm">Completed</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border-orange-500/30">
          <CardContent className="p-4">
            <Target className="w-6 h-6 text-orange-400 mb-2" />
            <p className="text-2xl font-bold text-white">
              {sessions?.filter(s => s.session_status === 'active').length || 0}
            </p>
            <p className="text-white/60 text-sm">In Progress</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-cyan-500/30">
          <CardContent className="p-4">
            <TrendingUp className="w-6 h-6 text-cyan-400 mb-2" />
            <p className="text-2xl font-bold text-white">
              {sessions?.[0]?.performance_improvement?.improvement_percentage?.toFixed(0) || 0}%
            </p>
            <p className="text-white/60 text-sm">Avg Improvement</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {sessions?.map((session) => (
          <motion.div
            key={session.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            layout
          >
            <Card className="bg-white/5 border-white/10 hover:border-purple-500/50 transition-all cursor-pointer"
              onClick={() => setSelectedSession(session)}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-lg">{session.session_name}</CardTitle>
                  <Badge className={
                    session.session_status === 'completed' ? 'bg-green-500' :
                    session.session_status === 'active' ? 'bg-blue-500' : 'bg-gray-500'
                  }>
                    {session.session_status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white/60 text-sm">Progress</span>
                    <span className="text-purple-400 font-bold">{session.progress_percentage?.toFixed(0)}%</span>
                  </div>
                  <Progress value={session.progress_percentage || 0} className="h-2" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-black/30 rounded p-2">
                    <div className="text-white/60 text-xs">Exercises</div>
                    <div className="text-white font-bold">
                      {session.training_exercises?.filter(e => e.completion_status === 'completed').length || 0}/
                      {session.training_exercises?.length || 0}
                    </div>
                  </div>
                  <div className="bg-black/30 rounded p-2">
                    <div className="text-white/60 text-xs">Improvement</div>
                    <div className="text-green-400 font-bold">
                      +{session.performance_improvement?.improvement_percentage?.toFixed(0) || 0}%
                    </div>
                  </div>
                </div>

                {session.identified_skill_gaps?.length > 0 && (
                  <div>
                    <div className="text-white/60 text-xs mb-2">Skill Gaps Addressed</div>
                    <div className="flex flex-wrap gap-1">
                      {session.identified_skill_gaps.slice(0, 3).map((gap, i) => (
                        <Badge key={i} className="text-xs bg-red-500/20 text-red-300">
                          {gap.skill_name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {session.learning_journal_entries?.length > 0 && (
                  <div className="bg-purple-500/20 border border-purple-500/30 rounded p-2">
                    <div className="text-purple-300 text-xs mb-1">Latest Entry</div>
                    <p className="text-white/80 text-xs">
                      {session.learning_journal_entries[session.learning_journal_entries.length - 1]?.agent_reflection}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selectedSession && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedSession(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-gray-900 border border-white/10 rounded-xl max-w-4xl w-full max-h-[80vh] overflow-auto p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-bold text-white mb-4">{selectedSession.session_name}</h3>
              
              <div className="space-y-4">
                {selectedSession.training_exercises?.map((exercise, i) => (
                  <Card key={i} className="bg-white/5 border-white/10">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium">{exercise.exercise_name}</span>
                          {exercise.completion_status === 'completed' && (
                            <CheckCircle2 className="w-4 h-4 text-green-400" />
                          )}
                        </div>
                        {exercise.score > 0 && (
                          <Badge className="bg-purple-500">{exercise.score}/100</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-white/60">
                        <span>Skill: {exercise.skill_targeted}</span>
                        <span>Difficulty: {exercise.difficulty}</span>
                        <span>Attempts: {exercise.attempts}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Button
                onClick={() => setSelectedSession(null)}
                className="mt-4 w-full"
                variant="outline"
              >
                Close
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}