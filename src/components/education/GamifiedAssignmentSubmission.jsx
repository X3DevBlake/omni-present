import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, CheckCircle2, AlertCircle, Zap } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function GamifiedAssignmentSubmission() {
  const [assignments, setAssignments] = useState([
    { id: 1, title: 'Budget Analysis', module: 'Financial Fundamentals', points: 50, status: 'pending' },
    { id: 2, title: 'Portfolio Review', module: 'Investment Strategy', points: 75, status: 'pending' },
  ]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissionData, setSubmissionData] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitAssignment = async (assignment) => {
    if (!submissionData.trim()) return;

    try {
      setIsSubmitting(true);

      // Submit via Zapier
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Grade and provide feedback on assignment:
        
Assignment: ${assignment.title}
Module: ${assignment.module}
Submission: ${submissionData}

Evaluate:
1. Correctness and completeness
2. Understanding demonstrated
3. Grade (Pass/Excellent/Needs Improvement)
4. Specific feedback
5. Points earned (0-${assignment.points})
6. Next recommended steps`,
        response_json_schema: {
          type: 'object',
          properties: {
            grade: { type: 'string' },
            feedback: { type: 'string' },
            pointsEarned: { type: 'number' },
            strengths: { type: 'array', items: { type: 'string' } },
            improvements: { type: 'array', items: { type: 'string' } },
            nextSteps: { type: 'string' },
          },
        },
      });

      setFeedback(response);
      setSubmissionData('');

      // Update assignment status
      setAssignments(prev => prev.map(a => 
        a.id === assignment.id ? { ...a, status: 'submitted' } : a
      ));
    } catch (error) {
      console.error('Error submitting:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Assignment List */}
      <div className="space-y-2">
        <p className="text-white/80 font-bold text-sm">Active Assignments</p>
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
                : 'bg-white/5 border-white/10 hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-white font-semibold">{assignment.title}</p>
                <p className="text-white/60 text-xs">{assignment.module}</p>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span className="text-yellow-400 font-bold text-sm">{assignment.points}pts</span>
                {assignment.status === 'submitted' && (
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                )}
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Submission Form */}
      {selectedAssignment && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-3"
        >
          <h3 className="text-white font-bold">{selectedAssignment.title}</h3>

          <textarea
            value={submissionData}
            onChange={(e) => setSubmissionData(e.target.value)}
            placeholder="Submit your assignment here... (can be analysis, document, or explanation)"
            className="w-full h-32 bg-white/10 border border-white/20 rounded px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:border-cyan-400 resize-none"
            disabled={isSubmitting}
          />

          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => submitAssignment(selectedAssignment)}
            disabled={!submissionData.trim() || isSubmitting}
            className="w-full px-4 py-2 bg-cyan-500/20 border border-cyan-400 rounded-lg text-cyan-300 hover:bg-cyan-500/30 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Upload className="w-4 h-4" />
            {isSubmitting ? 'Submitting...' : `Submit & Earn ${selectedAssignment.points}pts`}
          </motion.button>
        </motion.div>
      )}

      {/* AI Feedback */}
      {feedback && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-500/10 border border-green-400/30 rounded-lg p-4 space-y-3"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-400" />
            <p className="text-green-300 font-bold">Feedback from AI</p>
          </div>

          <div className="space-y-2">
            <div>
              <p className="text-green-300 text-sm font-semibold">Grade: {feedback.grade}</p>
              <p className="text-green-200/80 text-sm">{feedback.feedback}</p>
            </div>

            <div>
              <p className="text-green-300 text-xs font-semibold mb-1">Strengths:</p>
              <ul className="space-y-0.5">
                {feedback.strengths?.map((s, i) => (
                  <li key={i} className="text-green-200/70 text-xs">✓ {s}</li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-yellow-300 text-xs font-semibold mb-1">Areas to Improve:</p>
              <ul className="space-y-0.5">
                {feedback.improvements?.map((i, idx) => (
                  <li key={idx} className="text-yellow-200/70 text-xs">→ {i}</li>
                ))}
              </ul>
            </div>

            <div className="bg-green-500/20 rounded p-2">
              <p className="text-green-300 font-bold text-sm">
                +{feedback.pointsEarned} points earned!
              </p>
              <p className="text-green-200/80 text-xs mt-1">{feedback.nextSteps}</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}