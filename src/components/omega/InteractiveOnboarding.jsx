import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, ChevronLeft, Sparkles, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function InteractiveOnboarding({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);

  const onboardingSteps = [
    {
      title: 'Welcome to Omni-Present Omega',
      description: 'Your gateway to sentient cyber-physical isomorphism',
      visual: '🌌',
      content: 'This platform integrates neural interfaces, volumetric holography, and autonomous AI agents into a unified cognitive fabric.',
      action: 'Begin Journey'
    },
    {
      title: 'Neural Manifold Alignment',
      description: 'Direct thought-to-action via InfoNCE',
      visual: '🧠',
      content: 'Your neural signals are decoded using contrastive learning to align biological intent with digital execution. Phi (Φ) measures integrated information.',
      action: 'Explore Neural Interface'
    },
    {
      title: 'Sentient Finance Engine',
      description: 'Unlimited capital through Active Inference',
      visual: '💰',
      content: 'AI agents manage sovereign wealth using the OML framework, generating recursive value through algorithmic trading and project financing.',
      action: 'Activate Finance Agent'
    },
    {
      title: 'Aether Volumetric Display',
      description: 'Photophoretic holography in physical space',
      visual: '✨',
      content: 'Create persistent 3D holograms by trapping particles with light. Variable focal depth and active stabilization ensure precision.',
      action: 'Control Aether Display'
    },
    {
      title: 'Collaborative Intelligence',
      description: 'Human-AI cognitive handshake',
      visual: '🤝',
      content: 'Work seamlessly with AI through shared intentionality. Your preferences guide autonomous systems while AI optimizes execution.',
      action: 'Start Collaboration'
    }
  ];

  const handleNext = () => {
    setCompletedSteps([...completedSteps, currentStep]);
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete?.();
    }
  };

  const currentStepData = onboardingSteps[currentStep];

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-3xl w-full"
      >
        <Card className="bg-gradient-to-br from-indigo-950/90 via-purple-950/90 to-pink-950/90 border-purple-500/50">
          <CardContent className="p-8">
            <div className="flex justify-between items-center mb-6">
              <Badge className="bg-purple-600">
                Step {currentStep + 1} of {onboardingSteps.length}
              </Badge>
              <div className="flex gap-1">
                {onboardingSteps.map((_, idx) => (
                  <div
                    key={idx}
                    className={`w-2 h-2 rounded-full ${
                      completedSteps.includes(idx) ? 'bg-green-500' :
                      idx === currentStep ? 'bg-purple-500' : 'bg-gray-700'
                    }`}
                  />
                ))}
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-center mb-6">
                  <div className="text-8xl mb-4">{currentStepData.visual}</div>
                  <h2 className="text-3xl font-bold text-white mb-2">{currentStepData.title}</h2>
                  <p className="text-purple-300 text-lg mb-4">{currentStepData.description}</p>
                  <p className="text-gray-300 text-sm max-w-2xl mx-auto">{currentStepData.content}</p>
                </div>

                <div className="flex justify-between items-center">
                  <Button
                    variant="outline"
                    onClick={() => currentStep > 0 && setCurrentStep(currentStep - 1)}
                    disabled={currentStep === 0}
                    className="border-purple-500/50"
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>

                  <Button
                    onClick={handleNext}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {currentStep === onboardingSteps.length - 1 ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Complete Onboarding
                      </>
                    ) : (
                      <>
                        {currentStepData.action}
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}