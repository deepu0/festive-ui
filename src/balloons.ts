/**
 * Configuration options for balloons effect
 */
export interface BalloonsConfig {
    /**
     * Intensity level - controls balloon count
     * @default 'medium'
     */
    intensity?: 'low' | 'medium' | 'high';

    /**
     * Z-index for the balloons container
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

const BALLOON_COLORS = [
    '#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24',
    '#6c5ce7', '#fd79a8', '#00b894', '#fdcb6e',
    '#ff9ff3', '#54a0ff',
];

interface Balloon {
    x: number;
    y: number;
    swayOffset: number;
    swaySpeed: number;
    floatSpeed: number;
    color: string;
    size: number;
    popped: boolean;
    popProgress: number;
}

/**
 * Creates a balloons effect overlay on the page
 * @param config - Configuration options
 * @returns Cleanup function to remove the effect
 */
export function balloons(config: BalloonsConfig = {}): () => void {
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
    canvas.className = 'festive-ui-balloons';
    canvas.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: all;
    z-index: ${zIndex};
    cursor: pointer;
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

    // Create balloons
    const balloons: Balloon[] = [];
    for (let i = 0; i < settings.count; i++) {
        balloons.push({
            x: Math.random() * canvas.width,
            y: canvas.height + Math.random() * 200,
            swayOffset: Math.random() * Math.PI * 2,
            swaySpeed: 0.02 + Math.random() * 0.02,
            floatSpeed: 0.5 + Math.random() * 0.8,
            color: BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)],
            size: 25 + Math.random() * 15,
            popped: false,
            popProgress: 0,
        });
    }

    let animationId: number;
    let isVisible = true;

    // Draw a balloon
    const drawBalloon = (balloon: Balloon) => {
        if (balloon.popped && balloon.popProgress >= 1) return;

        const x = balloon.x;
        const y = balloon.y;
        const size = balloon.size * (balloon.popped ? 1 - balloon.popProgress : 1);

        ctx.save();

        if (balloon.popped) {
            // Draw pop burst
            ctx.globalAlpha = 1 - balloon.popProgress;
            for (let i = 0; i < 8; i++) {
                const angle = (Math.PI * 2 * i) / 8;
                const dist = balloon.popProgress * balloon.size;
                ctx.fillStyle = balloon.color;
                ctx.fillRect(
                    x + Math.cos(angle) * dist - 2,
                    y + Math.sin(angle) * dist - 2,
                    4, 4
                );
            }
        } else {
            // Draw balloon
            ctx.fillStyle = balloon.color;
            ctx.globalAlpha = 0.9;
            ctx.beginPath();
            ctx.ellipse(x, y, size * 0.8, size, 0, 0, Math.PI * 2);
            ctx.fill();

            // Highlight
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.beginPath();
            ctx.ellipse(x - size * 0.2, y - size * 0.3, size * 0.3, size * 0.4, 0, 0, Math.PI * 2);
            ctx.fill();

            // String
            ctx.strokeStyle = '#666';
            ctx.lineWidth = 1;
            ctx.globalAlpha = 0.6;
            ctx.beginPath();
            ctx.moveTo(x, y + size);
            ctx.quadraticCurveTo(x + 5, y + size + 10, x, y + size + 30);
            ctx.stroke();
        }

        ctx.restore();
    };

    // Handle click to pop
    const handleClick = (e: MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;

        balloons.forEach(balloon => {
            if (balloon.popped) return;
            const distance = Math.sqrt(
                Math.pow(clickX - balloon.x, 2) + Math.pow(clickY - balloon.y, 2)
            );
            if (distance < balloon.size) {
                balloon.popped = true;
            }
        });
    };
    canvas.addEventListener('click', handleClick);

    // Animation loop
    const animate = () => {
        if (!isVisible) {
            animationId = requestAnimationFrame(animate);
            return;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        balloons.forEach(balloon => {
            if (balloon.popped) {
                balloon.popProgress += 0.05;
                if (balloon.popProgress >= 1) {
                    // Reset balloon
                    balloon.popped = false;
                    balloon.popProgress = 0;
                    balloon.y = canvas.height + 50;
                    balloon.x = Math.random() * canvas.width;
                }
            } else {
                // Apply sway motion
                balloon.swayOffset += balloon.swaySpeed;
                const sway = Math.sin(balloon.swayOffset) * 20;

                // Float upward
                balloon.y -= balloon.floatSpeed;
                balloon.x += sway * 0.05;

                // Reset when off screen
                if (balloon.y < -100) {
                    balloon.y = canvas.height + 50;
                    balloon.x = Math.random() * canvas.width;
                }
            }

            drawBalloon(balloon);
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
        canvas.removeEventListener('click', handleClick);
        canvas.remove();
    };
}
