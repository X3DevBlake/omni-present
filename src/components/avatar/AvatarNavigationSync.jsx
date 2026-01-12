import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAvatar } from './AvatarContext';

// This component syncs avatar animations with navigation events
export default function AvatarNavigationSync() {
  const location = useLocation();
  const { setAnimation, avatarData } = useAvatar();

  useEffect(() => {
    if (!avatarData) return;

    // Trigger walking animation on navigation
    setAnimation('walking');

    // Return to idle after transition
    const timer = setTimeout(() => {
      setAnimation('idle');
    }, 1500);

    return () => clearTimeout(timer);
  }, [location.pathname, avatarData, setAnimation]);

  return null;
}