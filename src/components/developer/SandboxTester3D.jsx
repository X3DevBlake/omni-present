import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Box, Cone } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Beaker, Play, CheckCircle, XCircle, Clock } from 'lucide-react';

function TestNode({ test, position, index }) {
  const meshRef = useRef();

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = clock.elapsedTime * (1 + index * 0.1);
      if (!test.passed) {
        const shake = Math.sin(clock.elapsedTime * 10) * 0.1;
        meshRef.current.position.x = position[0] + shake;
      }
    }
  });

  const color = test.passed ? '#00ff88' : '#ff4444';

  return (
    <group position={position}>
      <Cone ref={meshRef} args={[0.3, 0.6, 4]}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={test.passed ? 0.6 : 1}
        />
      </Cone>
      <Text position={[0, 0.8, 0]} fontSize={0.08} color="white" anchorX="center">
        {test.test_name?.slice(0, 10)}
      </Text>
    </group>
  );
}

function SandboxScene({ testResults }) {
  const positions = testResults.map((_, idx) => {
    const angle = (idx / testResults.length) * Math.PI * 2;
    const radius = 3;
    return [Math.cos(angle) * radius, 0, Math.sin(angle) * radius];
  });

  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 10, 0]} intensity={2} color="#00ffff" />
      
      <Text position={[0, 4, 0]} fontSize={0.5} color="#ffffff" anchorX="center">
        SANDBOX TESTS
      </Text>

      <Sphere args={[0.6, 64, 64]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={1} />
      </Sphere>

      {testResults.map((test, idx) => (
        <TestNode key={idx} test={test} position={positions[idx]} index={idx} />
      ))}

      <OrbitControls enableZoom enablePan autoRotate autoRotateSpeed={0.6} />
    </>
  );
}

export default function SandboxTester3D({ sandbox, onRunTest }) {
  const testResults = sandbox?.test_results || [];
  const passed = testResults.filter(t => t.passed).length;

  return (
    <Card className="bg-gradient-to-br from-green-500/20 via-teal-500/20 to-cyan-500/20 border-green-500/50">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-3 text-2xl">
          <Beaker className="w-8 h-8 text-green-400 animate-pulse" />
          Sandbox Test Environment
          <Badge className="bg-green-500/30 text-green-300">
            {passed}/{testResults.length} PASSED
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="bg-black/40 p-3 rounded-lg border border-green-500/30">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-white/60 text-xs">Passed</span>
            </div>
            <div className="text-white text-lg font-bold">{passed}</div>
          </div>
          <div className="bg-black/40 p-3 rounded-lg border border-red-500/30">
            <div className="flex items-center gap-2 mb-1">
              <XCircle className="w-4 h-4 text-red-400" />
              <span className="text-white/60 text-xs">Failed</span>
            </div>
            <div className="text-white text-lg font-bold">{testResults.length - passed}</div>
          </div>
          <div className="bg-black/40 p-3 rounded-lg border border-blue-500/30">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-blue-400" />
              <span className="text-white/60 text-xs">Avg Time</span>
            </div>
            <div className="text-white text-lg font-bold">
              {testResults.length > 0 
                ? (testResults.reduce((sum, t) => sum + t.execution_time_ms, 0) / testResults.length).toFixed(0)
                : 0}ms
            </div>
          </div>
          <div className="bg-black/40 p-3 rounded-lg border border-cyan-500/30">
            <div className="flex items-center gap-2 mb-1">
              <Beaker className="w-4 h-4 text-cyan-400" />
              <span className="text-white/60 text-xs">Total</span>
            </div>
            <div className="text-white text-lg font-bold">{testResults.length}</div>
          </div>
        </div>

        <div className="h-[400px] bg-black/20 rounded-lg overflow-hidden mb-4">
          <Canvas camera={{ position: [6, 4, 6], fov: 60 }}>
            <color attach="background" args={['#001010']} />
            <fog attach="fog" args={['#001010', 5, 25]} />
            <SandboxScene testResults={testResults} />
          </Canvas>
        </div>

        <div className="flex gap-2 mb-4">
          <Button onClick={onRunTest} className="bg-green-600 hover:bg-green-700">
            <Play className="w-4 h-4 mr-2" />
            Run New Test
          </Button>
          <Button variant="outline" className="border-green-500 text-green-400">
            <Terminal className="w-4 h-4 mr-2" />
            View Logs
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}