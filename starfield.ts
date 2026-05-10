// 星空背景生成器
export function initializeStarfield() {
  // 只在深色模式下運行
  if (!document.documentElement.classList.contains('dark')) {
    return;
  }

  // 生成隨機星星位置
  function generateRandomStars(count: number = 20) {
    const stars: Array<{ x: number; y: number; size: number; opacity: number }> = [];
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() > 0.7 ? 2 : 1,
        opacity: 0.3 + Math.random() * 0.7,
      });
    }
    return stars;
  }

  // 生成流星
  function generateMeteor() {
    return {
      startX: Math.random() * 100,
      startY: Math.random() * 50,
      endX: Math.random() * 100,
      endY: 50 + Math.random() * 50,
      duration: 1 + Math.random() * 1.5,
      delay: Math.random() * 5,
    };
  }

  // 生成 CSS 變數
  function generateStarCSS() {
    const stars = generateRandomStars(25);
    const meteors = Array.from({ length: 3 }, generateMeteor);

    let css = ':root.dark {\n';

    // 星星 CSS 變數
    stars.forEach((star, index) => {
      css += `  --star-${index}-x: ${star.x}%;\n`;
      css += `  --star-${index}-y: ${star.y}%;\n`;
      css += `  --star-${index}-size: ${star.size}px;\n`;
      css += `  --star-${index}-opacity: ${star.opacity};\n`;
    });

    // 流星 CSS 變數
    meteors.forEach((meteor, index) => {
      css += `  --meteor-${index}-start-x: ${meteor.startX}%;\n`;
      css += `  --meteor-${index}-start-y: ${meteor.startY}%;\n`;
      css += `  --meteor-${index}-end-x: ${meteor.endX}%;\n`;
      css += `  --meteor-${index}-end-y: ${meteor.endY}%;\n`;
      css += `  --meteor-${index}-duration: ${meteor.duration}s;\n`;
      css += `  --meteor-${index}-delay: ${meteor.delay}s;\n`;
    });

    css += '}\n';

    // 星星背景
    css += 'html.dark body {\n';
    css += '  background: \n';

    // 添加星星
    stars.forEach((_, index) => {
      css += `    radial-gradient(var(--star-${index}-size) var(--star-${index}-size) at var(--star-${index}-x) var(--star-${index}-y), rgba(255, 255, 255, var(--star-${index}-opacity)), rgba(255, 255, 255, 0)),\n`;
    });

    // 添加流星
    meteors.forEach((_, index) => {
      css += `    linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 200, 100, 0.4) 50%, rgba(255, 255, 255, 0) 100%),\n`;
    });

    // 添加背景漸層
    css += `    linear-gradient(
      135deg,
      oklch(0.12 0.04 280) 0%,
      oklch(0.14 0.04 260) 30%,
      oklch(0.16 0.04 240) 70%,
      oklch(0.14 0.04 200) 100%
    ) !important;
  background-attachment: fixed !important;
  background-size: `;

    // 背景尺寸
    stars.forEach(() => {
      css += '100% 100%, ';
    });
    meteors.forEach(() => {
      css += '200% 200%, ';
    });
    css += '100% 100%;\n';

    // 背景位置
    css += '  background-position: ';
    stars.forEach(() => {
      css += '0% 0%, ';
    });
    meteors.forEach(() => {
      css += '0% 0%, ';
    });
    css += '0% 0%;\n';

    css += '  animation: starfield 30s ease-in-out infinite;\n';
    css += '}\n';

    // 流星動畫
    css += '@keyframes starfield {\n';
    css += '  0%, 100% { opacity: 1; }\n';
    css += '  50% { opacity: 0.95; }\n';
    css += '}\n';

    // 流星軌跡動畫
    meteors.forEach((_, index) => {
      css += `@keyframes meteor-${index} {\n`;
      css += `  0% { background-position: var(--meteor-${index}-start-x) var(--meteor-${index}-start-y); opacity: 0; }\n`;
      css += `  10% { opacity: 1; }\n`;
      css += `  90% { opacity: 1; }\n`;
      css += `  100% { background-position: var(--meteor-${index}-end-x) var(--meteor-${index}-end-y); opacity: 0; }\n`;
      css += `}\n`;
    });

    return css;
  }

  // 插入 CSS
  const styleId = 'starfield-styles';
  let styleElement = document.getElementById(styleId) as HTMLStyleElement;

  if (!styleElement) {
    styleElement = document.createElement('style');
    styleElement.id = styleId;
    document.head.appendChild(styleElement);
  }

  styleElement.textContent = generateStarCSS();

  // 監聽主題切換
  const observer = new MutationObserver(() => {
    if (document.documentElement.classList.contains('dark')) {
      styleElement.textContent = generateStarCSS();
    }
  });

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  });
}
