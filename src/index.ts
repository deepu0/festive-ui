import { ParticleEngine } from './engine';
import {
    SnowRenderer,
    ConfettiRenderer,
    HeartsRenderer,
    SparklesRenderer,
    FireworksRenderer,
    StarsRenderer,
    BubblesRenderer,
    AutumnLeavesRenderer,
    BalloonsRenderer,
    GulaalRenderer,
    DiyasRenderer,
    FlowerShowerRenderer,
    ChakriRenderer,
    SkyLanternsRenderer,
} from './effects';
import type { EffectOptions } from './engine/types';

/**
 * Global engine instance (singleton)
 */
let globalEngine: ParticleEngine | null = null;

/**
 * Get or create the global engine instance
 */
function getEngine(): ParticleEngine {
    if (!globalEngine) {
        globalEngine = new ParticleEngine();
        globalEngine.init();

        // Register all 14 effect renderers
        globalEngine.registerEffect('snow', new SnowRenderer());
        globalEngine.registerEffect('confetti', new ConfettiRenderer());
        globalEngine.registerEffect('hearts', new HeartsRenderer());
        globalEngine.registerEffect('sparkles', new SparklesRenderer());
        globalEngine.registerEffect('fireworks', new FireworksRenderer());
        globalEngine.registerEffect('stars', new StarsRenderer());
        globalEngine.registerEffect('bubbles', new BubblesRenderer());
        globalEngine.registerEffect('autumn-leaves', new AutumnLeavesRenderer());
        globalEngine.registerEffect('balloons', new BalloonsRenderer());
        globalEngine.registerEffect('gulaal', new GulaalRenderer());
        globalEngine.registerEffect('diyas', new DiyasRenderer());
        globalEngine.registerEffect('flower-shower', new FlowerShowerRenderer());
        globalEngine.registerEffect('chakri', new ChakriRenderer());
        globalEngine.registerEffect('sky-lanterns', new SkyLanternsRenderer());
    }
    return globalEngine;
}

/**
 * Legacy compatibility wrappers for all 14 effects
 */
export function snow(config: EffectOptions = {}): () => void {
    const engine = getEngine();
    const instance = engine.start('snow', config);
    return () => instance.stop();
}

export function confetti(config: EffectOptions = {}): () => void {
    const engine = getEngine();
    const instance = engine.start('confetti', config);
    return () => instance.stop();
}

export function hearts(config: EffectOptions = {}): () => void {
    const engine = getEngine();
    const instance = engine.start('hearts', config);
    return () => instance.stop();
}

export function sparkles(config: EffectOptions = {}): () => void {
    const engine = getEngine();
    const instance = engine.start('sparkles', config);
    return () => instance.stop();
}

export function fireworks(config: EffectOptions = {}): () => void {
    const engine = getEngine();
    const instance = engine.start('fireworks', config);
    return () => instance.stop();
}

export function stars(config: EffectOptions = {}): () => void {
    const engine = getEngine();
    const instance = engine.start('stars', config);
    return () => instance.stop();
}

export function bubbles(config: EffectOptions = {}): () => void {
    const engine = getEngine();
    const instance = engine.start('bubbles', config);
    return () => instance.stop();
}

export function autumnLeaves(config: EffectOptions = {}): () => void {
    const engine = getEngine();
    const instance = engine.start('autumn-leaves', config);
    return () => instance.stop();
}

export function balloons(config: EffectOptions = {}): () => void {
    const engine = getEngine();
    const instance = engine.start('balloons', config);
    return () => instance.stop();
}

export function gulaal(config: EffectOptions = {}): () => void {
    const engine = getEngine();
    const instance = engine.start('gulaal', config);
    return () => instance.stop();
}

export function diyas(config: EffectOptions = {}): () => void {
    const engine = getEngine();
    const instance = engine.start('diyas', config);
    return () => instance.stop();
}

export function flowerShower(config: EffectOptions = {}): () => void {
    const engine = getEngine();
    const instance = engine.start('flower-shower', config);
    return () => instance.stop();
}

export function chakri(config: EffectOptions = {}): () => void {
    const engine = getEngine();
    const instance = engine.start('chakri', config);
    return () => instance.stop();
}

export function skyLanterns(config: EffectOptions = {}): () => void {
    const engine = getEngine();
    const instance = engine.start('sky-lanterns', config);
    return () => instance.stop();
}

/**
 * Export engine and types for advanced usage
 */
export { ParticleEngine } from './engine';
export type {
    EffectOptions,
    EffectInstance,
    IntensityLevel,
    Particle,
    PerformanceMetrics,
} from './engine/types';
