import { useEffect } from 'react';
import { useAvatar } from './AvatarContext';
import { useLocation } from 'react-router-dom';

export default function AnimationController() {
  const { updateAnimationForHub, setAnimationState } = useAvatar();
  const location = useLocation();

  // Detect hub/page transitions
  useEffect(() => {
    const path = location.pathname;
    const hubName = path.split('/')[1] || 'home';
    
    updateAnimationForHub(hubName);
  }, [location, updateAnimationForHub]);

  // Listen for custom animation events
  useEffect(() => {
    const handleCustomAnimation = (event) => {
      if (event.detail?.animation) {
        setAnimationState(event.detail.animation);
      }
    };

    window.addEventListener('triggerAvatarAnimation', handleCustomAnimation);
    return () => window.removeEventListener('triggerAvatarAnimation', handleCustomAnimation);
  }, [setAnimationState]);

  return null; // This is a controller component with no UI
}

// Utility function to trigger animations from anywhere in the app
export function triggerAvatarAnimation(animationName) {
  window.dispatchEvent(
    new CustomEvent('triggerAvatarAnimation', {
      detail: { animation: animationName }
    })
  );
}