/**
 * Configuration options for bubbles effect
 */
export interface BubblesConfig {
    /**
     * Intensity level - controls bubble count
     * @default 'medium'
     */
    intensity?: 'low' | 'medium' | 'high';

    /**
     * Z-index for the bubbles container
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
    low: { count: 15 },
    medium: { count: 30 },
    high: { count: 50 },
};

interface Bubble {
    x: number;
    y: number;
    size: number;
    wobbleOffset: number;
    wobbleSpeed: number;
    floatSpeed: number;
    opacity: number;
    popped: boolean;
    popProgress: number;
}

/**
 * Creates a bubbles effect overlay on the page using Canvas
 * @param config - Configuration options
 * @returns Cleanup function to remove the effect
 */
export function bubbles(config: BubblesConfig = {}): () => void {
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
    canvas.className = 'festive-ui-bubbles';
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

    // Create bubbles
    const bubblesArray: Bubble[] = [];
    for (let i = 0; i < settings.count; i++) {
        bubblesArray.push({
            x: Math.random() * canvas.width,
            y: canvas.height + Math.random() * 200,
            size: 15 + Math.random() * 25,
            wobbleOffset: Math.random() * Math.PI * 2,
            wobbleSpeed: 0.03 + Math.random() * 0.04,
            floatSpeed: 0.5 + Math.random() * 1,
            opacity: 0.6 + Math.random() * 0.3,
            popped: false,
            popProgress: 0,
        });
    }

    let animationId: number;
    let isVisible = true;

    // Draw a bubble
    const drawBubble = (bubble: Bubble) => {
        if (bubble.popped && bubble.popProgress >= 1) return;

        const x = bubble.x;
        const y = bubble.y;
        const size = bubble.size * (bubble.popped ? 1 - bubble.popProgress : 1);

        ctx.save();

        if (bubble.popped) {
            // Draw pop burst
            ctx.globalAlpha = (1 - bubble.popProgress) * 0.5;
            for (let i = 0; i < 6; i++) {
                const angle = (Math.PI * 2 * i) / 6;
                const dist = bubble.popProgress * bubble.size * 0.8;
                ctx.strokeStyle = `rgba(200, 220, 255, ${1 - bubble.popProgress})`;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(x + Math.cos(angle) * dist, y + Math.sin(angle) * dist);
                ctx.stroke();
            }
        } else {
            // Draw bubble body
            ctx.globalAlpha = bubble.opacity;
            const gradient = ctx.createRadialGradient(
                x - size * 0.3, y - size * 0.3, 0,
                x, y, size
            );
            gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
            gradient.addColorStop(0.3, 'rgba(200, 220, 255, 0.4)');
            gradient.addColorStop(0.7, 'rgba(150, 200, 255, 0.3)');
            gradient.addColorStop(1, 'rgba(100, 180, 255, 0.2)');

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();

            // Draw bubble outline
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.lineWidth = 1;
            ctx.stroke();

            // Draw highlight
            ctx.globalAlpha = bubble.opacity * 0.8;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.beginPath();
            ctx.arc(x - size * 0.3, y - size * 0.3, size * 0.25, 0, Math.PI * 2);
            ctx.fill();

            // Small highlight
            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.beginPath();
            ctx.arc(x + size * 0.2, y - size * 0.2, size * 0.12, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    };

    // Handle click to pop
    const handleClick = (e: MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;

        bubblesArray.forEach(bubble => {
            if (bubble.popped) return;
            const distance = Math.sqrt(
                Math.pow(clickX - bubble.x, 2) + Math.pow(clickY - bubble.y, 2)
            );
            if (distance < bubble.size) {
                bubble.popped = true;
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

        bubblesArray.forEach(bubble => {
            if (bubble.popped) {
                bubble.popProgress += 0.08;
                if (bubble.popProgress >= 1) {
                    // Reset bubble
                    bubble.popped = false;
                    bubble.popProgress = 0;
                    bubble.y = canvas.height + 50;
                    bubble.x = Math.random() * canvas.width;
                }
            } else {
                // Apply wobble motion
                bubble.wobbleOffset += bubble.wobbleSpeed;
                const wobble = Math.sin(bubble.wobbleOffset) * 15;

                // Float upward
                bubble.y -= bubble.floatSpeed;
                bubble.x += wobble * 0.02;

                // Pop when reaching top
                if (bubble.y < -bubble.size) {
                    bubble.popped = true;
                }
            }

            drawBubble(bubble);
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
