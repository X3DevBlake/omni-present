import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Video, Phone, PhoneOff, Mic, MicOff } from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Float } from '@react-three/drei';

function AgentAvatar() {
  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.3}>
      <mesh>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial
          color="#a855f7"
          emissive="#a855f7"
          emissiveIntensity={0.4}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      <mesh position={[0, -0.5, 0]}>
        <cylinderGeometry args={[0.6, 0.8, 1, 32]} />
        <meshStandardMaterial
          color="#7c3aed"
          emissive="#7c3aed"
          emissiveIntensity={0.3}
        />
      </mesh>
    </Float>
  );
}

export default function AgentVideoCall() {
  const [isCalling, setIsCalling] = useState(false);
  const [micEnabled, setMicEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const userVideoRef = useRef(null);

  const startCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      if (userVideoRef.current) {
        userVideoRef.current.srcObject = stream;
      }
      setIsCalling(true);
    } catch (err) {
      console.error('Camera access denied');
    }
  };

  const endCall = () => {
    if (userVideoRef.current && userVideoRef.current.srcObject) {
      const tracks = userVideoRef.current.srcObject.getTracks?.();
      if (tracks) {
        tracks.forEach(track => track.stop());
      }
    }
    setIsCalling(false);
  };

  return (
    <div className="bg-black/40 border border-pink-500/30 rounded-2xl p-6">
      <h3 className="text-white font-bold mb-4">📹 Live Video Call with Agent</h3>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Agent 3D View */}
        <div className="bg-black/60 rounded-xl overflow-hidden border border-purple-500/30 h-80">
          <Canvas camera={{ position: [0, 0, 3], fov: 60 }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[5, 5, 5]} intensity={1} color="#a855f7" />
            <AgentAvatar />
            <OrbitControls autoRotate autoRotateSpeed={2} />
          </Canvas>
        </div>

        {/* User Video */}
        <div className="bg-black/60 rounded-xl overflow-hidden border border-cyan-500/30 h-80 relative">
          {isCalling ? (
            <video
              ref={userVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <Video className="w-12 h-12 text-white/40 mx-auto mb-2" />
                <p className="text-white/60 text-sm">Camera Feed</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Call Status & Info */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white font-bold">Agent-01 🤖</p>
            <p className="text-white/60 text-xs">
              {isCalling ? '✓ Connected' : 'Ready to call'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-white font-bold">Connection Quality</p>
            <p className="text-green-400 text-xs">Excellent (HD)</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-3 justify-center">
        <motion.button
          onClick={() => setMicEnabled(!micEnabled)}
          whileHover={{ scale: 1.1 }}
          className={`w-12 h-12 rounded-full flex items-center justify-center ${
            micEnabled
              ? 'bg-cyan-500/20 border border-cyan-500/40'
              : 'bg-red-500/20 border border-red-500/40'
          }`}
        >
          {micEnabled ? (
            <Mic className="w-5 h-5 text-cyan-400" />
          ) : (
            <MicOff className="w-5 h-5 text-red-400" />
          )}
        </motion.button>

        <motion.button
          onClick={() => setVideoEnabled(!videoEnabled)}
          whileHover={{ scale: 1.1 }}
          className={`w-12 h-12 rounded-full flex items-center justify-center ${
            videoEnabled
              ? 'bg-cyan-500/20 border border-cyan-500/40'
              : 'bg-red-500/20 border border-red-500/40'
          }`}
        >
          <Video className={`w-5 h-5 ${videoEnabled ? 'text-cyan-400' : 'text-red-400'}`} />
        </motion.button>

        <motion.button
          onClick={isCalling ? endCall : startCall}
          whileHover={{ scale: 1.1 }}
          className={`w-12 h-12 rounded-full flex items-center justify-center ${
            isCalling
              ? 'bg-red-500/20 border border-red-500/40'
              : 'bg-green-500/20 border border-green-500/40'
          }`}
        >
          {isCalling ? (
            <PhoneOff className="w-5 h-5 text-red-400" />
          ) : (
            <Phone className="w-5 h-5 text-green-400" />
          )}
        </motion.button>
      </div>

      {/* Live Interaction Feed */}
      <div className="mt-6 bg-white/5 border border-white/10 rounded-lg p-4 max-h-40 overflow-y-auto">
        <p className="text-white/60 text-xs font-bold mb-2">Live Interaction Feed:</p>
        <div className="space-y-1 text-xs text-white/50">
          <p>→ Agent detected user smile, adjusting conversation tone</p>
          <p>→ Analyzing user engagement level: High (95%)</p>
          <p>→ Agent personality mode: Friendly & Helpful</p>
          <p>→ Real-time comprehension: Processing multi-modal input</p>
        </div>
      </div>
    </div>
  );
}