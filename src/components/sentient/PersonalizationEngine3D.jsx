import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Text } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Sparkles, Target } from 'lucide-react';

function PersonalizationNode({ preference, position, index }) {
  const meshRef = useRef();

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = clock.elapsedTime + index;
      const pulse = Math.sin(clock.elapsedTime * 3 + index) * 0.15 + 1;
      meshRef.current.scale.setScalar(pulse);
    }
  });

  return (
    <group position={position}>
      <Sphere ref={meshRef} args={[0.3, 32, 32]}>
        <meshStandardMaterial
          color="#00ffff"
          emissive="#00ffff"
          emissiveIntensity={0.6}
        />
      </Sphere>
      <Text position={[0, 0.5, 0]} fontSize={0.08} color="white" anchorX="center">
        {preference.category}
      </Text>
    </group>
  );
}

function PersonalizationScene({ preferences = [] }) {
  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 5, 0]} intensity={2} color="#00ffff" />

      <Text position={[0, 4, 0]} fontSize={0.4} color="#ffffff" anchorX="center">
        AI PERSONALIZATION
      </Text>

      <Sphere args={[0.8, 32, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#ff00ff" emissive="#ff00ff" emissiveIntensity={1} />
      </Sphere>

      {preferences.map((pref, idx) => {
        const angle = (idx / preferences.length) * Math.PI * 2;
        const position = [Math.cos(angle) * 3, Math.sin(idx) * 2, Math.sin(angle) * 3];
        return <PersonalizationNode key={idx} preference={pref} position={position} index={idx} />;
      })}

      <OrbitControls enableZoom enablePan autoRotate autoRotateSpeed={0.5} />
    </>
  );
}

export default function PersonalizationEngine3D({ userPreferences = [] }) {
  return (
    <Card className="bg-gradient-to-br from-cyan-500/20 via-blue-500/20 to-indigo-500/20 border-cyan-500/50">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-3 text-xl">
          <User className="w-6 h-6 text-cyan-400" />
          AI-Driven Personalization
          <Badge className="bg-cyan-500/30 text-cyan-300">
            {userPreferences.length} PREFERENCES
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] bg-black/20 rounded-lg overflow-hidden">
          <Canvas camera={{ position: [6, 3, 6], fov: 60 }}>
            <color attach="background" args={['#000510']} />
            <PersonalizationScene preferences={userPreferences} />
          </Canvas>
        </div>
      </CardContent>
    </Card>
  );
}