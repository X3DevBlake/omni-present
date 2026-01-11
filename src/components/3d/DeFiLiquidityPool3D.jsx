import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import { Volume2, Info } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function DeFiLiquidityPool3D() {
  const containerRef = useRef(null);
  const [poolData, setPoolData] = useState([]);
  const [selectedPool, setSelectedPool] = useState(null);
  const [explanation, setExplanation] = useState('');

  useEffect(() => {
    initializePoolScene();
    loadPoolData();
  }, []);

  const loadPoolData = async () => {
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: 'Get top 5 DeFi liquidity pools with TVL, APY, and composition',
        add_context_from_internet: true,
        response_json_schema: {
          type: 'object',
          properties: {
            pools: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  tvl: { type: 'number' },
                  apy: { type: 'number' },
                  token_a: { type: 'string' },
                  token_b: { type: 'string' },
                  composition: { type: 'object' },
                },
              },
            },
          },
        },
      });

      setPoolData(response.pools || []);
    } catch (error) {
      console.error('Error loading pool data:', error);
    }
  };

  const initializePoolScene = () => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, containerRef.current.clientWidth / 400, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

    camera.position.z = 4;
    renderer.setSize(containerRef.current.clientWidth, 400);
    renderer.setClearColor(0x0a0e27, 0.1);
    containerRef.current.appendChild(renderer.domElement);

    // Create liquidity pool visualization (torus knot for dynamic flow)
    const geometry = new THREE.TorusKnotGeometry(1, 0.4, 100, 16);
    const material = new THREE.MeshPhongMaterial({
      color: 0x00ff88,
      emissive: 0x00ff88,
      emissiveIntensity: 0.5,
      shininess: 100,
    });

    const knot = new THREE.Mesh(geometry, material);
    scene.add(knot);

    // Lighting
    const light = new THREE.PointLight(0xffffff, 2);
    light.position.set(5, 10, 5);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0x505050));

    let animationId;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      knot.rotation.x += 0.01;
      knot.rotation.y += 0.01;
      renderer.render(scene, camera);
    };

    animate();
  };

  const generatePoolExplanation = async (pool) => {
    try {
      const explanation = await base44.integrations.Core.InvokeLLM({
        prompt: `Create voice-over explanation for DeFi pool:
        
Pool: ${pool.name}
TVL: $${pool.tvl.toLocaleString()}
APY: ${pool.apy}%
Composition: ${pool.token_a}/${pool.token_b}

Make it engaging and informative (30 seconds).`,
      });

      setExplanation(explanation);
      setSelectedPool(pool);
    } catch (error) {
      console.error('Error generating explanation:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <div
          ref={containerRef}
          className="w-full h-96 rounded-lg border border-white/10 overflow-hidden"
        />
        <motion.button
          whileHover={{ scale: 1.1 }}
          className="absolute top-4 right-4 p-2 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg border border-purple-400"
        >
          <Volume2 className="w-4 h-4 text-purple-300" />
        </motion.button>
      </div>

      {/* Pool List */}
      <div className="space-y-2">
        <p className="text-white font-bold text-sm">Liquidity Pools</p>
        <div className="grid grid-cols-2 gap-2">
          {poolData.slice(0, 4).map((pool, idx) => (
            <motion.button
              key={pool.name}
              onClick={() => generatePoolExplanation(pool)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`text-left p-2 rounded-lg border transition-all text-xs ${
                selectedPool?.name === pool.name
                  ? 'bg-cyan-500/20 border-cyan-400'
                  : 'bg-white/5 border-white/10 hover:border-white/20'
              }`}
            >
              <p className="text-white font-bold">{pool.name}</p>
              <p className="text-white/60">TVL: ${(pool.tvl / 1e6).toFixed(1)}M</p>
              <p className="text-green-300 text-xs">APY: {pool.apy}%</p>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Explanation */}
      {explanation && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-purple-500/10 border border-purple-400/30 rounded-lg p-3"
        >
          <p className="text-white text-sm">{explanation}</p>
        </motion.div>
      )}
    </div>
  );
}