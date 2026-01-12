import React, { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { base44 } from '@/api/base44Client';
import * as THREE from 'three';

export default function AgentGestureSystem({ agentId, gestureQueue }) {
  const [currentGesture, setCurrentGesture] = useState(null);
  const [gestureProgress, setGestureProgress] = useState(0);
  const gestureRef = useRef();
  const timeRef = useRef(0);

  useEffect(() => {
    if (gestureQueue && gestureQueue.length > 0 && !currentGesture) {
      processNextGesture();
    }
  }, [gestureQueue, currentGesture]);

  const processNextGesture = async () => {
    if (!gestureQueue || gestureQueue.length === 0) return;

    const nextGesture = gestureQueue[0];
    setCurrentGesture(nextGesture);
    setGestureProgress(0);
    timeRef.current = 0;

    // Remove the gesture from queue after processing
    setTimeout(async () => {
      try {
        const appearances = await base44.entities.AgentAppearance.filter({ agent_id: agentId });
        if (appearances.length > 0) {
          const appearance = appearances[0];
          const updatedQueue = gestureQueue.slice(1);
          await base44.entities.AgentAppearance.update(appearance.id, {
            gesture_queue: updatedQueue
          });
          setCurrentGesture(null);
        }
      } catch (error) {
        console.error('Error updating gesture queue:', error);
      }
    }, getGestureDuration(nextGesture.gesture_type) * 1000);
  };

  const getGestureDuration = (gestureType) => {
    const durations = {
      wave: 2,
      nod: 1,
      celebrate: 3,
      point: 1.5,
      thumbsup: 1.5,
      clap: 2
    };
    return durations[gestureType] || 2;
  };

  useFrame((state, delta) => {
    if (currentGesture) {
      timeRef.current += delta;
      const duration = getGestureDuration(currentGesture.gesture_type);
      const progress = Math.min(timeRef.current / duration, 1);
      setGestureProgress(progress);

      if (gestureRef.current) {
        applyGestureAnimation(currentGesture.gesture_type, progress);
      }
    }
  });

  const applyGestureAnimation = (gestureType, progress) => {
    if (!gestureRef.current) return;

    const easeInOut = (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    const smoothProgress = easeInOut(progress);

    switch (gestureType) {
      case 'wave':
        gestureRef.current.rotation.z = Math.sin(smoothProgress * Math.PI * 4) * 0.5;
        gestureRef.current.position.y = Math.sin(smoothProgress * Math.PI * 2) * 0.2;
        break;
      case 'nod':
        gestureRef.current.rotation.x = Math.sin(smoothProgress * Math.PI * 2) * 0.3;
        break;
      case 'celebrate':
        gestureRef.current.position.y = Math.abs(Math.sin(smoothProgress * Math.PI * 3)) * 0.5;
        gestureRef.current.rotation.y = smoothProgress * Math.PI * 2;
        break;
      case 'point':
        gestureRef.current.rotation.x = -0.5 + Math.sin(smoothProgress * Math.PI) * 0.3;
        break;
      case 'thumbsup':
        gestureRef.current.rotation.z = Math.sin(smoothProgress * Math.PI) * 0.3;
        gestureRef.current.position.y = Math.sin(smoothProgress * Math.PI) * 0.2;
        break;
      case 'clap':
        gestureRef.current.position.x = Math.sin(smoothProgress * Math.PI * 6) * 0.1;
        break;
      default:
        break;
    }
  };

  return (
    <group ref={gestureRef}>
      {/* Visual indicator for active gesture */}
      {currentGesture && (
        <mesh position={[0, 2.5, 0]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial
            color={gestureProgress < 0.5 ? '#00ffff' : '#ff00ff'}
            emissive={gestureProgress < 0.5 ? '#00ffff' : '#ff00ff'}
            emissiveIntensity={0.5}
          />
        </mesh>
      )}
    </group>
  );
}