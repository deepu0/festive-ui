/**
 * Configuration options for chakri (spinning fireworks) effect
 */
export interface ChakriConfig {
    /**
     * Intensity level - controls chakri count and spark density
     * @default 'medium'
     */
    intensity?: 'low' | 'medium' | 'high';

    /**
     * Z-index for the chakri container
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
    chakriCount: number;
    sparkDensity: number;
}

const INTENSITY_MAP: Record<string, IntensitySettings> = {
    low: { chakriCount: 2, sparkDensity: 3 },
    medium: { chakriCount: 3, sparkDensity: 5 },
    high: { chakriCount: 4, sparkDensity: 8 },
};

const SPARK_COLORS = [
    '#ffff00', '#ff6600', '#ff0000', '#ff00ff',
    '#00ff00', '#00ffff', '#ffffff', '#ffd700',
];

interface Chakri {
    x: number;
    y: number;
    angle: number;
    rotationSpeed: number;
    sparks: Spark[];
}

interface Spark {
    x: number;
    y: number;
    velocityX: number;
    velocityY: number;
    color: string;
    life: number;
    maxLife: number;
    opacity: number;
}

/**
 * Creates a chakri (spinning fireworks) effect overlay on the page using Canvas
 * @param config - Configuration options
 * @returns Cleanup function to remove the effect
 */
export function chakri(config: ChakriConfig = {}): () => void {
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
    canvas.className = 'festive-ui-chakri';
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

    // Create chakris
    const chakris: Chakri[] = [];
    const positions = [
        { x: canvas.width * 0.25, y: canvas.height * 0.7 },
        { x: canvas.width * 0.5, y: canvas.height * 0.75 },
        { x: canvas.width * 0.75, y: canvas.height * 0.7 },
        { x: canvas.width * 0.4, y: canvas.height * 0.65 },
    ];

    for (let i = 0; i < settings.chakriCount; i++) {
        const pos = positions[i % positions.length];
        chakris.push({
            x: pos.x,
            y: pos.y,
            angle: 0,
            rotationSpeed: 0.15 + Math.random() * 0.1,
            sparks: [],
        });
    }

    let animationId: number;
    let isVisible = true;

    // Create sparks from chakri
    const createSparks = (chakri: Chakri) => {
        for (let i = 0; i < settings.sparkDensity; i++) {
            const spreadAngle = (Math.PI * 2 * i) / settings.sparkDensity + chakri.angle;
            const speed = 3 + Math.random() * 2;
            const color = SPARK_COLORS[Math.floor(Math.random() * SPARK_COLORS.length)];

            chakri.sparks.push({
                x: chakri.x,
                y: chakri.y,
                velocityX: Math.cos(spreadAngle) * speed,
                velocityY: Math.sin(spreadAngle) * speed,
                color,
                life: 0,
                maxLife: 30 + Math.random() * 20,
                opacity: 1,
            });
        }
    };

    // Animation loop
    const animate = () => {
        if (!isVisible) {
            animationId = requestAnimationFrame(animate);
            return;
        }

        // Fade background for trail effect
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        chakris.forEach(chakri => {
            // Rotate chakri
            chakri.angle += chakri.rotationSpeed;

            // Create sparks
            createSparks(chakri);

            // Draw chakri center
            ctx.fillStyle = '#ff6600';
            ctx.beginPath();
            ctx.arc(chakri.x, chakri.y, 8, 0, Math.PI * 2);
            ctx.fill();

            // Glow
            const glowGradient = ctx.createRadialGradient(
                chakri.x, chakri.y, 0,
                chakri.x, chakri.y, 20
            );
            glowGradient.addColorStop(0, 'rgba(255, 200, 0, 0.6)');
            glowGradient.addColorStop(1, 'transparent');
            ctx.fillStyle = glowGradient;
            ctx.fillRect(chakri.x - 20, chakri.y - 20, 40, 40);

            // Update and draw sparks
            for (let i = chakri.sparks.length - 1; i >= 0; i--) {
                const spark = chakri.sparks[i];

                // Apply gravity
                spark.velocityY += 0.1;
                spark.x += spark.velocityX;
                spark.y += spark.velocityY;
                spark.life++;

                // Fade out
                spark.opacity = 1 - (spark.life / spark.maxLife);

                // Draw spark
                ctx.globalAlpha = spark.opacity;
                ctx.fillStyle = spark.color;
                ctx.fillRect(spark.x - 2, spark.y - 2, 4, 4);

                // Draw spark trail
                ctx.fillStyle = spark.color;
                ctx.globalAlpha = spark.opacity * 0.3;
                ctx.fillRect(
                    spark.x - spark.velocityX * 0.3 - 1,
                    spark.y - spark.velocityY * 0.3 - 1,
                    2, 2
                );

                // Remove dead sparks
                if (spark.life >= spark.maxLife) {
                    chakri.sparks.splice(i, 1);
                }
            }
        });

        ctx.globalAlpha = 1;
        animationId = requestAnimationFrame(animate);
    };

    // Handle tab visibility
    const handleVisibilityChange = () => {
        isVisible = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Reposition chakris on resize
    const handleResize = () => {
        const newPositions = [
            { x: canvas.width * 0.25, y: canvas.height * 0.7 },
            { x: canvas.width * 0.5, y: canvas.height * 0.75 },
            { x: canvas.width * 0.75, y: canvas.height * 0.7 },
            { x: canvas.width * 0.4, y: canvas.height * 0.65 },
        ];
        chakris.forEach((chakri, i) => {
            const pos = newPositions[i % newPositions.length];
            chakri.x = pos.x;
            chakri.y = pos.y;
        });
    };
    window.addEventListener('resize', handleResize);

    // Add to DOM and start animation
    document.body.appendChild(canvas);

    // Clear canvas initially
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

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
