import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Line, Sphere } from '@react-three/drei';
import { Search, MessageCircle, Sparkles, Layers } from 'lucide-react';
import { base44 } from '@/api/base44Client';

function KnowledgeNode3D({ position, article, onClick, isHighlighted }) {
  const color = isHighlighted ? '#00f5ff' : '#a855f7';
  
  return (
    <group position={position} onClick={() => onClick(article)}>
      <Sphere args={[0.3, 16, 16]}>
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={isHighlighted ? 0.8 : 0.4} />
      </Sphere>
      <Text position={[0, -0.6, 0]} fontSize={0.12} color="white">{article.title}</Text>
    </group>
  );
}

export default function ContextAwareKnowledgeHub() {
  const [articles] = useState([
    { id: 1, title: 'Agent Optimization', category: 'performance', connections: [2, 3] },
    { id: 2, title: 'Memory Systems', category: 'architecture', connections: [1, 4] },
    { id: 3, title: 'Task Distribution', category: 'performance', connections: [1, 5] },
    { id: 4, title: 'Learning Algorithms', category: 'training', connections: [2, 5] },
    { id: 5, title: 'Collaboration Patterns', category: 'social', connections: [3, 4] }
  ]);

  const [contextSuggestions, setContextSuggestions] = useState([]);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [qaSummary, setQaSummary] = useState(null);
  const [question, setQuestion] = useState('');

  useEffect(() => {
    generateContextSuggestions();
  }, []);

  const generateContextSuggestions = async () => {
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Based on current user activity focusing on agent performance optimization, suggest 3-4 relevant knowledge articles from the graph. Include title and relevance explanation.`,
      response_json_schema: {
        type: 'object',
        properties: {
          suggestions: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                relevance: { type: 'string' },
                priority: { type: 'string' }
              }
            }
          }
        }
      }
    });

    setContextSuggestions(response.suggestions);
  };

  const summarizeArticle = async (article) => {
    setSelectedArticle(article);
    
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Provide a concise summary of the knowledge article "${article.title}" in the context of AI agent systems. Include key concepts and practical applications.`,
      response_json_schema: {
        type: 'object',
        properties: {
          summary: { type: 'string' },
          key_concepts: { type: 'array', items: { type: 'string' } },
          related_topics: { type: 'array', items: { type: 'string' } }
        }
      }
    });

    setQaSummary(response);
  };

  const askQuestion = async () => {
    if (!question.trim()) return;
    
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Answer this question using the AI knowledge graph: "${question}". Provide a detailed answer with references to relevant knowledge articles.`
    });

    setQaSummary({
      summary: response,
      key_concepts: [],
      related_topics: []
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6">
        <h3 className="text-white font-bold text-xl mb-4">Context-Aware Knowledge Graph</h3>

        {/* Context Suggestions */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-yellow-400" />
            <h4 className="text-white font-bold">Suggested for You</h4>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            {contextSuggestions.map((suggestion, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="p-3 bg-gradient-to-br from-yellow-500/10 to-orange-500/5 border border-yellow-500/30 rounded-lg cursor-pointer hover:border-yellow-500/50"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-semibold text-sm">{suggestion.title}</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    suggestion.priority === 'high' ? 'bg-red-500/20 text-red-400' : 'bg-cyan-500/20 text-cyan-400'
                  }`}>
                    {suggestion.priority}
                  </span>
                </div>
                <p className="text-white/60 text-xs">{suggestion.relevance}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Interactive 3D Knowledge Graph */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          <div className="h-96 bg-black/20 rounded-xl overflow-hidden">
            <Canvas camera={{ position: [0, 0, 12], fov: 60 }}>
              <ambientLight intensity={0.5} />
              <pointLight position={[10, 10, 10]} intensity={1} />
              
              {articles.map((article, idx) => {
                const angle = (idx / articles.length) * Math.PI * 2;
                return (
                  <KnowledgeNode3D
                    key={article.id}
                    position={[Math.cos(angle) * 5, Math.sin(angle) * 5, 0]}
                    article={article}
                    onClick={summarizeArticle}
                    isHighlighted={selectedArticle?.id === article.id}
                  />
                );
              })}

              {articles.map(article => 
                article.connections.map(connId => {
                  const fromIdx = articles.findIndex(a => a.id === article.id);
                  const toIdx = articles.findIndex(a => a.id === connId);
                  if (fromIdx === -1 || toIdx === -1) return null;
                  const fromAngle = (fromIdx / articles.length) * Math.PI * 2;
                  const toAngle = (toIdx / articles.length) * Math.PI * 2;
                  return (
                    <Line
                      key={`${article.id}-${connId}`}
                      points={[
                        [Math.cos(fromAngle) * 5, Math.sin(fromAngle) * 5, 0],
                        [Math.cos(toAngle) * 5, Math.sin(toAngle) * 5, 0]
                      ]}
                      color="#ffffff20"
                      lineWidth={1}
                    />
                  );
                })
              )}

              <OrbitControls enableZoom />
            </Canvas>
          </div>

          {/* Article Summary & Q&A */}
          <div className="space-y-4">
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-cyan-400" />
                Ask the Knowledge Graph
              </h4>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="What would you like to know?"
                  className="flex-1 bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm"
                  onKeyPress={(e) => e.key === 'Enter' && askQuestion()}
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={askQuestion}
                  className="px-4 py-2 bg-cyan-500/20 border border-cyan-500/50 rounded text-cyan-400 font-semibold text-sm"
                >
                  <Search className="w-4 h-4" />
                </motion.button>
              </div>
            </div>

            {qaSummary && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-purple-500/10 to-cyan-500/5 border border-purple-500/30 rounded-xl p-4"
              >
                {selectedArticle && (
                  <h4 className="text-purple-400 font-bold mb-2">{selectedArticle.title}</h4>
                )}
                <p className="text-white/80 text-sm mb-3">{qaSummary.summary}</p>
                
                {qaSummary.key_concepts.length > 0 && (
                  <div className="mb-3">
                    <p className="text-white/60 text-xs mb-2">Key Concepts:</p>
                    {qaSummary.key_concepts.map((concept, idx) => (
                      <span key={idx} className="inline-block px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded text-xs mr-2 mb-2">
                        {concept}
                      </span>
                    ))}
                  </div>
                )}

                {qaSummary.related_topics.length > 0 && (
                  <div>
                    <p className="text-white/60 text-xs mb-2">Related Topics:</p>
                    {qaSummary.related_topics.map((topic, idx) => (
                      <span key={idx} className="inline-block px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs mr-2 mb-2">
                        {topic}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>

        {/* Quick Insights */}
        <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/5 border border-cyan-500/30 rounded-xl p-4">
          <h4 className="text-cyan-400 font-bold mb-3 flex items-center gap-2">
            <Layers className="w-4 h-4" />
            Knowledge Graph Insights
          </h4>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-white mb-1">{articles.length}</p>
              <p className="text-white/60 text-xs">Articles</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-400 mb-1">
                {articles.reduce((sum, a) => sum + a.connections.length, 0)}
              </p>
              <p className="text-white/60 text-xs">Connections</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-400 mb-1">94%</p>
              <p className="text-white/60 text-xs">Coverage</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}