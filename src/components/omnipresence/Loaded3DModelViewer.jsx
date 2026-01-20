import React, { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Text, Html } from '@react-three/drei';
import { Loader2 } from 'lucide-react';

function Model3D({ url, detectedFeatures }) {
  const modelRef = useRef();
  
  useFrame(() => {
    if (modelRef.current) {
      modelRef.current.rotation.y += 0.005;
    }
  });

  try {
    const { scene } = useGLTF(url);
    return (
      <group ref={modelRef}>
        <primitive object={scene.clone()} scale={0.05} />
      </group>
    );
  } catch (error) {
    return (
      <mesh>
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial color="#64748b" wireframe />
      </mesh>
    );
  }
}

function DetectedFeatureMarker({ feature, index }) {
  return (
    <group position={[feature.position?.x || 0, feature.position?.y || 0, feature.position?.z || 0]}>
      <mesh>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial
          color="#00ff88"
          emissive="#00ff88"
          emissiveIntensity={0.8}
        />
      </mesh>
      <Html position={[0, 0.2, 0]} center>
        <div className="bg-slate-900/90 backdrop-blur-sm border border-cyan-500 rounded px-2 py-1">
          <p className="text-cyan-400 text-xs">{feature.feature_type}</p>
        </div>
      </Html>
    </group>
  );
}

export default function Loaded3DModelViewer({ scan }) {
  if (!scan?.scan_file_url) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-900/40 rounded-lg">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">No scan loaded</p>
        </div>
      </div>
    );
  }

  return (
    <Canvas camera={{ position: [5, 5, 5], fov: 60 }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, 5, -10]} intensity={0.5} color="#00f5ff" />

      <Text position={[0, 4, 0]} fontSize={0.3} color="white" anchorX="center">
        3D Spatial Scan
      </Text>

      <Suspense fallback={null}>
        <Model3D url={scan.scan_file_url} detectedFeatures={scan.ai_detected_features} />
      </Suspense>

      {scan.ai_detected_features?.map((feature, idx) => (
        <DetectedFeatureMarker key={idx} feature={feature} index={idx} />
      ))}

      <gridHelper args={[20, 20, '#334155', '#1e293b']} />

      <OrbitControls
        enableZoom={true}
        minDistance={2}
        maxDistance={15}
      />
    </Canvas>
  );
}