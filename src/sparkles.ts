/**
 * Configuration options for sparkles effect
 */
export interface SparklesConfig {
    /**
     * Intensity level - controls particle count
     * @default 'medium'
     */
    intensity?: 'low' | 'medium' | 'high';

    /**
     * Z-index for the sparkles container
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
    count: number;
}

const INTENSITY_MAP: Record<string, IntensitySettings> = {
    low: { count: 20 },
    medium: { count: 40 },
    high: { count: 70 },
};

const COLORS = [
    '#FFD700', // gold
    '#FFF700', // bright yellow
    '#FFFFFF', // white
];

interface Particle {
    x: number;
    y: number;
    size: number;
    color: string;
    life: number; // 0 to 1
    maxLife: number; // Total lifecycle in seconds
    age: number; // Current age in seconds
}

/**
 * Creates a sparkles effect overlay on the page using Canvas
 * @param config - Configuration options
 * @returns Cleanup function to remove the effect
 */
export function sparkles(config: SparklesConfig = {}): () => void {
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
    canvas.className = 'festive-ui-sparkles';
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

    // Helper function to draw star/sparkle shape
    const drawStar = (x: number, y: number, size: number, opacity: number, color: string) => {
        ctx.save();
        ctx.globalAlpha = opacity;
        ctx.fillStyle = color;

        // Draw 4-point star (plus shape with tapered ends)
        ctx.beginPath();
        // Horizontal beam
        ctx.moveTo(x - size, y);
        ctx.lineTo(x - size * 0.3, y - size * 0.15);
        ctx.lineTo(x + size * 0.3, y - size * 0.15);
        ctx.lineTo(x + size, y);
        ctx.lineTo(x + size * 0.3, y + size * 0.15);
        ctx.lineTo(x - size * 0.3, y + size * 0.15);
        ctx.closePath();
        ctx.fill();

        // Vertical beam
        ctx.beginPath();
        ctx.moveTo(x, y - size);
        ctx.lineTo(x + size * 0.15, y - size * 0.3);
        ctx.lineTo(x + size * 0.15, y + size * 0.3);
        ctx.lineTo(x, y + size);
        ctx.lineTo(x - size * 0.15, y + size * 0.3);
        ctx.lineTo(x - size * 0.15, y - size * 0.3);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    };

    // Create initial particles
    const createParticle = (): Particle => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 3, // 3-6px
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        life: 0,
        maxLife: Math.random() * 1 + 1.5, // 1.5-2.5 seconds
        age: 0,
    });

    const particles: Particle[] = [];
    for (let i = 0; i < settings.count; i++) {
        const particle = createParticle();
        // Stagger initial spawn times
        particle.age = Math.random() * particle.maxLife;
        particles.push(particle);
    }

    let animationId: number;
    let isVisible = true;
    const deltaTime = 0.016; // ~60fps

    // Animation loop
    const animate = () => {
        if (!isVisible) {
            animationId = requestAnimationFrame(animate);
            return;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach(particle => {
            // Update age and lifecycle
            particle.age += deltaTime;
            particle.life = particle.age / particle.maxLife;

            // Respawn particle if it's too old
            if (particle.life >= 1) {
                Object.assign(particle, createParticle());
            }

            // Calculate opacity with fade in/out
            let opacity: number;
            if (particle.life < 0.1) {
                // Fade in (first 10%)
                opacity = particle.life / 0.1;
            } else if (particle.life > 0.8) {
                // Fade out (last 20%)
                opacity = (1 - particle.life) / 0.2;
            } else {
                // Peak visibility with twinkle
                const twinkle = Math.sin(particle.life * Math.PI * 8) * 0.2;
                opacity = 0.8 + twinkle;
            }

            // Scale pulse
            const scalePulse = 1 + Math.sin(particle.life * Math.PI * 4) * 0.3;

            // Draw sparkle
            drawStar(
                particle.x,
                particle.y,
                particle.size * scalePulse,
                opacity,
                particle.color
            );
        });

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
