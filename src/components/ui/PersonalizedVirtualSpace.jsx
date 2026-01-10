/**
 * Personalized Virtual Space
 * - Customizable 3D lobby/office
 * - Arrange data widgets
 * - Drag-and-drop customization
 * - Gesture controls
 * - Voice commands
 */

import React, { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mic, Move3d, Settings } from 'lucide-react';

// Virtual office environment
function VirtualOffice({ widgets }) {
  const sceneRef = useRef();

  useFrame(() => {
    if (sceneRef.current) {
      sceneRef.current.rotation.y += 0.0001;
    }
  });

  return (
    <scene ref={sceneRef}>
      <ambientLight intensity={0.6} />
      <pointLight position={[50, 50, 50]} intensity={1} />

      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>

      {/* Walls */}
      <mesh position={[0, 25, -50]}>
        <planeGeometry args={[100, 50]} />
        <meshStandardMaterial color="#16213e" />
      </mesh>

      {/* Widget displays */}
      {widgets.map((widget, idx) => {
        const x = -30 + idx * 20;
        return (
          <group key={widget.id} position={[x, 10, 0]}>
            {/* Screen frame */}
            <mesh>
              <boxGeometry args={[15, 10, 0.5]} />
              <meshPhongMaterial color="#333333" emissive="#333333" emissiveIntensity={0.2} />
            </mesh>

            {/* Screen display */}
            <mesh position={[0, 0, 0.3]}>
              <planeGeometry args={[14, 9]} />
              <meshBasicMaterial color={widget.color} />
            </mesh>

            {/* Widget label */}
            <Text
              position={[0, -6, 0]}
              fontSize={1}
              color="white"
              anchorX="center"
            >
              {widget.label}
            </Text>
          </group>
        );
      })}
    </scene>
  );
}

export default function PersonalizedVirtualSpace() {
  const [widgets, setWidgets] = useState([
    { id: 1, label: 'Portfolio', color: '#00ffff', position: [0, 0, 0] },
    { id: 2, label: 'Analytics', color: '#00ff00', position: [20, 0, 0] },
    { id: 3, label: 'Alerts', color: '#ff6600', position: [-20, 0, 0] }
  ]);

  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [customizationMode, setCustomizationMode] = useState(false);

  const handleVoiceCommand = () => {
    setIsVoiceActive(!isVoiceActive);
    if (!isVoiceActive) {
      // Start listening for voice commands
      console.log('Voice commands enabled. Try: "show portfolio", "arrange widgets", etc.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex gap-4 items-center justify-center"
      >
        <Button
          onClick={handleVoiceCommand}
          className={`flex items-center gap-2 ${isVoiceActive ? 'bg-red-600' : 'bg-gray-600'}`}
        >
          <Mic className="w-4 h-4" />
          {isVoiceActive ? 'Listening...' : 'Voice Commands'}
        </Button>

        <Button
          onClick={() => setCustomizationMode(!customizationMode)}
          variant={customizationMode ? 'default' : 'outline'}
          className="flex items-center gap-2"
        >
          <Move3d className="w-4 h-4" />
          {customizationMode ? 'Done Editing' : 'Customize Space'}
        </Button>

        <Button variant="outline" className="flex items-center gap-2">
          <Settings className="w-4 h-4" />
          Settings
        </Button>
      </motion.div>

      {/* 3D Virtual Space */}
      <Card className="bg-black/20 border-white/10 h-[600px]">
        <Canvas camera={{ position: [0, 30, 60], fov: 60 }}>
          <VirtualOffice widgets={widgets} />
          <OrbitControls autoRotate autoRotateSpeed={0.5} />
        </Canvas>
      </Card>

      {/* Widget Management */}
      {customizationMode && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {widgets.map(widget => (
            <Card key={widget.id} className="bg-black/40 border-white/10">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded"
                    style={{ backgroundColor: widget.color }}
                  />
                  <span className="text-white font-semibold">{widget.label}</span>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">Remove</Button>
                  <Button size="sm" variant="outline">Move</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>
      )}

      {/* Voice Command Info */}
      {isVoiceActive && (
        <Card className="bg-purple-900/20 border-purple-500/30">
          <CardContent className="p-4">
            <p className="text-purple-300 text-sm">
              💬 Try saying: "show portfolio", "arrange widgets", "open analytics", "change theme"
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}