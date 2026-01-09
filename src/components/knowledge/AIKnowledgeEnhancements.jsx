import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, FileText, Users, Link as LinkIcon, Edit } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function AIKnowledgeEnhancements() {
  const [articles, setArticles] = useState([
    { id: 1, title: 'Agent Communication Protocols', content: 'Detailed guide on how agents communicate...', status: 'published', editor: null },
    { id: 2, title: 'Machine Learning Best Practices', content: 'Essential ML techniques for optimal performance...', status: 'review', editor: 'User-2' }
  ]);

  const [selectedArticle, setSelectedArticle] = useState(null);
  const [generatedFAQ, setGeneratedFAQ] = useState(null);
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [summary, setSummary] = useState(null);
  const [semanticLinks, setSemanticLinks] = useState([]);

  const generateFAQ = async (article) => {
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate 5 frequently asked questions and detailed answers based on this article: "${article.title}". Content: ${article.content}`,
      response_json_schema: {
        type: 'object',
        properties: {
          faqs: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                question: { type: 'string' },
                answer: { type: 'string' }
              }
            }
          }
        }
      }
    });

    setGeneratedFAQ(response.faqs);
  };

  const generateSummary = async (article) => {
    setGeneratingSummary(true);
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Create a concise 2-3 sentence summary of this article: "${article.title}". ${article.content}`,
      response_json_schema: {
        type: 'object',
        properties: {
          summary: { type: 'string' },
          key_points: { type: 'array', items: { type: 'string' } }
        }
      }
    });

    setSummary(response);
    setGeneratingSummary(false);
  };

  const findSemanticLinks = async (article) => {
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Given article "${article.title}", find semantically similar topics from: ${articles.map(a => a.title).join(', ')}. Return related article titles and connection strength (0-100).`,
      response_json_schema: {
        type: 'object',
        properties: {
          links: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                article: { type: 'string' },
                strength: { type: 'number' },
                reason: { type: 'string' }
              }
            }
          }
        }
      }
    });

    setSemanticLinks(response.links);
  };

  const requestReview = (articleId) => {
    setArticles(articles.map(a => 
      a.id === articleId ? { ...a, status: 'review', editor: 'Reviewer-AI' } : a
    ));
  };

  return (
    <div className="space-y-6">
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6">
        <h3 className="text-white font-bold text-xl mb-4">AI Knowledge Enhancements</h3>

        {/* Article List */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {articles.map(article => (
            <motion.div
              key={article.id}
              whileHover={{ scale: 1.02 }}
              onClick={() => setSelectedArticle(article)}
              className={`p-4 rounded-xl border cursor-pointer ${
                selectedArticle?.id === article.id
                  ? 'bg-purple-500/20 border-purple-500/50'
                  : 'bg-white/5 border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-white font-semibold text-sm">{article.title}</h4>
                <span className={`px-2 py-0.5 rounded text-xs ${
                  article.status === 'published' ? 'bg-green-500/20 text-green-400' :
                  'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {article.status}
                </span>
              </div>
              <p className="text-white/60 text-xs line-clamp-2">{article.content}</p>
              {article.editor && (
                <p className="text-cyan-400 text-xs mt-2 flex items-center gap-1">
                  <Edit className="w-3 h-3" />
                  Editing: {article.editor}
                </p>
              )}
            </motion.div>
          ))}
        </div>

        {selectedArticle && (
          <>
            {/* Action Buttons */}
            <div className="flex gap-2 mb-6 flex-wrap">
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => generateFAQ(selectedArticle)}
                className="px-4 py-2 bg-purple-500/20 border border-purple-500/50 rounded-lg text-purple-400 font-semibold text-sm flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Generate FAQ
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => generateSummary(selectedArticle)}
                disabled={generatingSummary}
                className="px-4 py-2 bg-cyan-500/20 border border-cyan-500/50 rounded-lg text-cyan-400 font-semibold text-sm flex items-center gap-2 disabled:opacity-50"
              >
                <FileText className="w-4 h-4" />
                {generatingSummary ? 'Generating...' : 'Generate Summary'}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => findSemanticLinks(selectedArticle)}
                className="px-4 py-2 bg-green-500/20 border border-green-500/50 rounded-lg text-green-400 font-semibold text-sm flex items-center gap-2"
              >
                <LinkIcon className="w-4 h-4" />
                Find Links
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => requestReview(selectedArticle.id)}
                className="px-4 py-2 bg-yellow-500/20 border border-yellow-500/50 rounded-lg text-yellow-400 font-semibold text-sm flex items-center gap-2"
              >
                <Users className="w-4 h-4" />
                Request Review
              </motion.button>
            </div>

            {/* Generated FAQ */}
            {generatedFAQ && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl"
              >
                <h4 className="text-purple-400 font-bold mb-3 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Auto-Generated FAQs
                </h4>
                <div className="space-y-3">
                  {generatedFAQ.map((faq, idx) => (
                    <div key={idx} className="p-3 bg-black/20 rounded-lg">
                      <p className="text-white font-semibold text-sm mb-2">Q: {faq.question}</p>
                      <p className="text-white/70 text-sm">A: {faq.answer}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Generated Summary */}
            {summary && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-xl"
              >
                <h4 className="text-cyan-400 font-bold mb-3">AI-Generated Summary</h4>
                <p className="text-white mb-3">{summary.summary}</p>
                <div>
                  <p className="text-white/60 text-sm mb-2">Key Points:</p>
                  {summary.key_points.map((point, idx) => (
                    <p key={idx} className="text-white/80 text-sm">• {point}</p>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Semantic Links */}
            {semanticLinks.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl"
              >
                <h4 className="text-green-400 font-bold mb-3 flex items-center gap-2">
                  <LinkIcon className="w-5 h-5" />
                  Semantic Connections
                </h4>
                <div className="space-y-2">
                  {semanticLinks.map((link, idx) => (
                    <div key={idx} className="p-3 bg-black/20 rounded-lg flex items-center justify-between">
                      <div>
                        <p className="text-white font-semibold text-sm">{link.article}</p>
                        <p className="text-white/60 text-xs">{link.reason}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-black/40 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-green-400 to-cyan-400"
                            style={{ width: `${link.strength}%` }}
                          />
                        </div>
                        <span className="text-green-400 text-xs font-bold">{link.strength}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}