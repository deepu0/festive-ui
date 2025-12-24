import type { Particle, EffectOptions } from '../engine/types';
import { INTENSITY_MAP } from '../engine/types';
import type { EffectRenderer } from '../engine/ParticleEngine';

/**
 * Fireworks Effect Renderer (v2.0)
 * 
 * Specifications:
 * - Phase 1: Launch rocket (vy: -12 to -18); trail optional
 * - Phase 2: Burst (30-60 particles); radial velocity; deceleration v *= 0.96
 * - Max Particles: 80 per burst
 * - Industry Rule: Max 3 concurrent bursts
 */
export class FireworksRenderer implements EffectRenderer {
    private readonly MAX_PARTICLES = 80;

    spawn(particle: Particle, options: EffectOptions): void {
        const intensity = options.intensity || 'medium';
        const config = INTENSITY_MAP[intensity];

        // Launch from bottom
        particle.x = Math.random() * window.innerWidth;
        particle.y = window.innerHeight;

        // Rocket velocity (spec: vy -12 to -18)
        particle.vx = 0;
        particle.vy = (-12 - Math.random() * 6) * config.speedMultiplier;

        // No acceleration initially
        particle.ax = 0;
        particle.ay = 0;

        // Visual
        particle.size = 3;
        particle.opacity = 1;
        particle.color = [255, 255, 200]; // Yellow-white rocket

        // No rotation
        particle.rotation = 0;
        particle.rotationSpeed = 0;

        // Lifecycle
        particle.life = 0;
        particle.maxLife = Infinity;
        particle.phase = 'spawning'; // Will be 'rocket' phase

        // Metadata
        particle.meta.isRocket = true;
        particle.meta.targetY = window.innerHeight * (0.2 + Math.random() * 0.3);
        particle.meta.burstColor = this.getRandomFireworkColor();
    }

    update(particle: Particle, deltaTime: number, canvas: HTMLCanvasElement): boolean {
        if (particle.meta.isRocket) {
            // Rocket phase
            particle.y += particle.vy * deltaTime;
            particle.life += deltaTime;

            // Check if rocket reached apex
            if (particle.y <= particle.meta.targetY || particle.vy > 0) {
                // Trigger burst - this would be handled by spawning new particles
                // For now, just mark for removal
                return false;
            }
        } else {
            // Burst particle phase
            // Apply deceleration (spec: v *= 0.96)
            particle.vx *= Math.pow(0.96, deltaTime);
            particle.vy *= Math.pow(0.96, deltaTime);

            // Gravity
            particle.vy += 0.05 * deltaTime;

            // Update position
            particle.x += particle.vx * deltaTime;
            particle.y += particle.vy * deltaTime;

            // Fade out
            particle.life += deltaTime;
            const fadeStart = particle.maxLife * 0.7;
            if (particle.life > fadeStart) {
                particle.opacity = 1 - (particle.life - fadeStart) / (particle.maxLife - fadeStart);
            }

            // Remove when dead
            return particle.life < particle.maxLife;
        }

        return true;
    }

    render(ctx: CanvasRenderingContext2D, particle: Particle): void {
        ctx.save();
        ctx.globalAlpha = particle.opacity;

        const color = typeof particle.color === 'string'
            ? particle.color
            : `rgb(${particle.color[0]}, ${particle.color[1]}, ${particle.color[2]})`;
        ctx.fillStyle = color;

        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    getMaxParticles(options: EffectOptions): number {
        const intensity = options.intensity || 'medium';
        const config = INTENSITY_MAP[intensity];
        return Math.min(
            Math.floor(this.MAX_PARTICLES * config.countMultiplier),
            this.MAX_PARTICLES
        );
    }

    private getRandomFireworkColor(): [number, number, number] {
        const colors: [number, number, number][] = [
            [255, 107, 107], // Red
            [78, 205, 196], // Teal
            [249, 202, 36], // Yellow
            [108, 92, 231], // Purple
            [253, 121, 168], // Pink
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }
}
