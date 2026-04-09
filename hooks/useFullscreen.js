import { useCallback, useRef } from 'react';

export function useFullscreen() {
  const elementRef = useRef(null);

  const toggleFullscreen = useCallback(() => {
    const elem = elementRef.current;
    if (!elem) return;
    if (!document.fullscreenElement) {
      elem.requestFullscreen().catch(err => console.error(err));
    } else {
      document.exitFullscreen();
    }
  }, []);

  return { elementRef, toggleFullscreen };
}