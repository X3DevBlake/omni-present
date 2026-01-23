import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Torus } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Wand2, Palette, Zap, Heart, Brain } from 'lucide-react';

function CustomizableAgent({ config }) {
  const meshRef = useRef();
  const auraRef = useRef();

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = clock.elapsedTime * 0.5;
    }
    if (auraRef.current) {
      const breathe = Math.sin(clock.elapsedTime * 2) * 0.2 + 1;
      auraRef.current.scale.setScalar(breathe);
    }
  });

  const proactiveness = config?.proactiveness || 0.7;
  const creativity = config?.creativity || 0.8;
  const empathy = config?.empathy || 0.75;

  return (
    <group>
      <Sphere ref={auraRef} args={[2, 64, 64]}>
        <meshBasicMaterial 
          color="#00ffff" 
          transparent 
          opacity={0.1 * proactiveness} 
        />
      </Sphere>

      <Sphere ref={meshRef} args={[1, 64, 64]}>
        <meshStandardMaterial
          color="#ff00ff"
          emissive="#ff00ff"
          emissiveIntensity={creativity}
          metalness={0.8}
          roughness={0.2}
        />
      </Sphere>

      <Torus args={[1.5, 0.05, 16, 64]} rotation={[Math.PI / 2, 0, 0]}>
        <meshBasicMaterial color="#ffaa00" transparent opacity={empathy * 0.6} />
      </Torus>

      <Text position={[0, 2.5, 0]} fontSize={0.3} color="#ffffff" anchorX="center">
        CUSTOMIZED AGENT
      </Text>
    </group>
  );
}

function AgentCustomizationScene({ config }) {
  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={2} color="#ff00ff" />
      <pointLight position={[-10, 5, -10]} intensity={1.5} color="#00ffff" />
      
      <CustomizableAgent config={config} />

      <OrbitControls enableZoom enablePan autoRotate autoRotateSpeed={0.4} />
    </>
  );
}

export default function AgentCustomizationStudio3D({ onSave }) {
  const [config, setConfig] = useState({
    proactiveness: 0.7,
    creativity: 0.8,
    empathy: 0.75,
    risk_tolerance: 0.5,
    autonomy: 0.6
  });

  return (
    <Card className="bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-orange-500/20 border-purple-500/50">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-3 text-2xl">
          <Wand2 className="w-8 h-8 text-purple-400 animate-pulse" />
          Agent Customization Studio
          <Badge className="bg-purple-500/30 text-purple-300">LIVE PREVIEW</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-cyan-400" />
                  Proactiveness
                </label>
                <span className="text-cyan-400">{(config.proactiveness * 100).toFixed(0)}%</span>
              </div>
              <Slider
                value={[config.proactiveness * 100]}
                onValueChange={([v]) => setConfig({...config, proactiveness: v / 100})}
                max={100}
                step={1}
                className="bg-black/60"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-white flex items-center gap-2">
                  <Palette className="w-4 h-4 text-pink-400" />
                  Creativity
                </label>
                <span className="text-pink-400">{(config.creativity * 100).toFixed(0)}%</span>
              </div>
              <Slider
                value={[config.creativity * 100]}
                onValueChange={([v]) => setConfig({...config, creativity: v / 100})}
                max={100}
                step={1}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-white flex items-center gap-2">
                  <Heart className="w-4 h-4 text-red-400" />
                  Empathy
                </label>
                <span className="text-red-400">{(config.empathy * 100).toFixed(0)}%</span>
              </div>
              <Slider
                value={[config.empathy * 100]}
                onValueChange={([v]) => setConfig({...config, empathy: v / 100})}
                max={100}
                step={1}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-white flex items-center gap-2">
                  <Brain className="w-4 h-4 text-purple-400" />
                  Autonomy Level
                </label>
                <span className="text-purple-400">{(config.autonomy * 100).toFixed(0)}%</span>
              </div>
              <Slider
                value={[config.autonomy * 100]}
                onValueChange={([v]) => setConfig({...config, autonomy: v / 100})}
                max={100}
                step={1}
              />
            </div>

            <Button 
              onClick={() => onSave?.(config)}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Wand2 className="w-4 h-4 mr-2" />
              Apply Configuration
            </Button>
          </div>

          <div className="h-[500px] bg-black/20 rounded-lg overflow-hidden">
            <Canvas camera={{ position: [5, 3, 5], fov: 60 }}>
              <color attach="background" args={['#0a0015']} />
              <fog attach="fog" args={['#0a0015', 5, 25]} />
              <AgentCustomizationScene config={config} />
            </Canvas>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}