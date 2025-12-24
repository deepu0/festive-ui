/**
 * Configuration options for sky lanterns effect
 */
export interface SkyLanternsConfig {
    /**
     * Intensity level - controls lantern count
     * @default 'medium'
     */
    intensity?: 'low' | 'medium' | 'high';

    /**
     * Z-index for the sky lanterns container
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
    low: { count: 6 },
    medium: { count: 12 },
    high: { count: 20 },
};

const LANTERN_COLORS = [
    '#ff6b35', // orange
    '#ffd700', // gold
    '#ff69b4', // pink
    '#ff4500', // red-orange
    '#ffff00', // yellow
    '#ff8c00', // dark orange
];

interface Lantern {
    x: number;
    y: number;
    swayOffset: number;
    swaySpeed: number;
    floatSpeed: number;
    color: string;
    width: number;
    height: number;
    glowPulse: number;
    glowSpeed: number;
}

/**
 * Creates a sky lanterns effect overlay on the page using Canvas
 * @param config - Configuration options
 * @returns Cleanup function to remove the effect
 */
export function skyLanterns(config: SkyLanternsConfig = {}): () => void {
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
    canvas.className = 'festive-ui-sky-lanterns';
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

    // Create lanterns
    const lanterns: Lantern[] = [];
    for (let i = 0; i < settings.count; i++) {
        lanterns.push({
            x: Math.random() * canvas.width,
            y: canvas.height + Math.random() * 200,
            swayOffset: Math.random() * Math.PI * 2,
            swaySpeed: 0.015 + Math.random() * 0.015,
            floatSpeed: 0.3 + Math.random() * 0.4,
            color: LANTERN_COLORS[Math.floor(Math.random() * LANTERN_COLORS.length)],
            width: 25 + Math.random() * 15,
            height: 35 + Math.random() * 20,
            glowPulse: Math.random() * Math.PI * 2,
            glowSpeed: 0.03 + Math.random() * 0.02,
        });
    }

    let animationId: number;
    let isVisible = true;

    // Draw a sky lantern
    const drawLantern = (lantern: Lantern) => {
        const x = lantern.x;
        const y = lantern.y;
        const w = lantern.width;
        const h = lantern.height;

        ctx.save();

        // Update glow pulse
        lantern.glowPulse += lantern.glowSpeed;
        const glowIntensity = 0.6 + Math.sin(lantern.glowPulse) * 0.3;

        // Draw glow
        const glowSize = Math.max(w, h) * 1.5;
        const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, glowSize);
        glowGradient.addColorStop(0, `rgba(255, 200, 100, ${glowIntensity * 0.5})`);
        glowGradient.addColorStop(0.5, `rgba(255, 150, 50, ${glowIntensity * 0.3})`);
        glowGradient.addColorStop(1, 'transparent');
        ctx.fillStyle = glowGradient;
        ctx.fillRect(x - glowSize, y - glowSize, glowSize * 2, glowSize * 2);

        // Draw lantern body
        ctx.fillStyle = lantern.color;
        ctx.globalAlpha = 0.9;

        // Top part
        ctx.beginPath();
        ctx.moveTo(x - w / 2, y - h / 2);
        ctx.lineTo(x - w / 3, y - h / 2 - 5);
        ctx.lineTo(x + w / 3, y - h / 2 - 5);
        ctx.lineTo(x + w / 2, y - h / 2);
        ctx.closePath();
        ctx.fill();

        // Main body
        ctx.fillRect(x - w / 2, y - h / 2, w, h);

        // Bottom part
        ctx.beginPath();
        ctx.moveTo(x - w / 2, y + h / 2);
        ctx.lineTo(x - w / 3, y + h / 2 + 5);
        ctx.lineTo(x + w / 3, y + h / 2 + 5);
        ctx.lineTo(x + w / 2, y + h / 2);
        ctx.closePath();
        ctx.fill();

        // Inner glow (light source)
        ctx.globalAlpha = glowIntensity;
        const innerGlow = ctx.createRadialGradient(
            x, y, 0,
            x, y, w * 0.4
        );
        innerGlow.addColorStop(0, 'rgba(255, 255, 200, 0.9)');
        innerGlow.addColorStop(1, 'rgba(255, 200, 100, 0)');
        ctx.fillStyle = innerGlow;
        ctx.fillRect(x - w / 2, y - h / 2, w, h);

        // Lantern frame lines
        ctx.globalAlpha = 0.3;
        ctx.strokeStyle = '#8b4513';
        ctx.lineWidth = 1;

        // Vertical lines
        ctx.beginPath();
        ctx.moveTo(x - w / 4, y - h / 2);
        ctx.lineTo(x - w / 4, y + h / 2);
        ctx.moveTo(x + w / 4, y - h / 2);
        ctx.lineTo(x + w / 4, y + h / 2);
        ctx.stroke();

        // Horizontal lines
        ctx.beginPath();
        ctx.moveTo(x - w / 2, y - h / 4);
        ctx.lineTo(x + w / 2, y - h / 4);
        ctx.moveTo(x - w / 2, y + h / 4);
        ctx.lineTo(x + w / 2, y + h / 4);
        ctx.stroke();

        ctx.restore();
    };

    // Animation loop
    const animate = () => {
        if (!isVisible) {
            animationId = requestAnimationFrame(animate);
            return;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        lanterns.forEach(lantern => {
            // Apply sway motion
            lantern.swayOffset += lantern.swaySpeed;
            const sway = Math.sin(lantern.swayOffset) * 30;

            // Float upward
            lantern.y -= lantern.floatSpeed;

            // Reset when off screen
            if (lantern.y < -lantern.height - 20) {
                lantern.y = canvas.height + 50;
                lantern.x = Math.random() * canvas.width;
            }

            // Draw lantern
            drawLantern({ ...lantern, x: lantern.x + sway });
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
