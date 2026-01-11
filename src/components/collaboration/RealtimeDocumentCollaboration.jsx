import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Users, History, Share2, Loader, CheckCircle2, AlertCircle, Zap } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { suggestWorkflowsForComment, createWorkflowFromSuggestion, getWorkflowTemplates } from '../../functions/collaboration/workflow-suggestion-engine';

export default function RealtimeDocumentCollaboration({ documentId, documentTitle }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [versions, setVersions] = useState([]);
  const [currentVersion, setCurrentVersion] = useState(null);
  const [collaborators, setCollaborators] = useState([]);
  const [posting, setPosting] = useState(false);
  const [userEmail, setUserEmail] = useState(null);
  const [expandedComment, setExpandedComment] = useState(null);
  const [workflowSuggestions, setWorkflowSuggestions] = useState({});
  const [loadingSuggestions, setLoadingSuggestions] = useState({});
  const [userRole, setUserRole] = useState('viewer');

  useEffect(() => {
    base44.auth.me()
      .then(user => {
        setUserEmail(user?.email);
        setUserRole(user?.role || 'viewer');
      })
      .catch(() => setUserEmail(null));

    loadDocumentCollaboration();
    setupRealtimeSync();
  }, [documentId]);

  const loadDocumentCollaboration = async () => {
    try {
      const data = await base44.integrations.Core.InvokeLLM({
        prompt: `Load document collaboration data:
        
DocumentID: ${documentId}

Load:
1. All comments
2. Version history
3. Active collaborators
4. Change log`,
      });

      setComments(data.comments || []);
      setVersions(data.versions || []);
      setCollaborators(data.collaborators || []);
      setCurrentVersion(data.currentVersion);
    } catch (error) {
      console.error('Error loading collaboration:', error);
    }
  };

  const setupRealtimeSync = () => {
    const interval = setInterval(loadDocumentCollaboration, 5000);
    return () => clearInterval(interval);
  };

  const postComment = async (metric) => {
    if (!newComment.trim() || !userEmail) return;

    setPosting(true);
    try {
      const comment = {
        documentId,
        authorEmail: userEmail,
        content: newComment,
        metricPath: metric,
        timestamp: new Date().toISOString(),
      };

      // Save comment
      await base44.entities.DocumentComment.create(comment);

      // Notify mentioned users
      const mentions = extractMentions(newComment);
      for (const mention of mentions) {
        await notifyMention(mention, userEmail, newComment);
      }

      // Generate workflow suggestions
      await generateWorkflowSuggestions(comment.id || Date.now(), newComment, metric);

      setComments(prev => [...prev, comment]);
      setNewComment('');
    } catch (error) {
      console.error('Error posting comment:', error);
    } finally {
      setPosting(false);
    }
  };

  const generateWorkflowSuggestions = async (commentId, content, metric) => {
    setLoadingSuggestions(prev => ({ ...prev, [commentId]: true }));
    try {
      const suggestions = await suggestWorkflowsForComment(
        content,
        { documentTitle, metric },
        userRole
      );
      setWorkflowSuggestions(prev => ({ ...prev, [commentId]: suggestions }));
    } catch (error) {
      console.error('Error generating suggestions:', error);
    } finally {
      setLoadingSuggestions(prev => ({ ...prev, [commentId]: false }));
    }
  };

  const implementWorkflow = async (commentId, suggestion) => {
    try {
      const result = await createWorkflowFromSuggestion(userEmail, suggestion, [
        { resource: 'workflows', actions: ['create'] },
      ]);

      if (result.status === 'created') {
        alert('Workflow created successfully!');
        setWorkflowSuggestions(prev => {
          const updated = { ...prev };
          delete updated[commentId];
          return updated;
        });
      } else if (result.status === 'pending_approval') {
        alert('Workflow pending approval from admin');
      }
    } catch (error) {
      console.error('Error implementing workflow:', error);
      alert('Failed to create workflow');
    }
  };

  const extractMentions = (text) => {
    const matches = text.match(/@\w+/g) || [];
    return matches.map(m => m.slice(1));
  };

  const notifyMention = async (username, mentioner, comment) => {
    try {
      await base44.integrations.Core.InvokeLLM({
        prompt: `Send mention notification:
        
User: ${username}
Mentioner: ${mentioner}
Comment: ${comment}
Document: ${documentTitle}

Send Slack/Email notification of mention.`,
      });
    } catch (error) {
      console.error('Error notifying mention:', error);
    }
  };

  const resolveComment = async (commentId) => {
    try {
      await base44.entities.DocumentComment.update(commentId, { resolved: true });
      loadDocumentCollaboration();
    } catch (error) {
      console.error('Error resolving comment:', error);
    }
  };

  const restoreVersion = async (versionId) => {
    try {
      await base44.integrations.Core.InvokeLLM({
        prompt: `Restore document version:
        
DocumentID: ${documentId}
VersionID: ${versionId}

Restore and create new version entry.`,
      });

      loadDocumentCollaboration();
    } catch (error) {
      console.error('Error restoring version:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {/* Comments Section */}
        <div className="space-y-3">
          <p className="text-white font-bold flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-cyan-400" />
            Comments ({comments.length})
          </p>

          <div className="bg-white/5 border border-white/10 rounded-lg p-3 space-y-2 max-h-96 overflow-y-auto">
            {comments.map((comment, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-white/10 rounded p-2 space-y-1 ${
                  comment.resolved ? 'opacity-50' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <p className="text-white text-xs font-semibold">{comment.authorEmail}</p>
                  {comment.resolved && (
                    <CheckCircle2 className="w-3 h-3 text-green-400" />
                  )}
                </div>
                <p className="text-white/70 text-xs">{comment.content}</p>
                {comment.metricPath && (
                  <p className="text-white/40 text-xs">📍 {comment.metricPath}</p>
                )}

                {expandedComment === idx && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-t border-white/10 pt-2 mt-2 space-y-2"
                  >
                    {comment.replies?.map((reply, ridx) => (
                      <div key={ridx} className="bg-white/5 rounded p-1 ml-2">
                        <p className="text-white/60 text-xs">{reply.authorEmail}:</p>
                        <p className="text-white/70 text-xs">{reply.content}</p>
                      </div>
                    ))}
                    
                    {/* Workflow Suggestions */}
                    {workflowSuggestions[idx] && workflowSuggestions[idx].length > 0 && (
                      <div className="bg-purple-500/10 rounded p-2 space-y-1 border border-purple-400/30">
                        <p className="text-purple-300 text-xs font-semibold flex items-center gap-1">
                          <Zap className="w-3 h-3" /> Suggested Workflows
                        </p>
                        {workflowSuggestions[idx].map((wf, wfIdx) => (
                          <div key={wfIdx} className="bg-white/5 rounded p-1">
                            <p className="text-white text-xs font-semibold">{wf.name}</p>
                            <p className="text-white/60 text-xs">{wf.description}</p>
                            <button
                              onClick={() => implementWorkflow(idx, wf)}
                              className="text-xs text-cyan-400 hover:text-cyan-300 mt-1"
                            >
                              Implement →
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {!comment.resolved && (
                      <button
                        onClick={() => resolveComment(comment.id)}
                        className="text-xs text-green-400 hover:text-green-300"
                      >
                        Resolve
                      </button>
                    )}
                  </motion.div>
                )}

                <button
                  onClick={() => setExpandedComment(expandedComment === idx ? null : idx)}
                  className="text-xs text-cyan-400 hover:text-cyan-300"
                >
                  {expandedComment === idx ? 'Hide' : 'Reply/Resolve'}
                </button>
              </motion.div>
            ))}
          </div>

          {/* Comment Input */}
          <div className="space-y-2">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add comment (mention with @username)..."
              className="w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-white placeholder-white/40 text-xs h-16 resize-none"
            />
            <button
              onClick={() => postComment()}
              disabled={posting || !newComment.trim()}
              className="w-full px-2 py-1 bg-cyan-500/20 border border-cyan-400 rounded text-cyan-300 hover:bg-cyan-500/30 disabled:opacity-50 text-xs font-semibold"
            >
              {posting ? <Loader className="w-3 h-3 animate-spin inline" /> : 'Post Comment'}
            </button>
          </div>
        </div>

        {/* Version History & Collaborators */}
        <div className="space-y-3">
          <p className="text-white font-bold flex items-center gap-2">
            <History className="w-4 h-4 text-purple-400" />
            Version History ({versions.length})
          </p>

          <div className="bg-white/5 border border-white/10 rounded-lg p-3 space-y-2 max-h-96 overflow-y-auto">
            {versions.map((version, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white/10 rounded p-2"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-white text-xs font-semibold">v{version.versionNumber}</p>
                    <p className="text-white/60 text-xs">{version.authorEmail}</p>
                  </div>
                  {idx !== 0 && (
                    <button
                      onClick={() => restoreVersion(version.id)}
                      className="text-xs text-yellow-400 hover:text-yellow-300"
                    >
                      Restore
                    </button>
                  )}
                </div>
                <p className="text-white/70 text-xs mt-1">{version.changesSummary}</p>
                <p className="text-white/40 text-xs">{new Date(version.createdAt).toLocaleString()}</p>
              </motion.div>
            ))}
          </div>

          <p className="text-white font-bold flex items-center gap-2 mt-4">
            <Users className="w-4 h-4 text-green-400" />
            Collaborators ({collaborators.length})
          </p>

          <div className="bg-white/5 border border-white/10 rounded-lg p-3 space-y-1">
            {collaborators.map((collab, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-center justify-between"
              >
                <p className="text-white text-xs">{collab.email}</p>
                <p className="text-green-400 text-xs">Active</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}