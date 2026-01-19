import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Users, Radio, MessageSquare, Crown, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

export default function MultiplayerSimulationHub() {
  const queryClient = useQueryClient();
  const [sessionName, setSessionName] = useState('');
  const [currentSession, setCurrentSession] = useState(null);
  const [participants, setParticipants] = useState([]);

  const { data: activeSessions } = useQuery({
    queryKey: ['multiplayer-sessions'],
    queryFn: async () => {
      const sessions = await base44.entities.Simulation.filter({ 
        multiplayer_enabled: true,
        status: 'running'
      });
      return sessions;
    },
    refetchInterval: 3000,
  });

  const createSession = useMutation({
    mutationFn: async (name) => {
      const user = await base44.auth.me();
      const session = await base44.entities.Simulation.create({
        name: name,
        status: 'running',
        multiplayer_enabled: true,
        host_user: user.email,
        current_step: 0,
        total_steps: 500,
      });
      return session;
    },
    onSuccess: (session) => {
      queryClient.invalidateQueries({ queryKey: ['multiplayer-sessions'] });
      setCurrentSession(session.id);
      setSessionName('');
    },
  });

  const joinSession = useMutation({
    mutationFn: async (sessionId) => {
      const user = await base44.auth.me();
      setCurrentSession(sessionId);
      return sessionId;
    },
  });

  // Subscribe to session updates
  useEffect(() => {
    if (!currentSession) return;

    const unsubscribe = base44.entities.Simulation.subscribe((event) => {
      if (event.id === currentSession && event.type === 'update') {
        queryClient.invalidateQueries({ queryKey: ['multiplayer-sessions'] });
      }
    });

    return unsubscribe;
  }, [currentSession, queryClient]);

  const currentSessionData = activeSessions?.find(s => s.id === currentSession);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2 bg-black/40 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Radio className="w-5 h-5 text-purple-400 animate-pulse" />
            Multiplayer Simulation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {!currentSession ? (
            <>
              <div>
                <label className="text-white text-sm mb-2 block">Create New Session</label>
                <div className="flex gap-2">
                  <Input
                    value={sessionName}
                    onChange={(e) => setSessionName(e.target.value)}
                    placeholder="Market Competition Session"
                    className="bg-white/5 border-white/10 text-white"
                  />
                  <Button
                    onClick={() => createSession.mutate(sessionName)}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    Create
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-white text-sm mb-2 block">Join Existing Session</label>
                <div className="space-y-2">
                  {activeSessions?.map((session) => (
                    <button
                      key={session.id}
                      onClick={() => joinSession.mutate(session.id)}
                      className="w-full bg-white/5 hover:bg-white/10 rounded-lg p-3 border border-white/10 transition-all text-left"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-white font-medium">{session.name}</div>
                          <div className="text-white/60 text-xs">
                            Host: {session.host_user}
                          </div>
                        </div>
                        <Badge className="bg-green-500/20 text-green-400 border-0">
                          <Radio className="w-3 h-3 mr-1" />
                          Live
                        </Badge>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg p-6 border border-purple-500/30">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-white font-bold text-lg">{currentSessionData?.name}</h3>
                    <p className="text-white/60 text-sm">Step {currentSessionData?.current_step} / {currentSessionData?.total_steps}</p>
                  </div>
                  {currentSessionData?.host_user && (
                    <Crown className="w-6 h-6 text-yellow-400" />
                  )}
                </div>

                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-black/30 rounded p-2">
                    <div className="text-white/60 text-xs">Efficiency</div>
                    <div className="text-white font-bold">87%</div>
                  </div>
                  <div className="bg-black/30 rounded p-2">
                    <div className="text-white/60 text-xs">Participants</div>
                    <div className="text-white font-bold">{Math.floor(Math.random() * 5) + 2}</div>
                  </div>
                  <div className="bg-black/30 rounded p-2">
                    <div className="text-white/60 text-xs">Resources</div>
                    <div className="text-white font-bold">1,245</div>
                  </div>
                </div>

                <Button
                  onClick={() => setCurrentSession(null)}
                  variant="outline"
                  className="w-full border-white/10"
                >
                  Leave Session
                </Button>
              </div>

              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Live Feed
                </h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  <div className="text-xs text-white/60">
                    <span className="text-cyan-400">User1:</span> Adjusting agent strategy
                  </div>
                  <div className="text-xs text-white/60">
                    <span className="text-purple-400">AI System:</span> Market volatility increased to 65%
                  </div>
                  <div className="text-xs text-white/60">
                    <span className="text-green-400">User2:</span> Collaboration initiated with Agent-5
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card className="bg-black/40 border-white/10">
        <CardHeader>
          <CardTitle className="text-white text-lg flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-400" />
            Active Participants
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentSession ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white/5 rounded-lg p-3 border border-white/10">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-white text-sm">Participant {i}</span>
                    {i === 1 && <Crown className="w-3 h-3 text-yellow-400 ml-auto" />}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Eye className="w-12 h-12 text-white/40 mx-auto mb-3" />
              <p className="text-white/60 text-sm">Join a session to see participants</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}