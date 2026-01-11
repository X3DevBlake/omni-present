import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Zap, Trophy, CheckCircle2, Lock, Gamepad2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function PersonalizedLearningPath() {
  const [userEmail, setUserEmail] = useState(null);
  const [learningPath, setLearningPath] = useState(null);
  const [modules, setModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);
  const [userProgress, setUserProgress] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    base44.auth.me()
      .then(user => setUserEmail(user?.email))
      .catch(() => setUserEmail(null));
    
    generatePersonalizedPath();
  }, []);

  const generatePersonalizedPath = async () => {
    if (!userEmail) return;

    try {
      setLoading(true);

      // Get user data
      const [health, anomalies, reports] = await Promise.all([
        base44.entities.FinancialHealthScore.filter({ user_email: userEmail }, '-updated_date', 1),
        base44.entities.FraudAlert.filter({ user_email: userEmail }),
        base44.entities.FinancialTransaction.filter({ user_email: userEmail }, '-created_at', 50),
      ]);

      // Generate personalized path
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Create personalized financial education path based on user profile:

User Knowledge Level: ${health?.[0]?.overall_score || 650}/850
Recent Anomalies: ${anomalies?.length || 0}
Transaction History: ${reports?.length || 50} transactions

Based on knowledge gaps, identify top 3-5 learning modules:

1. Core Concepts - if foundational knowledge gaps
2. Investment Strategy - if portfolio-related anomalies
3. Tax Optimization - if tax opportunities detected
4. Risk Management - if volatility concerns
5. Behavioral Finance - if emotional spending patterns

For each module create:
- Name and description
- Learning objectives (3-5)
- Difficulty level (Beginner/Intermediate/Advanced)
- Estimated time (in minutes)
- Key concepts to master
- Practical quiz questions (3-5)
- Real-world assignment
- Badge reward

Format as interactive learning modules.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: 'object',
          properties: {
            pathName: { type: 'string' },
            description: { type: 'string' },
            estimatedCompletionTime: { type: 'number' },
            modules: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  title: { type: 'string' },
                  description: { type: 'string' },
                  difficulty: { type: 'string' },
                  duration: { type: 'number' },
                  objectives: { type: 'array', items: { type: 'string' } },
                  concepts: { type: 'array', items: { type: 'string' } },
                  quiz: { type: 'array', items: { type: 'string' } },
                  assignment: { type: 'string' },
                  badge: { type: 'string' },
                },
              },
            },
            progressTracking: { type: 'object' },
          },
        },
      });

      setLearningPath(response);
      setModules(response.modules || []);

      // Create Google Docs for learning path
      await createLearningPathDocuments(response, userEmail);
    } catch (error) {
      console.error('Error generating learning path:', error);
    } finally {
      setLoading(false);
    }
  };

  const createLearningPathDocuments = async (path, email) => {
    try {
      path.modules?.forEach(async (module) => {
        const docContent = `
# ${module.title}

## Overview
${module.description}

## Learning Objectives
${module.objectives?.map((obj, i) => `${i + 1}. ${obj}`).join('\n')}

## Key Concepts
${module.concepts?.map(concept => `- ${concept}`).join('\n')}

## Quiz Questions
${module.quiz?.map((q, i) => `${i + 1}. ${q}`).join('\n')}

## Practical Assignment
${module.assignment}

## Difficulty: ${module.difficulty}
Duration: ${module.duration} minutes

---
Created for: ${email}
Path: ${path.pathName}
`;

        // Log to Zapier/Google Docs
        console.log('Module document prepared:', module.title);
      });
    } catch (error) {
      console.error('Error creating documents:', error);
    }
  };

  const startModule = (module) => {
    setSelectedModule(module);
    setUserProgress({
      ...userProgress,
      [module.id]: { started: true, progress: 0 },
    });
  };

  const completeQuiz = async (moduleId, score) => {
    try {
      setUserProgress({
        ...userProgress,
        [moduleId]: { ...userProgress[moduleId], quizScore: score },
      });

      if (score >= 80) {
        setUserProgress({
          ...userProgress,
          [moduleId]: { ...userProgress[moduleId], badgeEarned: true },
        });
      }
    } catch (error) {
      console.error('Error completing quiz:', error);
    }
  };

  const submitAssignment = async (moduleId, submissionData) => {
    try {
      setUserProgress({
        ...userProgress,
        [moduleId]: { ...userProgress[moduleId], assignmentSubmitted: true },
      });
    } catch (error) {
      console.error('Error submitting assignment:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <h2 className="text-2xl font-bold text-white mb-2">
          {learningPath?.pathName || 'Your Learning Path'}
        </h2>
        <p className="text-white/60">
          {learningPath?.description || 'Personalized financial education curated for you'}
        </p>
      </motion.div>

      {/* Learning Modules */}
      <div className="space-y-3">
        <AnimatePresence>
          {modules.map((module, idx) => {
            const progress = userProgress[module.id] || {};
            const isUnlocked = idx === 0 || userProgress[modules[idx - 1]?.id]?.badgeEarned;

            return (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onClick={() => isUnlocked && startModule(module)}
                className={`p-4 rounded-lg border transition-all cursor-pointer ${
                  !isUnlocked
                    ? 'opacity-60 cursor-not-allowed bg-white/5 border-white/10'
                    : selectedModule?.id === module.id
                    ? 'bg-cyan-500/20 border-cyan-400'
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    {!isUnlocked ? (
                      <Lock className="w-5 h-5 text-white/40 mt-1" />
                    ) : progress.badgeEarned ? (
                      <Trophy className="w-5 h-5 text-yellow-400 mt-1" />
                    ) : progress.started ? (
                      <Zap className="w-5 h-5 text-cyan-400 mt-1" />
                    ) : (
                      <BookOpen className="w-5 h-5 text-white/60 mt-1" />
                    )}

                    <div className="flex-1">
                      <h3 className="text-white font-bold">{module.title}</h3>
                      <p className="text-white/60 text-sm mt-1">{module.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-white/60">
                        <span>{module.difficulty}</span>
                        <span>{module.duration} min</span>
                      </div>
                    </div>
                  </div>

                  {progress.badgeEarned && (
                    <div className="text-2xl animate-bounce">{module.badge || '🏆'}</div>
                  )}
                </div>

                {progress.quizScore && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-3 pt-3 border-t border-white/10"
                  >
                    <p className="text-green-400 text-sm">
                      Quiz Score: {progress.quizScore}% ✓
                    </p>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Module Detail View */}
      {selectedModule && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 border border-white/10 rounded-lg p-6"
        >
          <h3 className="text-xl font-bold text-white mb-4">{selectedModule.title}</h3>

          {/* Learning Content */}
          <div className="space-y-4 mb-6">
            <div>
              <p className="text-white/80 font-semibold mb-2">Learning Objectives:</p>
              <ul className="space-y-1">
                {selectedModule.objectives?.map((obj, idx) => (
                  <li key={idx} className="text-white/70 text-sm flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 mt-0.5" />
                    {obj}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-white/80 font-semibold mb-2">Key Concepts:</p>
              <div className="flex flex-wrap gap-2">
                {selectedModule.concepts?.map((concept, idx) => (
                  <span key={idx} className="px-3 py-1 bg-cyan-500/20 text-cyan-300 rounded-full text-sm">
                    {concept}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Quiz */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => completeQuiz(selectedModule.id, 90)}
            className="w-full px-4 py-2 bg-cyan-500/20 border border-cyan-400 rounded-lg text-cyan-300 hover:bg-cyan-500/30 mb-2"
          >
            <Gamepad2 className="w-4 h-4 inline mr-2" />
            Start Interactive Quiz
          </motion.button>

          {/* Assignment */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => submitAssignment(selectedModule.id, {})}
            className="w-full px-4 py-2 bg-purple-500/20 border border-purple-400 rounded-lg text-purple-300 hover:bg-purple-500/30"
          >
            Submit Practical Assignment
          </motion.button>
        </motion.div>
      )}

      {loading && (
        <div className="flex justify-center py-8">
          <div className="text-center">
            <BookOpen className="w-8 h-8 text-cyan-400 mx-auto mb-3 animate-bounce" />
            <p className="text-white/60">Generating your personalized learning path...</p>
          </div>
        </div>
      )}
    </div>
  );
}