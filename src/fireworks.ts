/**
 * Configuration options for fireworks effect
 */
export interface FireworksConfig {
    /**
     * Intensity level - controls frequency and particle count
     * @default 'medium'
     */
    intensity?: 'low' | 'medium' | 'high';

    /**
     * Z-index for the fireworks container
     * @default 9999
     */
    zIndex?: number;

    /**
     * Disable effect when user has prefers-reduced-motion enabled
     * @default true
     */
    disableOnReducedMotion?: boolean;
}

interface IntensitySettings {
    launchInterval: number;
    particlesPerBurst: number;
}

const INTENSITY_MAP: Record<string, IntensitySettings> = {
    low: { launchInterval: 2000, particlesPerBurst: 50 },
    medium: { launchInterval: 1200, particlesPerBurst: 80 },
    high: { launchInterval: 800, particlesPerBurst: 120 },
};

const COLORS = [
    '#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24',
    '#6c5ce7', '#fd79a8', '#00b894', '#fdcb6e',
    '#ff9ff3', '#54a0ff', '#48dbfb', '#feca57',
];

interface Particle {
    x: number;
    y: number;
    velocityX: number;
    velocityY: number;
    color: string;
    opacity: number;
    life: number;
    maxLife: number;
}

interface Rocket {
    x: number;
    y: number;
    velocityY: number;
    targetY: number;
    color: string;
    trail: { x: number; y: number; opacity: number }[];
}

/**
 * Creates a fireworks effect overlay on the page using Canvas
 * @param config - Configuration options
 * @returns Cleanup function to remove the effect
 */
export function fireworks(config: FireworksConfig = {}): () => void {
    const {
        intensity = 'medium',
        zIndex = 9999,
        disableOnReducedMotion = true,
    } = config;

    // Check for reduced motion preference
    if (disableOnReducedMotion &&
        typeof window !== 'undefined' &&
        window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
        return () => { }; // No-op cleanup
    }

    const settings = INTENSITY_MAP[intensity];

    // Create canvas
    const canvas = document.createElement('canvas');
    canvas.className = 'festive-ui-fireworks';
    canvas.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: ${zIndex};
  `;
    canvas.setAttribute('aria-hidden', 'true');

    const ctx = canvas.getContext('2d');
    if (!ctx) {
        return () => { };
    }

    // Set canvas size
    const resizeCanvas = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const rockets: Rocket[] = [];
    const particles: Particle[] = [];
    let lastLaunch = 0;
    let isVisible = true;

    // Launch a rocket
    const launchRocket = () => {
        const x = Math.random() * canvas.width;
        const targetY = canvas.height * (0.2 + Math.random() * 0.3); // Explode in upper half
        const color = COLORS[Math.floor(Math.random() * COLORS.length)];

        rockets.push({
            x,
            y: canvas.height,
            velocityY: -8 - Math.random() * 4,
            targetY,
            color,
            trail: [],
        });
    };

    // Create explosion
    const explode = (x: number, y: number, color: string) => {
        const burstType = Math.random();

        for (let i = 0; i < settings.particlesPerBurst; i++) {
            let angle: number;
            let speed: number;

            if (burstType < 0.33) {
                // Circular burst
                angle = (Math.PI * 2 * i) / settings.particlesPerBurst;
                speed = 2 + Math.random() * 3;
            } else if (burstType < 0.66) {
                // Random burst
                angle = Math.random() * Math.PI * 2;
                speed = 1 + Math.random() * 4;
            } else {
                // Star pattern
                const points = 8;
                const pointAngle = (Math.PI * 2) / points;
                angle = Math.floor(i / (settings.particlesPerBurst / points)) * pointAngle;
                angle += (Math.random() - 0.5) * 0.3;
                speed = 2 + Math.random() * 2;
            }

            particles.push({
                x,
                y,
                velocityX: Math.cos(angle) * speed,
                velocityY: Math.sin(angle) * speed,
                color,
                opacity: 1,
                life: 1,
                maxLife: 60 + Math.random() * 40,
            });
        }
    };

    let animationId: number;

    // Animation loop
    const animate = (timestamp: number) => {
        if (!isVisible) {
            animationId = requestAnimationFrame(animate);
            return;
        }

        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Launch new rocket
        if (timestamp - lastLaunch > settings.launchInterval) {
            launchRocket();
            lastLaunch = timestamp;
        }

        // Update and draw rockets
        for (let i = rockets.length - 1; i >= 0; i--) {
            const rocket = rockets[i];
            rocket.y += rocket.velocityY;

            // Add trail
            rocket.trail.push({ x: rocket.x, y: rocket.y, opacity: 1 });
            if (rocket.trail.length > 15) {
                rocket.trail.shift();
            }

            // Draw trail
            rocket.trail.forEach((point, idx) => {
                const opacity = (idx / rocket.trail.length) * 0.6;
                ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
                ctx.fillRect(point.x - 1, point.y - 1, 2, 2);
            });

            // Draw rocket
            ctx.fillStyle = rocket.color;
            ctx.fillRect(rocket.x - 2, rocket.y - 4, 4, 8);

            // Explode when reaching target
            if (rocket.y <= rocket.targetY) {
                explode(rocket.x, rocket.y, rocket.color);
                rockets.splice(i, 1);
            }
        }

        // Update and draw particles
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];

            // Apply gravity
            p.velocityY += 0.05;
            p.x += p.velocityX;
            p.y += p.velocityY;
            p.life++;

            // Fade out
            p.opacity = 1 - (p.life / p.maxLife);

            // Draw particle
            ctx.globalAlpha = p.opacity;
            ctx.fillStyle = p.color;
            ctx.fillRect(p.x - 2, p.y - 2, 4, 4);

            // Remove dead particles
            if (p.life >= p.maxLife) {
                particles.splice(i, 1);
            }
        }

        ctx.globalAlpha = 1;
        animationId = requestAnimationFrame(animate);
    };

    // Handle tab visibility
    const handleVisibilityChange = () => {
        isVisible = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Add to DOM and start animation
    document.body.appendChild(canvas);
    animationId = requestAnimationFrame(animate);

    // Return cleanup function
    return () => {
        cancelAnimationFrame(animationId);
        window.removeEventListener('resize', resizeCanvas);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        canvas.remove();
    };
}
