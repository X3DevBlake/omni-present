import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Save, History, Users, Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function SmartDocumentEditor({ documentId, userEmail }) {
  const [content, setContent] = useState('');
  const [versions, setVersions] = useState([]);
  const [collaborators, setCollaborators] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadDocument();
    loadVersions();
    
    // Subscribe to real-time updates
    const unsubscribe = base44.entities.CollaborativeDocument.subscribe((event) => {
      if (event.data.id === documentId && event.type === 'update') {
        setContent(event.data.content);
        setCollaborators(event.data.collaborators || []);
      }
    });

    return unsubscribe;
  }, [documentId]);

  const loadDocument = async () => {
    try {
      const docs = await base44.entities.CollaborativeDocument.list({ id: documentId });
      if (docs[0]) {
        setContent(docs[0].content || '');
        setCollaborators(docs[0].collaborators || []);
      }
    } catch (error) {
      console.error('Error loading document:', error);
    }
  };

  const loadVersions = async () => {
    try {
      const history = await base44.entities.DocumentVersion.list(
        { documentId },
        '-created_date',
        10
      );
      setVersions(history);
    } catch (error) {
      console.error('Error loading versions:', error);
    }
  };

  const saveDocument = async () => {
    setSaving(true);
    try {
      // Save current version
      await base44.entities.CollaborativeDocument.update(documentId, {
        content,
        last_modified: new Date().toISOString()
      });

      // Create version snapshot
      const versionNum = versions.length + 1;
      await base44.entities.DocumentVersion.create({
        documentId,
        versionNumber: versionNum,
        authorEmail: userEmail,
        snapshot: { content },
        changesSummary: `Version ${versionNum} saved`,
        createdAt: new Date().toISOString()
      });

      await loadVersions();
      alert('Document saved!');
    } catch (error) {
      console.error('Error saving document:', error);
    } finally {
      setSaving(false);
    }
  };

  const generateSummary = async () => {
    try {
      const summary = await base44.integrations.Core.InvokeLLM({
        prompt: `Summarize this document and extract action items:\n\n${content}`,
        response_json_schema: {
          type: 'object',
          properties: {
            summary: { type: 'string' },
            action_items: { type: 'array', items: { type: 'string' } }
          }
        }
      });

      alert(`Summary: ${summary.summary}\n\nAction Items:\n${summary.action_items.join('\n')}`);
    } catch (error) {
      console.error('Error generating summary:', error);
    }
  };

  const restoreVersion = async (version) => {
    if (!confirm(`Restore version ${version.versionNumber}?`)) return;
    setContent(version.snapshot.content);
    await saveDocument();
  };

  return (
    <div className="space-y-4">
      {/* Editor Header */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            <h3 className="text-white font-bold">Document Editor</h3>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-white/60" />
            <span className="text-white/60 text-sm">{collaborators.length} active</span>
          </div>
        </div>

        {/* Collaborators */}
        <div className="flex gap-2 mb-3">
          {collaborators.slice(0, 5).map((email, idx) => (
            <div key={idx} className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">{email[0].toUpperCase()}</span>
            </div>
          ))}
        </div>

        {/* Editor */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Start typing..."
          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder:text-white/40 h-64 font-mono text-sm"
        />

        {/* Actions */}
        <div className="flex gap-2 mt-3">
          <button
            onClick={saveDocument}
            disabled={saving}
            className="px-4 py-2 bg-green-500/20 border border-green-400 text-green-300 rounded font-semibold hover:bg-green-500/30 flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save'}
          </button>
          <button
            onClick={generateSummary}
            className="px-4 py-2 bg-purple-500/20 border border-purple-400 text-purple-300 rounded font-semibold hover:bg-purple-500/30 flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            AI Summary
          </button>
        </div>
      </div>

      {/* Version History */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-4">
        <h4 className="text-white font-bold mb-3 flex items-center gap-2">
          <History className="w-4 h-4 text-cyan-400" />
          Version History
        </h4>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {versions.map((version, idx) => (
            <div key={idx} className="bg-white/5 rounded p-2 flex items-center justify-between">
              <div>
                <p className="text-white text-sm font-semibold">Version {version.versionNumber}</p>
                <p className="text-white/60 text-xs">{version.authorEmail} • {new Date(version.createdAt).toLocaleString()}</p>
              </div>
              <button
                onClick={() => restoreVersion(version)}
                className="px-2 py-1 bg-cyan-500/20 border border-cyan-400 text-cyan-300 rounded text-xs hover:bg-cyan-500/30"
              >
                Restore
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}