import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Zap, MessageCircle, Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function EnhancedAgentMemory({ agentId }) {
  const [memories, setMemories] = useState([]);
  const [summary, setSummary] = useState(null);
  const [relevantMemories, setRelevantMemories] = useState([]);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [loadingRetrieval, setLoadingRetrieval] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    loadMemories();
  }, [agentId]);

  const loadMemories = async () => {
    try {
      const data = await base44.entities.AgentMemory.filter(
        { agent_id: agentId },
        '-importance_score',
        50
      );
      setMemories(data);
    } catch (err) {
      console.error('Failed to load memories:', err);
    }
  };

  const generateSummary = async () => {
    if (memories.length === 0) {
      toast.error('No memories to summarize');
      return;
    }

    setLoadingSummary(true);
    try {
      const memoryContent = memories
        .map(m => `${m.memory_type}: ${m.content}`)
        .join('\n');

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Summarize the following agent memories and identify key patterns, relationships, and important facts:

${memoryContent}

Provide a concise summary with:
1. Core knowledge and facts
2. Learned patterns and behaviors
3. User preferences and relationships
4. Important connections between memories`,
        add_context_from_internet: false
      });

      setSummary(response);
      toast.success('Summary generated!');
    } catch (err) {
      toast.error('Failed to generate summary');
    } finally {
      setLoadingSummary(false);
    }
  };

  const retrieveContextualMemories = async () => {
    if (!query.trim()) {
      toast.error('Enter a query');
      return;
    }

    setLoadingRetrieval(true);
    try {
      const prompt = `Given this query: "${query}"

And these agent memories:
${memories.map(m => `- [${m.memory_type}] ${m.content}`).join('\n')}

Identify the 3-5 most relevant memories that would help answer or inform about this query.
Explain why each is relevant and how they connect to the query.

Format as JSON:
{
  "relevant_memories": [
    {"memory": "memory content", "relevance": "why it matters", "connection": "how it connects"}
  ],
  "synthesis": "overall insight from combining these memories"
}`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            relevant_memories: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  memory: { type: 'string' },
                  relevance: { type: 'string' },
                  connection: { type: 'string' }
                }
              }
            },
            synthesis: { type: 'string' }
          }
        }
      });

      setRelevantMemories(response.relevant_memories || []);
      toast.success('Retrieved contextual memories!');
    } catch (err) {
      toast.error('Failed to retrieve memories');
    } finally {
      setLoadingRetrieval(false);
    }
  };

  return (
    <div className="bg-black/40 border border-blue-500/30 rounded-2xl p-6 space-y-6">
      <h3 className="text-white font-bold flex items-center gap-2">
        <Brain className="w-5 h-5 text-blue-400" />
        Enhanced Memory System
      </h3>

      {/* AI Summarization */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-yellow-400" />
          <p className="text-white/60 text-sm font-bold">AI Summarization</p>
        </div>
        
        <motion.button
          onClick={generateSummary}
          disabled={loadingSummary || memories.length === 0}
          whileHover={{ scale: 1.05 }}
          className="w-full py-2 bg-yellow-500/20 border border-yellow-500/40 text-yellow-300 rounded font-medium text-sm disabled:opacity-50"
        >
          {loadingSummary ? 'Generating...' : 'Generate Memory Summary'}
        </motion.button>

        {summary && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white/5 border border-yellow-500/30 rounded-lg p-3"
          >
            <p className="text-white/80 text-sm whitespace-pre-wrap">{summary}</p>
          </motion.div>
        )}
      </div>

      {/* Contextual Retrieval */}
      <div className="space-y-3 border-t border-white/10 pt-6">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-cyan-400" />
          <p className="text-white/60 text-sm font-bold">Contextual Retrieval</p>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Ask something about agent memories..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && retrieveContextualMemories()}
            className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm placeholder-white/40"
          />
          <motion.button
            onClick={retrieveContextualMemories}
            disabled={loadingRetrieval || !query.trim()}
            whileHover={{ scale: 1.05 }}
            className="px-4 py-2 bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 rounded font-medium text-sm disabled:opacity-50"
          >
            Search
          </motion.button>
        </div>

        {relevantMemories.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-2"
          >
            {relevantMemories.map((item, i) => (
              <div key={i} className="bg-white/5 border border-cyan-500/30 rounded-lg p-3">
                <p className="text-cyan-400 text-xs font-bold mb-1">Memory {i + 1}</p>
                <p className="text-white/80 text-xs mb-2">{item.memory}</p>
                <div className="space-y-1 text-xs text-white/60">
                  <p><strong>Relevance:</strong> {item.relevance}</p>
                  <p><strong>Connection:</strong> {item.connection}</p>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Proactive Recall Status */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-3">
        <p className="text-white/60 text-xs font-bold mb-2">System Status:</p>
        <div className="space-y-1 text-xs text-white/70">
          <div className="flex justify-between">
            <span>Total Memories:</span>
            <span className="text-cyan-400">{memories.length}</span>
          </div>
          <div className="flex justify-between">
            <span>High Importance:</span>
            <span className="text-yellow-400">{memories.filter(m => m.importance_score >= 75).length}</span>
          </div>
          <div className="flex justify-between">
            <span>Recently Accessed:</span>
            <span className="text-green-400">{memories.filter(m => m.access_count > 0).length}</span>
          </div>
          <div className="flex justify-between">
            <span>Proactive Recall:</span>
            <span className="text-purple-400">Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}