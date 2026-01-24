import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Box, Plane, Html } from '@react-three/drei';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Users, Video, Mic, Share2, Activity } from 'lucide-react';
import * as THREE from 'three';

const HolographicWhiteboard = ({ position, content }) => {
  const meshRef = useRef();

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(Date.now() * 0.001) * 0.1;
    }
  });

  return (
    <group position={position} ref={meshRef}>
      <Box args={[6, 4, 0.1]}>
        <meshStandardMaterial color="#1e293b" transparent opacity={0.9} />
      </Box>
      <Html distanceFactor={6} transform>
        <div className="w-96 h-64 bg-gradient-to-br from-blue-900/80 to-purple-900/80 backdrop-blur-xl rounded-lg p-4 text-white">
          <h3 className="font-bold mb-2">Interactive Whiteboard</h3>
          <p className="text-sm text-gray-300">{content || 'Collaborative drawing space'}</p>
        </div>
      </Html>
    </group>
  );
};

const StudentAvatar = ({ position, studentId, isActive }) => {
  const meshRef = useRef();

  useFrame(() => {
    if (meshRef.current && isActive) {
      meshRef.current.scale.setScalar(1 + Math.sin(Date.now() * 0.003) * 0.1);
    }
  });

  return (
    <group position={position}>
      <Box ref={meshRef} args={[0.5, 1, 0.5]}>
        <meshStandardMaterial
          color={isActive ? '#3b82f6' : '#6b7280'}
          emissive={isActive ? '#3b82f6' : '#000000'}
          emissiveIntensity={isActive ? 0.5 : 0}
        />
      </Box>
      <Text position={[0, -0.8, 0]} fontSize={0.2} color="white" anchorX="center">
        {studentId.substring(0, 6)}
      </Text>
    </group>
  );
};

const InstructorHologram = ({ position }) => {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime) * 0.2;
    }
  });

  return (
    <group position={position}>
      <Plane ref={meshRef} args={[2, 3]}>
        <meshStandardMaterial
          color="#8b5cf6"
          emissive="#8b5cf6"
          emissiveIntensity={0.8}
          transparent
          opacity={0.7}
          side={THREE.DoubleSide}
        />
      </Plane>
      <Text position={[0, -2, 0]} fontSize={0.3} color="white" anchorX="center">
        AI Instructor
      </Text>
    </group>
  );
};

export default function HolographicClassroom3D({ sessionId, courseId }) {
  const [participants, setParticipants] = useState([
    { id: 'student_1', active: true },
    { id: 'student_2', active: false },
    { id: 'student_3', active: true },
    { id: 'student_4', active: false }
  ]);
  const [whiteboardContent, setWhiteboardContent] = useState('');

  const studentPositions = [
    [-3, 0, 2],
    [-1, 0, 2],
    [1, 0, 2],
    [3, 0, 2]
  ];

  return (
    <div className="w-full h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950 relative">
      {/* Controls */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-6 left-6 right-6 z-10"
      >
        <Card className="bg-black/40 backdrop-blur-xl border-white/20 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Badge className="bg-green-500">
                <Activity className="w-3 h-3 mr-1" />
                Live Session
              </Badge>
              <span className="text-white text-sm">
                {participants.filter(p => p.active).length} active participants
              </span>
            </div>

            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="border-white/20 text-white">
                <Mic className="w-4 h-4 mr-2" />
                Mute
              </Button>
              <Button size="sm" variant="outline" className="border-white/20 text-white">
                <Video className="w-4 h-4 mr-2" />
                Camera
              </Button>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                <Share2 className="w-4 h-4 mr-2" />
                Share Screen
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* 3D Classroom */}
      <Canvas camera={{ position: [0, 5, 10], fov: 60 }}>
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, 10, -10]} intensity={0.5} color="#8b5cf6" />

        {/* Floor */}
        <Plane args={[20, 20]} rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
          <meshStandardMaterial color="#1e293b" transparent opacity={0.5} />
        </Plane>

        {/* Instructor Hologram */}
        <InstructorHologram position={[0, 2, -4]} />

        {/* Whiteboard */}
        <HolographicWhiteboard position={[0, 1, -5]} content={whiteboardContent} />

        {/* Student Avatars */}
        {participants.map((student, idx) => (
          <StudentAvatar
            key={student.id}
            position={studentPositions[idx]}
            studentId={student.id}
            isActive={student.active}
          />
        ))}

        <OrbitControls enableZoom enablePan maxPolarAngle={Math.PI / 2} />
      </Canvas>

      {/* Chat/Notes Panel */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute bottom-6 right-6 w-80 z-10"
      >
        <Card className="bg-black/60 backdrop-blur-xl border-white/20 p-4 text-white">
          <h3 className="font-bold mb-3 flex items-center gap-2">
            <Bot className="w-5 h-5 text-blue-400" />
            Live Notes & Q&A
          </h3>
          <div className="bg-white/5 rounded-lg p-3 h-40 overflow-y-auto mb-3 text-sm">
            <p className="text-gray-400">AI is taking notes...</p>
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Ask a question..."
              className="bg-white/10 border-white/20 text-white text-sm"
            />
            <Button size="sm" className="bg-blue-600">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}