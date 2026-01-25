import React, { useState, useRef, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Text, Html } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { base44 } from '@/api/base44Client';
import { Brain, Send, User, Bot, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

function TutorBrain({ isThinking }) {
  const brainRef = useRef();
  const [synapses, setSynapses] = useState([]);

  useEffect(() => {
    if (isThinking) {
      const newSynapses = Array(30).fill(0).map(() => ({
        x: (Math.random() - 0.5) * 2,
        y: (Math.random() - 0.5) * 2,
        z: (Math.random() - 0.5) * 2,
        speed: Math.random() * 0.5 + 0.5
      }));
      setSynapses(newSynapses);
    } else {
      setSynapses([]);
    }
  }, [isThinking]);

  useFrame((state) => {
    if (brainRef.current) {
      brainRef.current.rotation.y = state.clock.elapsedTime * 0.3;
      brainRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 2) * 0.1);
    }
  });

  return (
    <group>
      <Sphere ref={brainRef} args={[1.2, 32, 32]}>
        <meshPhongMaterial
          color="#8b5cf6"
          emissive="#8b5cf6"
          emissiveIntensity={isThinking ? 1.2 : 0.6}
          wireframe={isThinking}
          transparent
          opacity={0.8}
        />
      </Sphere>

      {synapses.map((synapse, i) => (
        <mesh key={i} position={[synapse.x, synapse.y, synapse.z]}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshBasicMaterial color="#ec4899" />
        </mesh>
      ))}

      <Text position={[0, -2, 0]} fontSize={0.2} color="white" anchorX="center">
        AI TUTOR
      </Text>
    </group>
  );
}

export default function InteractiveAITutor3D({ courseId, courseName }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = { role: 'student', message: inputMessage, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsThinking(true);

    try {
      const response = await base44.functions.invoke('academy/aiTutorChat', {
        session_id: sessionId,
        course_id: courseId,
        student_message: inputMessage,
        conversation_history: messages.slice(-10)
      });

      const tutorMessage = {
        role: 'tutor',
        message: response.data.tutor_response,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, tutorMessage]);
      setSessionId(response.data.session_id);
    } catch (error) {
      toast.error('Failed to get tutor response: ' + error.message);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* 3D Tutor Visualization */}
      <div className="h-[600px] bg-black/40 rounded-2xl border-2 border-purple-500/30 overflow-hidden">
        <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
          <ambientLight intensity={0.4} />
          <pointLight position={[5, 5, 5]} color="#8b5cf6" intensity={2} />
          <pointLight position={[-5, -5, -5]} color="#ec4899" intensity={1.5} />
          
          <Suspense fallback={null}>
            <TutorBrain isThinking={isThinking} />
          </Suspense>
          
          <OrbitControls enableZoom={false} />
        </Canvas>
      </div>

      {/* Chat Interface */}
      <Card className="bg-black/60 border-2 border-purple-500/40 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-3">
            <Bot className="w-6 h-6 text-purple-400" />
            AI Tutor - {courseName}
          </CardTitle>
          <Badge className="w-fit bg-purple-600/40 text-purple-300">
            Personalized Learning Assistant
          </Badge>
        </CardHeader>
        <CardContent>
          {/* Messages */}
          <ScrollArea className="h-[380px] mb-4 pr-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.length === 0 && (
                <div className="text-center text-gray-400 py-12">
                  <Brain className="w-12 h-12 mx-auto mb-3 text-purple-400/40" />
                  <p className="text-sm">Ask me anything about {courseName}!</p>
                </div>
              )}

              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${msg.role === 'student' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'tutor' && (
                    <div className="w-8 h-8 rounded-full bg-purple-600/40 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-purple-300" />
                    </div>
                  )}
                  
                  <div className={`max-w-[75%] rounded-2xl p-4 ${
                    msg.role === 'student' 
                      ? 'bg-gradient-to-r from-cyan-600/40 to-blue-600/40 border border-cyan-500/40' 
                      : 'bg-gradient-to-r from-purple-600/40 to-pink-600/40 border border-purple-500/40'
                  }`}>
                    {msg.role === 'tutor' ? (
                      <ReactMarkdown className="text-white text-sm prose prose-invert prose-sm max-w-none">
                        {msg.message}
                      </ReactMarkdown>
                    ) : (
                      <p className="text-white text-sm">{msg.message}</p>
                    )}
                  </div>

                  {msg.role === 'student' && (
                    <div className="w-8 h-8 rounded-full bg-cyan-600/40 flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-cyan-300" />
                    </div>
                  )}
                </motion.div>
              ))}

              {isThinking && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-3"
                >
                  <div className="w-8 h-8 rounded-full bg-purple-600/40 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-purple-300" />
                  </div>
                  <div className="bg-purple-600/20 rounded-2xl p-4 border border-purple-500/40">
                    <div className="flex gap-1">
                      {[0, 1, 2].map(i => (
                        <motion.div
                          key={i}
                          className="w-2 h-2 bg-purple-400 rounded-full"
                          animate={{ y: [0, -5, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="flex gap-2">
            <Input
              placeholder="Ask your tutor a question..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="bg-white/5 border-purple-500/40 text-white flex-1"
              disabled={isThinking}
            />
            <Button
              onClick={handleSendMessage}
              disabled={isThinking || !inputMessage.trim()}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}