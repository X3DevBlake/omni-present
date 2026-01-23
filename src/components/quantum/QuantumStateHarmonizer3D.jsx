import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Line } from '@react-three/drei';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Sparkles, Zap, Activity } from 'lucide-react';

function QuantumStateOrb({ position, state, isActive, pulseSpeed = 1 }) {
  const ref = React.useRef();
  
  React.useEffect(() => {
    if (!ref.current) return;
    const interval = setInterval(() => {
      if (ref.current) {
        ref.current.scale.setScalar(1 + Math.sin(Date.now() * 0.001 * pulseSpeed) * 0.2);
      }
    }, 16);
    return () => clearInterval(interval);
  }, [pulseSpeed]);

  const colorMap = {
    'Focus': '#3b82f6',
    'Creativity': '#a855f7',
    'Relaxation': '#10b981',
    'Energy': '#f59e0b'
  };

  return (
    <group position={position}>
      <Sphere ref={ref} args={[0.4, 32, 32]}>
        <meshStandardMaterial 
          color={colorMap[state.state_descriptor] || '#ffffff'} 
          emissive={colorMap[state.state_descriptor] || '#ffffff'}
          emissiveIntensity={isActive ? 0.8 : 0.3}
          transparent
          opacity={0.7}
        />
      </Sphere>
      <Text
        position={[0, -0.7, 0]}
        fontSize={0.15}
        color="white"
        anchorX="center"
      >
        {state.state_descriptor}
      </Text>
      <Text
        position={[0, -0.9, 0]}
        fontSize={0.12}
        color="#aaa"
        anchorX="center"
      >
        {(state.probability_amplitude * 100).toFixed(0)}%
      </Text>
    </group>
  );
}

function HarmonizationBeam({ from, to, intensity }) {
  const points = [from, to];
  
  return (
    <Line
      points={points}
      color="#00ffff"
      lineWidth={2 + intensity * 3}
      transparent
      opacity={0.4 + intensity * 0.4}
    />
  );
}

function HarmonizationScene({ states, harmonizationProgress, activeStates }) {
  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8b5cf6" />

      <Text position={[0, 2, 0]} fontSize={0.25} color="white" anchorX="center">
        Quantum State Harmonization
      </Text>

      {states.map((state, idx) => {
        const angle = (idx / states.length) * Math.PI * 2;
        const radius = 2;
        const position = [
          Math.cos(angle) * radius,
          0,
          Math.sin(angle) * radius
        ];
        
        return (
          <QuantumStateOrb
            key={idx}
            position={position}
            state={state}
            isActive={activeStates.includes(idx)}
            pulseSpeed={1 + harmonizationProgress}
          />
        );
      })}

      {activeStates.length === 2 && states[activeStates[0]] && states[activeStates[1]] && (
        <>
          <HarmonizationBeam
            from={[
              Math.cos((activeStates[0] / states.length) * Math.PI * 2) * 2,
              0,
              Math.sin((activeStates[0] / states.length) * Math.PI * 2) * 2
            ]}
            to={[
              Math.cos((activeStates[1] / states.length) * Math.PI * 2) * 2,
              0,
              Math.sin((activeStates[1] / states.length) * Math.PI * 2) * 2
            ]}
            intensity={harmonizationProgress}
          />
          
          <Sphere position={[0, 0, 0]} args={[0.3 + harmonizationProgress * 0.3, 32, 32]}>
            <meshStandardMaterial 
              color="#00ffff" 
              emissive="#00ffff"
              emissiveIntensity={harmonizationProgress}
              transparent
              opacity={0.5}
            />
          </Sphere>
        </>
      )}

      <OrbitControls enableZoom={true} enablePan={false} />
    </>
  );
}

export default function QuantumStateHarmonizer3D({ states = [] }) {
  const queryClient = useQueryClient();
  const [selectedStates, setSelectedStates] = useState([]);
  const [harmonizationIntensity, setHarmonizationIntensity] = useState([0.5]);
  const [sessionActive, setSessionActive] = useState(false);
  const [progress, setProgress] = useState(0);

  const superpositionStates = states.flatMap(s => 
    s.superposition_states?.map(ss => ({ ...ss, parent_id: s.state_id })) || []
  ).slice(0, 6);

  const harmonizeMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('quantumHarmonization', {
        action: 'harmonize_states',
        state_ids: selectedStates.map(idx => superpositionStates[idx]?.parent_id),
        intensity: harmonizationIntensity[0],
        target_coherence: 0.85
      });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['quantum-states'] });
      toast.success(`Harmonization complete! Coherence: ${(data.achieved_coherence * 100).toFixed(0)}%`);
      setSessionActive(false);
      setProgress(0);
    }
  });

  const startHarmonizationSession = () => {
    if (selectedStates.length !== 2) {
      toast.error('Please select exactly 2 quantum states to harmonize');
      return;
    }
    
    setSessionActive(true);
    setProgress(0);
    
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 1) {
          clearInterval(interval);
          harmonizeMutation.mutate();
          return 1;
        }
        return prev + 0.02;
      });
    }, 100);
  };

  const toggleStateSelection = (idx) => {
    setSelectedStates(prev => {
      if (prev.includes(idx)) {
        return prev.filter(i => i !== idx);
      }
      if (prev.length < 2) {
        return [...prev, idx];
      }
      return prev;
    });
  };

  return (
    <Card className="bg-black/40 border-cyan-500/50">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-cyan-400" />
          Quantum State Harmonization
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <div className="bg-black rounded-lg overflow-hidden" style={{ height: '400px' }}>
              <Canvas camera={{ position: [0, 2, 5], fov: 50 }}>
                <HarmonizationScene 
                  states={superpositionStates}
                  harmonizationProgress={progress}
                  activeStates={selectedStates}
                />
              </Canvas>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="text-white text-sm font-bold mb-3">Select States to Harmonize</div>
              <div className="space-y-2">
                {superpositionStates.map((state, idx) => (
                  <button
                    key={idx}
                    onClick={() => toggleStateSelection(idx)}
                    disabled={sessionActive}
                    className={`w-full p-3 rounded-lg border transition-all ${
                      selectedStates.includes(idx)
                        ? 'bg-cyan-500/30 border-cyan-400'
                        : 'bg-black/60 border-cyan-500/30 hover:bg-cyan-500/10'
                    } ${sessionActive ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="text-white font-bold text-left">{state.state_descriptor}</div>
                    <div className="text-white/60 text-xs text-left">
                      Coherence: {(state.coherence * 100).toFixed(0)}%
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-white text-sm font-bold mb-2">Harmonization Intensity</div>
              <Slider
                value={harmonizationIntensity}
                onValueChange={setHarmonizationIntensity}
                max={1}
                step={0.1}
                disabled={sessionActive}
                className="mb-2"
              />
              <div className="text-white/60 text-xs text-center">
                {(harmonizationIntensity[0] * 100).toFixed(0)}%
              </div>
            </div>

            {sessionActive && (
              <div className="bg-cyan-500/20 border border-cyan-400 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
                  <span className="text-white text-sm font-bold">Harmonizing...</span>
                </div>
                <div className="w-full bg-black/60 rounded-full h-2">
                  <div 
                    className="bg-cyan-400 h-2 rounded-full transition-all"
                    style={{ width: `${progress * 100}%` }}
                  />
                </div>
                <div className="text-white/60 text-xs text-center mt-1">
                  {(progress * 100).toFixed(0)}% Complete
                </div>
              </div>
            )}

            <Button
              onClick={startHarmonizationSession}
              disabled={selectedStates.length !== 2 || sessionActive || harmonizeMutation.isPending}
              className="w-full bg-cyan-600 hover:bg-cyan-700"
            >
              <Zap className="w-4 h-4 mr-2" />
              {sessionActive ? 'Harmonizing...' : 'Start Guided Session'}
            </Button>

            {selectedStates.length === 2 && superpositionStates[selectedStates[0]] && superpositionStates[selectedStates[1]] && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-black/60 border border-cyan-500/30 rounded-lg p-3"
              >
                <div className="text-white text-xs font-bold mb-2">Harmonization Preview</div>
                <div className="text-white/80 text-xs mb-1">
                  {superpositionStates[selectedStates[0]].state_descriptor} + {superpositionStates[selectedStates[1]].state_descriptor}
                </div>
                <div className="text-white/60 text-xs">
                  Expected coherence: {((superpositionStates[selectedStates[0]].coherence + superpositionStates[selectedStates[1]].coherence) / 2 * 100).toFixed(0)}%
                </div>
              </motion.div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="bg-black/60 border border-cyan-500/30 rounded-lg p-3 text-center">
            <div className="text-cyan-400 text-2xl font-bold">{superpositionStates.length}</div>
            <div className="text-white/60 text-xs">Available States</div>
          </div>
          <div className="bg-black/60 border border-cyan-500/30 rounded-lg p-3 text-center">
            <div className="text-cyan-400 text-2xl font-bold">
              {superpositionStates.length > 0 ? 
                (superpositionStates.reduce((sum, s) => sum + s.coherence, 0) / superpositionStates.length * 100).toFixed(0) : 0}%
            </div>
            <div className="text-white/60 text-xs">Avg Coherence</div>
          </div>
          <div className="bg-black/60 border border-cyan-500/30 rounded-lg p-3 text-center">
            <div className="text-cyan-400 text-2xl font-bold">{selectedStates.length}/2</div>
            <div className="text-white/60 text-xs">States Selected</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}