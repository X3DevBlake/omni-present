import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';

export default function CustomMemoryDesigner({ agent, onSave }) {
  const [memories, setMemories] = useState([]);
  const [retrievalRules, setRetrievalRules] = useState({
    recencyWeight: 50,
    importanceWeight: 30,
    relevanceWeight: 20,
  });

  const addMemory = () => {
    setMemories([...memories, {
      id: Date.now(),
      content: '',
      tags: [],
      importance: 50,
      context: '',
    }]);
  };

  return (
    <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-xl p-6">
      <h3 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
        <Brain className="w-6 h-6 text-cyan-400" />
        Custom Memory Designer
      </h3>

      <div className="bg-black/20 rounded-lg p-4 mb-6">
        <h4 className="text-white font-semibold mb-3">Retrieval Mechanism</h4>
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-white text-sm">Recency Weight</span>
              <span className="text-cyan-400 text-sm">{retrievalRules.recencyWeight}%</span>
            </div>
            <Slider
              value={[retrievalRules.recencyWeight]}
              onValueChange={([v]) => setRetrievalRules({...retrievalRules, recencyWeight: v})}
              max={100}
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-white text-sm">Importance Weight</span>
              <span className="text-cyan-400 text-sm">{retrievalRules.importanceWeight}%</span>
            </div>
            <Slider
              value={[retrievalRules.importanceWeight]}
              onValueChange={([v]) => setRetrievalRules({...retrievalRules, importanceWeight: v})}
              max={100}
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-white text-sm">Relevance Weight</span>
              <span className="text-cyan-400 text-sm">{retrievalRules.relevanceWeight}%</span>
            </div>
            <Slider
              value={[retrievalRules.relevanceWeight]}
              onValueChange={([v]) => setRetrievalRules({...retrievalRules, relevanceWeight: v})}
              max={100}
            />
          </div>
        </div>
      </div>

      <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
        {memories.map((memory, i) => (
          <div key={memory.id} className="bg-black/20 rounded-lg p-3">
            <Textarea
              value={memory.content}
              onChange={(e) => {
                const updated = [...memories];
                updated[i].content = e.target.value;
                setMemories(updated);
              }}
              placeholder="Memory content..."
              className="bg-white/5 border-white/10 text-white mb-2 text-sm"
            />
            <Input
              value={memory.tags.join(', ')}
              onChange={(e) => {
                const updated = [...memories];
                updated[i].tags = e.target.value.split(',').map(t => t.trim());
                setMemories(updated);
              }}
              placeholder="Tags (comma-separated)"
              className="bg-white/5 border-white/10 text-white text-xs"
            />
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Button onClick={addMemory} className="flex-1 bg-cyan-500/20 hover:bg-cyan-500/30">
          <Plus className="w-4 h-4 mr-2" />
          Add Memory
        </Button>
        <Button onClick={() => onSave?.({ memories, retrievalRules })} className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500">
          Save Configuration
        </Button>
      </div>
    </div>
  );
}