import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, Video, Mic, MicOff, VideoOff, X } from 'lucide-react';

export default function AgentCommunicationCalls() {
  const [activeCall, setActiveCall] = useState(null);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);

  const agents = [
    { id: 1, name: 'Explorer-01', status: 'online', avatar: '🔭' },
    { id: 2, name: 'Trader-05', status: 'online', avatar: '📈' },
    { id: 3, name: 'Analyst-12', status: 'busy', avatar: '📊' },
    { id: 4, name: 'Coordinator-08', status: 'online', avatar: '🎯' }
  ];

  const initiateCall = (agent, type) => {
    setActiveCall({
      agent,
      type,
      duration: 0,
      startTime: Date.now()
    });
  };

  const endCall = () => {
    setActiveCall(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-black/40 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-6 space-y-6"
    >
      <h3 className="text-white font-bold text-lg flex items-center gap-2">
        <Phone className="w-6 h-6 text-cyan-400" />
        Agent Communication Calls
      </h3>

      {/* Active Call */}
      {activeCall ? (
        <motion.div
          layout
          className="bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/50 rounded-xl p-6 space-y-4"
        >
          <div className="text-center">
            <div className="text-4xl mb-2">{activeCall.agent.avatar}</div>
            <h4 className="text-white font-bold text-lg">{activeCall.agent.name}</h4>
            <p className="text-cyan-400 text-sm">
              {activeCall.type === 'voice' ? '🎙️ Voice Call' : '📹 Video Conference'}
            </p>
          </div>

          <div className="flex gap-3 justify-center">
            <motion.button
              whileHover={{ scale: 1.1 }}
              onClick={() => setIsAudioOn(!isAudioOn)}
              className={`p-3 rounded-full transition-all ${
                isAudioOn
                  ? 'bg-cyan-500/30 border border-cyan-500/50 text-cyan-400'
                  : 'bg-red-500/30 border border-red-500/50 text-red-400'
              }`}
            >
              {isAudioOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </motion.button>

            {activeCall.type === 'video' && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                onClick={() => setIsVideoOn(!isVideoOn)}
                className={`p-3 rounded-full transition-all ${
                  isVideoOn
                    ? 'bg-cyan-500/30 border border-cyan-500/50 text-cyan-400'
                    : 'bg-red-500/30 border border-red-500/50 text-red-400'
                }`}
              >
                {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </motion.button>
            )}

            <motion.button
              whileHover={{ scale: 1.1 }}
              onClick={endCall}
              className="p-3 rounded-full bg-red-500/30 border border-red-500/50 text-red-400"
            >
              <X className="w-5 h-5" />
            </motion.button>
          </div>
        </motion.div>
      ) : (
        /* Agent List */
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {agents.map((agent) => (
            <motion.div
              key={agent.id}
              layout
              className="space-y-2"
            >
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                <div className="text-3xl mb-2">{agent.avatar}</div>
                <p className="text-white font-semibold text-sm">{agent.name}</p>
                <div className="flex items-center justify-center gap-1 mt-2">
                  <div className={`w-2 h-2 rounded-full ${agent.status === 'online' ? 'bg-green-400' : 'bg-yellow-400'}`} />
                  <p className="text-white/60 text-xs">{agent.status}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => initiateCall(agent, 'voice')}
                  disabled={agent.status === 'busy'}
                  className="flex-1 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 rounded-lg text-cyan-400 text-xs font-semibold disabled:opacity-50 flex items-center justify-center gap-1"
                >
                  <Phone className="w-3 h-3" />
                  Call
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => initiateCall(agent, 'video')}
                  disabled={agent.status === 'busy'}
                  className="flex-1 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/50 rounded-lg text-purple-400 text-xs font-semibold disabled:opacity-50 flex items-center justify-center gap-1"
                >
                  <Video className="w-3 h-3" />
                  Video
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}