/**
 * Configuration options for gulaal (Holi colors) effect
 */
export interface GulaalConfig {
    /**
     * Intensity level - controls burst frequency and particle count
     * @default 'medium'
     */
    intensity?: 'low' | 'medium' | 'high';

    /**
     * Z-index for the gulaal container
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
    burstInterval: number;
    particlesPerBurst: number;
}

const INTENSITY_MAP: Record<string, IntensitySettings> = {
    low: { burstInterval: 2500, particlesPerBurst: 100 },
    medium: { burstInterval: 1800, particlesPerBurst: 150 },
    high: { burstInterval: 1200, particlesPerBurst: 200 },
};

const GULAAL_COLORS = [
    '#ff1493', // magenta/pink
    '#ff69b4', // hot pink
    '#ffff00', // yellow
    '#00ff00', // green
    '#ff8c00', // orange
    '#9370db', // purple
    '#00bfff', // blue
    '#ff4500', // red-orange
];

interface Particle {
    x: number;
    y: number;
    velocityX: number;
    velocityY: number;
    color: string;
    opacity: number;
    size: number;
    life: number;
    maxLife: number;
}

/**
 * Creates a gulaal (Holi colors) effect overlay on the page using Canvas
 * @param config - Configuration options
 * @returns Cleanup function to remove the effect
 */
export function gulaal(config: GulaalConfig = {}): () => void {
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
    canvas.className = 'festive-ui-gulaal';
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

    const particles: Particle[] = [];
    let lastBurst = 0;
    let isVisible = true;

    // Create a powder burst
    const createBurst = () => {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const color = GULAAL_COLORS[Math.floor(Math.random() * GULAAL_COLORS.length)];

        for (let i = 0; i < settings.particlesPerBurst; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1 + Math.random() * 4;

            particles.push({
                x,
                y,
                velocityX: Math.cos(angle) * speed,
                velocityY: Math.sin(angle) * speed,
                color,
                opacity: 0.8,
                size: 3 + Math.random() * 5,
                life: 0,
                maxLife: 80 + Math.random() * 60,
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

        // Fade background instead of clearing for powder cloud effect
        ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Create new burst
        if (timestamp - lastBurst > settings.burstInterval) {
            createBurst();
            lastBurst = timestamp;
        }

        // Update and draw particles
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];

            // Apply drag/settling
            p.velocityX *= 0.98;
            p.velocityY *= 0.98;
            p.velocityY += 0.02; // Slight gravity

            p.x += p.velocityX;
            p.y += p.velocityY;
            p.life++;

            // Fade out based on life
            p.opacity = (1 - p.life / p.maxLife) * 0.8;

            // Draw powder particle with soft edges
            ctx.globalAlpha = p.opacity;
            const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
            gradient.addColorStop(0, p.color);
            gradient.addColorStop(1, 'transparent');
            ctx.fillStyle = gradient;
            ctx.fillRect(p.x - p.size, p.y - p.size, p.size * 2, p.size * 2);

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

    // Clear canvas initially
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    animationId = requestAnimationFrame(animate);

    // Return cleanup function
    return () => {
        cancelAnimationFrame(animationId);
        window.removeEventListener('resize', resizeCanvas);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        canvas.remove();
    };
}
