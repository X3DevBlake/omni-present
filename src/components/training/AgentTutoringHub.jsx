import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Brain, BookOpen, TrendingUp, Award } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import TutoringProgress3D from './TutoringProgress3D';

export default function AgentTutoringHub({ agentId }) {
  const queryClient = useQueryClient();
  const [sessionName, setSessionName] = useState('');

  const { data: sessions } = useQuery({
    queryKey: ['tutoring-sessions', agentId],
    queryFn: () => base44.entities.AgentTutoringSession.filter({ agent_id: agentId }, '-created_date', 20),
  });

  const { data: skillGaps } = useQuery({
    queryKey: ['skill-gaps', agentId],
    queryFn: async () => {
      const response = await base44.functions.invoke('identifySkillGaps', { agent_id: agentId });
      return response.data;
    },
    enabled: !!agentId
  });

  const createSession = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('generateTutoringSession', {
        agent_id: agentId,
        skill_gaps: skillGaps?.skill_gaps || [],
        session_name: sessionName || `Session ${new Date().toLocaleDateString()}`
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tutoring-sessions'] });
      setSessionName('');
    }
  });

  const activeSession = sessions?.find(s => s.session_status === 'active');

  return (
    <div className="space-y-6">
      {/* Skill Gaps Detection */}
      <Card className="bg-gradient-to-br from-red-500/20 to-orange-500/20 border-red-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Identified Skill Gaps
          </CardTitle>
        </CardHeader>
        <CardContent>
          {skillGaps?.skill_gaps && skillGaps.skill_gaps.length > 0 ? (
            <div className="space-y-3">
              {skillGaps.skill_gaps.slice(0, 5).map((gap, i) => (
                <div key={i} className="bg-black/30 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium">{gap.skill_name}</span>
                    <Badge className={`${
                      gap.gap_severity === 'critical' ? 'bg-red-500' :
                      gap.gap_severity === 'moderate' ? 'bg-yellow-500' : 'bg-blue-500'
                    }`}>
                      {gap.gap_severity}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div>
                      <span className="text-white/60">Current: </span>
                      <span className="text-orange-400">{gap.current_level}%</span>
                    </div>
                    <div>
                      <span className="text-white/60">Target: </span>
                      <span className="text-green-400">{gap.target_level}%</span>
                    </div>
                    <div>
                      <span className="text-white/60">Impact: </span>
                      <span className="text-purple-400">{gap.impact_on_performance}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-white/60 text-center py-4">
              No skill gaps detected
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Session */}
      <Card className="bg-black/40 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Request Tutoring
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            value={sessionName}
            onChange={(e) => setSessionName(e.target.value)}
            placeholder="Session name (optional)"
            className="bg-white/5 border-white/10 text-white"
          />
          <Button
            onClick={() => createSession.mutate()}
            disabled={createSession.isPending || !skillGaps?.skill_gaps?.length}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
          >
            Generate Training Session
          </Button>
          {!skillGaps?.skill_gaps?.length && (
            <p className="text-white/60 text-xs text-center">
              Analyze skill gaps first
            </p>
          )}
        </CardContent>
      </Card>

      {/* Active Session Progress */}
      {activeSession && (
        <Card className="bg-black/40 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Active Training Session
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TutoringProgress3D session={activeSession} />
            <div className="mt-4 grid grid-cols-3 gap-4">
              <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-3">
                <div className="text-purple-300 text-xs">Progress</div>
                <div className="text-white text-2xl font-bold">
                  {activeSession.progress_percentage?.toFixed(0)}%
                </div>
              </div>
              <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3">
                <div className="text-green-300 text-xs">Exercises</div>
                <div className="text-white text-2xl font-bold">
                  {activeSession.training_exercises?.filter(e => e.completion_status === 'completed').length || 0}/
                  {activeSession.training_exercises?.length || 0}
                </div>
              </div>
              <div className="bg-cyan-500/20 border border-cyan-500/30 rounded-lg p-3">
                <div className="text-cyan-300 text-xs">Improvement</div>
                <div className="text-white text-2xl font-bold">
                  {activeSession.performance_improvement?.improvement_percentage?.toFixed(0) || 0}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Learning Journal */}
      <Card className="bg-black/40 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Award className="w-5 h-5" />
            Learning Journal
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeSession?.learning_journal_entries && activeSession.learning_journal_entries.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {activeSession.learning_journal_entries.slice().reverse().map((entry, i) => (
                <div key={i} className="bg-white/5 rounded-lg p-3 border border-white/10">
                  <div className="text-white/60 text-xs mb-2">
                    {new Date(entry.entry_date).toLocaleString()}
                  </div>
                  {entry.achievements?.length > 0 && (
                    <div className="mb-2">
                      <div className="text-green-400 text-xs font-medium mb-1">Achievements:</div>
                      {entry.achievements.map((achievement, j) => (
                        <div key={j} className="text-white text-sm">• {achievement}</div>
                      ))}
                    </div>
                  )}
                  {entry.challenges_faced?.length > 0 && (
                    <div className="mb-2">
                      <div className="text-orange-400 text-xs font-medium mb-1">Challenges:</div>
                      {entry.challenges_faced.map((challenge, j) => (
                        <div key={j} className="text-white text-sm">• {challenge}</div>
                      ))}
                    </div>
                  )}
                  {entry.agent_reflection && (
                    <div className="text-purple-300 text-sm italic">
                      "{entry.agent_reflection}"
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-white/60 text-center py-4">
              No journal entries yet
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}