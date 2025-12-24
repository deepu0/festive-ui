import type { Particle, EffectOptions } from '../engine/types';
import { INTENSITY_MAP } from '../engine/types';
import type { EffectRenderer } from '../engine/ParticleEngine';

/**
 * Diyas (Diwali Oil Lamps) Effect Renderer (v2.0)
 * 
 * Specifications:
 * - Motion: Static position; Flame flicker: scaleY: 1 + noise * 0.15; Opacity pulse
 * - Visual: Diya base (flat icon); Flame gradient; Glow halo
 * - Placement: Bottom edge; Spaced evenly or clustered
 * - Max Count: 8–12
 * - Industry Rule: Static, movement = disrespect to tradition
 */
export class DiyasRenderer implements EffectRenderer {
    private readonly MAX_PARTICLES = 12;

    spawn(particle: Particle, options: EffectOptions): void {
        const intensity = options.intensity || 'medium';
        const config = INTENSITY_MAP[intensity];

        // Static position at bottom edge
        const maxCount = this.getMaxParticles(options);
        const spacing = window.innerWidth / (maxCount + 1);
        const index = Math.floor(Math.random() * maxCount);

        particle.x = spacing * (index + 1);
        particle.y = window.innerHeight - 60;

        // No velocity (static)
        particle.vx = 0;
        particle.vy = 0;

        // No acceleration
        particle.ax = 0;
        particle.ay = 0;

        // Visual
        particle.size = 30 + Math.random() * 10;
        particle.opacity = 1;
        particle.color = [255, 165, 0]; // Orange flame

        // No rotation
        particle.rotation = 0;
        particle.rotationSpeed = 0;

        // Lifecycle (persistent)
        particle.life = 0;
        particle.maxLife = Infinity;
        particle.phase = 'active';

        // Metadata for flicker
        particle.meta.flickerSpeed = 0.1 + Math.random() * 0.1;
        particle.meta.flickerOffset = Math.random() * Math.PI * 2;
        particle.meta.glowPulse = Math.random() * Math.PI * 2;
    }

    update(particle: Particle, deltaTime: number, canvas: HTMLCanvasElement): boolean {
        // Flame flicker
        particle.life += deltaTime;
        particle.meta.flickerOffset += particle.meta.flickerSpeed * deltaTime;
        particle.meta.glowPulse += 0.05 * deltaTime;

        // Keep alive (persistent)
        return true;
    }

    render(ctx: CanvasRenderingContext2D, particle: Particle): void {
        ctx.save();

        // Glow halo
        const glowIntensity = 0.6 + Math.sin(particle.meta.glowPulse) * 0.2;
        const glow = ctx.createRadialGradient(
            particle.x, particle.y - particle.size * 0.3, 0,
            particle.x, particle.y - particle.size * 0.3, particle.size * 1.5
        );
        glow.addColorStop(0, `rgba(255, 165, 0, ${glowIntensity * 0.4})`);
        glow.addColorStop(0.5, `rgba(255, 140, 0, ${glowIntensity * 0.2})`);
        glow.addColorStop(1, 'rgba(255, 140, 0, 0)');

        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y - particle.size * 0.3, particle.size * 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Diya base (brown clay lamp)
        ctx.fillStyle = '#8B4513';
        ctx.beginPath();
        ctx.ellipse(particle.x, particle.y, particle.size * 0.5, particle.size * 0.2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Flame
        const flicker = 1 + Math.sin(particle.meta.flickerOffset) * 0.15;
        ctx.save();
        ctx.translate(particle.x, particle.y - particle.size * 0.3);
        ctx.scale(1, flicker);

        // Flame gradient
        const flameGradient = ctx.createLinearGradient(0, -particle.size * 0.4, 0, 0);
        flameGradient.addColorStop(0, '#FFD700');
        flameGradient.addColorStop(0.5, '#FFA500');
        flameGradient.addColorStop(1, '#FF4500');

        ctx.fillStyle = flameGradient;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(-particle.size * 0.15, -particle.size * 0.2, 0, -particle.size * 0.4);
        ctx.quadraticCurveTo(particle.size * 0.15, -particle.size * 0.2, 0, 0);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
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
