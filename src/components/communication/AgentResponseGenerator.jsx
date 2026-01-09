import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Send, Sparkles } from 'lucide-react';

export default function AgentResponseGenerator() {
  const [selectedAgent, setSelectedAgent] = useState('Explorer-01');
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const agents = [
    { name: 'Explorer-01', color: '#00f5ff', skills: ['discovery', 'analysis', 'reporting'] },
    { name: 'Trader-05', color: '#10b981', skills: ['negotiation', 'trading', 'market-analysis'] },
    { name: 'Analyst-12', color: '#a855f7', skills: ['research', 'synthesis', 'forecasting'] },
    { name: 'Coordinator-08', color: '#ec4899', skills: ['planning', 'coordination', 'optimization'] }
  ];

  const agent = agents.find(a => a.name === selectedAgent);

  const generateResponse = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    // Simulate AI response generation
    await new Promise(resolve => setTimeout(resolve, 1500));
    setResponse(`${selectedAgent} response: "${prompt}" - Generated using ${agent.skills.join(', ')} capabilities.`);
    setLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid lg:grid-cols-2 gap-6"
    >
      {/* Agent Selection & Skills */}
      <div className="bg-black/40 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <Brain className="w-6 h-6 text-purple-400" />
          <h3 className="text-white font-bold text-lg">Agent Response Generator</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-white/70 text-sm mb-2 block">Select Agent</label>
            <div className="grid grid-cols-2 gap-2">
              {agents.map((a) => (
                <motion.button
                  key={a.name}
                  onClick={() => setSelectedAgent(a.name)}
                  whileHover={{ scale: 1.02 }}
                  className={`py-2 px-3 rounded-lg text-sm font-semibold transition-all border ${
                    selectedAgent === a.name
                      ? 'bg-white/20 border-white/40 text-white'
                      : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                  }`}
                >
                  {a.name}
                </motion.button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-white/70 text-sm mb-2 block">Agent Skills</label>
            <div className="flex flex-wrap gap-2">
              {agent?.skills.map((skill) => (
                <span key={skill} className="text-xs bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="text-white/70 text-sm mb-2 block">Prompt for Agent</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="What should this agent respond to?"
              className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white text-sm h-32 resize-none"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            onClick={generateResponse}
            disabled={loading || !prompt.trim()}
            className="w-full py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="animate-spin">⚙️</span>
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Response
              </>
            )}
          </motion.button>
        </div>
      </div>

      {/* Response Display */}
      <div className="bg-black/40 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <Send className="w-6 h-6 text-cyan-400" />
          <h3 className="text-white font-bold text-lg">Generated Response</h3>
        </div>

        {response ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white/5 border border-cyan-500/20 rounded-lg p-4 text-white/80 text-sm leading-relaxed"
          >
            {response}
          </motion.div>
        ) : (
          <div className="text-white/40 text-sm text-center py-8">
            Generate a response to see results here
          </div>
        )}
      </div>
    </motion.div>
  );
}