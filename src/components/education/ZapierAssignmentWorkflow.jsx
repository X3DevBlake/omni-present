import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, CheckCircle2, AlertCircle, Zap } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function ZapierAssignmentWorkflow() {
  const [assignments, setAssignments] = useState([
    { id: 1, title: 'Budget Analysis', points: 50, status: 'pending' },
    { id: 2, title: 'Investment Review', points: 75, status: 'pending' },
  ]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submission, setSubmission] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const submitViaZapier = async (assignment) => {
    if (!submission.trim()) return;

    setSubmitting(true);
    try {
      // Send to Gemini for autonomous review and grading
      const grading = await base44.integrations.Core.InvokeLLM({
        prompt: `Grade this learning assignment autonomously:
        
Assignment: ${assignment.title}
Points Available: ${assignment.points}
Submission: "${submission}"

Evaluate:
1. Correctness (0-100%)
2. Completeness (0-100%)
3. Understanding demonstrated (0-100%)
4. Final Grade (Pass/Good/Excellent)
5. Points earned
6. Detailed feedback with specific improvements
7. Suggested next steps for mastery
8. Recommendation for bonus points`,
        response_json_schema: {
          type: 'object',
          properties: {
            correctness: { type: 'number' },
            completeness: { type: 'number' },
            understanding: { type: 'number' },
            grade: { type: 'string' },
            pointsEarned: { type: 'number' },
            feedback: { type: 'string' },
            nextSteps: { type: 'string' },
            bonusPoints: { type: 'number' },
          },
        },
      });

      // Create Zapier workflow record
      await base44.integrations.Core.InvokeLLM({
        prompt: `Create Zapier workflow record:
        
Assignment: ${assignment.title}
Grading: ${JSON.stringify(grading)}

Log to:
1. Assignment completion database
2. User points ledger
3. Learning path progress
4. Slack notification to user`,
      });

      setFeedback(grading);
      setAssignments(prev =>
        prev.map(a => a.id === assignment.id ? { ...a, status: 'graded' } : a)
      );
      setSubmission('');
    } catch (error) {
      console.error('Error submitting:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Assignment List */}
      <div className="space-y-2">
        <p className="text-white font-bold text-sm">Module Assignments</p>
        {assignments.map((assignment, idx) => (
          <motion.button
            key={assignment.id}
            onClick={() => setSelectedAssignment(assignment)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`w-full text-left p-3 rounded-lg border transition-all ${
              selectedAssignment?.id === assignment.id
                ? 'bg-cyan-500/20 border-cyan-400'
                : 'bg-white/5 border-white/10'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-semibold text-sm">{assignment.title}</p>
                <p className="text-white/60 text-xs">Click to submit</p>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span className="text-yellow-400 font-bold text-sm">{assignment.points}</span>
                {assignment.status === 'graded' && (
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                )}
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Submission Form */}
      {selectedAssignment && !feedback && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-3"
        >
          <h3 className="text-white font-bold">{selectedAssignment.title}</h3>

          <textarea
            value={submission}
            onChange={(e) => setSubmission(e.target.value)}
            placeholder="Submit your assignment..."
            className="w-full h-32 bg-white/10 border border-white/20 rounded px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:border-cyan-400 resize-none"
            disabled={submitting}
          />

          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => submitViaZapier(selectedAssignment)}
            disabled={!submission.trim() || submitting}
            className="w-full px-4 py-2 bg-cyan-500/20 border border-cyan-400 rounded-lg text-cyan-300 hover:bg-cyan-500/30 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Upload className="w-4 h-4" />
            {submitting ? 'Grading via Zapier...' : 'Submit for AI Grading'}
          </motion.button>
        </motion.div>
      )}

      {/* AI Grading Results */}
      {feedback && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`border rounded-lg p-4 space-y-3 ${
            feedback.grade === 'Excellent'
              ? 'bg-green-500/10 border-green-400/30'
              : feedback.grade === 'Good'
              ? 'bg-blue-500/10 border-blue-400/30'
              : 'bg-yellow-500/10 border-yellow-400/30'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-400" />
            <p className="text-white font-bold">Grading Complete</p>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center bg-white/5 rounded p-2">
            <div>
              <p className="text-white text-xs font-bold">{feedback.correctness}%</p>
              <p className="text-white/60 text-xs">Correct</p>
            </div>
            <div>
              <p className="text-white text-xs font-bold">{feedback.completeness}%</p>
              <p className="text-white/60 text-xs">Complete</p>
            </div>
            <div>
              <p className="text-white text-xs font-bold">{feedback.understanding}%</p>
              <p className="text-white/60 text-xs">Understanding</p>
            </div>
          </div>

          <div>
            <p className="text-white/80 text-xs font-semibold mb-1">Feedback:</p>
            <p className="text-white/70 text-xs">{feedback.feedback}</p>
          </div>

          <div className="bg-green-500/20 border border-green-400/30 rounded p-3">
            <p className="text-green-300 font-bold text-sm">
              +{feedback.pointsEarned} Points Earned!
            </p>
            {feedback.bonusPoints > 0 && (
              <p className="text-green-200/80 text-xs mt-1">
                +{feedback.bonusPoints} Bonus Points for excellence!
              </p>
            )}
            <p className="text-green-300 font-semibold text-xs mt-2">Grade: {feedback.grade}</p>
          </div>

          <div className="text-white/70 text-xs border-t border-white/10 pt-2">
            <p className="font-semibold mb-1">Next Steps:</p>
            <p>{feedback.nextSteps}</p>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => {
              setFeedback(null);
              setSelectedAssignment(null);
            }}
            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded text-white/80 hover:border-white/30 text-sm"
          >
            Close
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}