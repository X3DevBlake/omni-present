import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Swords, Trophy, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CompetitiveArenaManager() {
  const [matches, setMatches] = useState([]);
  const [activeMatch, setActiveMatch] = useState(null);

  const startMatch = () => {
    const agents = ['Agent Alpha', 'Agent Beta', 'Agent Gamma', 'Agent Delta'];
    const selected = agents.sort(() => 0.5 - Math.random()).slice(0, 2);
    const newMatch = {
      id: Date.now(),
      participants: selected,
      scores: { [selected[0]]: 0, [selected[1]]: 0 },
      status: 'active',
      rounds: 0
    };
    setMatches([newMatch, ...matches.slice(0, 9)]);
    setActiveMatch(newMatch.id);
    simulateRounds(newMatch.id);
  };

  const simulateRounds = (matchId) => {
    const interval = setInterval(() => {
      setMatches(prev => prev.map(m => {
        if (m.id === matchId && m.rounds < 5) {
          const winner = m.participants[Math.floor(Math.random() * 2)];
          return {
            ...m,
            scores: { ...m.scores, [winner]: m.scores[winner] + 1 },
            rounds: m.rounds + 1
          };
        } else if (m.id === matchId) {
          clearInterval(interval);
          return { ...m, status: 'completed' };
        }
        return m;
      }));
    }, 1000);
  };

  return (
    <div className="bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/30 rounded-xl p-6">
      <h3 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
        <Swords className="w-6 h-6 text-red-400" />
        Competitive Training Arena
      </h3>

      <Button onClick={startMatch} className="mb-6 bg-gradient-to-r from-red-500 to-orange-500">
        <Users className="w-4 h-4 mr-2" />
        Start New Match
      </Button>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {matches.map(match => (
          <motion.div
            key={match.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-black/20 rounded-lg p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="text-white font-semibold">{match.participants[0]}</div>
                <div className="text-white/40">vs</div>
                <div className="text-white font-semibold">{match.participants[1]}</div>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs ${
                match.status === 'active' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
              }`}>
                {match.status}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-cyan-400 font-bold text-2xl">{match.scores[match.participants[0]]}</div>
              <div className="text-white/60 text-sm">Round {match.rounds}/5</div>
              <div className="text-purple-400 font-bold text-2xl">{match.scores[match.participants[1]]}</div>
            </div>
            {match.status === 'completed' && (
              <div className="mt-2 text-center">
                <Trophy className="w-4 h-4 inline text-yellow-400 mr-1" />
                <span className="text-yellow-400 text-sm">
                  {match.scores[match.participants[0]] > match.scores[match.participants[1]] 
                    ? match.participants[0] 
                    : match.participants[1]} wins!
                </span>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}