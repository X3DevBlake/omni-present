import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Cone } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, TrendingUp, Target, CheckCircle } from 'lucide-react';

function RecommendationNode({ recommendation, position, index }) {
  const meshRef = useRef();

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = clock.elapsedTime * (1 + index * 0.1);
      const float = Math.sin(clock.elapsedTime * 2 + index) * 0.2;
      meshRef.current.position.y = position[1] + float;
    }
  });

  const priorityColor = recommendation.priority === 1 ? '#ff00ff' : 
                       recommendation.priority === 2 ? '#00ffff' : '#ffaa00';

  return (
    <group position={position}>
      <Cone ref={meshRef} args={[0.3, 0.6, 4]}>
        <meshStandardMaterial
          color={priorityColor}
          emissive={priorityColor}
          emissiveIntensity={0.8}
        />
      </Cone>
      <Text position={[0, 0.8, 0]} fontSize={0.08} color="white" anchorX="center">
        Priority {recommendation.priority}
      </Text>
    </group>
  );
}

function RecommendationScene({ recommendations }) {
  const positions = recommendations.slice(0, 6).map((_, idx) => {
    const angle = (idx / 6) * Math.PI * 2;
    const radius = 3;
    return [Math.cos(angle) * radius, 0, Math.sin(angle) * radius];
  });

  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 10, 0]} intensity={2} color="#ffffff" />
      <pointLight position={[10, 5, 10]} intensity={1} color="#ff00ff" />
      
      <Text position={[0, 4, 0]} fontSize={0.4} color="#ffffff" anchorX="center">
        AI RECOMMENDATIONS
      </Text>

      <Sphere args={[0.6, 64, 64]} position={[0, 0, 0]}>
        <meshStandardMaterial
          color="#00ffff"
          emissive="#00ffff"
          emissiveIntensity={1}
        />
      </Sphere>

      {recommendations.slice(0, 6).map((rec, idx) => (
        <RecommendationNode
          key={idx}
          recommendation={rec}
          position={positions[idx]}
          index={idx}
        />
      ))}

      <OrbitControls enableZoom enablePan autoRotate autoRotateSpeed={0.6} />
    </>
  );
}

export default function AIGoalRecommendations3D({ recommendations = [], onApply }) {
  return (
    <Card className="bg-gradient-to-br from-cyan-500/20 via-blue-500/20 to-indigo-500/20 border-cyan-500/50">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-3 text-2xl">
          <Sparkles className="w-8 h-8 text-cyan-400 animate-pulse" />
          AI Goal Recommendations
          <Badge className="bg-cyan-500/30 text-cyan-300">
            {recommendations.length} INSIGHTS
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] bg-black/20 rounded-lg overflow-hidden mb-4">
          <Canvas camera={{ position: [6, 4, 6], fov: 60 }}>
            <color attach="background" args={['#000510']} />
            <fog attach="fog" args={['#000510', 5, 25]} />
            <RecommendationScene recommendations={recommendations} />
          </Canvas>
        </div>

        <div className="space-y-3">
          {recommendations.map((rec, idx) => (
            <div key={idx} className="bg-black/40 p-4 rounded-lg border border-cyan-500/30">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-cyan-400" />
                  <span className="text-white font-bold">Priority {rec.priority}</span>
                </div>
                <Badge className={
                  rec.expected_impact > 0.7 ? 'bg-green-500/30 text-green-300' :
                  rec.expected_impact > 0.4 ? 'bg-yellow-500/30 text-yellow-300' :
                  'bg-gray-500/30 text-gray-300'
                }>
                  {(rec.expected_impact * 100).toFixed(0)}% Impact
                </Badge>
              </div>
              <p className="text-white/80 text-sm mb-2">{rec.recommendation}</p>
              <div className="flex items-center justify-between">
                <span className="text-white/50 text-xs">
                  Difficulty: {rec.implementation_difficulty}
                </span>
                <Button
                  size="sm"
                  onClick={() => onApply?.(rec)}
                  className="bg-cyan-600 hover:bg-cyan-700"
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