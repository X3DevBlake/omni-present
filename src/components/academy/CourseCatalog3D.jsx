import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Box, Html } from '@react-three/drei';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { BookOpen, Users, Star, Clock } from 'lucide-react';
import * as THREE from 'three';
import { toast } from 'sonner';

const CourseCard3D = ({ position, course, onEnroll }) => {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.2;
    }
  });

  const categoryColors = {
    ai_fundamentals: '#3b82f6',
    quantum_computing: '#8b5cf6',
    agent_development: '#10b981',
    spatial_intelligence: '#f59e0b',
    blockchain_security: '#ef4444',
    consciousness_studies: '#ec4899',
    holographic_systems: '#06b6d4',
    defi_economics: '#84cc16',
    research_methodology: '#6366f1',
    ethics_governance: '#f97316'
  };

  return (
    <group position={position} ref={meshRef}>
      <Box args={[3, 4, 0.2]}>
        <meshStandardMaterial
          color={categoryColors[course.category] || '#3b82f6'}
          emissive={categoryColors[course.category] || '#3b82f6'}
          emissiveIntensity={0.3}
          transparent
          opacity={0.9}
        />
      </Box>

      <Html distanceFactor={6} transform>
        <div className="w-72 p-4 bg-gradient-to-br from-slate-900/90 to-blue-900/90 backdrop-blur-xl rounded-lg border border-white/20">
          <Badge className="mb-2 bg-blue-500">{course.academic_level}</Badge>
          <h3 className="font-bold text-white mb-2">{course.title}</h3>
          <p className="text-xs text-gray-300 mb-3 line-clamp-2">{course.description}</p>
          
          <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {course.duration_weeks}w
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {course.enrollment_count || 0}
            </span>
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3 text-yellow-400" />
              {course.rating?.toFixed(1) || 'N/A'}
            </span>
          </div>

          <Button
            size="sm"
            className="w-full bg-blue-600 hover:bg-blue-700"
            onClick={onEnroll}
          >
            Enroll Now
          </Button>
        </div>
      </Html>
    </group>
  );
};

export default function CourseCatalog3D() {
  const queryClient = useQueryClient();

  const { data: courses = [] } = useQuery({
    queryKey: ['all-courses'],
    queryFn: () => base44.entities.Course.list()
  });

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  const enrollMutation = useMutation({
    mutationFn: async (courseId) => {
      const response = await base44.functions.invoke('academicOrchestrator', {
        action: 'enroll_course',
        payload: { course_id: courseId }
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic-profile'] });
      toast.success('Enrolled successfully! AI is generating your personalized learning path...');
    }
  });

  const publishedCourses = courses.filter(c => c.is_published);

  const positions = publishedCourses.map((_, index) => {
    const row = Math.floor(index / 4);
    const col = index % 4;
    return [col * 4 - 6, -row * 5, 0];
  });

  return (
    <div className="w-full h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-6 left-6 right-6 z-10"
      >
        <Card className="bg-black/40 backdrop-blur-xl border-white/20 p-6">
          <h1 className="text-3xl font-bold text-white mb-2">Course Catalog</h1>
          <p className="text-gray-300">Explore {publishedCourses.length} AI-powered holographic courses</p>
        </Card>
      </motion.div>

      <Canvas camera={{ position: [0, 0, 15], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8b5cf6" />

        {publishedCourses.map((course, index) => (
          <CourseCard3D
            key={course.id}
            position={positions[index]}
            course={course}
            onEnroll={() => enrollMutation.mutate(course.course_id)}
          />
        ))}

        <OrbitControls enableZoom enablePan />
      </Canvas>
    </div>
  );
}