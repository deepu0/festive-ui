import type { Particle } from './types';

/**
 * Object Pool for Particle Reuse
 * Eliminates GC pressure from constant object creation/destruction
 */
export class ParticlePool {
    private pool: Particle[] = [];
    private readonly maxSize: number;
    private activeCount = 0;

    constructor(maxSize: number = 500) {
        this.maxSize = maxSize;
        this.prewarm(Math.min(100, maxSize)); // Prewarm with 100 particles
    }

    /**
     * Pre-create particles to avoid allocation during animation
     */
    prewarm(count: number): void {
        for (let i = 0; i < count; i++) {
            this.pool.push(this.createParticle());
        }
    }

    /**
     * Acquire a particle from the pool
     */
    acquire(): Particle {
        this.activeCount++;

        if (this.pool.length > 0) {
            const particle = this.pool.pop()!;
            this.resetParticle(particle);
            return particle;
        }

        // Pool exhausted, create new (should be rare)
        return this.createParticle();
    }

    /**
     * Release a particle back to the pool
     */
    release(particle: Particle): void {
        this.activeCount = Math.max(0, this.activeCount - 1);

        if (this.pool.length < this.maxSize) {
            this.resetParticle(particle);
            this.pool.push(particle);
        }
        // If pool is full, let GC handle it
    }

    /**
     * Get current active particle count
     */
    getActiveCount(): number {
        return this.activeCount;
    }

    /**
     * Get pool size
     */
    getPoolSize(): number {
        return this.pool.length;
    }

    /**
     * Clear the pool
     */
    clear(): void {
        this.pool.length = 0;
        this.activeCount = 0;
    }

    /**
     * Create a new particle with default values
     */
    private createParticle(): Particle {
        return {
            x: 0,
            y: 0,
            vx: 0,
            vy: 0,
            ax: 0,
            ay: 0,
            size: 0,
            opacity: 1,
            color: '#FFFFFF',
            rotation: 0,
            rotationSpeed: 0,
            life: 0,
            maxLife: 100,
            phase: 'active',
            meta: {},
        };
    }

    /**
     * Reset particle to default state
     */
    private resetParticle(particle: Particle): void {
        particle.x = 0;
        particle.y = 0;
        particle.vx = 0;
        particle.vy = 0;
        particle.ax = 0;
        particle.ay = 0;
        particle.size = 0;
        particle.opacity = 1;
        particle.color = '#FFFFFF';
        particle.rotation = 0;
        particle.rotationSpeed = 0;
        particle.life = 0;
        particle.maxLife = 100;
        particle.phase = 'active';
        particle.meta = {};
    }
}
