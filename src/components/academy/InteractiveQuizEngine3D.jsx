import React, { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Text, Html, Float } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, CheckCircle2, XCircle, Trophy, Zap } from 'lucide-react';
import * as THREE from 'three';

const QuizOption = ({ option, position, index, onClick, isSelected, isCorrect, revealed }) => {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  
  useFrame((state) => {
    if (meshRef.current) {
      const scale = isSelected ? 1.3 : hovered ? 1.15 : 1;
      meshRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.15);
      if (revealed) {
        meshRef.current.rotation.y = state.clock.elapsedTime * 2;
      }
    }
  });

  const getColor = () => {
    if (!revealed) return isSelected ? '#8b5cf6' : '#3b82f6';
    return isCorrect ? '#10b981' : '#ef4444';
  };
  
  return (
    <group position={position}>
      <Float speed={2} rotationIntensity={0.5}>
        <Sphere 
          ref={meshRef}
          args={[0.4, 32, 32]}
          onClick={(e) => {
            e.stopPropagation();
            if (!revealed) onClick(index);
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHovered(true);
          }}
          onPointerOut={() => setHovered(false)}
        >
          <meshPhysicalMaterial
            color={getColor()}
            emissive={getColor()}
            emissiveIntensity={isSelected || revealed ? 1.5 : hovered ? 1 : 0.7}
            metalness={0.9}
            roughness={0.1}
          />
        </Sphere>
        
        <Html distanceFactor={8}>
          <div className={`bg-black/95 border-2 rounded-xl p-3 min-w-[200px] max-w-[250px] backdrop-blur-xl ${
            revealed ? (isCorrect ? 'border-green-400' : 'border-red-400') : 'border-blue-400'
          }`}>
            <div className="text-white text-sm mb-2">{option.text}</div>
            {revealed && (
              <Badge className={isCorrect ? 'bg-green-600' : 'bg-red-600'}>
                {isCorrect ? 'Correct!' : 'Incorrect'}
              </Badge>
            )}
          </div>
        </Html>
      </Float>
      
      <Text position={[0, -0.7, 0]} fontSize={0.15} color="white" anchorX="center">
        {String.fromCharCode(65 + index)}
      </Text>
    </group>
  );
};

export default function InteractiveQuizEngine3D() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);

  const questions = [
    {
      question: 'What does IIT 4.0 measure as consciousness?',
      options: [
        { text: 'Processing speed', correct: false },
        { text: 'Integrated information (Φ)', correct: true },
        { text: 'Neural density', correct: false },
        { text: 'Synaptic count', correct: false }
      ]
    },
    {
      question: 'What technology enables volumetric displays in POT?',
      options: [
        { text: 'LED matrices', correct: false },
        { text: 'Photophoretic forces', correct: true },
        { text: 'LCD screens', correct: false },
        { text: 'Plasma fields', correct: false }
      ]
    },
    {
      question: 'What ensures distributed consistency in CRDT?',
      options: [
        { text: 'Central server', correct: false },
        { text: 'Consensus voting', correct: false },
        { text: 'Delta-state merging', correct: true },
        { text: 'Blockchain', correct: false }
      ]
    }
  ];

  const question = questions[currentQuestion];
  const optionPositions = question.options.map((opt, idx) => {
    const angle = (idx / 4) * Math.PI * 2;
    const radius = 3;
    return {
      option: opt,
      position: [Math.cos(angle) * radius, Math.sin(angle) * radius, 0],
      index: idx
    };
  });

  const handleAnswer = (index) => {
    setSelectedAnswer(index);
  };

  const handleSubmit = () => {
    setRevealed(true);
    if (question.options[selectedAnswer].correct) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setRevealed(false);
    } else {
      setQuizComplete(true);
    }
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setRevealed(false);
    setScore(0);
    setQuizComplete(false);
  };

  if (quizComplete) {
    return (
      <Card className="bg-gradient-to-br from-purple-950/90 via-indigo-950/90 to-blue-950/90 backdrop-blur-xl border-purple-500/30">
        <CardContent className="p-12 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: 360 }}
            transition={{ duration: 0.6 }}
          >
            <Trophy className="w-24 h-24 text-amber-400 mx-auto mb-6" />
          </motion.div>
          
          <h2 className="text-4xl font-bold text-white mb-4">Quiz Complete!</h2>
          <p className="text-gray-400 text-xl mb-8">
            You scored {score} out of {questions.length}
          </p>
          
          <div className="flex gap-4 justify-center">
            <Button onClick={handleRestart} size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600">
              <Zap className="w-5 h-5 mr-2" />
              Retake Quiz
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-indigo-950/90 via-purple-950/90 to-blue-950/90 backdrop-blur-xl border-purple-500/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-3">
            <Brain className="w-7 h-7 text-purple-400" />
            Interactive 3D Quiz
          </CardTitle>
          <Badge className="bg-purple-600">
            Question {currentQuestion + 1}/{questions.length}
          </Badge>
        </div>
        <p className="text-gray-300 text-lg mt-4">{question.question}</p>
      </CardHeader>
      <CardContent>
        <div className="h-[500px] bg-black/40 rounded-xl overflow-hidden mb-4 border border-purple-500/20">
          <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={2} color="#8b5cf6" />
            <pointLight position={[-10, -10, -10]} intensity={1} color="#3b82f6" />

            {/* Question sphere */}
            <Float speed={1} rotationIntensity={0.3}>
              <Sphere args={[0.6, 64, 64]} position={[0, 0, 0]}>
                <meshPhysicalMaterial
                  color="#ec4899"
                  emissive="#ec4899"
                  emissiveIntensity={1.2}
                  metalness={0.9}
                  roughness={0.1}
                />
              </Sphere>
              <Text position={[0, 0, 0]} fontSize={0.3} color="white" anchorX="center">
                ?
              </Text>
            </Float>

            {optionPositions.map(({ option, position, index }) => (
              <QuizOption
                key={index}
                option={option}
                position={position}
                index={index}
                onClick={handleAnswer}
                isSelected={selectedAnswer === index}
                isCorrect={option.correct}
                revealed={revealed}
              />
            ))}

            <OrbitControls enableZoom={false} autoRotate={!revealed} autoRotateSpeed={0.5} />
          </Canvas>
        </div>

        <div className="flex gap-3">
          {!revealed ? (
            <Button 
              onClick={handleSubmit}
              disabled={selectedAnswer === null}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 py-6 text-lg"
            >
              Submit Answer
            </Button>
          ) : (
            <Button 
              onClick={handleNext}
              className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 py-6 text-lg"
            >
              {currentQuestion < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
            </Button>
          )}
        </div>

        {/* Score Tracker */}
        <div className="mt-4 bg-black/60 rounded-lg p-4 border border-purple-500/30">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Current Score:</span>
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              <span className="text-white font-bold text-xl">{score}/{currentQuestion + (revealed ? 1 : 0)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}