import type { Particle, EffectOptions } from '../engine/types';
import { INTENSITY_MAP } from '../engine/types';
import type { EffectRenderer } from '../engine/ParticleEngine';

/**
 * Sky Lanterns Effect Renderer (v2.0)
 * 
 * Specifications:
 * - Motion: vy: -0.3 to -0.6; vx: sinusoidal ±0.1; Slight rotation
 * - Visual: Lantern silhouette (rounded rect); Inner glow radial gradient
 * - Size: 40–70px
 * - Max Particles: 6
 * - Industry Rule: Hero elements, max 8, more = visual clutter
 */
export class SkyLanternsRenderer implements EffectRenderer {
    private readonly MAX_PARTICLES = 6;

    spawn(particle: Particle, options: EffectOptions): void {
        const intensity = options.intensity || 'medium';
        const config = INTENSITY_MAP[intensity];

        // Spawn from bottom
        particle.x = Math.random() * window.innerWidth;
        particle.y = window.innerHeight + 80;

        // Slow ascent (spec: vy -0.3 to -0.6)
        particle.vx = 0;
        particle.vy = (-0.3 - Math.random() * 0.3) * config.speedMultiplier;

        // No acceleration
        particle.ax = 0;
        particle.ay = 0;

        // Visual (spec: 40-70px)
        particle.size = 40 + Math.random() * 30;
        particle.opacity = 0.7 + Math.random() * 0.2;
        particle.color = [255, 165, 0]; // Orange glow

        // Slight rotation
        particle.rotation = (Math.random() - 0.5) * 0.1;
        particle.rotationSpeed = (Math.random() - 0.5) * 0.01;

        // Lifecycle
        particle.life = 0;
        particle.maxLife = Infinity;
        particle.phase = 'active';

        // Metadata for sway
        particle.meta.swayOffset = Math.random() * Math.PI * 2;
        particle.meta.swaySpeed = 0.015 + Math.random() * 0.015;
    }

    update(particle: Particle, deltaTime: number, canvas: HTMLCanvasElement): boolean {
        // Sinusoidal sway (spec: ±0.1)
        particle.meta.swayOffset += particle.meta.swaySpeed * deltaTime;
        const sway = Math.sin(particle.meta.swayOffset) * 0.1;

        // Update position
        particle.x += sway * deltaTime;
        particle.y += particle.vy * deltaTime;

        // Update rotation
        particle.rotation += particle.rotationSpeed * deltaTime;

        // Increment life
        particle.life += deltaTime;

        // Respawn at bottom when off-screen
        if (particle.y < -particle.size * 2) {
            particle.y = window.innerHeight + 80;
            particle.x = Math.random() * window.innerWidth;
            particle.life = 0;
        }

        return true;
    }

    render(ctx: CanvasRenderingContext2D, particle: Particle): void {
        ctx.save();
        ctx.globalAlpha = particle.opacity;
        ctx.translate(particle.x, particle.y);
        ctx.rotate(particle.rotation);

        const w = particle.size;
        const h = particle.size * 1.4;

        // Inner glow (radial gradient)
        const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, w * 0.8);
        glow.addColorStop(0, 'rgba(255, 200, 100, 0.9)');
        glow.addColorStop(0.5, 'rgba(255, 165, 0, 0.6)');
        glow.addColorStop(1, 'rgba(255, 140, 0, 0)');

        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(0, 0, w * 0.8, 0, Math.PI * 2);
        ctx.fill();

        // Lantern silhouette (rounded rect)
        ctx.fillStyle = 'rgba(139, 69, 19, 0.8)';
        ctx.strokeStyle = 'rgba(210, 180, 140, 0.6)';
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.roundRect(-w / 2, -h / 2, w, h, [w * 0.15]);
        ctx.fill();
        ctx.stroke();

        // Horizontal lines (lantern frame)
        ctx.strokeStyle = 'rgba(139, 69, 19, 0.4)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 3; i++) {
            const y = -h / 2 + (h / 4) * (i + 1);
            ctx.beginPath();
            ctx.moveTo(-w / 2, y);
            ctx.lineTo(w / 2, y);
            ctx.stroke();
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
