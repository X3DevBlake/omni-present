import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BookOpen, CheckCircle, ChevronRight, Play } from 'lucide-react';

export default function InteractiveTutorial({ tutorial }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);

  const tutorials = {
    quickstart: {
      title: 'Quick Start Guide',
      steps: [
        { title: 'Install SDK', content: 'npm install @omni-present/sdk', action: 'Copy command' },
        { title: 'Initialize Client', content: 'const client = new OmniPresentClient({ apiKey: "..." });', action: 'Copy code' },
        { title: 'Create Agent', content: 'await client.agents.create({ name: "MyAgent" });', action: 'Try it' },
        { title: 'Test Integration', content: 'Run your first API call', action: 'Execute' }
      ]
    },
    agent_creation: {
      title: 'Agent Creation Tutorial',
      steps: [
        { title: 'Define Capabilities', content: 'Specify what your agent can do', action: 'Configure' },
        { title: 'Set Personality', content: 'Choose personality archetype', action: 'Select' },
        { title: 'Configure Ethics', content: 'Set ethical guidelines', action: 'Define' },
        { title: 'Deploy Agent', content: 'Launch your agent', action: 'Deploy' }
      ]
    }
  };

  const activeTutorial = tutorials[tutorial] || tutorials.quickstart;
  const progress = (completedSteps.length / activeTutorial.steps.length) * 100;

  const completeStep = (stepIndex) => {
    if (!completedSteps.includes(stepIndex)) {
      setCompletedSteps([...completedSteps, stepIndex]);
      if (stepIndex === currentStep && stepIndex < activeTutorial.steps.length - 1) {
        setCurrentStep(stepIndex + 1);
      }
    }
  };

  return (
    <Card className="bg-black/40 border-indigo-500/50">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-400" />
          {activeTutorial.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white text-sm">Progress</span>
            <span className="text-indigo-400 font-bold">{progress.toFixed(0)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="space-y-3">
          {activeTutorial.steps.map((step, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-lg border transition-all ${
                idx === currentStep
                  ? 'bg-indigo-500/20 border-indigo-500/50'
                  : completedSteps.includes(idx)
                  ? 'bg-green-500/20 border-green-500/50'
                  : 'bg-black/60 border-white/10'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {completedSteps.includes(idx) ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-white/30" />
                  )}
                  <span className="text-white font-bold">{step.title}</span>
                </div>
                <Badge className={idx === currentStep ? 'bg-indigo-500/30 text-indigo-300' : 'bg-white/10 text-white/60'}>
                  Step {idx + 1}
                </Badge>
              </div>
              
              <p className="text-white/70 text-sm mb-3 ml-7">{step.content}</p>
              
              {idx === currentStep && (
                <Button
                  size="sm"
                  onClick={() => completeStep(idx)}
                  className="ml-7 bg-indigo-600 hover:bg-indigo-700"
                >
                  {step.action}
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}