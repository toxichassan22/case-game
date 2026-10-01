/**
 * Advanced Animations System
 * Premium micro-interactions and transitions
 */

export interface AnimationConfig {
  duration?: number;
  easing?: string;
  delay?: number;
  iterations?: number;
}

export class AnimationEngine {
  /**
   * Animate element entrance
   */
  static animateEntrance(
    element: HTMLElement,
    type: 'fade' | 'slide' | 'scale' | 'bounce' | 'flip' = 'fade',
    config?: AnimationConfig
  ) {
    const { duration = 400, easing = 'cubic-bezier(0.4, 0, 0.2, 1)', delay = 0 } = config || {};

    element.style.opacity = '0';
    element.style.transform = this.getInitialTransform(type);
    element.style.transition = `all ${duration}ms ${easing} ${delay}ms`;

    requestAnimationFrame(() => {
      element.style.opacity = '1';
      element.style.transform = 'translate(0, 0) scale(1) rotate(0deg)';
    });
  }

  /**
   * Animate element exit
   */
  static animateExit(
    element: HTMLElement,
    type: 'fade' | 'slide' | 'scale' | 'bounce' | 'flip' = 'fade',
    config?: AnimationConfig
  ): Promise<void> {
    const { duration = 300, easing = 'cubic-bezier(0.4, 0, 0.2, 1)' } = config || {};

    element.style.transition = `all ${duration}ms ${easing}`;
    element.style.opacity = '0';
    element.style.transform = this.getExitTransform(type);

    return new Promise(resolve => {
      setTimeout(() => resolve(), duration);
    });
  }

  /**
   * Stagger animation for multiple elements
   */
  static staggerAnimate(
    elements: HTMLElement[],
    type: 'fade' | 'slide' | 'scale' = 'fade',
    staggerDelay: number = 100,
    config?: AnimationConfig
  ) {
    elements.forEach((element, index) => {
      this.animateEntrance(element, type, {
        ...config,
        delay: (config?.delay || 0) + index * staggerDelay,
      });
    });
  }

  /**
   * Pulse animation
   */
  static pulse(element: HTMLElement, config?: AnimationConfig) {
    const { duration = 1000, iterations = 1 } = config || {};

    element.style.animation = `pulse ${duration}ms ease-in-out ${iterations}`;
  }

  /**
   * Shake animation for errors
   */
  static shake(element: HTMLElement) {
    element.style.animation = 'shake 0.5s cubic-bezier(.36,.07,.19,.97) both';
    
    setTimeout(() => {
      element.style.animation = '';
    }, 500);
  }

  /**
   * Bounce animation
   */
  static bounce(element: HTMLElement) {
    element.style.animation = 'bounce 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
    
    setTimeout(() => {
      element.style.animation = '';
    }, 600);
  }

  /**
   * Smooth scroll to element
   */
  static scrollTo(element: HTMLElement, options?: ScrollIntoViewOptions) {
    element.scrollIntoView({ behavior: 'smooth', ...options });
  }

  /**
   * Parallax effect
   */
  static parallax(element: HTMLElement, scrollPosition: number, speed: number = 0.5) {
    const yPos = scrollPosition * speed;
    element.style.transform = `translateY(${yPos}px)`;
  }

  /**
   * Morph between two states
   */
  static morph(element: HTMLElement, fromStyles: any, toStyles: any, duration: number = 400) {
    Object.assign(element.style, fromStyles);
    element.style.transition = `all ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
    
    requestAnimationFrame(() => {
      Object.assign(element.style, toStyles);
    });
  }

  /**
   * Get initial transform based on animation type
   */
  private static getInitialTransform(type: string): string {
    switch (type) {
      case 'fade':
        return 'translate(0, 0) scale(1)';
      case 'slide':
        return 'translate(0, 30px) scale(1)';
      case 'scale':
        return 'translate(0, 0) scale(0.8)';
      case 'bounce':
        return 'translate(0, -30px) scale(1)';
      case 'flip':
        return 'translate(0, 0) scale(1) rotateX(90deg)';
      default:
        return 'translate(0, 0) scale(1)';
    }
  }

  /**
   * Get exit transform based on animation type
   */
  private static getExitTransform(type: string): string {
    switch (type) {
      case 'fade':
        return 'translate(0, 0) scale(1)';
      case 'slide':
        return 'translate(0, -30px) scale(1)';
      case 'scale':
        return 'translate(0, 0) scale(0.8)';
      case 'bounce':
        return 'translate(0, 30px) scale(1)';
      case 'flip':
        return 'translate(0, 0) scale(1) rotateX(-90deg)';
      default:
        return 'translate(0, 0) scale(1)';
    }
  }
}

// CSS Keyframes to inject
export const animationKeyframes = `
@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

@keyframes shake {
  10%, 90% { transform: translate3d(-1px, 0, 0); }
  20%, 80% { transform: translate3d(2px, 0, 0); }
  30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
  40%, 60% { transform: translate3d(4px, 0, 0); }
}

@keyframes bounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

@keyframes shimmer {
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

@keyframes glow {
  0%, 100% { box-shadow: 0 0 5px rgba(102, 126, 234, 0.5); }
  50% { box-shadow: 0 0 20px rgba(102, 126, 234, 0.8), 0 0 30px rgba(102, 126, 234, 0.6); }
}

@keyframes spin-slow {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes slide-in-right {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

@keyframes slide-in-left {
  from { transform: translateX(-100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

@keyframes slide-in-up {
  from { transform: translateY(100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes slide-in-down {
  from { transform: translateY(-100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
`;

// Inject keyframes on module load
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = animationKeyframes;
  document.head.appendChild(style);
}
