import { ParticlePool } from './ParticlePool';
import { PerformanceMonitor } from './PerformanceMonitor';
import { AccessibilityManager } from './AccessibilityManager';
import {
    DEFAULT_CANVAS_CONFIG,
    PERFORMANCE_BUDGET,
    INTENSITY_MAP,
    type Particle,
    type EffectType,
    type EffectOptions,
    type EffectInstance,
    type IntensityLevel,
    type Point,
    type BurstOptions,
    type PerformanceMetrics,
} from './types';

/**
 * Effect renderer interface
 */
export interface EffectRenderer {
    spawn(particle: Particle, options: EffectOptions): void;
    update(particle: Particle, deltaTime: number, canvas: HTMLCanvasElement): boolean;
    render(ctx: CanvasRenderingContext2D, particle: Particle): void;
    getMaxParticles(options: EffectOptions): number;
}

/**
 * Active effect state
 */
interface ActiveEffect {
    instance: EffectInstance;
    renderer: EffectRenderer;
    options: EffectOptions;
    particleIds: Set<string>;
    lastSpawnTime: number;
}

/**
 * Central Particle Effects Engine
 */
export class ParticleEngine {
    private canvas: HTMLCanvasElement | null = null;
    private ctx: CanvasRenderingContext2D | null = null;
    private pool: ParticlePool;
    private performanceMonitor: PerformanceMonitor;
    private accessibilityManager: AccessibilityManager;

    private particles: Map<string, { particle: Particle; effectId: string }> = new Map();
    private effects: Map<string, EffectRenderer> = new Map();
    private activeEffects: Map<string, ActiveEffect> = new Map();

    private animationId: number | null = null;
    private lastFrameTime = 0;
    private isPaused = false;
    private isVisible = true;

    private globalIntensity: IntensityLevel = 'medium';
    private eventListeners: Map<string, Set<Function>> = new Map();
    private particleIdCounter = 0;

    constructor() {
        this.pool = new ParticlePool(500);
        this.performanceMonitor = new PerformanceMonitor();
        this.accessibilityManager = new AccessibilityManager();

        this.accessibilityManager.subscribe((prefersReducedMotion) => {
            if (prefersReducedMotion) {
                this.stopAll();
            }
        });
    }

    init(container: HTMLElement = document.body): void {
        if (this.canvas) {
            console.warn('ParticleEngine already initialized');
            return;
        }

        this.canvas = document.createElement('canvas');
        this.canvas.className = 'festive-ui-particle-engine';
        this.canvas.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: ${DEFAULT_CANVAS_CONFIG.zIndex};
      will-change: ${DEFAULT_CANVAS_CONFIG.willChange};
    `;

        this.accessibilityManager.applyCanvasAttributes(this.canvas);

        this.ctx = this.canvas.getContext('2d', {
            alpha: true,
            desynchronized: true,
        });

        if (!this.ctx) {
            throw new Error('Failed to get canvas 2D context');
        }

        this.resizeCanvas();
        container.appendChild(this.canvas);
        this.setupEventListeners();
        this.startRenderLoop();
    }

    destroy(): void {
        this.stopAll();
        this.stopRenderLoop();

        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }

        this.canvas = null;
        this.ctx = null;
        this.pool.clear();
        this.accessibilityManager.destroy();
        this.eventListeners.clear();

        window.removeEventListener('resize', this.resizeCanvas);
        document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    }

    registerEffect(type: EffectType, renderer: EffectRenderer): void {
        this.effects.set(type, renderer);
    }

    start(type: EffectType, options: EffectOptions = {}): EffectInstance {
        if (this.accessibilityManager.prefersReducedMotion && options.disableOnReducedMotion !== false) {
            console.log('Effect disabled due to prefers-reduced-motion');
            return this.createNoOpInstance(type);
        }

        const renderer = this.effects.get(type);
        if (!renderer) {
            console.error(`Effect "${type}" not registered`);
            return this.createNoOpInstance(type);
        }

        const id = `${type}-${Date.now()}-${Math.random()}`;
        const instance: EffectInstance = {
            id,
            type,
            stop: () => this.stop(instance),
        };

        const activeEffect: ActiveEffect = {
            instance,
            renderer,
            options,
            particleIds: new Set(),
            lastSpawnTime: performance.now(),
        };

        this.activeEffects.set(id, activeEffect);

        // Spawn initial particles
        const maxParticles = renderer.getMaxParticles(options);
        const initialCount = Math.floor(maxParticles * 0.5); // Start with 50% of max
        for (let i = 0; i < initialCount; i++) {
            this.spawnParticleForEffect(id, activeEffect);
        }

        this.emit('start', { type, options });
        return instance;
    }

    stop(instance: EffectInstance): void {
        const activeEffect = this.activeEffects.get(instance.id);
        if (!activeEffect) return;

        // Remove all particles for this effect
        activeEffect.particleIds.forEach(particleId => {
            const entry = this.particles.get(particleId);
            if (entry) {
                this.pool.release(entry.particle);
                this.particles.delete(particleId);
            }
        });

        this.activeEffects.delete(instance.id);
        this.emit('stop', { type: instance.type });
    }

    stopAll(): void {
        this.activeEffects.forEach(effect => {
            effect.particleIds.forEach(particleId => {
                const entry = this.particles.get(particleId);
                if (entry) {
                    this.pool.release(entry.particle);
                }
            });
        });

        this.particles.clear();
        this.activeEffects.clear();
    }

    burst(type: 'confetti' | 'fireworks' | 'gulaal', origin: Point, options: BurstOptions = {}): void {
        this.emit('burst', { type, origin, options });
    }

    setIntensity(level: IntensityLevel): void {
        this.globalIntensity = level;
        if (level === 'off') {
            this.stopAll();
        }
    }

    setPaused(paused: boolean): void {
        this.isPaused = paused;
    }

    on(event: string, callback: Function): () => void {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, new Set());
        }
        this.eventListeners.get(event)!.add(callback);
        return () => this.eventListeners.get(event)?.delete(callback);
    }

    getMetrics(): PerformanceMetrics {
        return this.performanceMonitor.getMetrics(this.particles.size);
    }

    private spawnParticleForEffect(effectId: string, activeEffect: ActiveEffect): boolean {
        if (this.particles.size >= PERFORMANCE_BUDGET.MAX_PARTICLES_GLOBAL) {
            return false;
        }

        const maxParticles = activeEffect.renderer.getMaxParticles(activeEffect.options);
        if (activeEffect.particleIds.size >= maxParticles) {
            return false;
        }

        const particle = this.pool.acquire();
        activeEffect.renderer.spawn(particle, activeEffect.options);

        const particleId = `p-${this.particleIdCounter++}`;
        this.particles.set(particleId, { particle, effectId });
        activeEffect.particleIds.add(particleId);

        return true;
    }

    private setupEventListeners(): void {
        window.addEventListener('resize', this.resizeCanvas);
        document.addEventListener('visibilitychange', this.handleVisibilityChange);
    }

    private resizeCanvas = (): void => {
        if (!this.canvas) return;

        const dpr = window.devicePixelRatio || 1;
        const width = window.innerWidth;
        const height = window.innerHeight;

        this.canvas.width = width * dpr;
        this.canvas.height = height * dpr;
        this.canvas.style.width = `${width}px`;
        this.canvas.style.height = `${height}px`;

        if (this.ctx) {
            // Reset transformation and reapply scale
            this.ctx.setTransform(1, 0, 0, 1, 0, 0);
            this.ctx.scale(dpr, dpr);
        }
    };

    private handleVisibilityChange = (): void => {
        this.isVisible = !document.hidden;
    };

    private startRenderLoop(): void {
        this.lastFrameTime = performance.now();
        this.animationId = requestAnimationFrame(this.renderLoop);
    }

    private stopRenderLoop(): void {
        if (this.animationId !== null) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    private renderLoop = (currentTime: number): void => {
        this.animationId = requestAnimationFrame(this.renderLoop);

        if (this.isPaused || !this.isVisible || !this.ctx || !this.canvas) {
            return;
        }

        let deltaTime = currentTime - this.lastFrameTime;
        this.lastFrameTime = currentTime;
        deltaTime = Math.min(deltaTime, PERFORMANCE_BUDGET.MAX_DELTA_CLAMP);
        const deltaNormalized = deltaTime / 16.67;

        const frameStartTime = this.performanceMonitor.startFrame();

        // Clear canvas
        const dpr = window.devicePixelRatio || 1;
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.scale(dpr, dpr);

        // Handle continuous spawning for active effects
        this.activeEffects.forEach((activeEffect, effectId) => {
            const intensity = activeEffect.options.intensity || 'medium';
            const config = INTENSITY_MAP[intensity];
            const spawnInterval = 1000 / config.spawnRate; // ms between spawns

            if (currentTime - activeEffect.lastSpawnTime >= spawnInterval) {
                this.spawnParticleForEffect(effectId, activeEffect);
                activeEffect.lastSpawnTime = currentTime;
            }
        });

        // Update and render particles
        const toRemove: string[] = [];
        this.particles.forEach((entry, particleId) => {
            const activeEffect = this.activeEffects.get(entry.effectId);
            if (!activeEffect) {
                toRemove.push(particleId);
                return;
            }

            const shouldKeep = activeEffect.renderer.update(entry.particle, deltaNormalized, this.canvas!);

            if (!shouldKeep) {
                toRemove.push(particleId);
                return;
            }

            activeEffect.renderer.render(this.ctx!, entry.particle);
        });

        // Remove dead particles
        toRemove.forEach(particleId => {
            const entry = this.particles.get(particleId);
            if (entry) {
                const activeEffect = this.activeEffects.get(entry.effectId);
                if (activeEffect) {
                    activeEffect.particleIds.delete(particleId);
                }
                this.pool.release(entry.particle);
                this.particles.delete(particleId);
            }
        });

        this.performanceMonitor.endFrame(frameStartTime, this.particles.size);

        if (this.performanceMonitor.isCritical() && this.globalIntensity !== 'low') {
            console.warn('Performance critical, reducing intensity');
            this.setIntensity('low');
        }
    };

    private createNoOpInstance(type: EffectType): EffectInstance {
        return {
            id: `noop-${type}`,
            type,
            stop: () => { },
        };
    }

    private emit(event: string, data: any): void {
        const listeners = this.eventListeners.get(event);
        if (!listeners) return;

        listeners.forEach(listener => {
            try {
                listener(data);
            } catch (error) {
                console.error(`Error in event listener for "${event}":`, error);
            }
        });
    }
}
