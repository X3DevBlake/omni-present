import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Line, Text, Html } from '@react-three/drei';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import * as THREE from 'three';

const ProjectNode = ({ position, project, onClick, isSelected }) => {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      if (isSelected) {
        meshRef.current.scale.setScalar(1.5 + Math.sin(state.clock.elapsedTime * 2) * 0.2);
      }
    }
  });

  const statusColors = {
    proposal: '#6b7280',
    active: '#3b82f6',
    peer_review: '#f59e0b',
    published: '#10b981',
    archived: '#4b5563'
  };

  return (
    <group position={position} onClick={onClick}>
      <Sphere ref={meshRef} args={[0.6, 32, 32]}>
        <meshStandardMaterial
          color={statusColors[project.status]}
          emissive={statusColors[project.status]}
          emissiveIntensity={isSelected ? 0.8 : 0.4}
        />
      </Sphere>
      
      {isSelected && (
        <Html distanceFactor={8}>
          <div className="bg-black/90 backdrop-blur-xl text-white p-4 rounded-lg w-72 border border-white/20">
            <h3 className="font-bold mb-2">{project.title}</h3>
            <p className="text-xs text-gray-300 mb-2">{project.abstract?.substring(0, 100)}...</p>
            <div className="flex gap-2">
              <Badge className="text-xs">{project.status}</Badge>
              <Badge className="text-xs bg-purple-500">
                {project.collaborators?.length || 0} collaborators
              </Badge>
            </div>
          </div>
        </Html>
      )}
      
      <Text position={[0, -1, 0]} fontSize={0.2} color="white" anchorX="center">
        {project.title.substring(0, 20)}
      </Text>
    </group>
  );
};

export default function ResearchProjectNexus3D({ userId }) {
  const [selectedProject, setSelectedProject] = useState(null);

  const { data: projects = [] } = useQuery({
    queryKey: ['research-nexus'],
    queryFn: () => base44.entities.ResearchProject.list()
  });

  const myProjects = projects.filter(p => 
    p.principal_investigator === userId || p.collaborators?.includes(userId)
  );

  const positions = myProjects.map((_, index) => {
    const angle = (index / myProjects.length) * Math.PI * 2;
    const radius = 6;
    return [
      Math.cos(angle) * radius,
      Math.sin(angle) * radius,
      0
    ];
  });

  return (
    <Card className="bg-white/10 backdrop-blur-xl border-white/20 h-[600px]">
      <Canvas camera={{ position: [0, 0, 15], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8b5cf6" />

        {/* Central hub */}
        <Sphere args={[1.5, 64, 64]} position={[0, 0, 0]}>
          <meshStandardMaterial
            color="#8b5cf6"
            emissive="#8b5cf6"
            emissiveIntensity={0.5}
            transparent
            opacity={0.4}
            wireframe
          />
        </Sphere>

        <Text position={[0, 0, 0]} fontSize={0.4} color="white" anchorX="center">
          Research Nexus
        </Text>

        {/* Projects */}
        {myProjects.map((project, index) => (
          <React.Fragment key={project.id}>
            <ProjectNode
              position={positions[index]}
              project={project}
              onClick={() => setSelectedProject(project)}
              isSelected={selectedProject?.id === project.id}
            />
            
            <Line
              points={[
                new THREE.Vector3(0, 0, 0),
                new THREE.Vector3(...positions[index])
              ]}
              color="#3b82f6"
              lineWidth={1}
              transparent
              opacity={0.3}
            />
          </React.Fragment>
        ))}

        <OrbitControls enableZoom enablePan />
      </Canvas>
    </Card>
  );
}