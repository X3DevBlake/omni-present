import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import { Volume2, TrendingUp } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function OmniTokenEcosystem3D() {
  const containerRef = useRef(null);
  const [omniData, setOmniData] = useState(null);
  const [voiceExplanation, setVoiceExplanation] = useState('');
  const [metrics, setMetrics] = useState([]);

  useEffect(() => {
    initializeOmniScene();
    loadOmniData();
  }, []);

  const loadOmniData = async () => {
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: 'Get Omni token data: price, market cap, holders, growth metrics, partnerships',
        add_context_from_internet: true,
        response_json_schema: {
          type: 'object',
          properties: {
            price: { type: 'number' },
            market_cap: { type: 'number' },
            holders: { type: 'number' },
            daily_volume: { type: 'number' },
            growth_rate: { type: 'number' },
            partnerships: { type: 'array', items: { type: 'string' } },
            ecosystem_expansion: { type: 'string' },
          },
        },
      });

      setOmniData(response);
      setMetrics([
        { label: 'Price', value: `$${response.price?.toFixed(4)}` },
        { label: 'Market Cap', value: `$${(response.market_cap / 1e9).toFixed(2)}B` },
        { label: 'Holders', value: response.holders?.toLocaleString() },
        { label: 'Growth', value: `${response.growth_rate?.toFixed(2)}%` },
      ]);
    } catch (error) {
      console.error('Error loading Omni data:', error);
    }
  };

  const initializeOmniScene = () => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, containerRef.current.clientWidth / 400, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

    camera.position.z = 3;
    renderer.setSize(containerRef.current.clientWidth, 400);
    renderer.setClearColor(0x0a0e27, 0.1);
    containerRef.current.appendChild(renderer.domElement);

    // Create central Omni token sphere
    const geometry = new THREE.IcosahedronGeometry(1, 4);
    const material = new THREE.MeshPhongMaterial({
      color: 0xffaa00,
      emissive: 0xffaa00,
      emissiveIntensity: 0.8,
      shininess: 100,
    });

    const omniSphere = new THREE.Mesh(geometry, material);
    scene.add(omniSphere);

    // Orbiting ecosystem elements
    const orbitGroup = new THREE.Group();
    const ecosystemElements = ['Cards', 'DeFi', 'Crypto', 'Banking', 'DAO'];

    ecosystemElements.forEach((element, idx) => {
      const angle = (idx / ecosystemElements.length) * Math.PI * 2;
      const orbitRadius = 2;

      const elemGeometry = new THREE.SphereGeometry(0.2, 16, 16);
      const elemMaterial = new THREE.MeshPhongMaterial({
        color: 0x00ff88,
        emissive: 0x00ff88,
        emissiveIntensity: 0.4,
      });

      const elemSphere = new THREE.Mesh(elemGeometry, elemMaterial);
      elemSphere.position.x = Math.cos(angle) * orbitRadius;
      elemSphere.position.z = Math.sin(angle) * orbitRadius;
      orbitGroup.add(elemSphere);
    });

    scene.add(orbitGroup);

    // Lighting
    const light = new THREE.PointLight(0xffffff, 2);
    light.position.set(5, 10, 5);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0x505050));

    let animationId;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      omniSphere.rotation.x += 0.005;
      omniSphere.rotation.y += 0.005;
      orbitGroup.rotation.y += 0.01;
      renderer.render(scene, camera);
    };

    animate();
  };

  const generateEcosystemVoiceOver = async () => {
    if (!omniData) return;

    try {
      const voiceScript = await base44.integrations.Core.InvokeLLM({
        prompt: `Create compelling voice-over about Omni Token ecosystem growth:
        
Price: $${omniData.price}
Market Cap: $${(omniData.market_cap / 1e9).toFixed(2)}B
Holders: ${omniData.holders}
Growth: ${omniData.growth_rate}%
Expansion: ${omniData.ecosystem_expansion}

Make it exciting and show vision for growth (30-40 seconds).`,
      });

      setVoiceExplanation(voiceScript);
    } catch (error) {
      console.error('Error generating voice-over:', error);
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
          onClick={generateEcosystemVoiceOver}
          className="absolute top-4 right-4 p-2 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg border border-purple-400"
        >
          <Volume2 className="w-4 h-4 text-purple-300" />
        </motion.button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-2">
        {metrics.map((metric, idx) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white/5 border border-white/10 rounded-lg p-3 text-center"
          >
            <p className="text-white/60 text-xs">{metric.label}</p>
            <p className="text-white font-bold text-sm mt-1">{metric.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Voice Explanation */}
      {voiceExplanation && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-purple-500/10 border border-purple-400/30 rounded-lg p-3"
        >
          <div className="flex gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-purple-300 flex-shrink-0" />
            <p className="text-white text-sm">{voiceExplanation}</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}