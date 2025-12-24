/**
 * Configuration options for twinkling stars effect
 */
export interface StarsConfig {
    /**
     * Intensity level - controls star count
     * @default 'medium'
     */
    intensity?: 'low' | 'medium' | 'high';

    /**
     * Z-index for the stars container
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

const STAR_COLORS = [
    '#ffffff', '#fffacd', '#ffffe0', '#f0e68c',
    '#ffd700', '#daa520', '#87ceeb', '#b0e0e6',
];

interface Star {
    x: number;
    y: number;
    size: number;
    color: string;
    twinkleSpeed: number;
    twinkleOffset: number;
    opacity: number;
    maxOpacity: number;
}

/**
 * Creates a twinkling stars effect overlay on the page using Canvas
 * @param config - Configuration options
 * @returns Cleanup function to remove the effect
 */
export function stars(config: StarsConfig = {}): () => void {
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
    canvas.className = 'festive-ui-stars';
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

    // Create stars
    const starsArray: Star[] = [];
    for (let i = 0; i < settings.count; i++) {
        starsArray.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: 1 + Math.random() * 2,
            color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
            twinkleSpeed: 0.01 + Math.random() * 0.03,
            twinkleOffset: Math.random() * Math.PI * 2,
            opacity: 0,
            maxOpacity: 0.3 + Math.random() * 0.7,
        });
    }

    let animationId: number;
    let isVisible = true;

    // Draw a star
    const drawStar = (x: number, y: number, size: number, color: string, opacity: number) => {
        ctx.save();
        ctx.globalAlpha = opacity;

        // Draw star glow
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, size * 3);
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.fillRect(x - size * 3, y - size * 3, size * 6, size * 6);

        // Draw star core
        ctx.fillStyle = color;
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
            const x1 = x + Math.cos(angle) * size;
            const y1 = y + Math.sin(angle) * size;

            if (i === 0) {
                ctx.moveTo(x1, y1);
            } else {
                ctx.lineTo(x1, y1);
            }

            const angle2 = angle + Math.PI / 5;
            const x2 = x + Math.cos(angle2) * (size * 0.4);
            const y2 = y + Math.sin(angle2) * (size * 0.4);
            ctx.lineTo(x2, y2);
        }
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    };

    // Animation loop
    const animate = () => {
        if (!isVisible) {
            animationId = requestAnimationFrame(animate);
            return;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        starsArray.forEach(star => {
            // Update twinkle
            star.twinkleOffset += star.twinkleSpeed;
            star.opacity = (Math.sin(star.twinkleOffset) + 1) / 2 * star.maxOpacity;

            // Draw star
            drawStar(star.x, star.y, star.size, star.color, star.opacity);
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
