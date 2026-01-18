import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';

function NetworkScene({ agents = [] }) {
  const sceneRef = useRef();
  const nodesRef = useRef([]);
  const linesRef = useRef(null);
  const [hoveredNode, setHoveredNode] = useState(null);

  // Generate network nodes
  useEffect(() => {
    const nodeCount = Math.min(agents.length, 15);
    const nodeData = [];

    for (let i = 0; i < nodeCount; i++) {
      const phi = Math.acos(-1 + (2 * i) / nodeCount);
      const theta = Math.sqrt(nodeCount * Math.PI) * phi;
      nodeData.push({
        id: i,
        name: agents[i]?.name || `Agent ${i + 1}`,
        position: [
          15 * Math.cos(theta) * Math.sin(phi),
          15 * Math.sin(theta) * Math.sin(phi),
          15 * Math.cos(phi),
        ],
        color: new THREE.Color().setHSL(Math.random(), 0.7, 0.5),
      });
    }

    // Create nodes
    nodesRef.current = nodeData.map((node) => {
      const geometry = new THREE.IcosahedronGeometry(0.8, 4);
      const material = new THREE.MeshPhongMaterial({
        color: node.color,
        emissive: node.color,
        emissiveIntensity: 0.5,
        wireframe: false,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(...node.position);
      mesh.userData = node;
      sceneRef.current?.add(mesh);
      return mesh;
    });

    // Create connections
    const connections = [];
    const linePositions = [];

    for (let i = 0; i < Math.min(nodeCount, 5); i++) {
      for (let j = i + 1; j < Math.min(i + 3, nodeCount); j++) {
        if (Math.random() > 0.3) {
          const node1 = nodesRef.current[i].position;
          const node2 = nodesRef.current[j].position;
          linePositions.push(node1.x, node1.y, node1.z);
          linePositions.push(node2.x, node2.y, node2.z);
          connections.push({ from: i, to: j });
        }
      }
    }

    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(new Float32Array(linePositions), 3)
    );

    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x00ff88,
      transparent: true,
      opacity: 0.3,
      linewidth: 2,
    });

    linesRef.current = new THREE.LineSegments(lineGeometry, lineMaterial);
    sceneRef.current?.add(linesRef.current);
  }, [agents]);

  useFrame(() => {
    nodesRef.current.forEach((node, idx) => {
      node.rotation.x += 0.005 + Math.sin(Date.now() * 0.001) * 0.001;
      node.rotation.y += 0.003;

      // Pulsing effect
      node.scale.set(
        1 + Math.sin(Date.now() * 0.003 + idx) * 0.1,
        1 + Math.sin(Date.now() * 0.003 + idx) * 0.1,
        1 + Math.sin(Date.now() * 0.003 + idx) * 0.1
      );
    });

    if (linesRef.current) {
      linesRef.current.rotation.x += 0.0001;
      linesRef.current.rotation.y += 0.0002;
    }
  });

  return (
    <>
      <scene ref={sceneRef}>
        <OrbitControls autoRotate autoRotateSpeed={2} />
        <ambientLight intensity={0.5} />
        <pointLight position={[20, 20, 20]} intensity={1} />
        <pointLight position={[-20, -20, -20]} intensity={0.5} color="#ff00ff" />
      </scene>

      {hoveredNode && (
        <Html position={hoveredNode.position}>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-black/90 border border-green-500 rounded-lg px-3 py-2 text-green-300 text-sm whitespace-nowrap"
          >
            {hoveredNode.name}
          </motion.div>
        </Html>
      )}
    </>
  );
}

export default function AIEcosystemNetwork3D({ agents = [] }) {
  return (
    <div className="w-full h-full bg-gradient-to-b from-black/50 to-black/30">
      <Canvas camera={{ position: [0, 0, 30], fov: 45 }}>
        <NetworkScene agents={agents} />
      </Canvas>
      <div className="absolute top-4 left-4 bg-black/80 border border-green-500/30 rounded-lg px-4 py-2 text-green-300 text-sm">
        <div className="font-bold">Agent Network Status</div>
        <div className="text-xs text-green-400 mt-1">{agents.length} agents connected</div>
      </div>
    </div>
  );
}