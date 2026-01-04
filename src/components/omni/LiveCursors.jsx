import React, { useEffect, useState } from 'react';
import { Html } from '@react-three/drei';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';

export default function LiveCursors({ blueprintId }) {
  const [cursors, setCursors] = useState({});
  const [localPosition, setLocalPosition] = useState([0, 0, 0]);

  useEffect(() => {
    if (!blueprintId) return;

    // Simulate real-time cursor positions (in production, use WebSocket)
    const interval = setInterval(() => {
      const mockCursors = {
        'user-1': {
          name: 'Alice Chen',
          position: [Math.sin(Date.now() / 1000) * 2, 0, Math.cos(Date.now() / 1000) * 2],
          color: '#00f5ff',
          component: 'GPU Array 1'
        },
        'user-2': {
          name: 'Bob Smith',
          position: [-1 + Math.sin(Date.now() / 1500) * 0.5, 0.5, 0],
          color: '#a855f7',
          component: 'Memory Pool'
        }
      };
      
      setCursors(mockCursors);
    }, 100);

    return () => clearInterval(interval);
  }, [blueprintId]);

  return (
    <group>
      {Object.entries(cursors).map(([userId, cursor]) => (
        <group key={userId} position={cursor.position}>
          {/* Cursor marker */}
          <mesh>
            <coneGeometry args={[0.1, 0.3, 8]} />
            <meshStandardMaterial 
              color={cursor.color} 
              emissive={cursor.color}
              emissiveIntensity={0.5}
            />
          </mesh>
          
          {/* User label */}
          <Html position={[0, 0.4, 0]} center>
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="pointer-events-none"
            >
              <div 
                className="px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap shadow-lg"
                style={{ 
                  backgroundColor: cursor.color + '40',
                  borderColor: cursor.color,
                  borderWidth: 1,
                  color: '#fff'
                }}
              >
                {cursor.name}
                {cursor.component && (
                  <span className="opacity-60 ml-1">@ {cursor.component}</span>
                )}
              </div>
            </motion.div>
          </Html>
        </group>
      ))}
    </group>
  );
}