import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Float, Icosahedron, Line } from '@react-three/drei';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Brain, Zap, ShoppingCart, Upload } from 'lucide-react';
import * as THREE from 'three';
import { toast } from 'sonner';

function SkillNode({ position, skill, onBuy }) {
  const mesh = useRef();
  const [hovered, setHover] = React.useState(false);

  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.x += 0.01;
      mesh.current.rotation.y += 0.01;
      const scale = hovered ? 1.2 : 1;
      mesh.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.1);
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <group position={position}>
        <Icosahedron 
          ref={mesh} 
          args={[0.5, 0]} 
          onClick={() => onBuy(skill)}
          onPointerOver={() => setHover(true)}
          onPointerOut={() => setHover(false)}
        >
          <meshStandardMaterial 
            color={hovered ? "#4ade80" : "#a855f7"} 
            emissive={hovered ? "#4ade80" : "#a855f7"}
            emissiveIntensity={0.5}
            wireframe
          />
        </Icosahedron>
        <Text
          position={[0, -0.8, 0]}
          fontSize={0.2}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {skill.name}
        </Text>
        <Text
          position={[0, -1.1, 0]}
          fontSize={0.15}
          color="#fbbf24"
          anchorX="center"
          anchorY="middle"
        >
          {skill.cost} Omni
        </Text>
      </group>
    </Float>
  );
}

export default function AISkillMarketplace3D({ agentId }) {
  const { data: recommendations } = useQuery({
    queryKey: ['skill-recommendations', agentId],
    queryFn: async () => {
      const res = await base44.functions.invoke('recommendSkills', { agent_id: agentId });
      return res.data.recommendations;
    },
    enabled: !!agentId
  });

  const handleBuy = (skill) => {
    toast.success(`Acquired skill: ${skill.name}`);
    // Implement purchase logic
  };

  const positions = useMemo(() => {
    if (!recommendations) return [];
    return recommendations.map((_, i) => {
      const angle = (i / recommendations.length) * Math.PI * 2;
      return [Math.cos(angle) * 3, Math.sin(angle) * 3, 0];
    });
  }, [recommendations]);

  return (
    <Card className="bg-black/60 border-purple-500/30 backdrop-blur-xl h-[600px] flex flex-col">
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle className="flex items-center gap-2 text-white">
          <ShoppingCart className="w-5 h-5 text-purple-400" />
          Neural Skill Marketplace
        </CardTitle>
        <Button size="sm" variant="outline" className="border-purple-500/50 text-purple-300">
          <Upload className="w-4 h-4 mr-2" />
          Deploy Capability
        </Button>
      </CardHeader>
      <CardContent className="flex-1 relative p-0">
        <Canvas camera={{ position: [0, 0, 8] }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
          
          {recommendations?.map((skill, i) => (
            <SkillNode 
              key={i} 
              position={positions[i]} 
              skill={skill} 
              onBuy={handleBuy} 
            />
          ))}
          
          <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
        </Canvas>
        
        {/* Overlay for non-3D details */}
        <div className="absolute bottom-4 left-4 right-4 flex gap-4 overflow-x-auto pb-2">
          {recommendations?.map((skill, i) => (
            <div key={i} className="min-w-[200px] bg-black/80 p-3 rounded border border-white/10 backdrop-blur-md">
              <h4 className="text-purple-300 font-bold text-sm">{skill.name}</h4>
              <p className="text-white/60 text-xs mt-1">{skill.description}</p>
              <Badge className="mt-2 bg-green-900 text-green-300 border-green-700">{skill.boost}</Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}