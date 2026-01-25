import React, { useState, useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Text, Line } from '@react-three/drei';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RefreshCw, BookOpen, TrendingUp, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import * as THREE from 'three';

function ResearchNode({ position, isActive, label }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime;
      if (isActive) {
        meshRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 3) * 0.2);
      }
    }
  });

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial
          color={isActive ? "#10b981" : "#6366f1"}
          emissive={isActive ? "#10b981" : "#6366f1"}
          emissiveIntensity={isActive ? 1.5 : 0.5}
        />
      </mesh>
      {label && (
        <Text position={[0, 0.3, 0]} fontSize={0.08} color="white" anchorX="center">
          {label}
        </Text>
      )}
    </group>
  );
}

function ResearchFlow() {
  const positions = [
    [-1, 0.5, 0],
    [0, 0, 0],
    [1, 0.5, 0]
  ];

  return (
    <group>
      {positions.map((pos, i) => (
        <ResearchNode
          key={i}
          position={pos}
          isActive={i === 1}
          label={i === 0 ? 'Papers' : i === 1 ? 'AI Analysis' : 'Course'}
        />
      ))}
      <Line points={[positions[0], positions[1]]} color="#8b5cf6" lineWidth={2} />
      <Line points={[positions[1], positions[2]]} color="#ec4899" lineWidth={2} />
    </group>
  );
}

export default function AutoResearchUpdater3D() {
  const queryClient = useQueryClient();
  const [selectedCourse, setSelectedCourse] = useState(null);

  const { data: courses, isLoading } = useQuery({
    queryKey: ['ai-generated-courses'],
    queryFn: () => base44.entities.AIGeneratedCourse.list('-updated_date', 10),
    initialData: []
  });

  const updateMutation = useMutation({
    mutationFn: async (courseId) => {
      const response = await base44.functions.invoke('academy/updateCourseWithResearch', {
        course_id: courseId
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-generated-courses'] });
      toast.success('Course updated with latest research!');
    },
    onError: (error) => {
      toast.error('Update failed: ' + error.message);
    }
  });

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* 3D Visualization */}
      <div className="h-[500px] bg-black/40 rounded-2xl border-2 border-green-500/30 overflow-hidden">
        <Canvas camera={{ position: [0, 0, 3], fov: 60 }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[5, 5, 5]} color="#10b981" intensity={2} />
          <pointLight position={[-5, -5, -5]} color="#8b5cf6" intensity={1.5} />
          
          <Suspense fallback={null}>
            <ResearchFlow />
          </Suspense>
          
          <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
        </Canvas>
      </div>

      {/* Course List */}
      <Card className="bg-black/60 border-2 border-green-500/40 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-green-400" />
            Auto-Update Courses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-[380px] overflow-y-auto">
            {isLoading ? (
              <div className="text-center py-12 text-gray-400">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                Loading courses...
              </div>
            ) : courses.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-40" />
                No AI-generated courses yet
              </div>
            ) : (
              courses.map((course, idx) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white/5 rounded-lg p-4 border border-green-500/20 hover:border-green-500/40 transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="text-white font-semibold">{course.title}</div>
                      <div className="text-gray-400 text-xs capitalize">
                        {course.field?.replace(/_/g, ' ')}
                      </div>
                    </div>
                    <Badge className="bg-green-600/40 text-green-300">
                      {course.difficulty_level}
                    </Badge>
                  </div>

                  {course.last_research_update && (
                    <div className="text-xs text-gray-500 mb-3">
                      Last updated: {new Date(course.last_research_update).toLocaleDateString()}
                    </div>
                  )}

                  <Button
                    size="sm"
                    onClick={() => updateMutation.mutate(course.course_id)}
                    disabled={updateMutation.isPending}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  >
                    {updateMutation.isPending ? (
                      <>
                        <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-3 h-3 mr-2" />
                        Update with Latest Research
                      </>
                    )}
                  </Button>
                </motion.div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}