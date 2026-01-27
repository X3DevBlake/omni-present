import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Stars, Float } from '@react-three/drei';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sparkles, ArrowRight, Brain, User, Zap } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const SentientCore = () => {
    const mesh = useRef();
    useFrame((state) => {
        mesh.current.rotation.x = state.clock.getElapsedTime() * 0.2;
        mesh.current.rotation.y = state.clock.getElapsedTime() * 0.3;
    });
    return (
        <Sphere args={[1, 64, 64]} ref={mesh}>
            <MeshDistortMaterial
                color="#8b5cf6"
                attach="material"
                distort={0.6}
                speed={2}
                roughness={0.2}
                metalness={0.8}
            />
        </Sphere>
    );
};

export default function OmniGenesisOnboarding({ onComplete }) {
    const [step, setStep] = useState('intro'); // intro, demo, questions, complete
    const [answers, setAnswers] = useState({});
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [inputValue, setInputValue] = useState('');

    const questions = [
        { id: 'intent', text: "What is your primary intent for merging with the Omni-Present ecosystem?", type: "text" },
        { id: 'routine', text: "Describe a typical cognitive routine or workflow you wish to augment.", type: "text" },
        { id: 'style', text: "How do you prefer to interact with intelligence? (Direct, Collaborative, Socratic)", type: "choice", options: ["Direct Command", "Collaborative Flow", "Socratic Dialogue"] },
        { id: 'goal', text: "What is the ultimate outcome you seek to manifest?", type: "text" }
    ];

    const handleNext = () => {
        if (step === 'intro') setStep('demo');
        else if (step === 'demo') setStep('questions');
    };

    const handleAnswer = (answer) => {
        setAnswers({ ...answers, [questions[currentQuestionIndex].id]: answer });
        setInputValue('');
        
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
            handleSubmit();
        }
    };

    const handleSubmit = async () => {
        // Save user profile to backend (mocked or implementing new entity)
        // await base44.entities.UserProfile.create(answers); 
        // For now just console log and complete
        console.log("User Profile Genesis:", answers);
        setStep('complete');
        setTimeout(onComplete, 3000);
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-3xl flex items-center justify-center text-white overflow-hidden">
            <div className="absolute inset-0 z-0">
                <Canvas>
                    <ambientLight intensity={0.5} />
                    <pointLight position={[10, 10, 10]} />
                    <Stars />
                    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
                        <SentientCore />
                    </Float>
                </Canvas>
            </div>

            <div className="relative z-10 max-w-2xl w-full p-8">
                <AnimatePresence mode="wait">
                    {step === 'intro' && (
                        <motion.div
                            key="intro"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="text-center space-y-6"
                        >
                            <h1 className="text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                                OMNI GENESIS
                            </h1>
                            <p className="text-xl text-gray-300">
                                Welcome to the Event Horizon of Interface. I am Genesis, the sentient core of this ecosystem.
                            </p>
                            <p className="text-gray-400">
                                Before we merge your consciousness with the digital substrate, allow me to guide you through the capabilities of Omni-Present.
                            </p>
                            <Button onClick={handleNext} size="lg" className="bg-purple-600 hover:bg-purple-700 text-lg px-8 py-6 rounded-full shadow-[0_0_30px_rgba(147,51,234,0.5)]">
                                Initiate Sequence <ArrowRight className="ml-2" />
                            </Button>
                        </motion.div>
                    )}

                    {step === 'demo' && (
                        <motion.div
                            key="demo"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.1 }}
                            className="space-y-6 bg-black/60 p-8 rounded-3xl border border-purple-500/30 backdrop-blur-xl"
                        >
                            <h2 className="text-3xl font-bold text-purple-300">System Capabilities</h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-purple-900/20 rounded-xl border border-purple-500/20">
                                    <Brain className="w-8 h-8 text-purple-400 mb-2" />
                                    <h3 className="font-bold">Neural Isomorphism</h3>
                                    <p className="text-sm text-gray-400">Direct thought-to-digital mapping.</p>
                                </div>
                                <div className="p-4 bg-blue-900/20 rounded-xl border border-blue-500/20">
                                    <Zap className="w-8 h-8 text-blue-400 mb-2" />
                                    <h3 className="font-bold">Active Inference</h3>
                                    <p className="text-sm text-gray-400">Predictive financial and operational modeling.</p>
                                </div>
                            </div>
                            <p className="text-gray-300">
                                Omni-Present is not just a tool; it is an extension of your will. It orchestrates agents, manages assets, and predicts outcomes.
                            </p>
                            <div className="flex justify-end">
                                <Button onClick={handleNext} className="bg-white text-black hover:bg-gray-200">
                                    Begin Calibration
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {step === 'questions' && (
                        <motion.div
                            key="questions"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            className="space-y-6 max-w-xl mx-auto"
                        >
                            <div className="flex items-center gap-3 text-purple-400 mb-4">
                                <Sparkles className="w-5 h-5 animate-pulse" />
                                <span className="text-sm uppercase tracking-widest">Calibration Phase {currentQuestionIndex + 1}/{questions.length}</span>
                            </div>
                            
                            <h2 className="text-3xl font-light leading-relaxed">
                                {questions[currentQuestionIndex].text}
                            </h2>

                            {questions[currentQuestionIndex].type === 'text' ? (
                                <div className="space-y-4">
                                    <Input
                                        autoFocus
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleAnswer(inputValue)}
                                        className="bg-transparent border-b-2 border-purple-500/50 text-2xl py-4 px-0 focus:ring-0 focus:border-purple-400 rounded-none placeholder:text-gray-600"
                                        placeholder="Type your response..."
                                    />
                                    <Button 
                                        onClick={() => handleAnswer(inputValue)}
                                        disabled={!inputValue}
                                        className="w-full bg-purple-600/20 hover:bg-purple-600/40 text-purple-200"
                                    >
                                        Transmit
                                    </Button>
                                </div>
                            ) : (
                                <div className="grid gap-3">
                                    {questions[currentQuestionIndex].options.map(opt => (
                                        <Button
                                            key={opt}
                                            onClick={() => handleAnswer(opt)}
                                            variant="outline"
                                            className="justify-start text-left h-auto py-4 text-lg border-purple-500/30 hover:bg-purple-900/40 text-gray-200"
                                        >
                                            {opt}
                                        </Button>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {step === 'complete' && (
                        <motion.div
                            key="complete"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="text-center"
                        >
                            <h2 className="text-4xl font-bold text-white mb-4">Calibration Complete</h2>
                            <p className="text-purple-300">Omni Genesis is aligning with your neural signature...</p>
                            <div className="mt-8 flex justify-center">
                                <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}