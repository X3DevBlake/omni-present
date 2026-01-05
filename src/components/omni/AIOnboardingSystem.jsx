import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, ChevronRight, CheckCircle, Play } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function AIOnboardingSystem({ userRole, blueprintContext, onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [onboardingFlow, setOnboardingFlow] = useState(null);
  const [isGenerating, setIsGenerating] = useState(true);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [showTutorial, setShowTutorial] = useState(null);

  useEffect(() => {
    generatePersonalizedFlow();
  }, [userRole, blueprintContext]);

  const generatePersonalizedFlow = async () => {
    setIsGenerating(true);

    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `
          Create personalized AI onboarding flow for user.
          
          User Role: ${userRole || 'developer'}
          Blueprint Context: ${JSON.stringify(blueprintContext)}
          
          Generate customized onboarding based on:
          - User expertise level and role (Developer/DevOps/Data Scientist/Executive)
          - Blueprint complexity and requirements
          - Platform features most relevant to their use case
          - Role-specific workflows and best practices
          
          Create step-by-step flow with:
          1. WELCOME & CONTEXT: Personalized introduction
          2. CORE FEATURES: Essential features for their role (API Gateway, Tracing, Marketplace)
          3. ADVANCED FEATURES: Proactive monitoring, lifecycle management based on needs
          4. INTERACTIVE TUTORIALS: Hands-on guides for each feature
          5. CONTEXT-AWARE TIPS: Best practices specific to their blueprint
          
          For each step provide:
          - Title and description
          - Interactive tutorial content
          - Context-aware tips
          - Expected completion time
          - Feature to highlight
        `,
        response_json_schema: {
          type: 'object',
          properties: {
            steps: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  description: { type: 'string' },
                  feature: { type: 'string' },
                  tutorialContent: { type: 'string' },
                  contextTips: { type: 'array', items: { type: 'string' } },
                  estimatedTime: { type: 'string' },
                  actionable: { type: 'boolean' }
                }
              }
            },
            personalizedMessage: { type: 'string' }
          }
        }
      });

      setOnboardingFlow(result);
    } catch (error) {
      console.error('Onboarding generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStepComplete = () => {
    setCompletedSteps([...completedSteps, currentStep]);
    if (currentStep < onboardingFlow.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      toast.success('Onboarding completed!');
      onComplete?.();
    }
  };

  const launchTutorial = (feature) => {
    setShowTutorial(feature);
  };

  if (isGenerating) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      >
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <div className="text-white text-lg mb-2">Personalizing your experience...</div>
          <div className="text-white/60 text-sm">Analyzing your role and blueprint</div>
        </div>
      </motion.div>
    );
  }

  if (!onboardingFlow) return null;

  const step = onboardingFlow.steps[currentStep];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className="w-full max-w-3xl bg-black/95 border border-white/20 rounded-xl overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-cyan-400" />
              <h2 className="text-xl font-bold text-white">AI-Powered Onboarding</h2>
            </div>
            <button
              onClick={() => onComplete?.()}
              className="text-white/60 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress */}
          <div className="flex items-center gap-2 mb-2">
            {onboardingFlow.steps.map((_, idx) => (
              <div
                key={idx}
                className={`h-2 flex-1 rounded-full transition-all ${
                  completedSteps.includes(idx)
                    ? 'bg-green-500'
                    : idx === currentStep
                    ? 'bg-cyan-500'
                    : 'bg-white/10'
                }`}
              />
            ))}
          </div>
          <div className="text-white/60 text-sm">
            Step {currentStep + 1} of {onboardingFlow.steps.length}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          <h3 className="text-2xl font-bold text-white mb-3">{step.title}</h3>
          <p className="text-white/70 mb-6">{step.description}</p>

          {/* Tutorial Content */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 mb-6">
            <div className="text-white/80 text-sm whitespace-pre-line mb-4">
              {step.tutorialContent}
            </div>
            {step.actionable && (
              <button
                onClick={() => launchTutorial(step.feature)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400"
              >
                <Play className="w-4 h-4" />
                Launch Interactive Tutorial
              </button>
            )}
          </div>

          {/* Context-Aware Tips */}
          {step.contextTips?.length > 0 && (
            <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30">
              <h4 className="text-purple-400 font-semibold mb-3">
                💡 Tips for Your Use Case
              </h4>
              <div className="space-y-2">
                {step.contextTips.map((tip, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                    <span className="text-white/70 text-sm">{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 flex items-center justify-between">
          <div className="text-white/60 text-sm">
            ⏱ Estimated time: {step.estimatedTime}
          </div>
          <div className="flex gap-3">
            {currentStep > 0 && (
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                className="px-6 py-2 rounded-lg bg-white/5 text-white/70 hover:text-white"
              >
                Previous
              </button>
            )}
            <button
              onClick={handleStepComplete}
              className="flex items-center gap-2 px-6 py-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400"
            >
              {currentStep === onboardingFlow.steps.length - 1 ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Complete
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Interactive Tutorial Overlay */}
      <AnimatePresence>
        {showTutorial && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-10 bg-black/60 flex items-center justify-center"
            onClick={() => setShowTutorial(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-black/95 border border-cyan-500/30 rounded-xl p-6 max-w-2xl"
            >
              <h3 className="text-white font-bold text-xl mb-4">
                Interactive Tutorial: {showTutorial}
              </h3>
              <p className="text-white/70 mb-4">
                Follow along with the highlighted elements in the interface.
                This tutorial will guide you through using the {showTutorial}.
              </p>
              <button
                onClick={() => setShowTutorial(null)}
                className="px-6 py-2 rounded-lg bg-cyan-500/20 text-cyan-400"
              >
                Got it!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}