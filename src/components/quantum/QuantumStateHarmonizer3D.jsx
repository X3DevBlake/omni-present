import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Text, Line } from '@react-three/drei';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Atom, Zap, TrendingUp, Radio } from 'lucide-react';
import { toast } from 'sonner';

function QuantumStateOrb({ state, position, index, harmonizing }) {
  const orbRef = useRef();

  useFrame(({ clock }) => {
    if (orbRef.current) {
      orbRef.current.rotation.y = clock.elapsedTime + index;
      
      if (harmonizing) {
        const pulse = Math.sin(clock.elapsedTime * 4) * 0.2 + 1;
        orbRef.current.scale.setScalar(pulse);
      }
    }
  });

  const amplitude = state.probability_amplitude || 0.5;
  const coherence = state.coherence || 0.5;

  return (
    <group position={position}>
      <Sphere ref={orbRef} args={[0.4, 32, 32]}>
        <meshStandardMaterial
          color={harmonizing ? '#00ff88' : '#00ffff'}
          emissive={harmonizing ? '#00ff88' : '#00ffff'}
          emissiveIntensity={amplitude * 2}
          transparent
          opacity={coherence}
        />
      </Sphere>
      
      <Text position={[0, 0.7, 0]} fontSize={0.08} color="white" anchorX="center">
        {state.state_descriptor?.slice(0, 12)}
      </Text>
      <Text position={[0, -0.6, 0]} fontSize={0.06} color="#00ffff" anchorX="center">
        {(coherence * 100).toFixed(0)}% coherent
      </Text>
    </group>
  );
}

function HarmonizationBeam({ from, to, intensity }) {
  const points = [from, to];
  
  return (
    <Line
      points={points}
      color="#ff00ff"
      lineWidth={3}
      transparent
      opacity={intensity}
    />
  );
}

function QuantumHarmonizerScene({ states, harmonizing, harmonyLevel }) {
  const coreRef = useRef();

  useFrame(({ clock }) => {
    if (coreRef.current) {
      coreRef.current.rotation.y = clock.elapsedTime * 0.5;
      const pulse = Math.sin(clock.elapsedTime * 3) * 0.3 + 1;
      coreRef.current.scale.setScalar(pulse);
    }
  });

  const positions = states.map((_, idx) => {
    const angle = (idx / states.length) * Math.PI * 2;
    const radius = 4;
    return [Math.cos(angle) * radius, 0, Math.sin(angle) * radius];
  });

  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 0, 0]} intensity={3} color="#ff00ff" />
      
      <Text position={[0, 5, 0]} fontSize={0.5} color="#ffffff" anchorX="center">
        QUANTUM HARMONIZATION
      </Text>

      <Sphere ref={coreRef} args={[0.8, 32, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial
          color="#ff00ff"
          emissive="#ff00ff"
          emissiveIntensity={harmonizing ? 3 : 1.5}
          transparent
          opacity={0.7}
        />
      </Sphere>

      {states.map((state, idx) => (
        <React.Fragment key={idx}>
          <QuantumStateOrb
            state={state}
            position={positions[idx]}
            index={idx}
            harmonizing={harmonizing}
          />
          {harmonizing && (
            <HarmonizationBeam
              from={[0, 0, 0]}
              to={positions[idx]}
              intensity={harmonyLevel}
            />
          )}
        </React.Fragment>
      ))}

      <OrbitControls enableZoom enablePan autoRotate={harmonizing} autoRotateSpeed={2} />
    </>
  );
}

export default function QuantumStateHarmonizer3D({ states = [] }) {
  const [harmonizing, setHarmonizing] = useState(false);
  const [harmonyLevel, setHarmonyLevel] = useState(0);

  const harmonizeMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('quantumConsciousnessEngine', {
        action: 'harmonize_states',
        state_ids: states.map(s => s.state_id),
        target_coherence: 0.95
      });
      return response.data;
    },
    onSuccess: (data) => {
      setHarmonizing(false);
      setHarmonyLevel(data.final_coherence || 0.9);
      toast.success('Quantum states harmonized!');
    }
  });

  const startHarmonization = () => {
    setHarmonizing(true);
    
    // Simulate progressive harmonization
    let progress = 0;
    const interval = setInterval(() => {
      progress += 0.05;
      setHarmonyLevel(progress);
      
      if (progress >= 0.9) {
        clearInterval(interval);
        harmonizeMutation.mutate();
      }
    }, 300);
  };

  const avgCoherence = states.length > 0
    ? states.reduce((sum, s) => sum + (s.coherence || 0), 0) / states.length
    : 0;

  return (
    <Card className="bg-gradient-to-br from-fuchsia-500/20 via-purple-500/20 to-indigo-500/20 border-fuchsia-500/50">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-3 text-2xl">
          <Atom className="w-8 h-8 text-fuchsia-400 animate-pulse" />
          Quantum State Harmonization
          <Badge className={harmonizing ? 'bg-green-500/30 text-green-300' : 'bg-fuchsia-500/30 text-fuchsia-300'}>
            {harmonizing ? 'HARMONIZING' : 'READY'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="bg-black/40 p-3 rounded-lg border border-fuchsia-500/30">
            <Atom className="w-4 h-4 text-fuchsia-400 mb-1" />
            <div className="text-white text-xl font-bold">{states.length}</div>
            <div className="text-white/60 text-xs">States</div>
          </div>
          <div className="bg-black/40 p-3 rounded-lg border border-purple-500/30">
            <Radio className="w-4 h-4 text-purple-400 mb-1" />
            <div className="text-white text-xl font-bold">{(avgCoherence * 100).toFixed(0)}%</div>
            <div className="text-white/60 text-xs">Avg Coherence</div>
          </div>
          <div className="bg-black/40 p-3 rounded-lg border border-indigo-500/30">
            <Zap className="w-4 h-4 text-indigo-400 mb-1" />
            <div className="text-white text-xl font-bold">{(harmonyLevel * 100).toFixed(0)}%</div>
            <div className="text-white/60 text-xs">Harmony</div>
          </div>
          <div className="bg-black/40 p-3 rounded-lg border border-pink-500/30">
            <TrendingUp className="w-4 h-4 text-pink-400 mb-1" />
            <div className="text-white text-xl font-bold">
              {states.filter(s => s.coherence > 0.8).length}
            </div>
            <div className="text-white/60 text-xs">Stable</div>
          </div>
        </div>

        {harmonizing && (
          <div className="mb-4">
            <div className="text-white text-sm mb-2">Harmonization Progress</div>
            <Progress value={harmonyLevel * 100} className="h-3" />
          </div>
        )}

        <Button
          onClick={startHarmonization}
          disabled={harmonizing || states.length < 2}
          className="w-full bg-fuchsia-600 hover:bg-fuchsia-700 mb-4"
        >
          {harmonizing ? 'Harmonizing...' : 'Initiate Quantum Harmonization'}
        </Button>

        <div className="h-[500px] bg-black/20 rounded-lg overflow-hidden">
          <Canvas camera={{ position: [8, 4, 8], fov: 60 }}>
            <color attach="background" args={['#0a0010']} />
            <fog attach="fog" args={['#0a0010', 5, 30]} />
            <QuantumHarmonizerScene
              states={states}
              harmonizing={harmonizing}
              harmonyLevel={harmonyLevel}
            />
          </Canvas>
        </div>

        <div className="mt-4 bg-fuchsia-500/20 border border-fuchsia-500/50 p-4 rounded-lg">
          <div className="text-fuchsia-400 font-bold mb-2">Harmonization Benefits</div>
          <div className="space-y-1 text-white/80 text-sm">
            <div>• Enhanced cognitive coherence and mental clarity</div>
            <div>• Synchronized focus and creativity states</div>
            <div>• Reduced quantum decoherence and mental noise</div>
            <div>• Stable, beneficial consciousness configurations</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}