import type { Particle, EffectOptions } from '../engine/types';
import { INTENSITY_MAP } from '../engine/types';
import type { EffectRenderer } from '../engine/ParticleEngine';

/**
 * Hearts Effect Renderer (v2.0)
 * 
 * Specifications:
 * - Motion: vy: -0.5 to -1.2; vx: sinusoidal ±0.2; Scale-in: 0 → 1 over 300ms
 * - Visual: Bézier heart path; Pink/red colors; Opacity: 0.5–0.8
 * - Size: 12–24px
 * - Max Particles: 25
 * - Industry Rule: Low density, max 1 spawn per 400ms
 */
export class HeartsRenderer implements EffectRenderer {
    private readonly MAX_PARTICLES = 25;
    private readonly COLORS = ['#FF6B6B', '#EE5A5A', '#FF8E8E', '#FD79A8'];

    spawn(particle: Particle, options: EffectOptions): void {
        const intensity = options.intensity || 'medium';
        const config = INTENSITY_MAP[intensity];

        // Spawn from bottom
        particle.x = Math.random() * window.innerWidth;
        particle.y = window.innerHeight + 20;

        // Velocity (spec: vy -0.5 to -1.2)
        particle.vx = 0;
        particle.vy = (-0.5 - Math.random() * 0.7) * config.speedMultiplier;

        // No acceleration
        particle.ax = 0;
        particle.ay = 0;

        // Visual (spec: 12-24px)
        particle.size = 12 + Math.random() * 12;
        particle.opacity = 0.5 + Math.random() * 0.3; // 0.5-0.8
        particle.color = this.COLORS[Math.floor(Math.random() * this.COLORS.length)];

        // No rotation
        particle.rotation = 0;
        particle.rotationSpeed = 0;

        // Lifecycle
        particle.life = 0;
        particle.maxLife = Infinity;
        particle.phase = 'spawning';

        // Metadata for scale-in and sway
        particle.meta.swayOffset = Math.random() * Math.PI * 2;
        particle.meta.swaySpeed = 0.02 + Math.random() * 0.02;
        particle.meta.scale = 0; // Start at 0 for scale-in animation
        particle.meta.scaleInDuration = 18; // 300ms at 60fps
    }

    update(particle: Particle, deltaTime: number, canvas: HTMLCanvasElement): boolean {
        // Scale-in animation (0 → 1 over 300ms)
        if (particle.phase === 'spawning') {
            particle.meta.scale = Math.min(1, particle.meta.scale + deltaTime / particle.meta.scaleInDuration);
            if (particle.meta.scale >= 1) {
                particle.phase = 'active';
            }
        }

        // Sinusoidal sway (spec: vx sinusoidal ±0.2)
        particle.meta.swayOffset += particle.meta.swaySpeed * deltaTime;
        const sway = Math.sin(particle.meta.swayOffset) * 0.2;

        // Update position
        particle.x += sway * deltaTime;
        particle.y += particle.vy * deltaTime;

        // Increment life
        particle.life += deltaTime;

        // Fade out when reaching top 20% of screen
        if (particle.y < window.innerHeight * 0.2) {
            const fadeZone = window.innerHeight * 0.2;
            particle.opacity = Math.max(0, particle.y / fadeZone * 0.8);
        }

        // Remove when off-screen
        return particle.y > -particle.size;
    }

    render(ctx: CanvasRenderingContext2D, particle: Particle): void {
        ctx.save();
        ctx.globalAlpha = particle.opacity;
        ctx.translate(particle.x, particle.y);

        // Apply scale
        const scale = particle.meta.scale || 1;
        ctx.scale(scale, scale);

        const color = typeof particle.color === 'string'
            ? particle.color
            : `rgb(${particle.color[0]}, ${particle.color[1]}, ${particle.color[2]})`;
        ctx.fillStyle = color;

        // Draw heart shape using Bézier curves
        const size = particle.size;
        ctx.beginPath();
        ctx.moveTo(0, size / 4);
        ctx.bezierCurveTo(-size / 2, -size / 4, -size, size / 8, 0, size);
        ctx.bezierCurveTo(size, size / 8, size / 2, -size / 4, 0, size / 4);
        ctx.closePath();
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
