'use client';
import { useEffect, useRef } from 'react';

export default function AdCodeRenderer({ adCode, className = '' }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!adCode || !containerRef.current) return;

    const container = containerRef.current;
    container.innerHTML = '';

    const temp = document.createElement('div');
    temp.innerHTML = adCode;

    // Copy non-script nodes
    Array.from(temp.childNodes).forEach(node => {
      if (node.nodeName !== 'SCRIPT') {
        container.appendChild(node.cloneNode(true));
      }
    });

    // Re-create and execute script tags
    Array.from(temp.querySelectorAll('script')).forEach(oldScript => {
      const newScript = document.createElement('script');
      Array.from(oldScript.attributes).forEach(attr => {
        newScript.setAttribute(attr.name, attr.value);
      });
      if (oldScript.innerHTML) {
        newScript.innerHTML = oldScript.innerHTML;
      }
      container.appendChild(newScript);
    });

    return () => {
      container.innerHTML = '';
    };
  }, [adCode]);

  if (!adCode) return null;

  return (
    <div
      ref={containerRef}
      className={`ad-container ${className}`}
      style={{ minHeight: '50px', width: '100%' }}
    />
  );
}