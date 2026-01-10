import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ThumbsUp, ThumbsDown, MessageSquare, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export default function AgentFeedbackSystem({ agent, onFeedback }) {
  const [feedbackHistory, setFeedbackHistory] = useState([]);
  const [comment, setComment] = useState('');
  const [selectedRating, setSelectedRating] = useState(null);

  const submitFeedback = (rating) => {
    const feedback = {
      agentId: agent?.id,
      rating,
      comment,
      timestamp: new Date(),
    };

    setFeedbackHistory([feedback, ...feedbackHistory].slice(0, 10));
    onFeedback?.(feedback);
    setComment('');
    setSelectedRating(rating);

    setTimeout(() => setSelectedRating(null), 2000);
  };

  const positiveRate = feedbackHistory.length > 0
    ? (feedbackHistory.filter(f => f.rating === 'positive').length / feedbackHistory.length) * 100
    : 0;

  return (
    <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-6">
      <h3 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
        <MessageSquare className="w-6 h-6 text-green-400" />
        Performance Feedback
      </h3>

      <div className="bg-black/20 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="text-white/60 text-sm">Positive Feedback Rate</div>
          <div className="text-green-400 font-bold">{positiveRate.toFixed(0)}%</div>
        </div>
        <div className="h-2 bg-black/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
            style={{ width: `${positiveRate}%` }}
          />
        </div>
        <div className="text-white/40 text-xs mt-2">{feedbackHistory.length} total feedback entries</div>
      </div>

      <div className="mb-4">
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Provide specific feedback on agent performance..."
          className="bg-white/5 border-white/10 text-white"
        />
      </div>

      <div className="flex gap-3 mb-6">
        <Button
          onClick={() => submitFeedback('positive')}
          className="flex-1 bg-green-500/20 hover:bg-green-500/30 border border-green-500/40 text-green-400"
        >
          <ThumbsUp className="w-4 h-4 mr-2" />
          Good Performance
        </Button>
        <Button
          onClick={() => submitFeedback('negative')}
          className="flex-1 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-400"
        >
          <ThumbsDown className="w-4 h-4 mr-2" />
          Needs Improvement
        </Button>
      </div>

      {selectedRating && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-3 rounded-lg text-center ${
            selectedRating === 'positive' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
          }`}
        >
          Feedback recorded! Agent will adapt based on your input.
        </motion.div>
      )}

      <div className="mt-6">
        <div className="text-white/60 text-sm mb-3">Recent Feedback</div>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {feedbackHistory.map((fb, i) => (
            <div key={i} className="bg-black/20 rounded p-3 text-sm">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  {fb.rating === 'positive' ? (
                    <ThumbsUp className="w-3 h-3 text-green-400" />
                  ) : (
                    <ThumbsDown className="w-3 h-3 text-red-400" />
                  )}
                  <span className="text-white/60 text-xs">
                    {new Date(fb.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
              {fb.comment && <div className="text-white/80">{fb.comment}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}