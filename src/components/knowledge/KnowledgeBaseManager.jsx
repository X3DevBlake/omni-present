import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Plus, Trash2, FileText, Link as LinkIcon, Database } from 'lucide-react';

export default function KnowledgeBaseManager() {
  const [sources, setSources] = useState([
    { id: 1, name: 'Market Analysis Q1 2026', type: 'document', size: '2.4 MB', uploaded: '2 days ago' },
    { id: 2, name: 'Trading Strategies Guide', type: 'document', size: '1.8 MB', uploaded: '1 week ago' },
    { id: 3, name: 'https://tradingdata.com/api', type: 'url', status: 'active', lastSync: '2 hours ago' }
  ]);

  const [newSource, setNewSource] = useState({ type: 'document', content: '' });
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleDelete = (id) => {
    setSources(sources.filter(s => s.id !== id));
  };

  const handleUpload = () => {
    if (!newSource.content.trim()) return;
    
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.random() * 30;
      });
    }, 200);

    setTimeout(() => {
      setSources([...sources, {
        id: Date.now(),
        name: newSource.content.substring(0, 30) + '...',
        type: newSource.type,
        size: '0.5 MB',
        uploaded: 'just now'
      }]);
      setNewSource({ type: 'document', content: '' });
      setUploadProgress(0);
    }, 2000);
  };

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Upload Section */}
      <div className="bg-black/40 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <Upload className="w-6 h-6 text-cyan-400" />
          <h3 className="text-white font-bold text-lg">Add Knowledge Sources</h3>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-white/70 text-sm mb-2 block">Source Type</label>
            <div className="flex gap-2">
              {[
                { value: 'document', label: '📄 Document', icon: FileText },
                { value: 'url', label: '🔗 URL', icon: LinkIcon },
                { value: 'data', label: '📊 Structured Data', icon: Database }
              ].map(option => (
                <motion.button
                  key={option.value}
                  onClick={() => setNewSource({ ...newSource, type: option.value })}
                  whileHover={{ scale: 1.02 }}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                    newSource.type === option.value
                      ? 'bg-cyan-500/30 border border-cyan-500/50 text-cyan-400'
                      : 'bg-white/5 border border-white/10 text-white/70'
                  }`}
                >
                  {option.label}
                </motion.button>
              ))}
            </div>
          </div>

          <textarea
            value={newSource.content}
            onChange={(e) => setNewSource({ ...newSource, content: e.target.value })}
            placeholder={newSource.type === 'url' ? 'Enter URL...' : 'Paste content or upload file...'}
            className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white text-sm h-24 resize-none"
          />

          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-white/70">
                <span>Uploading...</span>
                <span>{Math.floor(uploadProgress)}%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                <motion.div
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full"
                  animate={{ width: `${uploadProgress}%` }}
                  transition={{ duration: 0.2 }}
                />
              </div>
            </div>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            onClick={handleUpload}
            disabled={uploadProgress > 0 && uploadProgress < 100}
            className="w-full py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 rounded-lg text-cyan-400 font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add to Knowledge Base
          </motion.button>
        </div>
      </div>

      {/* Sources List */}
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <h3 className="text-white font-bold text-lg mb-4">Knowledge Sources ({sources.length})</h3>
        <div className="space-y-3">
          {sources.filter(source => source && source.id && source.name).map((source) => {
            return (
              <motion.div
                key={source.id}
                layout
                className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-colors"
              >
                <span className="text-2xl">
                  {source.type === 'document' ? '📄' : source.type === 'url' ? '🔗' : '📊'}
                </span>
                <div className="flex-1">
                  <p className="text-white font-semibold text-sm">{source.name || 'Unnamed Source'}</p>
                  <div className="flex gap-2 mt-1 text-xs text-white/50">
                    <span>{source.type || 'unknown'}</span>
                    <span>•</span>
                    {source.size && <span>{source.size}</span>}
                    {source.status && <span>Status: {source.status}</span>}
                    <span>•</span>
                    <span>{source.uploaded || source.lastSync || 'N/A'}</span>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  onClick={() => handleDelete(source.id)}
                  className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </motion.button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}