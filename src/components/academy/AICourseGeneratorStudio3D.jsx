import React, { useState, useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Text, MeshDistortMaterial } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { base44 } from '@/api/base44Client';
import { Sparkles, BookOpen, Brain, Zap, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

function GeneratingVisual({ isGenerating }) {
  const sphereRef = useRef();
  const particlesRef = useRef([]);

  useFrame((state) => {
    if (sphereRef.current && isGenerating) {
      sphereRef.current.rotation.x = state.clock.elapsedTime;
      sphereRef.current.rotation.y = state.clock.elapsedTime * 0.7;
    }
  });

  return (
    <group>
      <Sphere ref={sphereRef} args={[1, 32, 32]}>
        <MeshDistortMaterial
          color={isGenerating ? "#8b5cf6" : "#6366f1"}
          emissive={isGenerating ? "#8b5cf6" : "#6366f1"}
          emissiveIntensity={isGenerating ? 1.5 : 0.5}
          distort={isGenerating ? 0.6 : 0.2}
          speed={isGenerating ? 5 : 1}
          roughness={0.2}
          metalness={0.8}
        />
      </Sphere>

      {isGenerating && Array(20).fill(0).map((_, i) => {
        const angle = (i / 20) * Math.PI * 2;
        const radius = 2 + Math.sin(i) * 0.5;
        return (
          <mesh key={i} position={[
            Math.cos(angle) * radius,
            Math.sin(angle * 2) * 0.5,
            Math.sin(angle) * radius
          ]}>
            <sphereGeometry args={[0.05, 16, 16]} />
            <meshBasicMaterial color="#ec4899" />
          </mesh>
        );
      })}

      {isGenerating && (
        <Text
          position={[0, 2, 0]}
          fontSize={0.3}
          color="#8b5cf6"
          anchorX="center"
        >
          AI GENERATING...
        </Text>
      )}
    </group>
  );
}

export default function AICourseGeneratorStudio3D() {
  const [formData, setFormData] = useState({
    title: '',
    field: 'advanced_quantum_ai',
    difficulty_level: 'intermediate'
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCourse, setGeneratedCourse] = useState(null);

  const handleGenerate = async () => {
    if (!formData.title) {
      toast.error('Please enter a course title');
      return;
    }

    setIsGenerating(true);
    setGeneratedCourse(null);

    try {
      const response = await base44.functions.invoke('academy/aiCourseGenerator', formData);
      
      setGeneratedCourse(response.data.course);
      toast.success('Course generated successfully!');
    } catch (error) {
      toast.error('Failed to generate course: ' + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="bg-black/60 border-2 border-purple-500/40 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-3">
              <Brain className="w-8 h-8 text-purple-400 drop-shadow-[0_0_10px_rgba(168,85,247,0.8)]" />
              AI Course Generator Studio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Form Section */}
              <div className="space-y-4">
                <div>
                  <label className="text-white text-sm mb-2 block">Course Title</label>
                  <Input
                    placeholder="e.g., Advanced Quantum AI Systems"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="bg-white/5 border-purple-500/40 text-white"
                  />
                </div>

                <div>
                  <label className="text-white text-sm mb-2 block">Field of Study</label>
                  <Select
                    value={formData.field}
                    onValueChange={(value) => setFormData({ ...formData, field: value })}
                  >
                    <SelectTrigger className="bg-white/5 border-purple-500/40 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="advanced_quantum_ai">Advanced Quantum AI</SelectItem>
                      <SelectItem value="volumetric_sentience_engineering">Volumetric Sentience Engineering</SelectItem>
                      <SelectItem value="neural_manifold_theory">Neural Manifold Theory</SelectItem>
                      <SelectItem value="consciousness_integration">Consciousness Integration</SelectItem>
                      <SelectItem value="photophoretic_physics">Photophoretic Physics</SelectItem>
                      <SelectItem value="distributed_cognition">Distributed Cognition</SelectItem>
                      <SelectItem value="ethical_ai_systems">Ethical AI Systems</SelectItem>
                      <SelectItem value="quantum_consciousness">Quantum Consciousness</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-white text-sm mb-2 block">Difficulty Level</label>
                  <Select
                    value={formData.difficulty_level}
                    onValueChange={(value) => setFormData({ ...formData, difficulty_level: value })}
                  >
                    <SelectTrigger className="bg-white/5 border-purple-500/40 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                      <SelectItem value="expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating Course...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Course
                    </>
                  )}
                </Button>
              </div>

              {/* 3D Visualization */}
              <div className="h-[400px] bg-black/40 rounded-xl border-2 border-purple-500/30 overflow-hidden">
                <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
                  <ambientLight intensity={0.5} />
                  <pointLight position={[10, 10, 10]} color="#8b5cf6" intensity={2} />
                  <pointLight position={[-10, -10, -10]} color="#ec4899" intensity={1.5} />
                  
                  <Suspense fallback={null}>
                    <GeneratingVisual isGenerating={isGenerating} />
                  </Suspense>
                  
                  <OrbitControls enableZoom={false} autoRotate={!isGenerating} autoRotateSpeed={0.5} />
                </Canvas>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Generated Course Display */}
      <AnimatePresence>
        {generatedCourse && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="bg-gradient-to-br from-purple-950/90 to-pink-950/90 border-2 border-purple-500/60 backdrop-blur-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-3">
                    <CheckCircle2 className="w-8 h-8 text-green-400" />
                    {generatedCourse.title}
                  </CardTitle>
                  <Badge className="bg-purple-600 text-white">
                    {generatedCourse.difficulty_level}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-purple-400" />
                      <span className="text-white">{generatedCourse.outline?.modules?.length || 0} Modules</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-cyan-400" />
                      <span className="text-white">{generatedCourse.estimated_hours}h Total</span>
                    </div>
                  </div>

                  <div>
                    <div className="text-purple-400 font-bold mb-3">Course Modules:</div>
                    <div className="space-y-2">
                      {generatedCourse.outline?.modules?.slice(0, 5).map((module, idx) => (
                        <div key={idx} className="bg-white/5 rounded-lg p-3">
                          <div className="text-white font-semibold mb-1">
                            Module {module.module_number}: {module.title}
                          </div>
                          <div className="text-gray-400 text-xs">
                            {module.duration_hours}h • {module.topics?.length || 0} topics
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-cyan-400 font-bold mb-2">Learning Objectives:</div>
                    <div className="space-y-1">
                      {generatedCourse.outline?.learning_objectives?.slice(0, 4).map((obj, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-gray-300 text-sm">
                          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5" />
                          <span>{obj}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/10">
                    <Button className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700">
                      <BookOpen className="w-4 h-4 mr-2" />
                      View Full Course
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}