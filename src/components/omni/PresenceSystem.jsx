import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, User } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const colors = ['#00f5ff', '#a855f7', '#ec4899', '#f59e0b', '#10b981'];

export default function PresenceSystem({ blueprintId }) {
  const [activeUsers, setActiveUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await base44.auth.me();
        setCurrentUser(user);
      } catch (e) {
        console.error('Failed to load user:', e);
      }
    };
    loadUser();
  }, []);

  useEffect(() => {
    if (!blueprintId || !currentUser) return;

    // Simulate real-time presence updates
    const interval = setInterval(() => {
      const mockUsers = [
        { email: currentUser.email, name: currentUser.full_name, color: colors[0], viewing: null },
        { email: 'alice@team.com', name: 'Alice Chen', color: colors[1], viewing: 'Neural Core' },
        { email: 'bob@team.com', name: 'Bob Smith', color: colors[2], viewing: null },
      ].filter(u => Math.random() > 0.3); // Random presence

      setActiveUsers(mockUsers);
    }, 3000);

    return () => clearInterval(interval);
  }, [blueprintId, currentUser]);

  if (!activeUsers.length) return null;

  return (
    <div className="fixed top-20 right-6 z-40">
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-black/80 backdrop-blur-xl border border-white/20 rounded-xl p-3 min-w-[200px]"
      >
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/10">
          <Eye className="w-4 h-4 text-cyan-400" />
          <span className="text-white text-sm font-medium">Active Now</span>
          <span className="ml-auto text-cyan-400 text-xs">{activeUsers.length}</span>
        </div>

        <div className="space-y-2">
          <AnimatePresence>
            {activeUsers.map((user, index) => (
              <motion.div
                key={user.email}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-2"
              >
                <div
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{ backgroundColor: user.color }}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-white text-xs truncate">{user.name}</div>
                  {user.viewing && (
                    <div className="text-white/40 text-[10px] truncate">
                      Viewing: {user.viewing}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

export function PresenceIndicator({ userId, position, color }) {
  return (
    <motion.group position={position}>
      <mesh>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.6} />
      </mesh>
      <motion.mesh
        position={[0, 0.15, 0]}
        animate={{ y: [0.15, 0.2, 0.15] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <planeGeometry args={[0.3, 0.1]} />
        <meshBasicMaterial color={color} transparent opacity={0.8} />
      </motion.mesh>
    </motion.group>
  );
}