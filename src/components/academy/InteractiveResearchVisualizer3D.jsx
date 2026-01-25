import React, { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Line, Text, Html, Float } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { FlaskConical, Users, TrendingUp, FileText, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import * as THREE from 'three';

const ResearchProjectNode = ({ project, position, onClick, isSelected, onHover }) => {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  
  useFrame((state) => {
    if (meshRef.current) {
      const scale = isSelected ? 1.6 : hovered ? 1.3 : 1;
      meshRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.12);
      meshRef.current.rotation.y += isSelected ? 0.03 : 0.01;
    }
  });

  const statusColors = {
    active: '#10b981',
    planning: '#3b82f6',
    completed: '#8b5cf6',
    archived: '#6b7280'
  };
  
  return (
    <group position={position}>
      <Float speed={2} rotationIntensity={0.6}>
        <Sphere 
          ref={meshRef}
          args={[0.35, 32, 32]}
          onClick={(e) => {
            e.stopPropagation();
            onClick(project);
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHovered(true);
            onHover?.(project);
          }}
          onPointerOut={() => {
            setHovered(false);
            onHover?.(null);
          }}
        >
          <meshPhysicalMaterial
            color={statusColors[project.status] || '#8b5cf6'}
            emissive={statusColors[project.status] || '#8b5cf6'}
            emissiveIntensity={isSelected ? 1.8 : hovered ? 1.3 : 0.7}
            metalness={0.9}
            roughness={0.1}
            clearcoat={1}
          />
        </Sphere>
        
        {(hovered || isSelected) && (
          <Html distanceFactor={8} style={{ pointerEvents: 'none' }}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-black/95 border-2 border-cyan-400 rounded-xl p-4 min-w-[280px] backdrop-blur-xl shadow-2xl"
            >
              <div className="text-cyan-400 font-bold text-sm mb-2">{project.title}</div>
              <div className="text-gray-400 text-xs mb-3">{project.description}</div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Status:</span>
                  <Badge className={`bg-${project.status === 'active' ? 'green' : 'blue'}-600`}>
                    {project.status}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Researchers:</span>
                  <span className="text-white">{project.team_size || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Progress:</span>
                  <span className="text-green-400">{project.progress || 0}%</span>
                </div>
              </div>
            </motion.div>
          </Html>
        )}
      </Float>
      
      <Text position={[0, -0.6, 0]} fontSize={0.12} color="white" anchorX="center">
        {project.title?.split(' ').slice(0, 2).join(' ')}
      </Text>
    </group>
  );
};

export default function InteractiveResearchVisualizer3D() {
  const [selectedProject, setSelectedProject] = useState(null);
  const [hoveredProject, setHoveredProject] = useState(null);

  const { data: projects = [] } = useQuery({
    queryKey: ['researchProjects'],
    queryFn: async () => {
      const data = await base44.entities.ResearchProject.list();
      return data;
    }
  });

  const sampleProjects = projects.length > 0 ? projects : [
    { id: 1, title: 'Quantum Consciousness', description: 'IIT 4.0 implementation in quantum systems', status: 'active', team_size: 12, progress: 67 },
    { id: 2, title: 'Photophoretic Displays', description: 'Volumetric holographic rendering', status: 'active', team_size: 8, progress: 45 },
    { id: 3, title: 'Neural Decoding', description: 'High-bandwidth BCI interfaces', status: 'planning', team_size: 15, progress: 23 },
    { id: 4, title: 'Active Inference AI', description: 'Free energy optimization', status: 'active', team_size: 6, progress: 89 },
    { id: 5, title: 'HAAS Architecture', description: 'Hierarchical agent swarms', status: 'completed', team_size: 10, progress: 100 },
    { id: 6, title: 'CRDT Protocols', description: 'Distributed state sync', status: 'active', team_size: 5, progress: 55 }
  ];

  const projectPositions = sampleProjects.slice(0, 8).map((project, idx) => {
    const angle = (idx / 8) * Math.PI * 2;
    const radius = 4.5;
    return {
      project,
      position: [Math.cos(angle) * radius, Math.sin(angle) * 2.5, Math.sin(angle) * radius]
    };
  });

  return (
    <div className="relative">
      <Card className="bg-gradient-to-br from-cyan-950/90 via-blue-950/90 to-indigo-950/90 backdrop-blur-xl border-cyan-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-3">
            <FlaskConical className="w-7 h-7 text-cyan-400" />
            Research Projects Constellation
          </CardTitle>
          <p className="text-gray-300 text-sm mt-2">
            Explore active research initiatives across consciousness, physics, and AI
          </p>
        </CardHeader>
        <CardContent>
          <div className="h-[600px] bg-black/40 rounded-xl overflow-hidden mb-4 border border-cyan-500/20">
            <Canvas camera={{ position: [0, 3, 12], fov: 60 }}>
              <ambientLight intensity={0.5} />
              <pointLight position={[10, 10, 10]} intensity={2} color="#06b6d4" />
              <pointLight position={[-10, -10, -10]} intensity={1} color="#3b82f6" />

              {/* Central Research Hub */}
              <Float speed={1} rotationIntensity={0.2}>
                <Sphere args={[0.6, 64, 64]} position={[0, 0, 0]}>
                  <meshPhysicalMaterial
                    color="#06b6d4"
                    emissive="#06b6d4"
                    emissiveIntensity={1.2}
                    metalness={0.9}
                    roughness={0.1}
                  />
                </Sphere>
                <Text position={[0, 1, 0]} fontSize={0.2} color="#06b6d4" anchorX="center">
                  Research Hub
                </Text>
              </Float>

              {/* Project nodes */}
              {projectPositions.map(({ project, position }) => (
                <React.Fragment key={project.id}>
                  <ResearchProjectNode
                    project={project}
                    position={position}
                    onClick={setSelectedProject}
                    isSelected={selectedProject?.id === project.id}
                    onHover={setHoveredProject}
                  />
                  
                  <Line
                    points={[new THREE.Vector3(0, 0, 0), new THREE.Vector3(...position)]}
                    color={selectedProject?.id === project.id ? '#ec4899' : '#3b82f6'}
                    lineWidth={selectedProject?.id === project.id ? 2.5 : 1}
                    transparent
                    opacity={selectedProject?.id === project.id ? 0.8 : 0.4}
                  />
                </React.Fragment>
              ))}

              <OrbitControls enableZoom autoRotate autoRotateSpeed={0.8} />
            </Canvas>
          </div>

          {selectedProject && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-black/80 border-2 border-cyan-500/60 rounded-xl p-6 backdrop-blur-xl"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-white font-bold text-2xl mb-1">{selectedProject.title}</h3>
                  <p className="text-gray-400 text-sm">{selectedProject.description}</p>
                </div>
                <button onClick={() => setSelectedProject(null)} className="text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-cyan-950/40 rounded-lg p-3 border border-cyan-500/30">
                  <Users className="w-5 h-5 text-cyan-400 mb-1" />
                  <div className="text-white font-bold text-lg">{selectedProject.team_size}</div>
                  <div className="text-gray-400 text-xs">Researchers</div>
                </div>
                <div className="bg-green-950/40 rounded-lg p-3 border border-green-500/30">
                  <TrendingUp className="w-5 h-5 text-green-400 mb-1" />
                  <div className="text-white font-bold text-lg">{selectedProject.progress}%</div>
                  <div className="text-gray-400 text-xs">Complete</div>
                </div>
                <div className="bg-purple-950/40 rounded-lg p-3 border border-purple-500/30">
                  <FileText className="w-5 h-5 text-purple-400 mb-1" />
                  <div className="text-white font-bold text-lg">{Math.floor(Math.random() * 20 + 5)}</div>
                  <div className="text-gray-400 text-xs">Publications</div>
                </div>
              </div>

              <Button className="w-full bg-gradient-to-r from-cyan-600 to-blue-600">
                <FileText className="w-4 h-4 mr-2" />
                View Project Details
              </Button>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}