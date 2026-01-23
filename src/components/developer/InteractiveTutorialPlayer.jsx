import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { PlayCircle, CheckCircle, ArrowRight, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TUTORIALS = [
  {
    id: 'quickstart',
    title: 'Quick Start Guide',
    difficulty: 'Beginner',
    duration: '10 min',
    steps: [
      { title: 'Install SDK', code: 'npm install @omni-present/sdk', completed: false },
      { title: 'Initialize Client', code: 'const client = new OmniPresentClient({ apiKey: "..." });', completed: false },
      { title: 'Create First Agent', code: 'const agent = await client.agents.create({ name: "MyAgent" });', completed: false },
      { title: 'Execute Task', code: 'const result = await client.tasks.execute({ agent_id: agent.id });', completed: false }
    ]
  },
  {
    id: 'agent_creation',
    title: 'Advanced Agent Creation',
    difficulty: 'Intermediate',
    duration: '30 min',
    steps: [
      { title: 'Define Capabilities', code: 'const capabilities = ["analysis", "prediction", "optimization"];', completed: false },
      { title: 'Configure Personality', code: 'const personality = { empathy: 0.8, creativity: 0.9 };', completed: false },
      { title: 'Set Ethical Framework', code: 'const ethics = client.ethics.framework("utilitarian");', completed: false },
      { title: 'Deploy Agent', code: 'await client.agents.deploy(agent.id, { environment: "production" });', completed: false }
    ]
  },
  {
    id: 'consciousness_integration',
    title: 'Consciousness Data Integration',
    difficulty: 'Advanced',
    duration: '60 min',
    steps: [
      { title: 'Subscribe to Stream', code: 'const stream = client.consciousness.subscribe(userId);', completed: false },
      { title: 'Process Neural Data', code: 'stream.on("neural_update", (data) => processNeuralData(data));', completed: false },
      { title: 'Send Motor Commands', code: 'await client.consciousness.sendCommand(userId, { type: "motor" });', completed: false }
    ]
  }
];

export default function InteractiveTutorialPlayer() {
  const [activeTutorial, setActiveTutorial] = useState(null);
  const [completedSteps, setCompletedSteps] = useState({});

  const handleStepComplete = (tutorialId, stepIndex) => {
    setCompletedSteps(prev => ({
      ...prev,
      [`${tutorialId}_${stepIndex}`]: true
    }));
  };

  const tutorial = TUTORIALS.find(t => t.id === activeTutorial);
  const progress = tutorial 
    ? (Object.keys(completedSteps).filter(k => k.startsWith(tutorial.id)).length / tutorial.steps.length) * 100
    : 0;

  return (
    <Card className="bg-black/40 border-indigo-500/50">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-400" />
          Interactive Tutorials
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!activeTutorial ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {TUTORIALS.map((tut) => (
              <motion.div
                key={tut.id}
                whileHover={{ scale: 1.02 }}
                className="bg-black/60 p-4 rounded-lg border border-indigo-500/30 cursor-pointer"
                onClick={() => setActiveTutorial(tut.id)}
              >
                <h3 className="text-white font-bold mb-2">{tut.title}</h3>
                <div className="flex gap-2 mb-3">
                  <Badge className={
                    tut.difficulty === 'Beginner' ? 'bg-green-500/30 text-green-300' :
                    tut.difficulty === 'Intermediate' ? 'bg-yellow-500/30 text-yellow-300' :
                    'bg-red-500/30 text-red-300'
                  }>
                    {tut.difficulty}
                  </Badge>
                  <Badge variant="outline" className="text-white/60">
                    {tut.duration}
                  </Badge>
                </div>
                <Button size="sm" className="w-full bg-indigo-600 hover:bg-indigo-700">
                  <PlayCircle className="w-4 h-4 mr-2" />
                  Start Tutorial
                </Button>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-bold text-xl">{tutorial.title}</h3>
                <div className="text-white/60 text-sm">{tutorial.difficulty} • {tutorial.duration}</div>
              </div>
              <Button variant="outline" onClick={() => setActiveTutorial(null)}>
                Back to List
              </Button>
            </div>

            <div>
              <div className="text-white text-sm mb-2">Progress: {progress.toFixed(0)}%</div>
              <Progress value={progress} className="h-2" />
            </div>

            <div className="space-y-3">
              <AnimatePresence>
                {tutorial.steps.map((step, idx) => {
                  const isCompleted = completedSteps[`${tutorial.id}_${idx}`];
                  
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className={`p-4 rounded-lg border ${
                        isCompleted
                          ? 'bg-green-500/20 border-green-500/50'
                          : 'bg-black/60 border-indigo-500/30'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {isCompleted ? (
                            <CheckCircle className="w-5 h-5 text-green-400" />
                          ) : (
                            <div className="w-5 h-5 rounded-full border-2 border-indigo-400 flex items-center justify-center text-white text-xs">
                              {idx + 1}
                            </div>
                          )}
                          <span className="text-white font-bold">{step.title}</span>
                        </div>
                        {!isCompleted && (
                          <Button
                            size="sm"
                            onClick={() => handleStepComplete(tutorial.id, idx)}
                            className="bg-indigo-600 hover:bg-indigo-700"
                          >
                            Complete
                          </Button>
                        )}
                      </div>
                      <div className="bg-gray-900 p-3 rounded mt-2">
                        <code className="text-green-400 text-xs">{step.code}</code>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {progress === 100 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-green-500/20 border border-green-500/50 p-6 rounded-lg text-center"
              >
                <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-3" />
                <h3 className="text-white font-bold text-xl mb-2">Tutorial Complete! 🎉</h3>
                <p className="text-white/70">You've mastered {tutorial.title}</p>
              </motion.div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}