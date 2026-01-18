import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function usePageTransition() {
  const location = useLocation();

  useEffect(() => {
    window.dispatchEvent(new Event('pageLoadStart'));
    
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event('pageLoadEnd'));
    }, 300);

    return () => clearTimeout(timer);
  }, [location.pathname]);
}