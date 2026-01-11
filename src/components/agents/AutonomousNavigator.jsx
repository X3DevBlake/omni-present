import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Navigation, Target, Sparkles, ArrowRight } from 'lucide-react';

export default function AutonomousNavigator({ agentId, agentName }) {
  const [goal, setGoal] = useState('');
  const [navigationPath, setNavigationPath] = useState(null);
  const navigate = useNavigate();

  const planNavigation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/functions/agent-navigation-api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'suggestNextHub',
          parameters: {
            currentHubId: 'home',
            userGoal: goal
          }
        })
      });

      if (!response.ok) throw new Error('Navigation planning failed');
      return response.json();
    },
    onSuccess: (data) => {
      setNavigationPath(data);
    }
  });

  const executeNavigation = (hubPath) => {
    navigate(createPageUrl(hubPath));
  };

  return (
    <Card className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border-cyan-500/30 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-cyan-500/20 rounded-lg">
          <Navigation className="w-5 h-5 text-cyan-400" />
        </div>
        <div>
          <h3 className="text-white font-bold">Autonomous Navigator</h3>
          <p className="text-white/60 text-sm">AI-powered navigation assistant</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-white/80 text-sm mb-2 block">What would you like to do?</label>
          <Input
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="e.g., analyze market data, train agents, simulate scenarios..."
            className="bg-white/5 border-white/10"
          />
        </div>

        <Button
          onClick={() => planNavigation.mutate()}
          disabled={planNavigation.isPending || !goal}
          className="w-full bg-gradient-to-r from-cyan-500 to-blue-500"
        >
          {planNavigation.isPending ? (
            <>
              <Sparkles className="w-4 h-4 mr-2 animate-spin" />
              Planning route...
            </>
          ) : (
            <>
              <Target className="w-4 h-4 mr-2" />
              Find Best Hub
            </>
          )}
        </Button>

        {navigationPath && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            {/* Main Suggestion */}
            <div className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-cyan-400 font-bold">{navigationPath.suggestion?.name}</p>
                  <p className="text-white/60 text-xs mt-1">{navigationPath.reasoning}</p>
                </div>
                <Button
                  size="sm"
                  onClick={() => executeNavigation(navigationPath.suggestion?.path)}
                  className="bg-cyan-500 hover:bg-cyan-600"
                >
                  Go
                  <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </div>
            </div>

            {/* Alternatives */}
            {navigationPath.alternatives && navigationPath.alternatives.length > 0 && (
              <div>
                <p className="text-white/60 text-sm mb-2">Or try these alternatives:</p>
                <div className="space-y-2">
                  {navigationPath.alternatives.map((alt, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all cursor-pointer"
                      onClick={() => executeNavigation(alt.path)}
                    >
                      <p className="text-white text-sm">{alt.name}</p>
                      <ArrowRight className="w-4 h-4 text-white/40" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </Card>
  );
}