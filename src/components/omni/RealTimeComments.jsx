import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, X, User } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function RealTimeComments({ componentIndex, componentName, position, onClose }) {
  const [commentText, setCommentText] = useState('');
  const queryClient = useQueryClient();

  const { data: comments } = useQuery({
    queryKey: ['component-comments', componentIndex],
    queryFn: async () => {
      const annotations = await base44.entities.Annotation.filter({
        component_index: componentIndex,
        type: 'comment'
      });
      return annotations;
    },
    refetchInterval: 3000, // Real-time updates every 3s
  });

  const addCommentMutation = useMutation({
    mutationFn: async (text) => {
      const user = await base44.auth.me();
      return base44.entities.Annotation.create({
        component_index: componentIndex,
        content: text,
        type: 'comment',
        position: position,
        replies: []
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['component-comments'] });
      setCommentText('');
      toast.success('Comment added');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (commentText.trim()) {
      addCommentMutation.mutate(commentText);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="absolute z-50 w-80 bg-black/90 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl"
      style={{
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)'
      }}
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-cyan-400" />
            <h3 className="text-white font-semibold">{componentName}</h3>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Comments list */}
        <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
          {comments?.map((comment) => (
            <div key={comment.id} className="p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-3 h-3 text-cyan-400" />
                <span className="text-white/70 text-xs">{comment.created_by}</span>
                <span className="text-white/40 text-xs ml-auto">
                  {new Date(comment.created_date).toLocaleTimeString()}
                </span>
              </div>
              <p className="text-white text-sm">{comment.content}</p>
            </div>
          ))}
          {comments?.length === 0 && (
            <div className="text-center text-white/40 text-sm py-4">
              No comments yet. Be the first!
            </div>
          )}
        </div>

        {/* Add comment form */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500"
          />
          <button
            type="submit"
            disabled={!commentText.trim()}
            className="p-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </motion.div>
  );
}