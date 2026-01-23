import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Text, Line } from '@react-three/drei';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Atom, Zap, CheckCircle, Waves } from 'lucide-react';
import { toast } from 'sonner';

function QuantumStateOrb({ state, position, harmonizing }) {
  const meshRef = useRef();

  useFrame(({ clock }) => {
    if (meshRef.current) {
      const pulse = harmonizing 
        ? Math.sin(clock.elapsedTime * 5) * 0.3 + 1
        : Math.sin(clock.elapsedTime * 2) * 0.1 + 1;
      meshRef.current.scale.setScalar(pulse);
      
      if (harmonizing) {
        meshRef.current.rotation.y = clock.elapsedTime * 2;
        meshRef.current.rotation.x = clock.elapsedTime * 1.5;
      } else {
        meshRef.current.rotation.y = clock.elapsedTime * 0.5;
      }
    }
  });

  const amplitude = state.probability_amplitude || 0.5;
  const coherence = state.coherence || 0.5;
  const color = harmonizing ? '#00ff88' : '#ff00ff';

  return (
    <group position={position}>
      <Sphere ref={meshRef} args={[0.4 + amplitude * 0.3, 32, 32]}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={coherence * 2}
          transparent
          opacity={0.8}
        />
      </Sphere>

      {harmonizing && (
        <Sphere args={[0.8, 32, 32]}>
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.5}
            transparent
            opacity={0.2}
            wireframe
          />
        </Sphere>
      )}

      <Text position={[0, 0.8, 0]} fontSize={0.1} color="white" anchorX="center">
        {state.state_descriptor || 'Quantum State'}
      </Text>
      <Text position={[0, -0.6, 0]} fontSize={0.08} color={color} anchorX="center">
        Coherence: {(coherence * 100).toFixed(0)}%
      </Text>
    </group>
  );
}

function HarmonizationBeam({ from, to, active }) {
  if (!active) return null;

  return (
    <Line
      points={[from, to]}
      color="#00ff88"
      lineWidth={3}
      transparent
      opacity={0.6}
    />
  );
}

function HarmonizationScene({ states, harmonizing, coherenceTarget }) {
  const positions = states.map((_, idx) => {
    const angle = (idx / states.length) * Math.PI * 2;
    const radius = 3;
    return [Math.cos(angle) * radius, Math.sin(idx * 0.8) * 1.5, Math.sin(angle) * radius];
  });

  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 10, 0]} intensity={2} color={harmonizing ? '#00ff88' : '#ff00ff'} />

      <Text position={[0, 5, 0]} fontSize={0.5} color="#ffffff" anchorX="center">
        QUANTUM HARMONIZATION
      </Text>

      <Sphere args={[0.6, 32, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial
          color={harmonizing ? '#00ff88' : '#ff00ff'}
          emissive={harmonizing ? '#00ff88' : '#ff00ff'}
          emissiveIntensity={harmonizing ? 2 : 1}
        />
      </Sphere>

      {states.map((state, idx) => (
        <React.Fragment key={idx}>
          <QuantumStateOrb state={state} position={positions[idx]} harmonizing={harmonizing} />
          {harmonizing && (
            <HarmonizationBeam from={[0, 0, 0]} to={positions[idx]} active={harmonizing} />
          )}
        </React.Fragment>
      ))}

      <OrbitControls enableZoom enablePan autoRotate autoRotateSpeed={harmonizing ? 1 : 0.3} />
    </>
  );
}

export default function QuantumStateHarmonizer3D({ quantumStates = [] }) {
  const [harmonizing, setHarmonizing] = useState(false);
  const [coherenceTarget, setCoherenceTarget] = useState(85);
  const [sessionDuration, setSessionDuration] = useState(10);

  const harmonizeMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('quantumConsciousnessEngine', {
        action: 'harmonize_states',
        state_ids: quantumStates.slice(0, 5).map(s => s.state_id),
        target_coherence: coherenceTarget / 100,
        duration_minutes: sessionDuration
      });
      return response.data;
    },
    onSuccess: () => {
      setHarmonizing(true);
      toast.success('Quantum harmonization initiated!');
      setTimeout(() => setHarmonizing(false), sessionDuration * 1000);
    }
  });

  const states = quantumStates.length > 0 
    ? quantumStates.slice(0, 8).flatMap(qs => qs.superposition_states || [])
    : [
        { state_descriptor: 'Focus', probability_amplitude: 0.7, coherence: 0.6 },
        { state_descriptor: 'Creativity', probability_amplitude: 0.8, coherence: 0.5 },
        { state_descriptor: 'Calm', probability_amplitude: 0.6, coherence: 0.7 },
        { state_descriptor: 'Energy', probability_amplitude: 0.75, coherence: 0.55 }
      ];

  const avgCoherence = states.reduce((sum, s) => sum + (s.coherence || 0), 0) / (states.length || 1);

  return (
    <Card className="bg-gradient-to-br from-fuchsia-500/30 via-purple-500/30 to-cyan-500/30 border-fuchsia-500/50">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-3 text-2xl">
          <Atom className="w-8 h-8 text-fuchsia-400 animate-spin" style={{ animationDuration: '3s' }} />
          Quantum State Harmonization
          <Badge className={`${harmonizing ? 'bg-green-500/30 text-green-300 animate-pulse' : 'bg-fuchsia-500/30 text-fuchsia-300'}`}>
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
            <Waves className="w-4 h-4 text-purple-400 mb-1" />
            <div className="text-white text-xl font-bold">{(avgCoherence * 100).toFixed(0)}%</div>
            <div className="text-white/60 text-xs">Coherence</div>
          </div>
          <div className="bg-black/40 p-3 rounded-lg border border-cyan-500/30">
            <Zap className="w-4 h-4 text-cyan-400 mb-1" />
            <div className="text-white text-xl font-bold">{sessionDuration}m</div>
            <div className="text-white/60 text-xs">Duration</div>
          </div>
          <div className="bg-black/40 p-3 rounded-lg border border-green-500/30">
            <CheckCircle className="w-4 h-4 text-green-400 mb-1" />
            <div className="text-white text-xl font-bold">{coherenceTarget}%</div>
            <div className="text-white/60 text-xs">Target</div>
          </div>
        </div>

        <div className="space-y-4 mb-4">
          <div>
            <label className="text-white text-sm mb-2 block">
              Target Coherence: {coherenceTarget}%
            </label>
            <Slider
              value={[coherenceTarget]}
              onValueChange={(val) => setCoherenceTarget(val[0])}
              min={50}
              max={100}
              step={5}
              disabled={harmonizing}
            />
          </div>

          <div>
            <label className="text-white text-sm mb-2 block">
              Session Duration: {sessionDuration} minutes
            </label>
            <Slider
              value={[sessionDuration]}
              onValueChange={(val) => setSessionDuration(val[0])}
              min={5}
              max={60}
              step={5}
              disabled={harmonizing}
            />
          </div>
        </div>

        <Button
          onClick={() => harmonizeMutation.mutate()}
          disabled={harmonizing || harmonizeMutation.isPending}
          className={`w-full ${harmonizing ? 'bg-green-600' : 'bg-fuchsia-600'} hover:bg-fuchsia-700 h-12`}
        >
          {harmonizing ? (
            <>
              <Waves className="w-5 h-5 mr-2 animate-pulse" />
              Harmonization in Progress...
            </>
          ) : (
            <>
              <Atom className="w-5 h-5 mr-2" />
              Initiate Quantum Harmonization
            </>
          )}
        </Button>

        <div className="h-[500px] bg-black/20 rounded-lg overflow-hidden mt-4">
          <Canvas camera={{ position: [6, 4, 6], fov: 60 }}>
            <color attach="background" args={['#0a0020']} />
            <fog attach="fog" args={['#0a0020', 5, 25]} />
            <HarmonizationScene 
              states={states} 
              harmonizing={harmonizing}
              coherenceTarget={coherenceTarget}
            />
          </Canvas>
        </div>

        <div className="mt-4 bg-fuchsia-500/20 border border-fuchsia-500/50 p-4 rounded-lg">
          <div className="text-fuchsia-400 font-bold mb-2">Harmonization Benefits</div>
          <div className="space-y-1 text-white/80 text-sm">
            <div>• Enhanced cognitive stability and mental clarity</div>
            <div>• Improved synchronization between different mental states</div>
            <div>• Reduced quantum decoherence and mental fatigue</div>
            <div>• Optimized creativity-focus balance for peak performance</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}