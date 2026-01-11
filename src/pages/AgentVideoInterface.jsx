import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import AuroraBackground from '../components/omni/AuroraBackground';
import AgentVideoCall from '../components/video/AgentVideoCall';
import { Video, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AgentVideoInterface() {
  const [userEmail, setUserEmail] = React.useState(null);
  const [activeCall, setActiveCall] = useState(null);

  React.useEffect(() => {
    base44.auth.me()
      .then(user => setUserEmail(user?.email))
      .catch(() => setUserEmail(null));
  }, []);

  const agents = [
    { id: 'agent-1', name: 'Financial Advisor', specialty: 'Trading & Investment' },
    { id: 'agent-2', name: 'Personal Assistant', specialty: 'Task Management' },
    { id: 'agent-3', name: 'Data Analyst', specialty: 'Analytics & Insights' }
  ];

  return (
    <AuroraBackground className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Video className="w-10 h-10 text-purple-400" />
            Agent Video Interface
          </h1>
          <p className="text-white/60">Live video conversations with AI agents</p>
        </motion.div>

        {!activeCall ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {agents.map((agent) => (
              <motion.div
                key={agent.id}
                whileHover={{ scale: 1.05, y: -10 }}
                className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 border border-purple-500/30 rounded-xl p-6 cursor-pointer"
                onClick={() => setActiveCall(agent.id)}
              >
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center mx-auto mb-4">
                  <Video className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-white font-bold text-center mb-2">{agent.name}</h3>
                <p className="text-white/60 text-sm text-center mb-4">{agent.specialty}</p>
                <Button className="w-full bg-purple-600 hover:bg-purple-700">
                  <Play className="w-4 h-4 mr-2" />
                  Start Call
                </Button>
              </motion.div>
            ))}
          </div>
        ) : (
          <AgentVideoCall 
            agentId={activeCall} 
            onEnd={() => setActiveCall(null)} 
          />
        )}
      </div>
    </AuroraBackground>
  );
}