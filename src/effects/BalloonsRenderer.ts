import type { Particle, EffectOptions } from '../engine/types';
import { INTENSITY_MAP } from '../engine/types';
import type { EffectRenderer } from '../engine/ParticleEngine';

/**
 * Balloons Effect Renderer (v2.0)
 * 
 * Specifications:
 * - Motion: vy: -0.4 to -0.8; vx: sinusoidal ±0.15
 * - Visual: Ellipse with highlight; String line; Bright primaries
 * - Size: 30–50px
 * - Max Particles: 12
 * - Industry Rule: > 15 balloons = too childish
 */
export class BalloonsRenderer implements EffectRenderer {
    private readonly MAX_PARTICLES = 12;
    private readonly COLORS = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181', '#45B7D1'];

    spawn(particle: Particle, options: EffectOptions): void {
        const intensity = options.intensity || 'medium';
        const config = INTENSITY_MAP[intensity];

        // Spawn from bottom
        particle.x = Math.random() * window.innerWidth;
        particle.y = window.innerHeight + 50;

        // Upward velocity (spec: vy -0.4 to -0.8)
        particle.vx = 0;
        particle.vy = (-0.4 - Math.random() * 0.4) * config.speedMultiplier;

        // No acceleration
        particle.ax = 0;
        particle.ay = 0;

        // Visual (spec: 30-50px)
        particle.size = 30 + Math.random() * 20;
        particle.opacity = 0.6 + Math.random() * 0.25; // 0.6-0.85
        particle.color = this.COLORS[Math.floor(Math.random() * this.COLORS.length)];

        // No rotation
        particle.rotation = 0;
        particle.rotationSpeed = 0;

        // Lifecycle
        particle.life = 0;
        particle.maxLife = Infinity;
        particle.phase = 'active';

        // Metadata for sway
        particle.meta.swayOffset = Math.random() * Math.PI * 2;
        particle.meta.swaySpeed = 0.02 + Math.random() * 0.02;
    }

    update(particle: Particle, deltaTime: number, canvas: HTMLCanvasElement): boolean {
        // Sinusoidal sway (spec: ±0.15)
        particle.meta.swayOffset += particle.meta.swaySpeed * deltaTime;
        const sway = Math.sin(particle.meta.swayOffset) * 0.15;

        // Update position
        particle.x += sway * deltaTime;
        particle.y += particle.vy * deltaTime;

        // Increment life
        particle.life += deltaTime;

        // Respawn at bottom when off screen
        if (particle.y < -particle.size) {
            particle.y = window.innerHeight + 50;
            particle.x = Math.random() * window.innerWidth;
            particle.life = 0;
        }

        return true;
    }

    render(ctx: CanvasRenderingContext2D, particle: Particle): void {
        ctx.save();
        ctx.globalAlpha = particle.opacity;

        const color = typeof particle.color === 'string'
            ? particle.color
            : `rgb(${particle.color[0]}, ${particle.color[1]}, ${particle.color[2]})`;

        // Draw string
        ctx.strokeStyle = 'rgba(100, 100, 100, 0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(particle.x, particle.y);
        ctx.lineTo(particle.x, particle.y + particle.size * 0.8);
        ctx.stroke();

        // Draw balloon (ellipse)
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.ellipse(particle.x, particle.y, particle.size * 0.45, particle.size * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.ellipse(particle.x - particle.size * 0.15, particle.y - particle.size * 0.15,
            particle.size * 0.15, particle.size * 0.2, 0, 0, Math.PI * 2);
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
