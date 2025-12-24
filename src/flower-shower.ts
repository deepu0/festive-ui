/**
 * Configuration options for flower shower effect
 */
export interface FlowerShowerConfig {
    /**
     * Intensity level - controls petal count
     * @default 'medium'
     */
    intensity?: 'low' | 'medium' | 'high';

    /**
     * Z-index for the flower shower container
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
    high: { count: 60 },
};

const PETAL_COLORS = [
    '#ff6b35', // marigold orange
    '#f7931e', // bright orange
    '#ffa500', // orange
    '#ff0000', // red rose
    '#dc143c', // crimson
    '#ffffff', // jasmine white
    '#fffacd', // light yellow
    '#ffd700', // golden
];

interface Petal {
    x: number;
    y: number;
    rotation: number;
    rotationSpeed: number;
    swayOffset: number;
    swaySpeed: number;
    fallSpeed: number;
    color: string;
    size: number;
    opacity: number;
    type: 'marigold' | 'rose' | 'jasmine';
}

/**
 * Creates a flower shower effect overlay on the page using Canvas
 * @param config - Configuration options
 * @returns Cleanup function to remove the effect
 */
export function flowerShower(config: FlowerShowerConfig = {}): () => void {
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
    canvas.className = 'festive-ui-flower-shower';
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

    // Create petals
    const petals: Petal[] = [];
    const types: ('marigold' | 'rose' | 'jasmine')[] = ['marigold', 'rose', 'jasmine'];
    for (let i = 0; i < settings.count; i++) {
        const type = types[Math.floor(Math.random() * types.length)];
        let color: string;

        if (type === 'marigold') {
            color = PETAL_COLORS[Math.floor(Math.random() * 3)]; // orange shades
        } else if (type === 'rose') {
            color = PETAL_COLORS[3 + Math.floor(Math.random() * 2)]; // red shades
        } else {
            color = PETAL_COLORS[5 + Math.floor(Math.random() * 3)]; // white/yellow
        }

        petals.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.08,
            swayOffset: Math.random() * Math.PI * 2,
            swaySpeed: 0.02 + Math.random() * 0.02,
            fallSpeed: 0.8 + Math.random() * 1.2,
            color,
            size: 6 + Math.random() * 6,
            opacity: 0.7 + Math.random() * 0.3,
            type,
        });
    }

    let animationId: number;
    let isVisible = true;

    // Draw a petal
    const drawPetal = (petal: Petal) => {
        ctx.save();
        ctx.translate(petal.x, petal.y);
        ctx.rotate(petal.rotation);
        ctx.globalAlpha = petal.opacity;
        ctx.fillStyle = petal.color;

        if (petal.type === 'marigold') {
            // Marigold petal (elongated)
            ctx.beginPath();
            ctx.ellipse(0, 0, petal.size * 0.6, petal.size * 1.2, 0, 0, Math.PI * 2);
            ctx.fill();
        } else if (petal.type === 'rose') {
            // Rose petal (heart shape)
            ctx.beginPath();
            ctx.moveTo(0, -petal.size * 0.5);
            ctx.bezierCurveTo(
                petal.size * 0.8, -petal.size,
                petal.size, -petal.size * 0.3,
                0, petal.size * 0.6
            );
            ctx.bezierCurveTo(
                -petal.size, -petal.size * 0.3,
                -petal.size * 0.8, -petal.size,
                0, -petal.size * 0.5
            );
            ctx.fill();
        } else {
            // Jasmine petal (small oval)
            ctx.beginPath();
            ctx.ellipse(0, 0, petal.size * 0.5, petal.size * 0.8, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    };

    // Animation loop
    const animate = () => {
        if (!isVisible) {
            animationId = requestAnimationFrame(animate);
            return;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        petals.forEach(petal => {
            // Apply sway motion
            petal.swayOffset += petal.swaySpeed;
            const sway = Math.sin(petal.swayOffset) * 25;

            // Update position
            petal.y += petal.fallSpeed;
            petal.rotation += petal.rotationSpeed;

            // Reset when off screen
            if (petal.y > canvas.height + 20) {
                petal.y = -20;
                petal.x = Math.random() * canvas.width;
            }

            // Draw petal
            drawPetal({ ...petal, x: petal.x + sway });
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
