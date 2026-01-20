import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, ArrowRight, X, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';

export default function InteractiveTourGuide({ onComplete }) {
  const [isOpen, setIsOpen] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);

  const tourSteps = [
    {
      title: 'Create Your First Agent',
      description: 'Design an autonomous AI agent with custom goals and personality',
      page: 'AgentCustomization',
      category: 'Getting Started',
      estimatedTime: '5 min'
    },
    {
      title: 'Explore Analytics',
      description: 'Discover predictive analytics and AI-powered insights',
      page: 'AnalyticsIntelligenceHub',
      category: 'Core Features',
      estimatedTime: '3 min'
    },
    {
      title: 'Start Collaboration',
      description: 'Form multi-agent teams for complex tasks',
      page: 'CollaborationOrchestrationHub',
      category: 'Advanced',
      estimatedTime: '7 min'
    },
    {
      title: 'Run a Simulation',
      description: 'Test agent behaviors in controlled environments',
      page: 'SimulationHub',
      category: 'Advanced',
      estimatedTime: '10 min'
    }
  ];

  const handleStepComplete = (index) => {
    if (!completedSteps.includes(index)) {
      setCompletedSteps([...completedSteps, index]);
    }
    if (index < tourSteps.length - 1) {
      setCurrentStep(index + 1);
    } else {
      onComplete && onComplete();
    }
  };

  if (!isOpen) return null;

  const step = tourSteps[currentStep];
  const progress = (completedSteps.length / tourSteps.length) * 100;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg"
      >
        <Card className="bg-gradient-to-br from-indigo-900/95 to-purple-900/95 border-indigo-400/50 backdrop-blur-md shadow-2xl">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <Badge className="mb-2 bg-indigo-600">{step.category}</Badge>
                <CardTitle className="text-white text-xl">
                  {step.title}
                </CardTitle>
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="text-white/60 hover:text-white"
                onClick={() => setIsOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-white/80">{step.description}</p>
            
            <div className="flex items-center gap-2 text-sm text-white/60">
              <MapPin className="w-4 h-4" />
              <span>Estimated time: {step.estimatedTime}</span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-white/60">
                <span>Tour Progress</span>
                <span>{completedSteps.length} / {tourSteps.length}</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-cyan-400 to-purple-400 h-2 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Link to={createPageUrl(step.page)} className="flex-1">
                <Button
                  className="w-full bg-gradient-to-r from-cyan-600 to-blue-600"
                  onClick={() => handleStepComplete(currentStep)}
                >
                  Start This Step
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              
              {currentStep < tourSteps.length - 1 && (
                <Button
                  variant="ghost"
                  className="text-white/60 hover:text-white"
                  onClick={() => setCurrentStep(currentStep + 1)}
                >
                  Skip
                </Button>
              )}
            </div>

            <div className="grid grid-cols-4 gap-2 pt-4 border-t border-white/10">
              {tourSteps.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 rounded-full ${
                    completedSteps.includes(i)
                      ? 'bg-green-400'
                      : i === currentStep
                      ? 'bg-cyan-400'
                      : 'bg-white/20'
                  }`}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}