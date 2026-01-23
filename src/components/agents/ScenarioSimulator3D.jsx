import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Cone, Line } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Play, CheckCircle, AlertTriangle, TrendingUp } from 'lucide-react';

function DecisionPoint({ decision, position, index }) {
  const meshRef = useRef();

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = clock.elapsedTime * (1 + index * 0.2);
      const pulse = Math.sin(clock.elapsedTime * 3 + index) * 0.1 + 1;
      meshRef.current.scale.setScalar(pulse);
    }
  });

  const alignment = decision.ethical_alignment || 0.8;
  const color = alignment > 0.8 ? '#00ff88' : alignment > 0.5 ? '#ffaa00' : '#ff4444';

  return (
    <group position={position}>
      <Cone ref={meshRef} args={[0.3, 0.6, 4]}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={alignment}
        />
      </Cone>
      <Text position={[0, 0.8, 0]} fontSize={0.08} color="white" anchorX="center">
        Decision {index + 1}
      </Text>
      <Text position={[0, -0.5, 0]} fontSize={0.06} color={color} anchorX="center">
        {(alignment * 100).toFixed(0)}% Ethical
      </Text>
    </group>
  );
}

function ScenarioSimulationScene({ test }) {
  const responses = test?.agent_responses || [];
  
  const positions = useMemo(() => {
    return responses.map((_, idx) => {
      const angle = (idx / responses.length) * Math.PI * 2;
      const radius = 4;
      const height = Math.sin(idx * 0.5) * 2;
      return [Math.cos(angle) * radius, height, Math.sin(angle) * radius];
    });
  }, [responses]);

  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1.5} color="#00ff88" />
      <pointLight position={[-10, 5, -10]} intensity={1} color="#ff00ff" />
      
      <Text position={[0, 5, 0]} fontSize={0.5} color="#ffffff" anchorX="center">
        SCENARIO TEST
      </Text>

      <Sphere args={[0.7, 64, 64]} position={[0, 0, 0]}>
        <meshStandardMaterial
          color="#ff00ff"
          emissive="#ff00ff"
          emissiveIntensity={1}
        />
      </Sphere>

      {responses.map((response, idx) => (
        <React.Fragment key={idx}>
          <DecisionPoint decision={response} position={positions[idx]} index={idx} />
          <Line
            points={[[0, 0, 0], positions[idx]]}
            color="#00ffff"
            lineWidth={1}
            transparent
            opacity={0.3}
          />
        </React.Fragment>
      ))}

      <OrbitControls enableZoom enablePan autoRotate autoRotateSpeed={0.7} />
    </>
  );
}

export default function ScenarioSimulator3D({ test, onRunScenario }) {
  const responses = test?.agent_responses || [];
  const avgEthical = responses.length > 0
    ? responses.reduce((sum, r) => sum + (r.ethical_alignment || 0), 0) / responses.length
    : 0;

  return (
    <Card className="bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 border-indigo-500/50">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-3 text-2xl">
          <Play className="w-8 h-8 text-indigo-400 animate-pulse" />
          Behavior Scenario Simulator
          <Badge className="bg-indigo-500/30 text-indigo-300">
            {test?.test_status || 'READY'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="bg-black/40 p-3 rounded-lg border border-indigo-500/30">
            <div className="flex items-center gap-2 mb-1">
              <Play className="w-4 h-4 text-indigo-400" />
              <span className="text-white/60 text-xs">Decisions</span>
            </div>
            <div className="text-white text-lg font-bold">{responses.length}</div>
          </div>
          <div className="bg-black/40 p-3 rounded-lg border border-green-500/30">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-white/60 text-xs">Ethical</span>
            </div>
            <div className="text-white text-lg font-bold">{(avgEthical * 100).toFixed(0)}%</div>
          </div>
          <div className="bg-black/40 p-3 rounded-lg border border-purple-500/30">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-purple-400" />
              <span className="text-white/60 text-xs">Completion</span>
            </div>
            <div className="text-white text-lg font-bold">
              {((test?.performance_metrics?.task_completion || 0) * 100).toFixed(0)}%
            </div>
          </div>
          <div className="bg-black/40 p-3 rounded-lg border border-pink-500/30">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4 text-pink-400" />
              <span className="text-white/60 text-xs">Complexity</span>
            </div>
            <div className="text-white text-lg font-bold">
              {((test?.scenario_config?.complexity_level || 0.5) * 100).toFixed(0)}%
            </div>
          </div>
        </div>

        <div className="h-[500px] bg-black/20 rounded-lg overflow-hidden mb-4">
          <Canvas camera={{ position: [8, 5, 8], fov: 60 }}>
            <color attach="background" args={['#050010']} />
            <fog attach="fog" args={['#050010', 5, 30]} />
            <ScenarioSimulationScene test={test || {}} />
          </Canvas>
        </div>

        <Button onClick={onRunScenario} className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 mb-4">
          <Play className="w-4 h-4 mr-2" />
          Run New Scenario Test
        </Button>

        {test?.ai_analysis && (
          <div className="space-y-3">
            <div className="bg-green-500/20 border border-green-500/50 p-3 rounded-lg">
              <div className="text-green-400 font-bold text-sm mb-2">Strengths</div>
              <ul className="text-white/80 text-xs space-y-1">
                {test.ai_analysis.strengths?.map((s, idx) => (
                  <li key={idx}>• {s}</li>
                ))}
              </ul>
            </div>

            <div className="bg-red-500/20 border border-red-500/50 p-3 rounded-lg">
              <div className="text-red-400 font-bold text-sm mb-2">Weaknesses</div>
              <ul className="text-white/80 text-xs space-y-1">
                {test.ai_analysis.weaknesses?.map((w, idx) => (
                  <li key={idx}>• {w}</li>
                ))}
              </ul>
            </div>

            <div className="bg-blue-500/20 border border-blue-500/50 p-3 rounded-lg">
              <div className="text-blue-400 font-bold text-sm mb-2">Improvement Suggestions</div>
              <ul className="text-white/80 text-xs space-y-1">
                {test.ai_analysis.improvement_suggestions?.map((s, idx) => (
                  <li key={idx}>• {s}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}