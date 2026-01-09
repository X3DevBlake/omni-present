import React, { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, RoundedBox, Text } from '@react-three/drei';
import { motion } from 'framer-motion';
import { Copy, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

function Card3DModel({ design, showDetails, cardData }) {
  const cardRef = useRef();
  const [flipped, setFlipped] = useState(false);

  useFrame(() => {
    if (cardRef.current) {
      const targetRotation = flipped ? Math.PI : 0;
      cardRef.current.rotation.y += (targetRotation - cardRef.current.rotation.y) * 0.1;
    }
  });

  const getCardColor = () => {
    if (design?.color) return design.color;
    switch (design?.material) {
      case 'metallic': return '#c0c0c0';
      case 'holographic': return '#ff00ff';
      case 'matte': return '#1a1a1a';
      default: return '#00f5ff';
    }
  };

  return (
    <group ref={cardRef} onClick={() => setFlipped(!flipped)}>
      {/* Card body */}
      <RoundedBox args={[4, 2.5, 0.1]} radius={0.1}>
        <meshStandardMaterial
          color={getCardColor()}
          metalness={design?.material === 'metallic' ? 0.9 : 0.3}
          roughness={design?.material === 'matte' ? 0.8 : 0.2}
          emissive={design?.glow ? getCardColor() : '#000000'}
          emissiveIntensity={design?.glow ? 0.3 : 0}
        />
      </RoundedBox>

      {/* Front side text */}
      {!flipped && showDetails && (
        <>
          <Text
            position={[-1.5, 0.8, 0.06]}
            fontSize={0.15}
            color="#ffffff"
            anchorX="left"
          >
            {cardData?.name || 'CARD HOLDER'}
          </Text>
          <Text
            position={[-1.5, 0.3, 0.06]}
            fontSize={0.2}
            color="#ffffff"
            anchorX="left"
            letterSpacing={0.1}
          >
            {cardData?.number || '**** **** **** ****'}
          </Text>
          <Text
            position={[-1.5, -0.3, 0.06]}
            fontSize={0.12}
            color="#ffffff"
            anchorX="left"
          >
            {cardData?.expiry || 'MM/YY'}
          </Text>
          <Text
            position={[1.2, 0.8, 0.06]}
            fontSize={0.25}
            color="#ffffff"
            anchorX="right"
            fontWeight="bold"
          >
            OMNI
          </Text>
        </>
      )}

      {/* Back side */}
      {flipped && (
        <>
          <RoundedBox args={[3.8, 0.5, 0.05]} position={[0, 0.7, 0.06]}>
            <meshStandardMaterial color="#000000" />
          </RoundedBox>
          {showDetails && (
            <Text
              position={[1, -0.5, 0.06]}
              fontSize={0.2}
              color="#ffffff"
              anchorX="right"
            >
              {cardData?.cvv || 'CVV'}
            </Text>
          )}
        </>
      )}
    </group>
  );
}

export default function OmniCard3DViewer({ design, cardData, onDesignChange }) {
  const [showDetails, setShowDetails] = useState(false);

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied!`);
  };

  return (
    <div className="space-y-4">
      <div className="relative w-full h-96 rounded-2xl overflow-hidden bg-gradient-to-br from-black/60 to-black/80 border border-white/10">
        <Canvas camera={{ position: [0, 0, 6], fov: 50 }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color="#a855f7" />
          <Card3DModel design={design} showDetails={showDetails} cardData={cardData} />
          <OrbitControls enableZoom={false} />
        </Canvas>

        <div className="absolute top-4 right-4">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="p-2 bg-black/60 backdrop-blur-md border border-white/20 rounded-lg hover:bg-white/10 transition-colors"
          >
            {showDetails ? <EyeOff className="w-5 h-5 text-white" /> : <Eye className="w-5 h-5 text-white" />}
          </button>
        </div>
      </div>

      {showDetails && cardData && (
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-white/60 text-sm">Card Number</span>
            <div className="flex items-center gap-2">
              <span className="text-white font-mono">{cardData.number}</span>
              <button
                onClick={() => copyToClipboard(cardData.number, 'Card number')}
                className="p-1 hover:bg-white/10 rounded transition-colors"
              >
                <Copy className="w-4 h-4 text-cyan-400" />
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white/60 text-sm">Expiry</span>
            <span className="text-white font-mono">{cardData.expiry}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white/60 text-sm">CVV</span>
            <div className="flex items-center gap-2">
              <span className="text-white font-mono">{cardData.cvv}</span>
              <button
                onClick={() => copyToClipboard(cardData.cvv, 'CVV')}
                className="p-1 hover:bg-white/10 rounded transition-colors"
              >
                <Copy className="w-4 h-4 text-cyan-400" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}