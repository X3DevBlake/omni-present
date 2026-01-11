import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Search, Folder } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function VideoMemoryStorage() {
  const [memories, setMemories] = useState([
    {
      id: 1,
      title: 'Portfolio Review - Jan 10',
      date: '2026-01-10',
      duration: '45 min',
      participants: 'You, Financial Advisor',
      keyPoints: ['Diversification needed', 'Consider index funds', 'Review quarterly'],
      status: 'ready',
    },
  ]);
  const [searchTerm, setSearchTerm] = useState('');
  const [userEmail, setUserEmail] = useState(null);

  useEffect(() => {
    base44.auth.me()
      .then(user => setUserEmail(user?.email))
      .catch(() => setUserEmail(null));

    subscribeToVideoUploads();
  }, []);

  const subscribeToVideoUploads = () => {
    // Subscribe to new video uploads
    const unsubscribe = base44.entities.MediaAsset?.subscribe?.((event) => {
      if (event.type === 'create' && event.data.type === 'video_memory') {
        setMemories(prev => [event.data, ...prev]);
      }
    });

    return unsubscribe;
  };

  const filteredMemories = memories.filter(m =>
    m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.participants.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const downloadMemory = async (memory) => {
    try {
      await base44.integrations.Core.InvokeLLM({
        prompt: `Generate download link for video memory:
        
MemoryID: ${memory.id}
Title: ${memory.title}
User: ${userEmail}`,
      });

      // Trigger download
      window.location.href = `https://drive.google.com/download/${memory.id}`;
    } catch (error) {
      console.error('Error downloading:', error);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search memories..."
          className="w-full bg-white/10 border border-white/20 rounded-lg pl-9 pr-4 py-2 text-white placeholder-white/40 text-sm"
        />
      </div>

      {/* Storage Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white/5 border border-white/10 rounded-lg p-3"
      >
        <div className="flex items-center justify-between mb-2">
          <p className="text-white font-semibold text-sm flex items-center gap-2">
            <Folder className="w-4 h-4" /> Google Drive Storage
          </p>
          <p className="text-white/60 text-xs">{memories.length} videos</p>
        </div>
        <div className="w-full bg-white/10 rounded-full h-2">
          <div className="bg-cyan-500 h-2 rounded-full w-1/3" />
        </div>
        <p className="text-white/60 text-xs mt-1">~5.2 GB / 15 GB used</p>
      </motion.div>

      {/* Video Memories */}
      <div className="space-y-2">
        {filteredMemories.map((memory, idx) => (
          <motion.div
            key={memory.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white/5 border border-white/10 rounded-lg p-3 space-y-2"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-white font-semibold text-sm">{memory.title}</p>
                <p className="text-white/60 text-xs mt-1">{memory.date} • {memory.duration}</p>
                <p className="text-white/40 text-xs">{memory.participants}</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                onClick={() => downloadMemory(memory)}
                className="p-2 hover:bg-white/10 rounded"
              >
                <Download className="w-4 h-4 text-cyan-400" />
              </motion.button>
            </div>

            {memory.keyPoints && memory.keyPoints.length > 0 && (
              <div className="border-t border-white/10 pt-2">
                <p className="text-white/60 text-xs font-semibold mb-1">Key Points:</p>
                <ul className="space-y-0.5">
                  {memory.keyPoints.slice(0, 3).map((point, idx) => (
                    <li key={idx} className="text-white/50 text-xs">• {point}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                memory.status === 'ready' ? 'bg-green-400' : 'bg-yellow-400'
              }`} />
              <p className="text-white/60 text-xs capitalize">{memory.status}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredMemories.length === 0 && (
        <p className="text-white/40 text-sm text-center py-4">No memories found</p>
      )}
    </div>
  );
}