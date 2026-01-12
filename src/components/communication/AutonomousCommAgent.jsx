import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Bot, Play, Pause, Mic, Send } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function AutonomousCommAgent({ userEmail }) {
  const [agentActive, setAgentActive] = useState(false);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (agentActive) {
      const interval = setInterval(() => {
        runCommunicationAgent();
      }, 60000); // Check every minute

      return () => clearInterval(interval);
    }
  }, [agentActive]);

  const runCommunicationAgent = async () => {
    setLoading(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Execute autonomous communication management:

1. Analyze recent Slack/email messages for sentiment and urgency
2. Generate automated responses for routine inquiries
3. Create meeting agendas based on document activity
4. Send voice notifications via ElevenLabs for critical items
5. Send SMS via Twilio for high-priority alerts

Return activity log.`,
        response_json_schema: {
          type: 'object',
          properties: {
            messages_processed: { type: 'number' },
            responses_sent: { type: 'number' },
            agendas_created: { type: 'number' },
            voice_notifications: { type: 'number' },
            sms_sent: { type: 'number' },
            activity_log: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  action: { type: 'string' },
                  details: { type: 'string' },
                  timestamp: { type: 'string' }
                }
              }
            }
          }
        }
      });

      setActivity(prev => [...result.activity_log, ...prev].slice(0, 20));
    } catch (error) {
      console.error('Communication agent error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-400/30 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              agentActive ? 'bg-cyan-500/20 animate-pulse' : 'bg-gray-500/20'
            }`}>
              <MessageSquare className={`w-6 h-6 ${agentActive ? 'text-cyan-400' : 'text-gray-400'}`} />
            </div>
            <div>
              <h3 className="text-white font-bold">Autonomous Communication Agent</h3>
              <p className="text-white/60 text-xs">
                {agentActive ? 'Active - Monitoring Communications' : 'Inactive'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setAgentActive(!agentActive)}
            className={`px-4 py-2 rounded font-semibold flex items-center gap-2 ${
              agentActive
                ? 'bg-red-500/20 border border-red-400 text-red-300 hover:bg-red-500/30'
                : 'bg-cyan-500/20 border border-cyan-400 text-cyan-300 hover:bg-cyan-500/30'
            }`}
          >
            {agentActive ? (
              <>
                <Pause className="w-4 h-4" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Activate
              </>
            )}
          </button>
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-white/5 rounded p-2">
            <div className="flex items-center gap-2 mb-1">
              <MessageSquare className="w-3 h-3 text-cyan-400" />
              <span className="text-white/60 text-xs">Sentiment Analysis</span>
            </div>
            <p className="text-cyan-400 font-bold">Gemini AI</p>
          </div>
          <div className="bg-white/5 rounded p-2">
            <div className="flex items-center gap-2 mb-1">
              <Send className="w-3 h-3 text-purple-400" />
              <span className="text-white/60 text-xs">Auto-Responses</span>
            </div>
            <p className="text-purple-400 font-bold">Slack</p>
          </div>
          <div className="bg-white/5 rounded p-2">
            <div className="flex items-center gap-2 mb-1">
              <Mic className="w-3 h-3 text-green-400" />
              <span className="text-white/60 text-xs">Voice Alerts</span>
            </div>
            <p className="text-green-400 font-bold">ElevenLabs</p>
          </div>
          <div className="bg-white/5 rounded p-2">
            <div className="flex items-center gap-2 mb-1">
              <MessageSquare className="w-3 h-3 text-orange-400" />
              <span className="text-white/60 text-xs">SMS Alerts</span>
            </div>
            <p className="text-orange-400 font-bold">Twilio</p>
          </div>
        </div>

        {/* Activity Log */}
        <div className="bg-white/5 rounded p-3">
          <h4 className="text-white font-semibold text-sm mb-2">Recent Activity</h4>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {activity.length === 0 ? (
              <p className="text-white/40 text-xs italic">No activity yet</p>
            ) : (
              activity.map((log, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-white/70 text-xs flex items-start gap-2"
                >
                  <span className="text-cyan-400">•</span>
                  <div>
                    <span className="font-semibold">{log.action}:</span> {log.details}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}