/**
 * Animated Background Component
 * Particles, gradients, and dynamic backgrounds
 */

import React, { useEffect, useRef } from 'react';
import '../styles/AnimatedBackground.css';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
}

interface AnimatedBackgroundProps {
  type?: 'particles' | 'gradient' | 'mesh' | 'waves';
  className?: string;
  color1?: string;
  color2?: string;
  color3?: string;
  particleCount?: number;
}

const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({
  type = 'particles',
  className = '',
  color1 = '#667eea',
  color2 = '#764ba2',
  color3 = '#f093fb',
  particleCount = 50,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (type !== 'particles' || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Particle[] = [];

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 1,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.5 + 0.2,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      particles.forEach((particle, index) => {
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        // Wrap around edges
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(102, 126, 234, ${particle.opacity})`;
        ctx.fill();

        // Draw connections
        for (let j = index + 1; j < particles.length; j++) {
          const dx = particles[j].x - particle.x;
          const dy = particles[j].y - particle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 150) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(102, 126, 234, ${0.1 * (1 - distance / 150)})`;
            ctx.lineWidth = 1;
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      });

      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [type, particleCount]);

  if (type === 'particles') {
    return (
      <canvas
        ref={canvasRef}
        className={`animated-background animated-particles ${className}`}
      />
    );
  }

  if (type === 'gradient') {
    return (
      <div
        className={`animated-background animated-gradient ${className}`}
        style={{
          background: `linear-gradient(135deg, ${color1}, ${color2}, ${color3})`,
        }}
      />
    );
  }

  if (type === 'mesh') {
    return (
      <div
        className={`animated-background animated-mesh ${className}`}
        style={{
          background: `
            radial-gradient(at 40% 20%, ${color1} 0px, transparent 50%),
            radial-gradient(at 80% 0%, ${color2} 0px, transparent 50%),
            radial-gradient(at 0% 50%, ${color3} 0px, transparent 50%),
            radial-gradient(at 80% 50%, ${color1} 0px, transparent 50%),
            radial-gradient(at 0% 100%, ${color2} 0px, transparent 50%),
            radial-gradient(at 80% 100%, ${color3} 0px, transparent 50%)
          `,
        }}
      />
    );
  }

  // Default: waves
  return (
    <div className={`animated-background animated-waves ${className}`}>
      <div className="wave wave1" />
      <div className="wave wave2" />
      <div className="wave wave3" />
    </div>
  );
};

export default AnimatedBackground;
