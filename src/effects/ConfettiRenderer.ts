import type { Particle, EffectOptions } from '../engine/types';
import { INTENSITY_MAP } from '../engine/types';
import type { EffectRenderer } from '../engine/ParticleEngine';

/**
 * Confetti Effect Renderer (v2.0)
 * 
 * Specifications:
 * - Motion: Initial vy: -8 to -15; vx: ±6; Gravity: ay = 0.25
 * - Tumble: rotationSpeed: ±0.15 rad/frame
 * - Visual: Rectangles (8×4px), circles (4px); Vibrant colors
 * - Max Particles: 100 (burst only)
 * - Industry Rule: Event-based, auto-clear after burst
 */
export class ConfettiRenderer implements EffectRenderer {
    private readonly MAX_PARTICLES = 100;
    private readonly COLORS = [
        '#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181',
        '#45B7D1', '#F9CA24', '#6C5CE7', '#FD79A8',
    ];

    spawn(particle: Particle, options: EffectOptions): void {
        const intensity = options.intensity || 'medium';
        const config = INTENSITY_MAP[intensity];

        // Spawn from center or specified origin
        particle.x = window.innerWidth / 2 + (Math.random() - 0.5) * 100;
        particle.y = window.innerHeight / 2;

        // Initial velocity (spec: vy -8 to -15, vx ±6)
        particle.vx = (Math.random() - 0.5) * 12 * config.speedMultiplier;
        particle.vy = (-8 - Math.random() * 7) * config.speedMultiplier;

        // Gravity (spec: ay = 0.25)
        particle.ax = 0;
        particle.ay = 0.25;

        // Visual (mix of rectangles and circles)
        const isCircle = Math.random() < 0.3;
        particle.size = isCircle ? 4 : 8;
        particle.opacity = config.opacityRange[0] +
            Math.random() * (config.opacityRange[1] - config.opacityRange[0]);
        particle.color = this.COLORS[Math.floor(Math.random() * this.COLORS.length)];

        // Tumble (spec: ±0.15 rad/frame)
        particle.rotation = Math.random() * Math.PI * 2;
        particle.rotationSpeed = (Math.random() - 0.5) * 0.3;

        // Lifecycle (4-7 seconds)
        particle.life = 0;
        particle.maxLife = (4 + Math.random() * 3) * 60; // 60 frames per second
        particle.phase = 'active';

        // Metadata
        particle.meta.isCircle = isCircle;
        particle.meta.width = isCircle ? particle.size : 8;
        particle.meta.height = isCircle ? particle.size : 4;
    }

    update(particle: Particle, deltaTime: number, canvas: HTMLCanvasElement): boolean {
        // Apply acceleration (gravity)
        particle.vy += particle.ay * deltaTime;
        particle.vx += particle.ax * deltaTime;

        // Update position
        particle.x += particle.vx * deltaTime;
        particle.y += particle.vy * deltaTime;

        // Update rotation
        particle.rotation += particle.rotationSpeed * deltaTime;

        // Increment life
        particle.life += deltaTime;

        // Fade out near end
        if (particle.life > particle.maxLife * 0.8) {
            const fadeProgress = (particle.life - particle.maxLife * 0.8) / (particle.maxLife * 0.2);
            particle.opacity = Math.max(0, 1 - fadeProgress);
        }

        // Remove when dead or off-screen
        return particle.life < particle.maxLife && particle.y < window.innerHeight + 50;
    }

    render(ctx: CanvasRenderingContext2D, particle: Particle): void {
        ctx.save();
        ctx.globalAlpha = particle.opacity;
        ctx.translate(particle.x, particle.y);
        ctx.rotate(particle.rotation);

        const color = typeof particle.color === 'string'
            ? particle.color
            : `rgb(${particle.color[0]}, ${particle.color[1]}, ${particle.color[2]})`;
        ctx.fillStyle = color;

        if (particle.meta.isCircle) {
            ctx.beginPath();
            ctx.arc(0, 0, particle.size / 2, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.fillRect(-particle.meta.width / 2, -particle.meta.height / 2,
                particle.meta.width, particle.meta.height);
        }

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
