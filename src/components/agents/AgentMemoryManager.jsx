import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Brain, Trash2, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AgentMemoryManager({ agentId }) {
  const [searchQuery, setSearchQuery] = useState('');

  const { data: memories = [] } = useQuery({
    queryKey: ['agentMemories', agentId],
    queryFn: () => base44.entities.AgentMemoryStore.filter({ agent_id: agentId }).catch(() => [])
  });

  const groupedMemories = memories.reduce((acc, mem) => {
    if (!acc[mem.memory_type]) acc[mem.memory_type] = [];
    acc[mem.memory_type].push(mem);
    return acc;
  }, {});

  const filteredMemories = Object.entries(groupedMemories).reduce((acc, [type, mems]) => {
    acc[type] = mems.filter(m =>
      JSON.stringify(m.content).toLowerCase().includes(searchQuery.toLowerCase())
    );
    return acc;
  }, {});

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-2 mb-4">
        <Brain className="w-5 h-5 text-cyan-400" />
        <h3 className="text-white font-bold">Agent Memory Management</h3>
      </div>

      <Input
        placeholder="Search memories..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="bg-white/5 border-white/10"
        icon={<Search className="w-4 h-4" />}
      />

      <Tabs defaultValue="short_term" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-white/5">
          <TabsTrigger value="short_term">Short-term</TabsTrigger>
          <TabsTrigger value="long_term">Long-term</TabsTrigger>
          <TabsTrigger value="episodic">Episodic</TabsTrigger>
          <TabsTrigger value="semantic">Semantic</TabsTrigger>
        </TabsList>

        {['short_term', 'long_term', 'episodic', 'semantic'].map((type) => (
          <TabsContent key={type} value={type} className="space-y-2">
            {(filteredMemories[type] || []).length > 0 ? (
              (filteredMemories[type] || []).map((mem, idx) => (
                <motion.div
                  key={mem.id || idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white/5 border border-white/10 rounded-lg p-3 hover:bg-white/10 transition"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <p className="text-white text-sm font-bold">
                        {mem.content?.title || `Memory ${idx + 1}`}
                      </p>
                      <p className="text-white/50 text-xs">
                        Importance: {(mem.importance_score * 100).toFixed(0)}%
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <p className="text-white/70 text-xs line-clamp-2">
                    {typeof mem.content === 'string'
                      ? mem.content
                      : JSON.stringify(mem.content).substring(0, 100)}
                  </p>

                  {mem.learned_patterns && mem.learned_patterns.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {mem.learned_patterns.slice(0, 3).map((pattern, pidx) => (
                        <span key={pidx} className="bg-cyan-500/20 text-cyan-300 text-xs px-2 py-1 rounded">
                          {pattern}
                        </span>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))
            ) : (
              <p className="text-white/40 text-sm text-center py-8">No {type} memories</p>
            )}
          </TabsContent>
        ))}
      </Tabs>

      <div className="grid grid-cols-2 gap-2 text-xs bg-white/5 border border-white/10 rounded-lg p-3">
        <div>
          <p className="text-white/60">Total Memories</p>
          <p className="text-white font-bold">{memories.length}</p>
        </div>
        <div>
          <p className="text-white/60">Avg Importance</p>
          <p className="text-white font-bold">
            {memories.length > 0
              ? (
                memories.reduce((sum, m) => sum + (m.importance_score || 0), 0) / memories.length * 100
              ).toFixed(0)
              : 0}%
          </p>
        </div>
      </div>
    </motion.div>
  );
}