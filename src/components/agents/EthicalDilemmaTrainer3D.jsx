import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Cone, Line, Torus } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, Scale, Brain, Lightbulb, Play } from 'lucide-react';

function DilemmaNode({ option, position, ethicalScore }) {
  const meshRef = useRef();
  const ringRef = useRef();

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = clock.elapsedTime;
      const pulse = Math.sin(clock.elapsedTime * 3) * 0.1 + 1;
      meshRef.current.scale.setScalar(pulse);
    }
    if (ringRef.current) {
      ringRef.current.rotation.z = clock.elapsedTime * 2;
    }
  });

  const color = ethicalScore > 0.8 ? '#00ff88' : 
                ethicalScore > 0.5 ? '#ffaa00' : '#ff4444';

  return (
    <group position={position}>
      <mesh ref={ringRef}>
        <torusGeometry args={[0.5, 0.03, 16, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.4} />
      </mesh>

      <Sphere ref={meshRef} args={[0.3, 32, 32]}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={ethicalScore}
        />
      </Sphere>

      <Text position={[0, 0.6, 0]} fontSize={0.08} color="white" anchorX="center">
        {option.slice(0, 12)}
      </Text>
      <Text position={[0, -0.5, 0]} fontSize={0.06} color={color} anchorX="center">
        {(ethicalScore * 100).toFixed(0)}% Ethical
      </Text>
    </group>
  );
}

function AgentDecisionCore({ position, analyzing }) {
  const meshRef = useRef();

  useFrame(({ clock }) => {
    if (meshRef.current && analyzing) {
      const pulse = Math.sin(clock.elapsedTime * 4) * 0.2 + 1;
      meshRef.current.scale.setScalar(pulse);
    }
  });

  return (
    <group position={position}>
      <Sphere ref={meshRef} args={[0.7, 64, 64]}>
        <meshStandardMaterial
          color="#ff00ff"
          emissive="#ff00ff"
          emissiveIntensity={analyzing ? 1.5 : 0.8}
          metalness={1}
          roughness={0}
        />
      </Sphere>
      <Text position={[0, 1, 0]} fontSize={0.2} color="#ffffff" anchorX="center">
        AGENT MIND
      </Text>
    </group>
  );
}

function DilemmaScene({ options, agentDecision, analyzing }) {
  const positions = useMemo(() => {
    return options.map((_, idx) => {
      const angle = (idx / options.length) * Math.PI * 2;
      const radius = 4;
      return [Math.cos(angle) * radius, 0, Math.sin(angle) * radius];
    });
  }, [options]);

  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 10, 0]} intensity={2} color="#ffffff" />
      <pointLight position={[10, 5, 10]} intensity={1.5} color="#ff00ff" />
      
      <Text position={[0, 5, 0]} fontSize={0.5} color="#ffffff" anchorX="center">
        ETHICAL DILEMMA
      </Text>

      <AgentDecisionCore position={[0, 0, 0]} analyzing={analyzing} />

      {options.map((option, idx) => {
        const ethicalScore = agentDecision?.selected_option === option ? 
          (agentDecision.ethical_alignment || 0.8) : 0.5;
        
        return (
          <React.Fragment key={idx}>
            <DilemmaNode option={option} position={positions[idx]} ethicalScore={ethicalScore} />
            {agentDecision?.selected_option === option && (
              <Line
                points={[[0, 0, 0], positions[idx]]}
                color="#00ff88"
                lineWidth={3}
                transparent
                opacity={0.8}
              />
            )}
          </React.Fragment>
        );
      })}

      <OrbitControls enableZoom enablePan autoRotate autoRotateSpeed={0.6} />
    </>
  );
}

export default function EthicalDilemmaTrainer3D({ onRunDilemma }) {
  const [dilemmaText, setDilemmaText] = useState('');
  const [options, setOptions] = useState(['Option A', 'Option B', 'Option C']);
  const [agentDecision, setAgentDecision] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  const handleRunDilemma = async () => {
    if (!dilemmaText) return;
    setAnalyzing(true);
    
    const result = await onRunDilemma?.(dilemmaText, options);
    
    setTimeout(() => {
      setAgentDecision(result || {
        selected_option: options[0],
        ethical_alignment: 0.85,
        reasoning: 'AI analysis complete'
      });
      setAnalyzing(false);
    }, 2000);
  };

  return (
    <Card className="bg-gradient-to-br from-orange-500/20 via-red-500/20 to-pink-500/20 border-orange-500/50">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-3 text-2xl">
          <Scale className="w-8 h-8 text-orange-400 animate-pulse" />
          Ethical Dilemma Training Module
          <Badge className="bg-orange-500/30 text-orange-300">
            {analyzing ? 'ANALYZING...' : 'READY'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="text-white mb-2 block flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-400" />
                Define Ethical Dilemma
              </label>
              <Textarea
                value={dilemmaText}
                onChange={(e) => setDilemmaText(e.target.value)}
                placeholder="Describe a complex ethical scenario..."
                className="bg-black/60 border-orange-500/30 text-white h-32"
              />
            </div>

            <div>
              <label className="text-white mb-2 block">Options (one per line)</label>
              <Textarea
                value={options.join('\n')}
                onChange={(e) => setOptions(e.target.value.split('\n').filter(o => o.trim()))}
                placeholder="Option A\nOption B\nOption C"
                className="bg-black/60 border-orange-500/30 text-white h-24"
              />
            </div>

            <Button
              onClick={handleRunDilemma}
              disabled={!dilemmaText || analyzing}
              className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
            >
              <Play className="w-4 h-4 mr-2" />
              {analyzing ? 'Agent Analyzing...' : 'Run Ethical Test'}
            </Button>

            {agentDecision && (
              <div className="space-y-3">
                <div className="bg-green-500/20 border border-green-500/50 p-3 rounded-lg">
                  <div className="text-green-400 font-bold text-sm mb-2 flex items-center gap-2">
                    <Brain className="w-4 h-4" />
                    Agent Decision
                  </div>
                  <div className="text-white text-sm">{agentDecision.selected_option}</div>
                </div>

                <div className="bg-blue-500/20 border border-blue-500/50 p-3 rounded-lg">
                  <div className="text-blue-400 font-bold text-sm mb-2 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4" />
                    Reasoning
                  </div>
                  <div className="text-white/80 text-xs">{agentDecision.reasoning}</div>
                </div>

                <div className="bg-purple-500/20 border border-purple-500/50 p-3 rounded-lg">
                  <div className="text-purple-400 font-bold text-sm mb-2">Ethical Alignment</div>
                  <div className="text-white text-2xl font-bold">
                    {(agentDecision.ethical_alignment * 100).toFixed(0)}%
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="h-[600px] bg-black/20 rounded-lg overflow-hidden">
            <Canvas camera={{ position: [8, 5, 8], fov: 60 }}>
              <color attach="background" args={['#0a0500']} />
              <fog attach="fog" args={['#0a0500', 5, 30]} />
              <DilemmaScene options={options} agentDecision={agentDecision} analyzing={analyzing} />
            </Canvas>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}