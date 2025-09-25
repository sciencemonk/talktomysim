import { useState, useEffect } from 'react';

interface UseIOSKeyboardReturn {
  isKeyboardVisible: boolean;
  viewportHeight: number;
}

export const useIOSKeyboard = (): UseIOSKeyboardReturn => {
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);

  useEffect(() => {
    // Check if we're on a mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (!isMobile) {
      return;
    }

    const handleResize = () => {
      const currentHeight = window.innerHeight;
      const initialHeight = window.screen.height;
      
      // If the current height is significantly smaller than initial, keyboard is likely visible
      const keyboardVisible = currentHeight < initialHeight * 0.75;
      
      setIsKeyboardVisible(keyboardVisible);
      setViewportHeight(currentHeight);
    };

    const handleVisualViewportChange = () => {
      if (window.visualViewport) {
        const viewport = window.visualViewport;
        const keyboardVisible = viewport.height < window.innerHeight * 0.75;
        
        setIsKeyboardVisible(keyboardVisible);
        setViewportHeight(viewport.height);
      }
    };

    // Use Visual Viewport API if available (better for iOS)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleVisualViewportChange);
      handleVisualViewportChange(); // Initial check
      
      return () => {
        if (window.visualViewport) {
          window.visualViewport.removeEventListener('resize', handleVisualViewportChange);
        }
      };
    } else {
      // Fallback to window resize
      window.addEventListener('resize', handleResize);
      handleResize(); // Initial check
      
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }
  }, []);

  return { isKeyboardVisible, viewportHeight };
};