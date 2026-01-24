import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Brain, Award, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function InteractiveQuizEngine({ quizId, moduleId }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(1800);
  const queryClient = useQueryClient();

  const { data: quiz } = useQuery({
    queryKey: ['quiz', quizId],
    queryFn: async () => {
      const quizzes = await base44.entities.Quiz.filter({ quiz_id: quizId });
      return quizzes[0];
    },
    enabled: !!quizId
  });

  const submitQuizMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('academicOrchestrator', {
        action: 'submit_quiz',
        payload: {
          quiz_id: quizId,
          answers
        }
      });
      return response.data;
    },
    onSuccess: (data) => {
      setShowResults(true);
      toast.success(`Quiz completed! Score: ${data.score}%`);
    }
  });

  const questions = quiz?.questions || [];
  const question = questions[currentQuestion];

  const handleAnswer = (answer) => {
    setAnswers({ ...answers, [question.question_id]: answer });
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      submitQuizMutation.mutate();
    }
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  if (!quiz) {
    return <div className="text-white">Loading quiz...</div>;
  }

  if (showResults) {
    const correctAnswers = Object.entries(answers).filter(([qId, ans]) => {
      const q = questions.find(qu => qu.question_id === qId);
      return q?.correct_answer === ans;
    }).length;
    
    const score = (correctAnswers / questions.length) * 100;

    return (
      <Card className="bg-white/10 backdrop-blur-xl border-white/20">
        <CardHeader>
          <CardTitle className="text-white text-center">Quiz Results</CardTitle>
        </CardHeader>
        <CardContent>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-center mb-6"
          >
            <div className="text-6xl font-bold text-white mb-2">{score.toFixed(0)}%</div>
            <p className="text-gray-300">
              {correctAnswers} out of {questions.length} correct
            </p>
          </motion.div>

          {score >= quiz.passing_score ? (
            <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 text-center">
              <Award className="w-12 h-12 text-green-400 mx-auto mb-2" />
              <p className="text-white font-bold">Passed!</p>
            </div>
          ) : (
            <div className="bg-amber-500/20 border border-amber-500/50 rounded-lg p-4 text-center">
              <Brain className="w-12 h-12 text-amber-400 mx-auto mb-2" />
              <p className="text-white font-bold">Keep Learning</p>
              <p className="text-sm text-gray-300 mt-2">
                Required: {quiz.passing_score}%
              </p>
            </div>
          )}

          <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700">
            Review Answers
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/10 backdrop-blur-xl border-white/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white">{quiz.title}</CardTitle>
          <Badge className="bg-blue-500 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
          </Badge>
        </div>
        <Progress value={progress} className="mt-2" />
      </CardHeader>
      <CardContent>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div className="mb-6">
              <Badge className="mb-3">Question {currentQuestion + 1} of {questions.length}</Badge>
              <h3 className="text-xl font-bold text-white mb-4">{question?.question_text}</h3>

              <div className="space-y-3">
                {question?.options?.map((option, idx) => (
                  <motion.button
                    key={idx}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAnswer(option)}
                    className={`w-full p-4 rounded-lg text-left transition-all ${
                      answers[question.question_id] === option
                        ? 'bg-blue-600 text-white border-2 border-blue-400'
                        : 'bg-white/5 text-white border-2 border-white/10 hover:border-white/30'
                    }`}
                  >
                    {option}
                  </motion.button>
                ))}
              </div>
            </div>

            <Button
              onClick={nextQuestion}
              disabled={!answers[question?.question_id]}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {currentQuestion === questions.length - 1 ? 'Submit Quiz' : 'Next Question'}
            </Button>
          </motion.div>
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}