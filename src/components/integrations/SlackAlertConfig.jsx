import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Link2, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function SlackAlertConfig({ userId }) {
  const [isConnected, setIsConnected] = useState(false);
  const [selectedChannels, setSelectedChannels] = useState({
    agents: true,
    finance: true,
    team: true,
    aiHub: true
  });

  const { data: slackStatus } = useQuery({
    queryKey: ['slack-status'],
    queryFn: async () => {
      try {
        // Check if Slack connector is available
        return { connected: false };
      } catch (error) {
        return { connected: false };
      }
    }
  });

  const authorizeSlack = async () => {
    // This would trigger the OAuth flow
    // For now, just show the configuration
    setIsConnected(true);
  };

  const alerts = [
    {
      id: 'agent-kpi',
      name: 'Agent KPI Alerts',
      description: 'Receive notifications when agent performance changes',
      channel: '#agents',
      enabled: selectedChannels.agents
    },
    {
      id: 'goal-progress',
      name: 'Goal Progress Updates',
      description: 'Track user financial goal progress',
      channel: '#finance',
      enabled: selectedChannels.finance
    },
    {
      id: 'market-insights',
      name: 'Market Insights',
      description: 'Share new market trends and opportunities',
      channel: '#team',
      enabled: selectedChannels.team
    },
    {
      id: 'collaboration',
      name: 'AI Collaboration Updates',
      description: 'Agent collaboration milestones and insights',
      channel: '#ai-hub',
      enabled: selectedChannels.aiHub
    }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-white flex items-center gap-3">
            <Settings className="w-8 h-8 text-cyan-400" />
            Slack Integration
          </h2>
          {isConnected ? (
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/20 border border-green-500/30">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
              <span className="text-green-400 font-semibold">Connected</span>
            </div>
          ) : (
            <Button
              onClick={authorizeSlack}
              className="bg-gradient-to-r from-cyan-500 to-purple-500 flex items-center gap-2"
            >
              <Link2 className="w-4 h-4" />
              Connect Slack
            </Button>
          )}
        </div>
        <p className="text-white/60">Configure notifications and alerts to be sent to your Slack workspace</p>
      </motion.div>

      {isConnected && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {alerts.map((alert, idx) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="p-6 rounded-xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 hover:border-cyan-400/30 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-white font-bold text-lg">{alert.name}</h3>
                  <p className="text-white/60 text-sm mt-1">{alert.description}</p>
                </div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={alert.enabled}
                    onChange={(e) => {
                      const key = alert.id === 'agent-kpi' ? 'agents' : 
                                 alert.id === 'goal-progress' ? 'finance' :
                                 alert.id === 'market-insights' ? 'team' : 'aiHub';
                      setSelectedChannels({
                        ...selectedChannels,
                        [key]: e.target.checked
                      });
                    }}
                    className="w-5 h-5 rounded accent-cyan-400"
                  />
                  <span className="text-white/60 text-sm">Enable</span>
                </label>
              </div>
              <div className="flex items-center gap-2 text-white/70 text-sm">
                <AlertCircle className="w-4 h-4" />
                Posts to <code className="px-2 py-1 rounded bg-black/40 text-cyan-400">{alert.channel}</code>
              </div>
            </motion.div>
          ))}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: alerts.length * 0.1 }}
            className="mt-8 p-6 rounded-xl bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-400/30"
          >
            <h4 className="text-white font-bold mb-3">Setup Instructions</h4>
            <ol className="space-y-2 text-white/70 text-sm list-decimal list-inside">
              <li>Create the required Slack channels: #agents, #finance, #team, #ai-hub</li>
              <li>Ensure the Slack app has permissions to post messages</li>
              <li>Enable the alerts above for automatic notifications</li>
              <li>Test the integration with sample data</li>
            </ol>
          </motion.div>

          <Button
            className="w-full mt-8 bg-gradient-to-r from-green-500 to-cyan-500 text-white font-semibold py-6"
          >
            Save Configuration
          </Button>
        </motion.div>
      )}
    </div>
  );
}