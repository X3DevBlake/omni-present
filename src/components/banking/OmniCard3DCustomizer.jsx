import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, RoundedBox, Text } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

function CardModel({ color, cardHolder, isHolographic }) {
  const cardRef = useRef();

  useFrame(() => {
    if (cardRef.current) {
      cardRef.current.rotation.y += 0.005;
    }
  });

  return (
    <>
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={1.5} />
      <pointLight position={[-10, -10, 10]} intensity={1} color="#ff00ff" />
      
      <OrbitControls autoRotate autoRotateSpeed={2} />

      <RoundedBox
        ref={cardRef}
        args={[3.4, 2.15, 0.1]}
        radius={0.2}
        widthSegments={32}
        heightSegments={32}
      >
        <meshPhongMaterial
          color={color}
          emissive={isHolographic ? color : '#000000'}
          emissiveIntensity={isHolographic ? 0.3 : 0}
          shininess={isHolographic ? 150 : 30}
          metalness={isHolographic ? 0.8 : 0.2}
          roughness={isHolographic ? 0.2 : 0.5}
        />
      </RoundedBox>

      <Text position={[0, 0.3, 0.06]} fontSize={0.3} color="#ffffff" anchorX="center">
        {cardHolder || 'YOUR NAME'}
      </Text>

      <Text position={[0, -0.5, 0.06]} fontSize={0.25} color="#ffffff" anchorX="center">
        4532 1234 5678 9012
      </Text>
    </>
  );
}

export default function OmniCard3DCustomizer() {
  const [cardColor, setCardColor] = useState('#6366f1');
  const [cardHolder, setCardHolder] = useState('John Doe');
  const [isHolographic, setIsHolographic] = useState(false);

  const colors = [
    { name: 'Indigo', value: '#6366f1' },
    { name: 'Purple', value: '#a855f7' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Cyan', value: '#06b6d4' },
    { name: 'Emerald', value: '#10b981' },
    { name: 'Gold', value: '#f59e0b' },
    { name: 'Red', value: '#ef4444' },
  ];

  return (
    <div className="w-full space-y-6">
      {/* 3D Card Viewer */}
      <Card className="bg-slate-900/60 backdrop-blur-xl border-slate-700">
        <div className="h-[400px]">
          <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
            <CardModel color={cardColor} cardHolder={cardHolder} isHolographic={isHolographic} />
          </Canvas>
        </div>
      </Card>

      {/* Customization Controls */}
      <Card className="bg-slate-900/60 backdrop-blur-xl border-slate-700 p-6">
        <div className="space-y-6">
          {/* Card Holder Name */}
          <div>
            <label className="text-white text-sm font-semibold mb-2 block">Card Holder Name</label>
            <input
              type="text"
              value={cardHolder}
              onChange={(e) => setCardHolder(e.target.value.toUpperCase().slice(0, 25))}
              maxLength={25}
              className="w-full bg-black/40 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:border-purple-500"
              placeholder="JOHN DOE"
            />
          </div>

          {/* Color Selection */}
          <div>
            <label className="text-white text-sm font-semibold mb-3 block">Card Color</label>
            <div className="grid grid-cols-4 gap-3">
              {colors.map((c) => (
                <motion.button
                  key={c.value}
                  onClick={() => setCardColor(c.value)}
                  whileHover={{ scale: 1.1 }}
                  className={`w-full h-12 rounded-lg border-2 transition-all ${
                    cardColor === c.value ? 'border-white' : 'border-white/20'
                  }`}
                  style={{ backgroundColor: c.value }}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          {/* Holographic Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <label className="text-white text-sm font-semibold block">Holographic Finish</label>
              <p className="text-white/60 text-xs mt-1">Premium holographic effect</p>
            </div>
            <button
              onClick={() => setIsHolographic(!isHolographic)}
              className={`w-12 h-7 rounded-full transition-all ${
                isHolographic ? 'bg-purple-600' : 'bg-white/20'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full bg-white transition-transform ${
                  isHolographic ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button className="flex-1 bg-purple-600 hover:bg-purple-700">
              Order Physical Card
            </Button>
            <Button variant="outline" className="flex-1 border-white/20">
              Save Design
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}