import { useEffect } from 'react';

export function MeteorBackground() {
  useEffect(() => {
    // Only show meteors in dark mode
    const isDarkMode = document.documentElement.classList.contains('dark');
    if (!isDarkMode) {
      return;
    }

    // Add meteor styles to head
    const style = document.createElement('style');
    style.textContent = `
      @keyframes meteorFall {
        0% {
          opacity: 1;
          transform: rotate(45deg) translateY(-100px);
        }
        100% {
          opacity: 0;
          transform: rotate(45deg) translateY(600px);
        }
      }

      .meteor {
        position: fixed;
        width: 2px;
        height: 80px;
        background: linear-gradient(to bottom, #ffffff, rgba(255, 200, 100, 0.8), transparent);
        box-shadow: 0 0 15px rgba(255, 200, 100, 0.8);
        pointer-events: none;
        z-index: 9998;
      }

      .meteor-1 {
        left: 20%;
        top: 10%;
        animation: meteorFall 1.5s linear infinite;
      }

      .meteor-2 {
        left: 50%;
        top: 5%;
        animation: meteorFall 1.8s linear 2s infinite;
      }

      .meteor-3 {
        left: 80%;
        top: 15%;
        animation: meteorFall 1.6s linear 4s infinite;
      }
    `;
    document.head.appendChild(style);

    // Create meteor container
    const container = document.createElement('div');
    container.id = 'meteor-container';
    container.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 9998;
    `;

    // Create 3 meteors
    for (let i = 1; i <= 3; i++) {
      const meteor = document.createElement('div');
      meteor.className = `meteor meteor-${i}`;
      container.appendChild(meteor);
    }

    document.body.appendChild(container);

    // Listen for theme changes
    const observer = new MutationObserver(() => {
      const isDark = document.documentElement.classList.contains('dark');
      container.style.display = isDark ? 'block' : 'none';
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => {
      observer.disconnect();
      container.remove();
      style.remove();
    };
  }, []);

  return null;
}
