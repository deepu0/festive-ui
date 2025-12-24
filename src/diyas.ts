/**
 * Configuration options for diyas (Diwali lamps) effect
 */
export interface DiyasConfig {
    /**
     * Intensity level - controls diya count
     * @default 'medium'
     */
    intensity?: 'low' | 'medium' | 'high';

    /**
     * Z-index for the diyas container
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
    low: { count: 8 },
    medium: { count: 15 },
    high: { count: 25 },
};

interface Diya {
    x: number;
    y: number;
    flameHeight: number;
    flameFlicker: number;
    flickerSpeed: number;
    glowPulse: number;
    glowSpeed: number;
}

/**
 * Creates a diyas (Diwali lamps) effect overlay on the page using Canvas
 * @param config - Configuration options
 * @returns Cleanup function to remove the effect
 */
export function diyas(config: DiyasConfig = {}): () => void {
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
    canvas.className = 'festive-ui-diyas';
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

    // Create diyas at bottom of screen
    const diyasArray: Diya[] = [];
    const spacing = canvas.width / (settings.count + 1);
    for (let i = 0; i < settings.count; i++) {
        diyasArray.push({
            x: spacing * (i + 1),
            y: canvas.height - 80,
            flameHeight: 15 + Math.random() * 5,
            flameFlicker: 0,
            flickerSpeed: 0.1 + Math.random() * 0.1,
            glowPulse: Math.random() * Math.PI * 2,
            glowSpeed: 0.02 + Math.random() * 0.02,
        });
    }

    let animationId: number;
    let isVisible = true;

    // Draw a diya
    const drawDiya = (diya: Diya) => {
        const x = diya.x;
        const y = diya.y;

        ctx.save();

        // Draw glow
        diya.glowPulse += diya.glowSpeed;
        const glowSize = 40 + Math.sin(diya.glowPulse) * 10;
        const glowGradient = ctx.createRadialGradient(x, y - 10, 0, x, y - 10, glowSize);
        glowGradient.addColorStop(0, 'rgba(255, 200, 50, 0.4)');
        glowGradient.addColorStop(0.5, 'rgba(255, 150, 0, 0.2)');
        glowGradient.addColorStop(1, 'transparent');
        ctx.fillStyle = glowGradient;
        ctx.fillRect(x - glowSize, y - glowSize - 10, glowSize * 2, glowSize * 2);

        // Draw diya lamp body
        ctx.fillStyle = '#8b4513';
        ctx.beginPath();
        ctx.ellipse(x, y, 20, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Diya rim
        ctx.fillStyle = '#d2691e';
        ctx.beginPath();
        ctx.ellipse(x, y - 2, 22, 5, 0, 0, Math.PI);
        ctx.fill();

        // Wick
        ctx.strokeStyle = '#2c1810';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, y - 8);
        ctx.lineTo(x, y - 15);
        ctx.stroke();

        // Flame
        diya.flameFlicker += diya.flickerSpeed;
        const flicker = Math.sin(diya.flameFlicker) * 2;
        const flameHeight = diya.flameHeight + flicker;

        // Outer flame (orange)
        const flameGradient = ctx.createRadialGradient(
            x, y - 15 - flameHeight / 2, 0,
            x, y - 15 - flameHeight / 2, 8
        );
        flameGradient.addColorStop(0, '#ffaa00');
        flameGradient.addColorStop(0.5, '#ff6600');
        flameGradient.addColorStop(1, 'rgba(255, 100, 0, 0)');

        ctx.fillStyle = flameGradient;
        ctx.beginPath();
        ctx.moveTo(x, y - 15);
        ctx.bezierCurveTo(
            x - 6, y - 15 - flameHeight * 0.3,
            x - 5, y - 15 - flameHeight * 0.7,
            x, y - 15 - flameHeight
        );
        ctx.bezierCurveTo(
            x + 5, y - 15 - flameHeight * 0.7,
            x + 6, y - 15 - flameHeight * 0.3,
            x, y - 15
        );
        ctx.fill();

        // Inner flame (yellow)
        const innerGradient = ctx.createRadialGradient(
            x, y - 15 - flameHeight / 2, 0,
            x, y - 15 - flameHeight / 2, 4
        );
        innerGradient.addColorStop(0, '#ffff99');
        innerGradient.addColorStop(0.7, '#ffaa00');
        innerGradient.addColorStop(1, 'rgba(255, 170, 0, 0)');

        ctx.fillStyle = innerGradient;
        ctx.beginPath();
        ctx.moveTo(x, y - 15);
        ctx.bezierCurveTo(
            x - 3, y - 15 - flameHeight * 0.3,
            x - 3, y - 15 - flameHeight * 0.7,
            x, y - 15 - flameHeight * 0.9
        );
        ctx.bezierCurveTo(
            x + 3, y - 15 - flameHeight * 0.7,
            x + 3, y - 15 - flameHeight * 0.3,
            x, y - 15
        );
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

        diyasArray.forEach(diya => {
            drawDiya(diya);
        });

        animationId = requestAnimationFrame(animate);
    };

    // Handle tab visibility
    const handleVisibilityChange = () => {
        isVisible = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Reposition diyas on resize
    const handleResize = () => {
        const newSpacing = canvas.width / (settings.count + 1);
        diyasArray.forEach((diya, i) => {
            diya.x = newSpacing * (i + 1);
            diya.y = canvas.height - 80;
        });
    };
    window.addEventListener('resize', handleResize);

    // Add to DOM and start animation
    document.body.appendChild(canvas);
    animationId = requestAnimationFrame(animate);

    // Return cleanup function
    return () => {
        cancelAnimationFrame(animationId);
        window.removeEventListener('resize', resizeCanvas);
        window.removeEventListener('resize', handleResize);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        canvas.remove();
    };
}
