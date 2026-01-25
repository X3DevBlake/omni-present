import React, { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Text, Html, Float, MeshDistortMaterial } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Play, CheckCircle2, Lock, Brain, Sparkles, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

const InteractiveCourseNode = ({ course, position, onClick, isSelected, onHover }) => {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  
  useFrame((state) => {
    if (meshRef.current) {
      const scale = isSelected ? 1.5 : hovered ? 1.2 : 1;
      meshRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.1);
      meshRef.current.rotation.y = state.clock.elapsedTime * (isSelected ? 1 : 0.3);
    }
  });
  
  const statusColors = {
    completed: '#10b981',
    in_progress: '#3b82f6',
    locked: '#6b7280',
    available: '#8b5cf6'
  };
  
  const status = course.completed ? 'completed' : course.locked ? 'locked' : course.started ? 'in_progress' : 'available';
  
  return (
    <group position={position}>
      <Float speed={2} rotationIntensity={0.5}>
        <Sphere 
          ref={meshRef}
          args={[0.4, 32, 32]}
          onClick={(e) => {
            e.stopPropagation();
            onClick(course);
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHovered(true);
            onHover(course);
          }}
          onPointerOut={() => {
            setHovered(false);
            onHover(null);
          }}
        >
          <MeshDistortMaterial
            color={statusColors[status]}
            distort={hovered ? 0.5 : 0.3}
            speed={isSelected ? 3 : 1.5}
            roughness={0.2}
            metalness={0.8}
          />
        </Sphere>
        
        {(hovered || isSelected) && (
          <Html distanceFactor={10}>
            <div className="bg-black/95 border-2 border-purple-400 rounded-xl p-4 min-w-[250px] pointer-events-none backdrop-blur-xl shadow-2xl">
              <div className="text-purple-400 font-bold text-sm mb-2">{course.title}</div>
              <div className="text-gray-400 text-xs mb-3">{course.description}</div>
              <div className="flex items-center gap-2 mb-2">
                <Badge className={`bg-${status === 'completed' ? 'green' : status === 'in_progress' ? 'blue' : status === 'locked' ? 'gray' : 'purple'}-600`}>
                  {status.replace('_', ' ')}
                </Badge>
                <span className="text-white text-xs">{course.modules?.length || 0} modules</span>
              </div>
              {isSelected && (
                <div className="text-cyan-400 text-xs font-semibold mt-2">
                  Click to start course →
                </div>
              )}
            </div>
          </Html>
        )}
      </Float>
      
      <Text position={[0, -0.7, 0]} fontSize={0.15} color="white" anchorX="center">
        {course.title.split(' ')[0]}
      </Text>
    </group>
  );
};

export default function EnhancedInteractiveCourseViewer() {
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [hoveredCourse, setHoveredCourse] = useState(null);
  const [enrolling, setEnrolling] = useState(false);

  const { data: courses = [] } = useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const data = await base44.entities.Course.list();
      return data;
    }
  });

  // Generate sample courses if none exist
  const displayCourses = courses.length > 0 ? courses : [
    { id: 1, title: 'Neural Networks', description: 'Deep learning fundamentals', modules: Array(12).fill(0), completed: false, locked: false },
    { id: 2, title: 'Quantum Computing', description: 'Quantum algorithms & circuits', modules: Array(8).fill(0), completed: false, locked: false },
    { id: 3, title: 'Consciousness Theory', description: 'IIT 4.0 & GWT frameworks', modules: Array(15).fill(0), completed: false, locked: false },
    { id: 4, title: 'Holographic Physics', description: 'POT & volumetric displays', modules: Array(10).fill(0), completed: false, locked: true },
    { id: 5, title: 'Active Inference', description: 'Free energy minimization', modules: Array(9).fill(0), completed: true, locked: false },
    { id: 6, title: 'CRDT Systems', description: 'Distributed consistency', modules: Array(7).fill(0), completed: false, locked: true }
  ];

  const coursePositions = displayCourses.slice(0, 8).map((course, idx) => {
    const angle = (idx / 8) * Math.PI * 2;
    const radius = 4;
    return {
      course,
      position: [Math.cos(angle) * radius, Math.sin(angle) * 2, Math.sin(angle) * radius]
    };
  });

  const handleEnroll = async () => {
    if (!selectedCourse) return;
    
    setEnrolling(true);
    try {
      await base44.entities.Course.update(selectedCourse.id, { started: true });
      alert(`Enrolled in ${selectedCourse.title}!`);
    } catch (error) {
      console.error('Enrollment error:', error);
    } finally {
      setEnrolling(false);
    }
  };

  return (
    <div className="relative">
      <Card className="bg-gradient-to-br from-indigo-950/90 via-purple-950/90 to-blue-950/90 backdrop-blur-xl border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-3">
            <Brain className="w-7 h-7 text-purple-400" />
            Interactive Course Galaxy
          </CardTitle>
          <p className="text-gray-300 text-sm mt-2">
            Click courses to explore curriculum • Hover for details
          </p>
        </CardHeader>
        <CardContent>
          <div className="h-[600px] bg-black/40 rounded-xl overflow-hidden mb-4 border border-purple-500/20 cursor-pointer">
            <Canvas camera={{ position: [0, 2, 10], fov: 60 }}>
              <ambientLight intensity={0.5} />
              <pointLight position={[10, 10, 10]} intensity={2} color="#8b5cf6" />
              <pointLight position={[-10, -10, -10]} intensity={1} color="#3b82f6" />
              <pointLight position={[0, 10, 0]} intensity={1.5} color="#ec4899" />

              {/* Central Knowledge Core */}
              <Float speed={1} rotationIntensity={0.3}>
                <Sphere args={[0.8, 64, 64]} position={[0, 0, 0]}>
                  <MeshDistortMaterial
                    color="#fbbf24"
                    distort={0.4}
                    speed={2}
                    roughness={0.1}
                    metalness={0.9}
                  />
                </Sphere>
                <Text position={[0, 1.2, 0]} fontSize={0.25} color="#fbbf24" anchorX="center">
                  Knowledge Core
                </Text>
              </Float>

              {/* Interactive course nodes */}
              {coursePositions.map(({ course, position }, idx) => (
                <InteractiveCourseNode
                  key={course.id}
                  course={course}
                  position={position}
                  onClick={setSelectedCourse}
                  isSelected={selectedCourse?.id === course.id}
                  onHover={setHoveredCourse}
                />
              ))}

              <OrbitControls enableZoom autoRotate autoRotateSpeed={0.5} />
            </Canvas>
          </div>

          <div className="grid grid-cols-4 gap-2 mb-4">
            {displayCourses.slice(0, 4).map((course, idx) => (
              <motion.button
                key={course.id}
                whileHover={{ scale: 1.05 }}
                onClick={() => setSelectedCourse(course)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  selectedCourse?.id === course.id
                    ? 'border-purple-400 bg-purple-500/20'
                    : 'border-gray-700 bg-black/40 hover:border-gray-500'
                }`}
              >
                <div className="text-white text-xs font-bold truncate">{course.title}</div>
              </motion.button>
            ))}
          </div>

          {selectedCourse && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-purple-950/30 border border-purple-500/40 rounded-lg p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="text-white font-bold text-lg">{selectedCourse.title}</h4>
                  <p className="text-gray-400 text-sm">{selectedCourse.description}</p>
                </div>
                <Button onClick={handleEnroll} disabled={enrolling || selectedCourse.locked} size="sm" className="bg-purple-600">
                  {selectedCourse.locked ? <Lock className="w-4 h-4" /> : <Play className="w-4 h-4 mr-1" />}
                  {enrolling ? 'Enrolling...' : selectedCourse.locked ? 'Locked' : 'Start Course'}
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-black/40 rounded p-2">
                  <div className="text-gray-400 text-xs">Modules</div>
                  <div className="text-white font-bold">{selectedCourse.modules?.length || 0}</div>
                </div>
                <div className="bg-black/40 rounded p-2">
                  <div className="text-gray-400 text-xs">Duration</div>
                  <div className="text-white font-bold">{Math.floor(Math.random() * 8 + 4)}h</div>
                </div>
                <div className="bg-black/40 rounded p-2">
                  <div className="text-gray-400 text-xs">Level</div>
                  <div className="text-white font-bold">Advanced</div>
                </div>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}