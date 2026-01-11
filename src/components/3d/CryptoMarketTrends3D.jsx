import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import { Volume2, Play, Pause } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function CryptoMarketTrends3D() {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [voiceActive, setVoiceActive] = useState(false);
  const [cryptoData, setCryptoData] = useState([]);

  useEffect(() => {
    initializeCryptoScene();
    loadCryptoData();
  }, []);

  const loadCryptoData = async () => {
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: 'Get top 5 cryptocurrencies with price data and trends',
        add_context_from_internet: true,
        response_json_schema: {
          type: 'object',
          properties: {
            cryptos: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  symbol: { type: 'string' },
                  price: { type: 'number' },
                  change24h: { type: 'number' },
                  trend: { type: 'string' },
                },
              },
            },
          },
        },
      });

      setCryptoData(response.cryptos || []);
    } catch (error) {
      console.error('Error loading crypto data:', error);
    }
  };

  const initializeCryptoScene = () => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, containerRef.current.clientWidth / 400, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

    camera.position.z = 5;
    renderer.setSize(containerRef.current.clientWidth, 400);
    renderer.setClearColor(0x0a0e27, 0.1);
    containerRef.current.appendChild(renderer.domElement);
    sceneRef.current = { scene, camera, renderer };

    // Create crypto candles/bars
    const group = new THREE.Group();
    const cryptoSymbols = ['BTC', 'ETH', 'SOL', 'ADA', 'DOGE'];

    cryptoSymbols.forEach((symbol, idx) => {
      const geometry = new THREE.BoxGeometry(0.4, Math.random() * 2 + 1, 0.4);
      const color = Math.random() > 0.5 ? 0x00ff00 : 0xff0000;
      const material = new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.5,
        metalness: 0.8,
      });

      const bar = new THREE.Mesh(geometry, material);
      bar.position.x = (idx - 2) * 1.2;
      group.add(bar);
    });

    scene.add(group);

    // Lighting
    const light = new THREE.PointLight(0xffffff, 2);
    light.position.set(5, 10, 5);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0x505050));

    let animationId;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      group.rotation.x += 0.01;
      group.rotation.z += 0.005;
      renderer.render(scene, camera);
    };

    animate();

    return () => cancelAnimationFrame(animationId);
  };

  const generateVoiceOverlay = async () => {
    if (!cryptoData.length) return;

    try {
      const summary = cryptoData
        .map(c => `${c.name} is ${c.change24h > 0 ? 'up' : 'down'} ${Math.abs(c.change24h)}% with ${c.trend}`)
        .join('. ');

      const voiceScript = await base44.integrations.Core.InvokeLLM({
        prompt: `Create engaging voice-over for crypto market visualization:
        
Data: ${summary}

Make it informative and concise (30 seconds max).`,
      });

      setVoiceActive(true);
      // Play voice here (would integrate with ElevenLabs)
    } catch (error) {
      console.error('Error generating voice:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <div
          ref={containerRef}
          className="w-full h-96 rounded-lg border border-white/10 overflow-hidden"
        />

        {/* Controls */}
        <div className="absolute top-4 right-4 flex gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            onClick={() => setPlaying(!playing)}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg border border-white/20"
          >
            {playing ? (
              <Pause className="w-4 h-4 text-white" />
            ) : (
              <Play className="w-4 h-4 text-white" />
            )}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            onClick={generateVoiceOverlay}
            className={`p-2 rounded-lg border ${
              voiceActive
                ? 'bg-purple-500/20 border-purple-400'
                : 'bg-white/10 border-white/20 hover:bg-white/20'
            }`}
          >
            <Volume2 className="w-4 h-4 text-white" />
          </motion.button>
        </div>
      </div>

      {/* Crypto Data Cards */}
      <div className="grid grid-cols-2 gap-2">
        {cryptoData.slice(0, 4).map((crypto, idx) => (
          <motion.div
            key={crypto.symbol}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`border rounded-lg p-2 text-xs ${
              crypto.change24h > 0
                ? 'bg-green-500/10 border-green-400/30'
                : 'bg-red-500/10 border-red-400/30'
            }`}
          >
            <p className="text-white font-bold">{crypto.symbol}</p>
            <p className="text-white/60">${crypto.price.toFixed(2)}</p>
            <p className={crypto.change24h > 0 ? 'text-green-300' : 'text-red-300'}>
              {crypto.change24h > 0 ? '+' : ''}{crypto.change24h.toFixed(2)}%
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}