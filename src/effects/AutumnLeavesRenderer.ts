import type { Particle, EffectOptions } from '../engine/types';
import { INTENSITY_MAP } from '../engine/types';
import type { EffectRenderer } from '../engine/ParticleEngine';

/**
 * Autumn Leaves Effect Renderer (v2.0)
 * 
 * Specifications:
 * - Motion: vy: 1–2.5; vx: 0.3–0.8 (diagonal); Sway: sinusoidal; ay: 0.01
 * - Rotation: rotationSpeed: ±0.03 rad/frame
 * - Visual: Leaf silhouette; Fall colors
 * - Max Particles: 40
 * - Industry Rule: Natural randomness, vary spawn ±30%
 */
export class AutumnLeavesRenderer implements EffectRenderer {
    private readonly MAX_PARTICLES = 40;
    private readonly COLORS = ['#D4A574', '#C17F59', '#8B4513', '#CD853F', '#DAA520'];

    spawn(particle: Particle, options: EffectOptions): void {
        const intensity = options.intensity || 'medium';
        const config = INTENSITY_MAP[intensity];

        // Spawn from top-left quadrant off-screen
        particle.x = -20 + Math.random() * (window.innerWidth * 0.3);
        particle.y = -20 - Math.random() * 50;

        // Diagonal motion (spec: vy 1-2.5, vx 0.3-0.8)
        particle.vx = (0.3 + Math.random() * 0.5) * config.speedMultiplier;
        particle.vy = (1 + Math.random() * 1.5) * config.speedMultiplier;

        // Slight acceleration (spec: ay 0.01)
        particle.ax = 0;
        particle.ay = 0.01;

        // Visual (spec: 15-30px)
        particle.size = 15 + Math.random() * 15;
        particle.opacity = config.opacityRange[0] +
            Math.random() * (config.opacityRange[1] - config.opacityRange[0]);
        particle.color = this.COLORS[Math.floor(Math.random() * this.COLORS.length)];

        // Rotation (spec: ±0.03 rad/frame)
        particle.rotation = Math.random() * Math.PI * 2;
        particle.rotationSpeed = (Math.random() - 0.5) * 0.06;

        // Lifecycle
        particle.life = 0;
        particle.maxLife = Infinity;
        particle.phase = 'active';

        // Metadata for sway
        particle.meta.swayOffset = Math.random() * Math.PI * 2;
        particle.meta.swaySpeed = 0.02 + Math.random() * 0.02;
    }

    update(particle: Particle, deltaTime: number, canvas: HTMLCanvasElement): boolean {
        // Apply acceleration
        particle.vy += particle.ay * deltaTime;

        // Sinusoidal sway
        particle.meta.swayOffset += particle.meta.swaySpeed * deltaTime;
        const sway = Math.sin(particle.meta.swayOffset) * 1.5;

        // Update position
        particle.x += (particle.vx + sway * 0.1) * deltaTime;
        particle.y += particle.vy * deltaTime;

        // Update rotation
        particle.rotation += particle.rotationSpeed * deltaTime;

        // Increment life
        particle.life += deltaTime;

        // Respawn at top when off screen
        if (particle.y > window.innerHeight + particle.size || particle.x > window.innerWidth + particle.size) {
            particle.x = -20 + Math.random() * (window.innerWidth * 0.3);
            particle.y = -20 - Math.random() * 50;
            particle.life = 0;
        }

        return true;
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

        // Draw leaf shape (simple oval with stem)
        const w = particle.size * 0.6;
        const h = particle.size;

        ctx.beginPath();
        ctx.ellipse(0, 0, w / 2, h / 2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Stem
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, h / 4);
        ctx.lineTo(0, h / 2);
        ctx.stroke();

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
