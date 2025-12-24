import type { Particle, EffectOptions } from '../engine/types';
import { INTENSITY_MAP } from '../engine/types';
import type { EffectRenderer } from '../engine/ParticleEngine';

/**
 * Chakri (Ground Spinner) Effect Renderer (v2.0)
 * 
 * Specifications:
 * - Motion: Anchor point rotates; Sparks emit tangentially
 * - Spark Velocity: Tangent to rotation + slight outward
 * - Visual: Core spinning disc; Sparks 2–3px dots; Warm colors
 * - Max Particles: 40 sparks active
 * - Industry Rule: Small radius < 80px, large = dominate viewport
 */
export class ChakriRenderer implements EffectRenderer {
    private readonly MAX_PARTICLES = 40;
    private readonly COLORS = [[255, 165, 0], [255, 215, 0], [255, 255, 255]];

    spawn(particle: Particle, options: EffectOptions): void {
        const intensity = options.intensity || 'medium';
        const config = INTENSITY_MAP[intensity];

        // Static chakri position (center-bottom)
        const chakriX = window.innerWidth / 2;
        const chakriY = window.innerHeight - 100;

        // Rotating emission point
        const angle = Math.random() * Math.PI * 2;
        const radius = 40; // Small radius < 80px

        // Spark position starts at emission point
        particle.x = chakriX + Math.cos(angle) * radius;
        particle.y = chakriY + Math.sin(angle) * radius;

        // Tangential velocity + outward
        const speed = (2 + Math.random() * 2) * config.speedMultiplier;
        particle.vx = Math.cos(angle) * speed;
        particle.vy = Math.sin(angle) * speed;

        // No acceleration (sparks travel straight)
        particle.ax = 0;
        particle.ay = 0.1; // Slight gravity

        // Visual (spec: 2-3px)
        particle.size = 2 + Math.random();
        particle.opacity = 0.8 + Math.random() * 0.2;
        particle.color = this.COLORS[Math.floor(Math.random() * this.COLORS.length)];

        // No rotation
        particle.rotation = 0;
        particle.rotationSpeed = 0;

        // Lifecycle (short spark trail)
        particle.life = 0;
        particle.maxLife = (20 + Math.random() * 20); // ~0.3-0.7s at 60fps
        particle.phase = 'active';
    }

    update(particle: Particle, deltaTime: number, canvas: HTMLCanvasElement): boolean {
        // Apply gravity
        particle.vy += particle.ay * deltaTime;

        // Update position
        particle.x += particle.vx * deltaTime;
        particle.y += particle.vy * deltaTime;

        // Increment life
        particle.life += deltaTime;

        // Fade out
        const fadeStart = particle.maxLife * 0.5;
        if (particle.life > fadeStart) {
            const fadeProgress = (particle.life - fadeStart) / (particle.maxLife - fadeStart);
            particle.opacity = Math.max(0, 1 - fadeProgress);
        }

        // Remove when dead
        return particle.life < particle.maxLife;
    }

    render(ctx: CanvasRenderingContext2D, particle: Particle): void {
        ctx.save();
        ctx.globalAlpha = particle.opacity;

        const color = typeof particle.color === 'string'
            ? particle.color
            : `rgb(${particle.color[0]}, ${particle.color[1]}, ${particle.color[2]})`;

        // Draw spark (small dot with glow)
        ctx.fillStyle = color;
        ctx.shadowBlur = 4;
        ctx.shadowColor = color;
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
}
