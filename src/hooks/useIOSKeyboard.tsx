import { useState, useEffect } from 'react';

interface UseIOSKeyboardReturn {
  keyboardHeight: number;
  isKeyboardVisible: boolean;
}

export const useIOSKeyboard = (): UseIOSKeyboardReturn => {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    // Check if we're on iOS and if the Visual Viewport API is available
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const hasVisualViewport = window.visualViewport;

    if (!isIOS || !hasVisualViewport) {
      return;
    }

    const handleViewportChange = () => {
      const viewport = window.visualViewport!;
      const windowHeight = window.innerHeight;
      const viewportHeight = viewport.height;
      const heightDifference = windowHeight - viewportHeight;

      // Consider keyboard visible if viewport height is significantly smaller than window height
      const isVisible = heightDifference > 150; // 150px threshold to account for UI chrome changes
      
      setIsKeyboardVisible(isVisible);
      setKeyboardHeight(isVisible ? heightDifference : 0);
    };

    // Listen to viewport changes
    window.visualViewport.addEventListener('resize', handleViewportChange);
    window.visualViewport.addEventListener('scroll', handleViewportChange);

    // Initial check
    handleViewportChange();

    // Cleanup
    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleViewportChange);
        window.visualViewport.removeEventListener('scroll', handleViewportChange);
      }
    };
  }, []);

  return { keyboardHeight, isKeyboardVisible };
};