/**
 * Configuration options for confetti effect
 */
export interface ConfettiConfig {
    /**
     * Intensity level - controls particle count and speed
     * @default 'medium'
     */
    intensity?: 'low' | 'medium' | 'high';

    /**
     * Z-index for the confetti container
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
    low: { count: 30 },
    medium: { count: 60 },
    high: { count: 100 },
};

const COLORS = [
    '#ff6b6b', // red
    '#4ecdc4', // teal
    '#45b7d1', // blue
    '#f9ca24', // yellow
    '#6c5ce7', // purple
    '#fd79a8', // pink
    '#00b894', // green
    '#fdcb6e', // orange
];

interface Particle {
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
    rotation: number;
    rotationSpeed: number;
    velocityX: number;
    velocityY: number;
    gravity: number;
    opacity: number;
    isCircle: boolean;
}

/**
 * Creates a confetti effect overlay on the page using Canvas
 * @param config - Configuration options
 * @returns Cleanup function to remove the effect
 */
export function confetti(config: ConfettiConfig = {}): () => void {
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
    canvas.className = 'festive-ui-confetti';
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

    // Create particles
    const particles: Particle[] = [];
    for (let i = 0; i < settings.count; i++) {
        const isCircle = Math.random() < 0.3; // 30% circles, 70% rectangles
        particles.push({
            x: Math.random() * canvas.width,
            y: -20 - Math.random() * 100, // Start above screen
            width: Math.random() * 4 + 4, // 4-8px
            height: isCircle ? 0 : Math.random() * 6 + 4, // 4-10px for rectangles
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.2,
            velocityX: (Math.random() - 0.5) * 3,
            velocityY: Math.random() * -3 - 2, // Initial upward burst
            gravity: 0.15,
            opacity: 1,
            isCircle,
        });
    }

    let animationId: number;
    let isVisible = true;

    // Animation loop
    const animate = () => {
        if (!isVisible) {
            animationId = requestAnimationFrame(animate);
            return;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach(particle => {
            // Apply physics
            particle.velocityY += particle.gravity;
            particle.x += particle.velocityX;
            particle.y += particle.velocityY;
            particle.rotation += particle.rotationSpeed;

            // Fade out near bottom
            if (particle.y > canvas.height * 0.8) {
                particle.opacity = Math.max(0, 1 - (particle.y - canvas.height * 0.8) / (canvas.height * 0.2));
            }

            // Reset particle when it goes off screen
            if (particle.y > canvas.height + 20) {
                particle.y = -20 - Math.random() * 100;
                particle.x = Math.random() * canvas.width;
                particle.velocityY = Math.random() * -3 - 2;
                particle.velocityX = (Math.random() - 0.5) * 3;
                particle.opacity = 1;
            }

            // Draw particle
            ctx.save();
            ctx.translate(particle.x, particle.y);
            ctx.rotate(particle.rotation);
            ctx.globalAlpha = particle.opacity;
            ctx.fillStyle = particle.color;

            if (particle.isCircle) {
                ctx.beginPath();
                ctx.arc(0, 0, particle.width / 2, 0, Math.PI * 2);
                ctx.fill();
            } else {
                ctx.fillRect(-particle.width / 2, -particle.height / 2, particle.width, particle.height);
            }

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
