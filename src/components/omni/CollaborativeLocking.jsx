import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Unlock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function CollaborativeLocking({ blueprintId, componentId, currentUser }) {
  const [locks, setLocks] = useState({});
  const [isLocked, setIsLocked] = useState(false);
  const [lockedBy, setLockedBy] = useState(null);

  useEffect(() => {
    if (!blueprintId || !componentId) return;

    // Simulate real-time lock status
    const interval = setInterval(() => {
      const mockLocks = {
        'component-0': { user: 'alice@team.com', name: 'Alice Chen' },
        'component-1': Math.random() > 0.7 ? { user: 'bob@team.com', name: 'Bob Smith' } : null,
      };
      
      setLocks(mockLocks);
      const lock = mockLocks[`component-${componentId}`];
      
      if (lock) {
        setIsLocked(true);
        setLockedBy(lock);
        if (lock.user !== currentUser?.email) {
          toast.info(`${lock.name} is editing this component`);
        }
      } else {
        setIsLocked(false);
        setLockedBy(null);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [blueprintId, componentId, currentUser]);

  const requestLock = () => {
    if (isLocked && lockedBy?.user !== currentUser?.email) {
      toast.error(`Component locked by ${lockedBy.name}`);
      return false;
    }
    toast.success('Component locked for editing');
    return true;
  };

  const releaseLock = () => {
    toast.info('Lock released');
  };

  return (
    <AnimatePresence>
      {isLocked && lockedBy && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="absolute top-2 right-2 z-20"
        >
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/20 border border-orange-500/40 backdrop-blur-sm">
            <Lock className="w-3 h-3 text-orange-400" />
            <span className="text-orange-300 text-xs">{lockedBy.name}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export { CollaborativeLocking };