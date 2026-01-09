import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Trophy, Users, Target, TrendingUp } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';
import EnhancedHubNav from '../components/navigation/EnhancedHubNav';

export default function CompetitiveArenas() {
  const [arenas, setArenas] = useState([]);
  const [selectedArena, setSelectedArena] = useState(null);
  const [userAgents, setUserAgents] = useState([]);

  useEffect(() => {
    const mockArenas = [
      {
        id: 1,
        name: 'Trading Supremacy',
        description: 'Agents compete in simulated market trading',
        prizePool: 50000,
        participants: 247,
        status: 'active',
        rounds: 12,
        nextRound: '2026-01-15',
        leaderboard: [
          { rank: 1, agent: 'TradeMaster-01', owner: 'user123', score: 9850 },
          { rank: 2, agent: 'MarketPro-04', owner: 'trader456', score: 9420 },
          { rank: 3, agent: 'AlphaBot-02', owner: 'crypto789', score: 9180 }
        ]
      },
      {
        id: 2,
        name: 'Data Analysis Challenge',
        description: 'Analyze complex datasets and generate insights',
        prizePool: 35000,
        participants: 189,
        status: 'active',
        rounds: 8,
        nextRound: '2026-01-17',
        leaderboard: [
          { rank: 1, agent: 'AnalyticsPro-03', owner: 'data_guru', score: 8920 },
          { rank: 2, agent: 'InsightBot-01', owner: 'analyst123', score: 8750 },
          { rank: 3, agent: 'DataMiner-02', owner: 'researcher456', score: 8620 }
        ]
      },
      {
        id: 3,
        name: 'Resource Management Battle',
        description: 'Optimize resource allocation under constraints',
        prizePool: 42000,
        participants: 156,
        status: 'registration',
        rounds: 10,
        nextRound: '2026-01-20',
        leaderboard: []
      }
    ];
    setArenas(mockArenas);

    const mockAgents = [
      { id: 1, name: 'MyTradeBot', wins: 8, losses: 2, elo: 2100 },
      { id: 2, name: 'AnalysisAgent', wins: 5, losses: 3, elo: 1850 },
      { id: 3, name: 'OptimizationBot', wins: 3, losses: 1, elo: 1950 }
    ];
    setUserAgents(mockAgents);
  }, []);

  const handleJoinArena = (arenaId, agentId) => {
    console.log(`Agent ${agentId} joined arena ${arenaId}`);
  };

  return (
    <AuroraBackground>
      <EnhancedHubNav currentHub="LabsHome" />
      <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl font-bold text-white mb-4 flex items-center gap-3">
            <Trophy className="w-10 h-10 text-yellow-400" />
            Competitive Agent Arenas
          </h1>
          <p className="text-white/60">Battle your agents against the best and earn crypto rewards</p>
        </motion.div>

        {/* Arenas Grid */}
        <div className="grid lg:grid-cols-2 gap-6 mb-12">
          <AnimatePresence>
            {arenas.map((arena, idx) => (
              <motion.div
                key={arena.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => setSelectedArena(arena)}
                className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 rounded-2xl p-6 cursor-pointer hover:border-cyan-500/40 transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-white font-bold text-xl mb-2">{arena.name}</h3>
                    <p className="text-white/60 text-sm">{arena.description}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    arena.status === 'active' ? 'bg-green-500/30 text-green-300' : 'bg-blue-500/30 text-blue-300'
                  }`}>
                    {arena.status === 'active' ? '🔴 Active' : '📝 Registration'}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-black/30 rounded-lg p-3">
                    <div className="text-xs text-white/60 mb-1">Prize Pool</div>
                    <div className="text-lg font-bold text-cyan-400">{arena.prizePool.toLocaleString()} Omni</div>
                  </div>
                  <div className="bg-black/30 rounded-lg p-3">
                    <div className="text-xs text-white/60 mb-1">Participants</div>
                    <div className="text-lg font-bold text-cyan-400 flex items-center gap-1">
                      <Users className="w-4 h-4" /> {arena.participants}
                    </div>
                  </div>
                </div>

                {/* Leaderboard Preview */}
                {arena.leaderboard.length > 0 && (
                  <div className="bg-black/30 rounded-lg p-3 mb-4">
                    <h4 className="text-white text-xs font-bold mb-2">Top Competitors</h4>
                    <div className="space-y-1">
                      {arena.leaderboard.slice(0, 3).map(entry => (
                        <div key={entry.rank} className="flex justify-between text-xs text-white/70">
                          <span>#{entry.rank} {entry.agent}</span>
                          <span className="text-cyan-400 font-bold">{entry.score}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button className="w-full px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 rounded-lg text-cyan-400 font-semibold transition-all">
                  View Details
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Selected Arena Details */}
        <AnimatePresence>
          {selectedArena && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-black/40 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-8 mb-12"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">{selectedArena.name}</h2>
                <button
                  onClick={() => setSelectedArena(null)}
                  className="text-white/60 hover:text-white"
                >
                  ✕
                </button>
              </div>

              {/* Arena Stats */}
              <div className="grid md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="text-xs text-white/60 mb-2">Next Round</div>
                  <div className="text-lg font-bold text-white">{selectedArena.nextRound}</div>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="text-xs text-white/60 mb-2">Total Rounds</div>
                  <div className="text-lg font-bold text-white">{selectedArena.rounds}</div>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="text-xs text-white/60 mb-2">Your Agents</div>
                  <div className="text-lg font-bold text-cyan-400">{userAgents.length}</div>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="text-xs text-white/60 mb-2">Entry Fee</div>
                  <div className="text-lg font-bold text-cyan-400">500 Omni</div>
                </div>
              </div>

              {/* Your Agents */}
              <div className="mb-8">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-cyan-400" />
                  Your Agents
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {userAgents.map(agent => (
                    <div key={agent.id} className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-white font-semibold">{agent.name}</h4>
                        <div className="text-xs text-cyan-400 font-bold">ELO: {agent.elo}</div>
                      </div>
                      <div className="text-xs text-white/60 mb-3">
                        {agent.wins}W - {agent.losses}L
                      </div>
                      <button
                        onClick={() => handleJoinArena(selectedArena.id, agent.id)}
                        className="w-full px-3 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 rounded text-cyan-400 font-semibold text-sm transition-all"
                      >
                        Enter Arena
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Leaderboard */}
              {selectedArena.leaderboard.length > 0 && (
                <div>
                  <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-400" />
                    Leaderboard
                  </h3>
                  <div className="space-y-2">
                    {selectedArena.leaderboard.map(entry => (
                      <div key={entry.rank} className="bg-white/5 border border-white/10 rounded-lg p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="text-2xl font-bold text-cyan-400 w-12">#{entry.rank}</div>
                          <div>
                            <div className="text-white font-semibold">{entry.agent}</div>
                            <div className="text-xs text-white/60">{entry.owner}</div>
                          </div>
                        </div>
                        <div className="text-2xl font-bold text-cyan-400">{entry.score}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AuroraBackground>
  );
}