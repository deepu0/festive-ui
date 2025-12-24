/**
 * Configuration options for hearts effect
 */
export interface HeartsConfig {
    /**
     * Intensity level - controls particle count and speed
     * @default 'medium'
     */
    intensity?: 'low' | 'medium' | 'high';

    /**
     * Z-index for the hearts container
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
    minSpeed: number;
    maxSpeed: number;
}

const INTENSITY_MAP: Record<string, IntensitySettings> = {
    low: { count: 15, minSpeed: 0.3, maxSpeed: 0.6 },
    medium: { count: 30, minSpeed: 0.4, maxSpeed: 0.8 },
    high: { count: 50, minSpeed: 0.5, maxSpeed: 1.0 },
};

const COLORS = [
    '#ff6b9d', // pink
    '#ff1744', // red
    '#ff4081', // hot pink
    '#f50057', // deep pink
];

interface Particle {
    x: number;
    y: number;
    size: number;
    speed: number;
    offset: number; // For sine wave motion
    color: string;
    opacity: number;
    pulsePhase: number;
}

/**
 * Creates a hearts effect overlay on the page using Canvas
 * @param config - Configuration options
 * @returns Cleanup function to remove the effect
 */
export function hearts(config: HeartsConfig = {}): () => void {
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
    canvas.className = 'festive-ui-hearts';
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

    // Helper function to draw heart shape
    const drawHeart = (x: number, y: number, size: number) => {
        ctx.beginPath();
        const topCurveHeight = size * 0.3;
        ctx.moveTo(x, y + topCurveHeight);
        // Left curve
        ctx.bezierCurveTo(
            x, y,
            x - size / 2, y,
            x - size / 2, y + topCurveHeight
        );
        ctx.bezierCurveTo(
            x - size / 2, y + (size + topCurveHeight) / 2,
            x, y + (size + topCurveHeight) / 2,
            x, y + size
        );
        // Right curve
        ctx.bezierCurveTo(
            x, y + (size + topCurveHeight) / 2,
            x + size / 2, y + (size + topCurveHeight) / 2,
            x + size / 2, y + topCurveHeight
        );
        ctx.bezierCurveTo(
            x + size / 2, y,
            x, y,
            x, y + topCurveHeight
        );
        ctx.closePath();
        ctx.fill();
    };

    // Create particles
    const particles: Particle[] = [];
    for (let i = 0; i < settings.count; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: canvas.height + Math.random() * 100, // Start below screen
            size: Math.random() * 8 + 8, // 8-16px
            speed: Math.random() * (settings.maxSpeed - settings.minSpeed) + settings.minSpeed,
            offset: Math.random() * Math.PI * 2,
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
            opacity: Math.random() * 0.3 + 0.5, // 0.5-0.8
            pulsePhase: Math.random() * Math.PI * 2,
        });
    }

    let animationId: number;
    let isVisible = true;
    let time = 0;

    // Animation loop
    const animate = () => {
        if (!isVisible) {
            animationId = requestAnimationFrame(animate);
            return;
        }

        time += 0.016; // ~60fps
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach(particle => {
            // Update position - float upward with sine wave
            particle.y -= particle.speed;
            const sineWave = Math.sin(time * 2 + particle.offset) * 20;
            const currentX = particle.x + sineWave;

            // Pulse scale
            particle.pulsePhase += 0.05;
            const scale = 0.9 + Math.sin(particle.pulsePhase) * 0.1; // 0.9x to 1.1x

            // Fade out near top
            let opacity = particle.opacity;
            if (particle.y < canvas.height * 0.2) {
                opacity = particle.opacity * (particle.y / (canvas.height * 0.2));
            }

            // Reset particle when it goes off screen
            if (particle.y < -50) {
                particle.y = canvas.height + Math.random() * 100;
                particle.x = Math.random() * canvas.width;
            }

            // Draw heart
            ctx.save();
            ctx.globalAlpha = opacity;
            ctx.fillStyle = particle.color;
            drawHeart(currentX, particle.y, particle.size * scale);
            ctx.restore();
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
