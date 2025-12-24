/**
 * Configuration options for autumn leaves effect
 */
export interface AutumnLeavesConfig {
    /**
     * Intensity level - controls leaf count
     * @default 'medium'
     */
    intensity?: 'low' | 'medium' | 'high';

    /**
     * Z-index for the leaves container
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

const LEAF_COLORS = [
    '#d35400', // burnt orange
    '#e67e22', // orange
    '#f39c12', // amber
    '#f1c40f', // yellow
    '#c0392b', // red
    '#8b4513', // brown
    '#a0522d', // sienna
];

interface Leaf {
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
}

/**
 * Creates an autumn leaves effect overlay on the page using Canvas
 * @param config - Configuration options
 * @returns Cleanup function to remove the effect
 */
export function autumnLeaves(config: AutumnLeavesConfig = {}): () => void {
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
    canvas.className = 'festive-ui-autumn-leaves';
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

    // Create leaves
    const leaves: Leaf[] = [];
    for (let i = 0; i < settings.count; i++) {
        leaves.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.05,
            swayOffset: Math.random() * Math.PI * 2,
            swaySpeed: 0.01 + Math.random() * 0.02,
            fallSpeed: 0.5 + Math.random() * 1,
            color: LEAF_COLORS[Math.floor(Math.random() * LEAF_COLORS.length)],
            size: 8 + Math.random() * 8,
            opacity: 0.7 + Math.random() * 0.3,
        });
    }

    let animationId: number;
    let isVisible = true;

    // Draw a leaf shape
    const drawLeaf = (x: number, y: number, size: number, rotation: number, color: string, opacity: number) => {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation);
        ctx.globalAlpha = opacity;
        ctx.fillStyle = color;

        // Simple leaf shape
        ctx.beginPath();
        ctx.moveTo(0, -size / 2);
        ctx.quadraticCurveTo(size / 2, -size / 4, size / 2, size / 2);
        ctx.quadraticCurveTo(0, size / 3, 0, size / 2);
        ctx.quadraticCurveTo(-size / 2, size / 3, -size / 2, size / 2);
        ctx.quadraticCurveTo(-size / 2, -size / 4, 0, -size / 2);
        ctx.fill();

        // Add stem
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, -size / 2);
        ctx.lineTo(0, size / 2);
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

        leaves.forEach(leaf => {
            // Apply sway motion
            leaf.swayOffset += leaf.swaySpeed;
            const sway = Math.sin(leaf.swayOffset) * 30;

            // Update position
            leaf.y += leaf.fallSpeed;
            leaf.rotation += leaf.rotationSpeed;

            // Reset when off screen
            if (leaf.y > canvas.height + 20) {
                leaf.y = -20;
                leaf.x = Math.random() * canvas.width;
            }

            // Draw leaf
            drawLeaf(leaf.x + sway, leaf.y, leaf.size, leaf.rotation, leaf.color, leaf.opacity);
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
