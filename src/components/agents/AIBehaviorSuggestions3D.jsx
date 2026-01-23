import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Cone, Line } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, TrendingUp, Brain, CheckCircle } from 'lucide-react';

function SuggestionNode({ suggestion, position, index }) {
  const meshRef = useRef();
  const glowRef = useRef();

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = clock.elapsedTime * (1 + index * 0.2);
      const float = Math.sin(clock.elapsedTime * 2 + index) * 0.3;
      meshRef.current.position.y = position[1] + float;
    }
    if (glowRef.current) {
      const pulse = Math.sin(clock.elapsedTime * 3) * 0.15 + 1;
      glowRef.current.scale.setScalar(pulse);
    }
  });

  const impactColor = suggestion.expected_impact > 0.7 ? '#00ff88' : 
                      suggestion.expected_impact > 0.4 ? '#ffaa00' : '#888888';

  return (
    <group position={position}>
      <Sphere ref={glowRef} args={[0.4, 32, 32]}>
        <meshBasicMaterial color={impactColor} transparent opacity={0.2} />
      </Sphere>

      <Cone ref={meshRef} args={[0.25, 0.5, 4]} rotation={[0, 0, Math.PI]}>
        <meshStandardMaterial
          color={impactColor}
          emissive={impactColor}
          emissiveIntensity={suggestion.expected_impact}
        />
      </Cone>

      <Text position={[0, 0.6, 0]} fontSize={0.08} color="white" anchorX="center">
        {suggestion.category?.slice(0, 10)}
      </Text>
      <Text position={[0, -0.5, 0]} fontSize={0.06} color={impactColor} anchorX="center">
        Impact: {(suggestion.expected_impact * 100).toFixed(0)}%
      </Text>
    </group>
  );
}

function AIBrain({ position }) {
  const meshRef = useRef();

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = clock.elapsedTime * 0.5;
      const pulse = Math.sin(clock.elapsedTime * 2) * 0.15 + 1;
      meshRef.current.scale.setScalar(pulse);
    }
  });

  return (
    <group position={position}>
      <Sphere ref={meshRef} args={[0.8, 64, 64]}>
        <meshStandardMaterial
          color="#ff00ff"
          emissive="#ff00ff"
          emissiveIntensity={1.2}
          metalness={1}
          roughness={0}
        />
      </Sphere>
      <Text position={[0, 1.2, 0]} fontSize={0.2} color="#ffffff" anchorX="center">
        AI SUGGESTER
      </Text>
    </group>
  );
}

function SuggestionsScene({ suggestions }) {
  const positions = useMemo(() => {
    return suggestions.map((_, idx) => {
      const angle = (idx / suggestions.length) * Math.PI * 2;
      const radius = 4;
      const height = Math.sin(idx * 0.5) * 2;
      return [Math.cos(angle) * radius, height, Math.sin(angle) * radius];
    });
  }, [suggestions]);

  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1.5} color="#ff00ff" />
      <pointLight position={[-10, 5, -10]} intensity={1} color="#00ff88" />
      
      <Text position={[0, 5, 0]} fontSize={0.5} color="#ffffff" anchorX="center">
        AI BEHAVIOR SUGGESTIONS
      </Text>

      <AIBrain position={[0, 0, 0]} />

      {suggestions.map((suggestion, idx) => (
        <React.Fragment key={idx}>
          <SuggestionNode suggestion={suggestion} position={positions[idx]} index={idx} />
          <Line
            points={[[0, 0, 0], positions[idx]]}
            color="#00ff88"
            lineWidth={1}
            transparent
            opacity={0.3}
            dashed
          />
        </React.Fragment>
      ))}

      <OrbitControls enableZoom enablePan autoRotate autoRotateSpeed={0.7} />
    </>
  );
}

export default function AIBehaviorSuggestions3D({ suggestions = [], onApplySuggestion }) {
  const highImpact = suggestions.filter(s => s.expected_impact > 0.7).length;

  return (
    <Card className="bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-orange-500/20 border-purple-500/50">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-3 text-2xl">
          <Sparkles className="w-8 h-8 text-purple-400 animate-pulse" />
          AI-Powered Behavior Suggestions
          <Badge className="bg-purple-500/30 text-purple-300">
            {highImpact} HIGH IMPACT
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[500px] bg-black/20 rounded-lg overflow-hidden mb-4">
          <Canvas camera={{ position: [8, 5, 8], fov: 60 }}>
            <color attach="background" args={['#0a0010']} />
            <fog attach="fog" args={['#0a0010', 5, 35]} />
            <SuggestionsScene suggestions={suggestions} />
          </Canvas>
        </div>

        <div className="space-y-3">
          {suggestions.slice(0, 4).map((suggestion, idx) => (
            <div key={idx} className="bg-black/40 p-4 rounded-lg border border-purple-500/30">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-purple-400" />
                  <span className="text-white font-bold">{suggestion.category}</span>
                </div>
                <Badge className={
                  suggestion.expected_impact > 0.7 ? 'bg-green-500/30 text-green-300' :
                  suggestion.expected_impact > 0.4 ? 'bg-yellow-500/30 text-yellow-300' :
                  'bg-gray-500/30 text-gray-300'
                }>
                  {(suggestion.expected_impact * 100).toFixed(0)}% Impact
                </Badge>
              </div>
              <p className="text-white/70 text-sm mb-3">{suggestion.recommendation}</p>
              <div className="flex items-center justify-between">
                <span className="text-white/50 text-xs">Based on {suggestion.based_on_templates} successful templates</span>
                <Button
                  size="sm"
                  onClick={() => onApplySuggestion?.(suggestion)}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Apply
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}