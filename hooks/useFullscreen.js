import { useCallback, useRef } from 'react';

export function useFullscreen() {
  const elementRef = useRef(null);

  const toggleFullscreen = useCallback(() => {
    const elem = elementRef.current;
    if (!elem) return;
    if (!document.fullscreenElement) {
      elem.requestFullscreen().catch(err => console.error(err));
      // Add styles to fill fullscreen
      elem.style.position = 'fixed';
      elem.style.top = '0';
      elem.style.left = '0';
      elem.style.width = '100vw';
      elem.style.height = '100vh';
      elem.style.zIndex = '9999';
      elem.style.overflow = 'auto';
      elem.style.backgroundColor = '#000';
    } else {
      document.exitFullscreen();
      // Reset styles
      elem.style.position = '';
      elem.style.top = '';
      elem.style.left = '';
      elem.style.width = '';
      elem.style.height = '';
      elem.style.zIndex = '';
      elem.style.backgroundColor = '';
    }
  }, []);

  return { elementRef, toggleFullscreen };
}