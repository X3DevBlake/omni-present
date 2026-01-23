import React, { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Line } from '@react-three/drei';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Sparkles, Brain, Activity, TrendingUp } from 'lucide-react';
import * as THREE from 'three';

function PathwayNode({ position, exercise, index, completed, active }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      if (active) {
        const pulse = Math.sin(state.clock.elapsedTime * 3) * 0.15 + 1;
        meshRef.current.scale.setScalar(pulse);
      }
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
    }
  });

  const color = completed ? '#10b981' : active ? '#3b82f6' : '#6b7280';

  return (
    <group position={position}>
      <Sphere ref={meshRef} args={[0.25, 32, 32]}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={active ? 0.8 : completed ? 0.4 : 0.1}
        />
      </Sphere>

      <Text position={[0, 0.5, 0]} fontSize={0.1} color="white" anchorX="center">
        {exercise.name}
      </Text>
      <Text position={[0, -0.5, 0]} fontSize={0.08} color="#aaa" anchorX="center">
        {exercise.duration_min} min
      </Text>
    </group>
  );
}

function PathwayScene({ pathway, currentStep }) {
  const exercises = pathway.neural_activities || [];

  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1.2} />
      <pointLight position={[-10, -10, -10]} intensity={0.6} color="#8b5cf6" />

      <Text position={[0, 3, 0]} fontSize={0.25} color="white" anchorX="center">
        {pathway.pathway_name}
      </Text>

      {exercises.map((exercise, idx) => {
        const progress = idx / Math.max(1, exercises.length - 1);
        const radius = 2.5;
        const angle = progress * Math.PI * 1.5 - Math.PI * 0.75;
        const position = [
          Math.cos(angle) * radius,
          Math.sin(angle) * 1.5,
          0
        ];

        return (
          <PathwayNode
            key={idx}
            position={position}
            exercise={exercise}
            index={idx}
            completed={idx < currentStep}
            active={idx === currentStep}
          />
        );
      })}

      {exercises.length > 1 && exercises.map((_, idx) => {
        if (idx === exercises.length - 1) return null;
        
        const progress1 = idx / Math.max(1, exercises.length - 1);
        const progress2 = (idx + 1) / Math.max(1, exercises.length - 1);
        const radius = 2.5;
        
        const angle1 = progress1 * Math.PI * 1.5 - Math.PI * 0.75;
        const angle2 = progress2 * Math.PI * 1.5 - Math.PI * 0.75;
        
        const from = [Math.cos(angle1) * radius, Math.sin(angle1) * 1.5, 0];
        const to = [Math.cos(angle2) * radius, Math.sin(angle2) * 1.5, 0];

        return (
          <Line
            key={idx}
            points={[from, to]}
            color={idx < currentStep ? '#10b981' : '#6b7280'}
            lineWidth={2}
            transparent
            opacity={0.6}
          />
        );
      })}

      <OrbitControls enableZoom={true} enablePan={false} />
    </>
  );
}

export default function AdaptivePathwayGenerator3D({ 
  currentState, 
  selectedGoal, 
  biometricFeedback,
  onPathwayGenerated,
  onExerciseComplete 
}) {
  const [pathway, setPathway] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [adaptationScore, setAdaptationScore] = useState(0);

  const generatePathway = async () => {
    setIsGenerating(true);
    
    // Simulate pathway generation based on current state
    const exercises = [
      { name: 'Breathwork Focus', duration_min: 5, type: 'breathing', impact: 0.7 },
      { name: 'Mindful Awareness', duration_min: 10, type: 'meditation', impact: 0.8 },
      { name: 'Cognitive Reframing', duration_min: 8, type: 'mental', impact: 0.75 },
      { name: 'Neural Activation', duration_min: 12, type: 'neural', impact: 0.85 },
      { name: 'State Integration', duration_min: 7, type: 'integration', impact: 0.9 }
    ];

    const generatedPathway = {
      pathway_name: `${selectedGoal} Optimization`,
      target_state: selectedGoal,
      neural_activities: exercises,
      biofeedback_enabled: !!biometricFeedback,
      estimated_completion_min: exercises.reduce((sum, e) => sum + e.duration_min, 0)
    };

    setTimeout(() => {
      setPathway(generatedPathway);
      setIsGenerating(false);
      setCurrentStep(0);
      onPathwayGenerated?.(generatedPathway);
    }, 2000);
  };

  const completeExercise = () => {
    if (currentStep < pathway.neural_activities.length - 1) {
      setCurrentStep(prev => prev + 1);
      
      // Simulate adaptation based on biometric feedback
      const feedbackScore = biometricFeedback?.stress_level ? (1 - biometricFeedback.stress_level) : 0.8;
      setAdaptationScore(feedbackScore);
      
      onExerciseComplete?.(pathway.neural_activities[currentStep], feedbackScore);
    }
  };

  const progress = pathway ? ((currentStep + 1) / pathway.neural_activities.length) * 100 : 0;

  return (
    <Card className="bg-black/40 border-purple-500/50">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-400" />
          AI-Driven Adaptive Pathway
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!pathway ? (
          <div className="text-center py-12">
            <Brain className="w-16 h-16 text-purple-400 mx-auto mb-4" />
            <div className="text-white mb-2">Current State</div>
            <div className="text-white/60 text-sm mb-1">
              Focus: {((currentState?.focus_level || 0.5) * 100).toFixed(0)}%
            </div>
            <div className="text-white/60 text-sm mb-4">
              Emotion: {currentState?.primary_emotion || 'Neutral'}
            </div>
            <div className="text-white mb-2">Selected Goal</div>
            <Badge className="bg-purple-500/30 text-purple-300 mb-6">
              {selectedGoal || 'Enhanced Focus'}
            </Badge>
            <div>
              <Button
                onClick={generatePathway}
                disabled={isGenerating}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isGenerating ? 'Generating AI Pathway...' : 'Generate Personalized Pathway'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-black rounded-lg overflow-hidden" style={{ height: '350px' }}>
              <Canvas camera={{ position: [0, 1, 5], fov: 60 }}>
                <PathwayScene pathway={pathway} currentStep={currentStep} />
              </Canvas>
            </div>

            <div className="bg-black/60 border border-purple-500/30 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-white text-sm font-bold">Current Exercise</div>
                  <div className="text-white/80">{pathway.neural_activities[currentStep]?.name}</div>
                </div>
                <Badge className="bg-blue-500/30 text-blue-300">
                  Step {currentStep + 1}/{pathway.neural_activities.length}
                </Badge>
              </div>

              <div className="mb-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-white/60">Pathway Progress</span>
                  <span className="text-white">{progress.toFixed(0)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              {biometricFeedback && (
                <div className="mb-3 bg-indigo-500/10 border border-indigo-500/30 rounded-lg p-2">
                  <div className="flex items-center gap-2 mb-1">
                    <Activity className="w-3 h-3 text-indigo-400" />
                    <span className="text-white text-xs font-bold">Real-Time Biometric Adaptation</span>
                  </div>
                  <div className="text-white/60 text-xs">
                    Heart Rate: {biometricFeedback.heart_rate || 72} BPM | 
                    Stress: {((biometricFeedback.stress_level || 0.3) * 100).toFixed(0)}%
                  </div>
                  {adaptationScore > 0 && (
                    <Badge className="mt-1 bg-green-500/30 text-green-300 text-xs">
                      Adaptation Score: {(adaptationScore * 100).toFixed(0)}%
                    </Badge>
                  )}
                </div>
              )}

              <Button
                onClick={completeExercise}
                disabled={currentStep >= pathway.neural_activities.length - 1}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                {currentStep >= pathway.neural_activities.length - 1 ? 'Pathway Complete!' : 'Complete Exercise'}
              </Button>
            </div>

            {currentStep >= pathway.neural_activities.length - 1 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 text-center"
              >
                <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <div className="text-white font-bold mb-1">Pathway Completed!</div>
                <div className="text-white/60 text-sm">
                  Total Time: {pathway.estimated_completion_min} minutes
                </div>
              </motion.div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}