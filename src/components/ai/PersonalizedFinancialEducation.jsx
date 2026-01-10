import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, TrendingUp, Target, Brain, Play, CheckCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function PersonalizedFinancialEducation() {
  const [recommendations, setRecommendations] = useState([]);
  const [learningPath, setLearningPath] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);

  useEffect(() => {
    // AI generates personalized content based on user activity and goals
    setRecommendations([
      {
        id: 1,
        title: 'Understanding Impermanent Loss in DeFi',
        reason: 'Based on your recent ETH/USDT liquidity provision',
        difficulty: 'intermediate',
        duration: 8,
        topics: ['DeFi', 'Liquidity Pools', 'Risk Management'],
        progress: 0,
        aiGenerated: true
      },
      {
        id: 2,
        title: 'Advanced Yield Farming Strategies',
        reason: 'You\'ve shown interest in high-APY pools',
        difficulty: 'advanced',
        duration: 12,
        topics: ['Yield Farming', 'Portfolio Optimization', 'Risk/Reward'],
        progress: 0,
        aiGenerated: true
      },
      {
        id: 3,
        title: 'Emergency Fund Planning',
        reason: 'Your savings goal needs adjustment',
        difficulty: 'beginner',
        duration: 5,
        topics: ['Personal Finance', 'Budgeting', 'Savings'],
        progress: 60,
        aiGenerated: true
      },
      {
        id: 4,
        title: 'Smart Contract Security Basics',
        reason: 'Recent vulnerability detected in your portfolio',
        difficulty: 'intermediate',
        duration: 10,
        topics: ['Security', 'Smart Contracts', 'Risk Assessment'],
        progress: 0,
        aiGenerated: true
      }
    ]);

    setLearningPath([
      {
        id: 1,
        phase: 'Foundation',
        lessons: ['Crypto Basics', 'Wallet Security', 'Transaction Types'],
        completed: 3,
        total: 3
      },
      {
        id: 2,
        phase: 'Intermediate',
        lessons: ['DeFi Protocols', 'Yield Strategies', 'Risk Management'],
        completed: 2,
        total: 3
      },
      {
        id: 3,
        phase: 'Advanced',
        lessons: ['Portfolio Optimization', 'Advanced Trading', 'Protocol Analysis'],
        completed: 0,
        total: 3
      }
    ]);
  }, []);

  const difficultyColors = {
    beginner: 'bg-green-500/20 text-green-400 border-green-500/30',
    intermediate: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    advanced: 'bg-red-500/20 text-red-400 border-red-500/30'
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Brain className="w-6 h-6 text-purple-400" />
            AI-Personalized Financial Education
          </CardTitle>
          <p className="text-sm text-gray-400">Content tailored to your activity and goals</p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="recommended" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-black/40">
              <TabsTrigger value="recommended">Recommended for You</TabsTrigger>
              <TabsTrigger value="path">Learning Path</TabsTrigger>
            </TabsList>

            <TabsContent value="recommended" className="space-y-4 mt-4">
              {recommendations.map((lesson) => (
                <motion.div
                  key={lesson.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-black/40 rounded-lg p-4 border border-white/10 hover:border-purple-400/50 transition-colors cursor-pointer"
                  onClick={() => setSelectedLesson(lesson)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <BookOpen className="w-5 h-5 text-purple-400" />
                        <h3 className="font-semibold text-white">{lesson.title}</h3>
                        {lesson.aiGenerated && (
                          <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                            AI Generated
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-cyan-400 mb-2">
                        <TrendingUp className="w-4 h-4" />
                        <span>{lesson.reason}</span>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge className={difficultyColors[lesson.difficulty]}>
                          {lesson.difficulty}
                        </Badge>
                        <Badge variant="outline" className="border-white/20 text-gray-400">
                          <Clock className="w-3 h-3 mr-1" />
                          {lesson.duration} min
                        </Badge>
                        {lesson.topics.map((topic) => (
                          <Badge key={topic} variant="outline" className="border-purple-500/30 text-purple-300">
                            {topic}
                          </Badge>
                        ))}
                      </div>
                      {lesson.progress > 0 && (
                        <div>
                          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                            <span>Progress</span>
                            <span>{lesson.progress}%</span>
                          </div>
                          <Progress value={lesson.progress} className="h-1" />
                        </div>
                      )}
                    </div>
                    <Button size="sm" className="bg-purple-500 hover:bg-purple-600">
                      {lesson.progress > 0 ? 'Continue' : 'Start'}
                      <Play className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </TabsContent>

            <TabsContent value="path" className="space-y-4 mt-4">
              {learningPath.map((phase) => (
                <motion.div
                  key={phase.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-black/40 rounded-lg p-4 border border-white/10"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-purple-400" />
                      <h3 className="font-semibold text-white">{phase.phase}</h3>
                    </div>
                    <Badge className={phase.completed === phase.total 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-purple-500/20 text-purple-400'}>
                      {phase.completed}/{phase.total} completed
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    {phase.lessons.map((lesson, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 text-sm text-gray-400 p-2 rounded bg-black/20"
                      >
                        {idx < phase.completed ? (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border-2 border-gray-600" />
                        )}
                        <span className={idx < phase.completed ? 'text-green-400' : ''}>{lesson}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3">
                    <Progress value={(phase.completed / phase.total) * 100} className="h-2" />
                  </div>
                </motion.div>
              ))}
            </TabsContent>
          </Tabs>

          {/* AI Insights */}
          <div className="mt-6 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 rounded-lg p-4 border border-purple-500/20">
            <div className="flex items-start gap-3">
              <Brain className="w-5 h-5 text-purple-400 mt-1" />
              <div>
                <h4 className="font-semibold text-white mb-1">AI Learning Insights</h4>
                <p className="text-sm text-gray-400">
                  Based on your recent DeFi activities, focusing on risk management topics will help you 
                  optimize your portfolio. You're 85% more likely to benefit from advanced yield farming 
                  strategies after completing the current intermediate modules.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lesson Modal */}
      <AnimatePresence>
        {selectedLesson && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedLesson(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 border border-white/10 rounded-xl p-6 max-w-2xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold text-white mb-4">{selectedLesson.title}</h2>
              <p className="text-gray-400 mb-4">
                This lesson has been AI-generated specifically for you based on: {selectedLesson.reason}
              </p>
              <div className="bg-black/40 rounded-lg p-4 mb-4">
                <p className="text-white">
                  [AI-Generated lesson content would appear here, dynamically created based on your 
                  specific activities, goals, and knowledge gaps. The content adapts in real-time to 
                  your learning pace and comprehension level.]
                </p>
              </div>
              <div className="flex gap-3">
                <Button className="flex-1 bg-purple-500 hover:bg-purple-600">
                  Start Lesson
                </Button>
                <Button variant="outline" onClick={() => setSelectedLesson(null)}>
                  Close
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}