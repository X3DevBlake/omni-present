import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Search, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';

export default function AIResearchAssistant() {
  const [query, setQuery] = useState('');
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(false);

  const searchPapers = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Search for academic papers related to: "${query}". Return 5 relevant papers with title, authors, year, summary, and relevance score.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            papers: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  authors: { type: "string" },
                  year: { type: "number" },
                  summary: { type: "string" },
                  relevance: { type: "number" }
                }
              }
            }
          }
        }
      });
      setPapers(response.papers || []);
    } catch (err) {
      console.error('Failed to search papers');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/30 rounded-xl p-6">
      <h3 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
        <BookOpen className="w-6 h-6 text-blue-400" />
        AI Research Assistant
      </h3>

      <div className="flex gap-2 mb-6">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search research papers..."
          className="bg-white/10 border-white/20 text-white"
          onKeyPress={(e) => e.key === 'Enter' && searchPapers()}
        />
        <Button onClick={searchPapers} disabled={loading} className="bg-blue-500/20 hover:bg-blue-500/30">
          <Search className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {papers.map((paper, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-black/20 rounded-lg p-4"
          >
            <div className="flex items-start justify-between mb-2">
              <FileText className="w-5 h-5 text-blue-400 flex-shrink-0 mt-1" />
              <div className="flex-1 ml-3">
                <h4 className="text-white font-semibold mb-1">{paper.title}</h4>
                <div className="text-white/60 text-sm mb-2">{paper.authors} ({paper.year})</div>
                <p className="text-white/70 text-sm mb-2">{paper.summary}</p>
                <div className="text-blue-400 text-xs">Relevance: {(paper.relevance * 100).toFixed(0)}%</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}