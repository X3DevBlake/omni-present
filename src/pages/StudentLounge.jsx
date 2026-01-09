import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Users, Video, Hash } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';

export default function StudentLounge() {
  const channels = [
    { id: 1, name: 'general', type: 'text', members: 342, unread: 5 },
    { id: 2, name: 'ai-discussions', type: 'text', members: 156, unread: 0 },
    { id: 3, name: 'study-room-1', type: 'voice', members: 8, active: true },
    { id: 4, name: 'help-desk', type: 'text', members: 89, unread: 2 }
  ];

  return (
    <AuroraBackground className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <motion.div className="mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="text-4xl font-bold text-white mb-2">Student Lounge</h1>
          <p className="text-white/60">Connect with peers in real-time</p>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-6">
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
            <h3 className="text-white font-bold mb-4">Channels</h3>
            <div className="space-y-2">
              {channels.map(channel => (
                <div key={channel.id} className={`p-3 rounded-lg cursor-pointer transition-all ${channel.id === 1 ? 'bg-cyan-500/20 border border-cyan-500/40' : 'bg-white/5 hover:bg-white/10'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    {channel.type === 'voice' ? <Video className="w-4 h-4 text-green-400" /> : <Hash className="w-4 h-4 text-white/60" />}
                    <span className="text-white text-sm font-medium">{channel.name}</span>
                    {channel.unread > 0 && (
                      <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{channel.unread}</span>
                    )}
                  </div>
                  <div className="text-xs text-white/60 flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {channel.members} members
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-3 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 h-[600px] flex flex-col">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
              <h3 className="text-white font-bold flex items-center gap-2">
                <Hash className="w-5 h-5" />
                general
              </h3>
              <button className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-sm flex items-center gap-2">
                <Video className="w-4 h-4" />
                Join Voice
              </button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-4 mb-4">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center text-white font-bold">A</div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white font-semibold text-sm">Alice</span>
                    <span className="text-white/40 text-xs">2:34 PM</span>
                  </div>
                  <p className="text-white/80 text-sm">Anyone working on the multi-agent assignment?</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center text-white font-bold">B</div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white font-semibold text-sm">Bob</span>
                    <span className="text-white/40 text-xs">2:36 PM</span>
                  </div>
                  <p className="text-white/80 text-sm">Yes! I'm stuck on the coordination protocol part.</p>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <input type="text" placeholder="Type a message..." className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40" />
              <button className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-lg hover:opacity-90">Send</button>
            </div>
          </div>
        </div>
      </div>
    </AuroraBackground>
  );
}