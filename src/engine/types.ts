/**
 * Standardized Particle Interface v2.0
 * Used by all effects in the Festive UI library
 */

/**
 * Particle lifecycle phase
 */
export type ParticlePhase = 'spawning' | 'active' | 'dying';

/**
 * Intensity level for effects
 */
export type IntensityLevel = 'off' | 'low' | 'medium' | 'high';

/**
 * Effect type identifier
 */
export type EffectType =
    | 'snow' | 'confetti' | 'hearts' | 'sparkles'
    | 'fireworks' | 'autumn-leaves' | 'balloons' | 'stars' | 'bubbles'
    | 'gulaal' | 'diyas' | 'flower-shower' | 'chakri' | 'sky-lanterns';

/**
 * Standardized Particle Model
 * All effects use this unified particle structure
 */
export interface Particle {
    // Position
    x: number;
    y: number;

    // Velocity
    vx: number;
    vy: number;

    // Acceleration (NEW in v2.0)
    ax: number;
    ay: number;

    // Visual properties
    size: number;
    opacity: number;
    color: string | [number, number, number];

    // Rotation
    rotation: number;
    rotationSpeed: number;

    // Lifecycle
    life: number;
    maxLife: number;

    // State (NEW in v2.0)
    phase: ParticlePhase;

    // Effect-specific metadata
    meta: Record<string, any>;
}

/**
 * Point in 2D space
 */
export interface Point {
    x: number;
    y: number;
}

/**
 * Effect instance handle
 */
export interface EffectInstance {
    id: string;
    type: EffectType;
    stop: () => void;
}

/**
 * Effect configuration options
 */
export interface EffectOptions {
    intensity?: IntensityLevel;
    colors?: string[];
    bounds?: DOMRect;
    duration?: number; // ms, for burst effects
    zIndex?: number;
    disableOnReducedMotion?: boolean;
}

/**
 * Burst effect options
 */
export interface BurstOptions extends EffectOptions {
    count?: number;
    spread?: number; // degrees
    velocity?: number;
}

/**
 * Performance metrics
 */
export interface PerformanceMetrics {
    particleCount: number;
    frameTime: number; // ms
    fps: number;
    droppedFrames: number;
    memoryUsage: number; // bytes
}

/**
 * Intensity mapping configuration
 */
export interface IntensityConfig {
    countMultiplier: number;
    speedMultiplier: number;
    spawnRate: number; // particles per second
    opacityRange: [number, number];
}

/**
 * Intensity mappings per spec
 */
export const INTENSITY_MAP: Record<IntensityLevel, IntensityConfig> = {
    off: {
        countMultiplier: 0,
        speedMultiplier: 0,
        spawnRate: 0,
        opacityRange: [0, 0],
    },
    low: {
        countMultiplier: 0.4,
        speedMultiplier: 0.75,
        spawnRate: 1.5, // 1-2/sec average
        opacityRange: [0.4, 0.7],
    },
    medium: {
        countMultiplier: 1,
        speedMultiplier: 1,
        spawnRate: 4, // 3-5/sec average
        opacityRange: [0.6, 0.9],
    },
    high: {
        countMultiplier: 1.8,
        speedMultiplier: 1.15,
        spawnRate: 8, // 6-10/sec average
        opacityRange: [0.7, 1.0],
    },
};

/**
 * Performance budget targets
 */
export const PERFORMANCE_BUDGET = {
    TARGET_FRAME_TIME: 8, // ms
    MAX_FRAME_TIME: 16, // ms
    MAX_PARTICLES_GLOBAL: 100,
    MAX_MEMORY_PER_EFFECT: 5 * 1024 * 1024, // 5MB
    MAX_DELTA_CLAMP: 32, // ms
} as const;

/**
 * Canvas configuration
 */
export interface CanvasConfig {
    zIndex: number;
    compositeOperation: GlobalCompositeOperation;
    willChange: string;
}

export const DEFAULT_CANVAS_CONFIG: CanvasConfig = {
    zIndex: 9999,
    compositeOperation: 'source-over',
    willChange: 'transform',
};
