import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Box, Plane, Html, Sphere, Line } from '@react-three/drei';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Video, Mic, Share2, Activity, Bot, Send, BookOpen, Lightbulb, MessageSquare } from 'lucide-react';
import * as THREE from 'three';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery } from '@tanstack/react-query';

const HolographicContent = ({ position, contentType, data }) => {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });

  if (contentType === 'model') {
    return (
      <group position={position} ref={meshRef}>
        <Sphere args={[1.5, 64, 64]}>
          <meshStandardMaterial
            color="#3b82f6"
            emissive="#3b82f6"
            emissiveIntensity={0.5}
            transparent
            opacity={0.6}
            wireframe
          />
        </Sphere>
        <Text position={[0, -2, 0]} fontSize={0.3} color="white" anchorX="center">
          {data?.title || '3D Model'}
        </Text>
      </group>
    );
  }

  if (contentType === 'formula') {
    return (
      <group position={position} ref={meshRef}>
        <Html distanceFactor={8}>
          <div className="bg-black/90 backdrop-blur-xl border border-purple-500/50 rounded-lg p-6 min-w-[400px]">
            <div className="text-2xl text-white font-mono mb-2">{data?.formula || 'E = mc²'}</div>
            <p className="text-sm text-gray-300">{data?.description || 'Energy-Mass Equivalence'}</p>
          </div>
        </Html>
      </group>
    );
  }

  return null;
};

const StudentAvatar = ({ position, student, isActive, isSpeaking }) => {
  const meshRef = useRef();
  const ringRef = useRef();

  useFrame((state) => {
    if (meshRef.current && isActive) {
      meshRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 3) * 0.1);
    }
    if (ringRef.current && isSpeaking) {
      ringRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 5) * 0.3);
    }
  });

  return (
    <group position={position}>
      <Box ref={meshRef} args={[0.5, 1.5, 0.5]}>
        <meshStandardMaterial
          color={isActive ? '#3b82f6' : '#6b7280'}
          emissive={isActive ? '#3b82f6' : '#000000'}
          emissiveIntensity={isActive ? 0.6 : 0}
        />
      </Box>
      {isSpeaking && (
        <mesh ref={ringRef} position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.8, 0.05, 16, 32]} />
          <meshBasicMaterial color="#10b981" transparent opacity={0.6} />
        </mesh>
      )}
      <Text position={[0, -1.2, 0]} fontSize={0.15} color="white" anchorX="center">
        {student.name}
      </Text>
      <Html distanceFactor={6}>
        <div className="bg-blue-600 text-white px-2 py-1 rounded text-xs">
          {student.engagement || 85}%
        </div>
      </Html>
    </group>
  );
};

const AIInstructorHologram = ({ position, mood }) => {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 1.5) * 0.3;
    }
  });

  const moodColors = {
    teaching: '#3b82f6',
    encouraging: '#10b981',
    explaining: '#8b5cf6'
  };

  return (
    <group position={position}>
      <Sphere ref={meshRef} args={[0.8, 32, 32]}>
        <meshStandardMaterial
          color={moodColors[mood] || '#3b82f6'}
          emissive={moodColors[mood] || '#3b82f6'}
          emissiveIntensity={0.9}
          transparent
          opacity={0.7}
        />
      </Sphere>
      <mesh position={[0, 1.5, 0]}>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial
          color="#fbbf24"
          emissive="#f59e0b"
          emissiveIntensity={0.8}
        />
      </mesh>
      <Text position={[0, -1.5, 0]} fontSize={0.3} color="white" anchorX="center">
        Omega Instructor
      </Text>
    </group>
  );
};

const InteractiveWhiteboard = ({ position, drawings, onDraw }) => {
  const meshRef = useRef();

  return (
    <group position={position}>
      <Box args={[8, 5, 0.1]} ref={meshRef}>
        <meshStandardMaterial color="#0f172a" transparent opacity={0.95} />
      </Box>
      <Html distanceFactor={10} transform>
        <div className="w-[600px] h-[400px] bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg p-4 border border-blue-500/30">
          <div className="text-white text-sm font-bold mb-2">Collaborative Board</div>
          <div className="bg-black/60 rounded h-[300px] mb-2 p-4 overflow-y-auto">
            {drawings.map((draw, idx) => (
              <div key={idx} className="text-gray-300 mb-2 text-sm">
                <span className="text-blue-400">{draw.author}:</span> {draw.content}
              </div>
            ))}
          </div>
          <Input 
            placeholder="Add annotation..." 
            className="bg-white/10 border-white/20 text-white text-sm"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.target.value) {
                onDraw({ author: 'You', content: e.target.value });
                e.target.value = '';
              }
            }}
          />
        </div>
      </Html>
    </group>
  );
};

export default function EnhancedHolographicClassroom3D({ sessionId, courseId, moduleId }) {
  const [participants, setParticipants] = useState([
    { id: 'student_1', name: 'Alice', active: true, speaking: false, engagement: 92 },
    { id: 'student_2', name: 'Bob', active: true, speaking: false, engagement: 88 },
    { id: 'student_3', name: 'Carol', active: true, speaking: true, engagement: 95 },
    { id: 'student_4', name: 'Dave', active: false, speaking: false, engagement: 75 }
  ]);

  const [instructorMood, setInstructorMood] = useState('teaching');
  const [holographicContent, setHolographicContent] = useState({
    type: 'formula',
    data: { formula: 'Φ = min_P EMD(M, ∏P)', description: 'Integrated Information (IIT 4.0)' }
  });
  const [drawings, setDrawings] = useState([
    { author: 'Instructor', content: 'Key concept: Phi measures consciousness as irreducible information' }
  ]);
  const [aiInsights, setAiInsights] = useState([]);
  const [questionInput, setQuestionInput] = useState('');

  const studentPositions = [
    [-4, 0, 3], [-1.5, 0, 3], [1.5, 0, 3], [4, 0, 3]
  ];

  const askQuestionMutation = useMutation({
    mutationFn: async (question) => {
      return await base44.integrations.Core.InvokeLLM({
        prompt: `As an AI instructor teaching ${courseId}, answer this student question concisely: ${question}`,
        add_context_from_internet: false
      });
    },
    onSuccess: (response) => {
      setAiInsights([...aiInsights, { type: 'answer', content: response }]);
      setInstructorMood('explaining');
      setTimeout(() => setInstructorMood('teaching'), 3000);
    }
  });

  const handleAskQuestion = () => {
    if (questionInput.trim()) {
      askQuestionMutation.mutate(questionInput);
      setQuestionInput('');
    }
  };

  return (
    <div className="w-full h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 relative">
      {/* Top Control Bar */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-4 left-4 right-4 z-10"
      >
        <Card className="bg-black/50 backdrop-blur-2xl border-white/20 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Badge className="bg-green-500 gap-1">
                <Activity className="w-3 h-3" />
                Live
              </Badge>
              <span className="text-white text-sm font-medium">
                <Users className="w-4 h-4 inline mr-1" />
                {participants.filter(p => p.active).length}/{participants.length} present
              </span>
              <Badge variant="outline" className="border-purple-500/50 text-purple-300">
                Module {moduleId}
              </Badge>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="border-white/20 text-white">
                <Mic className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="outline" className="border-white/20 text-white">
                <Video className="w-4 h-4" />
              </Button>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* 3D Classroom Scene */}
      <Canvas camera={{ position: [0, 6, 14], fov: 65 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 15, 10]} intensity={1.2} />
        <pointLight position={[-10, 10, -10]} intensity={0.6} color="#8b5cf6" />
        <pointLight position={[0, 20, 0]} intensity={0.4} color="#3b82f6" />

        {/* Floor with grid */}
        <Plane args={[30, 30]} rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
          <meshStandardMaterial color="#0f172a" transparent opacity={0.7} />
        </Plane>
        <gridHelper args={[30, 30, '#1e40af', '#1e3a8a']} position={[0, -0.99, 0]} />

        {/* AI Instructor Hologram */}
        <AIInstructorHologram position={[0, 3, -5]} mood={instructorMood} />

        {/* Interactive Whiteboard */}
        <InteractiveWhiteboard 
          position={[0, 2, -7]} 
          drawings={drawings}
          onDraw={(drawing) => setDrawings([...drawings, drawing])}
        />

        {/* Holographic Content Display */}
        <HolographicContent
          position={[5, 3, -4]}
          contentType={holographicContent.type}
          data={holographicContent.data}
        />

        {/* Student Avatars */}
        {participants.map((student, idx) => (
          <StudentAvatar
            key={student.id}
            position={studentPositions[idx]}
            student={student}
            isActive={student.active}
            isSpeaking={student.speaking}
          />
        ))}

        {/* Attention beams from students to content */}
        {participants.filter(p => p.active).map((student, idx) => (
          <Line
            key={`beam-${student.id}`}
            points={[
              new THREE.Vector3(...studentPositions[idx]),
              new THREE.Vector3(0, 3, -5)
            ]}
            color="#10b981"
            lineWidth={0.5}
            transparent
            opacity={0.2}
          />
        ))}

        <OrbitControls enableZoom enablePan maxPolarAngle={Math.PI / 2} minDistance={8} maxDistance={25} />
      </Canvas>

      {/* AI Assistant Panel */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute bottom-4 right-4 w-96 z-10"
      >
        <Card className="bg-black/70 backdrop-blur-2xl border-white/20 text-white">
          <Tabs defaultValue="qa" className="w-full">
            <TabsList className="bg-white/10 w-full">
              <TabsTrigger value="qa" className="flex-1">
                <MessageSquare className="w-4 h-4 mr-2" />
                Q&A
              </TabsTrigger>
              <TabsTrigger value="notes" className="flex-1">
                <BookOpen className="w-4 h-4 mr-2" />
                Notes
              </TabsTrigger>
              <TabsTrigger value="insights" className="flex-1">
                <Lightbulb className="w-4 h-4 mr-2" />
                Insights
              </TabsTrigger>
            </TabsList>

            <TabsContent value="qa" className="p-4">
              <div className="space-y-3 h-64 overflow-y-auto mb-3">
                {aiInsights.map((insight, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-blue-600/20 border border-blue-500/30 rounded-lg p-3"
                  >
                    <div className="flex items-start gap-2">
                      <Bot className="w-4 h-4 text-blue-400 mt-1 flex-shrink-0" />
                      <p className="text-sm text-gray-200">{insight.content}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Ask a question..."
                  value={questionInput}
                  onChange={(e) => setQuestionInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAskQuestion()}
                  className="bg-white/10 border-white/20 text-white"
                />
                <Button 
                  size="sm" 
                  onClick={handleAskQuestion}
                  disabled={askQuestionMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="notes" className="p-4">
              <div className="bg-white/5 rounded-lg p-3 h-72 overflow-y-auto text-sm">
                <h4 className="font-bold mb-2 text-purple-300">Auto-Generated Notes:</h4>
                {drawings.map((draw, idx) => (
                  <p key={idx} className="text-gray-300 mb-2">• {draw.content}</p>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="insights" className="p-4">
              <div className="space-y-3 h-72 overflow-y-auto">
                <div className="bg-purple-600/20 border border-purple-500/30 rounded-lg p-3">
                  <h4 className="font-bold text-sm mb-1 text-purple-300">Key Concepts</h4>
                  <p className="text-xs text-gray-300">Phi (Φ) quantifies consciousness as integrated information</p>
                </div>
                <div className="bg-green-600/20 border border-green-500/30 rounded-lg p-3">
                  <h4 className="font-bold text-sm mb-1 text-green-300">Real-World Application</h4>
                  <p className="text-xs text-gray-300">BCI systems use InfoNCE to decode neural patterns</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </motion.div>

      {/* Content Control Panel */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute bottom-4 left-4 z-10"
      >
        <Card className="bg-black/70 backdrop-blur-2xl border-white/20 p-4">
          <h4 className="text-white font-bold mb-3 text-sm">Holographic Content</h4>
          <div className="space-y-2">
            <Button
              size="sm"
              onClick={() => setHolographicContent({
                type: 'model',
                data: { title: 'Neural Network' }
              })}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Load 3D Model
            </Button>
            <Button
              size="sm"
              onClick={() => setHolographicContent({
                type: 'formula',
                data: { formula: '∇_θ J(θ) = -E[∇_θ log π(a|s)]', description: 'Policy Gradient' }
              })}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              Show Formula
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}