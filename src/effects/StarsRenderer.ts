import type { Particle, EffectOptions } from '../engine/types';
import { INTENSITY_MAP } from '../engine/types';
import type { EffectRenderer } from '../engine/ParticleEngine';

/**
 * Stars Effect Renderer (v2.0)
 * 
 * Specifications:
 * - Motion: None or drift < 0.05 px/frame
 * - Twinkle: Opacity: 0.3 + Math.sin(time * 0.005 + seed) * 0.4
 * - Visual: Dots 1–3px or 4-point stars; Colors: white/cream
 * - Max Particles: 60
 * - Industry Rule: Environmental texture, never foreground
 */
export class StarsRenderer implements EffectRenderer {
    private readonly MAX_PARTICLES = 60;
    private readonly COLORS = ['#FFFFFF', '#FFFACD', '#FFF8DC'];

    spawn(particle: Particle, options: EffectOptions): void {
        const intensity = options.intensity || 'medium';
        const config = INTENSITY_MAP[intensity];

        // Random screen position
        particle.x = Math.random() * window.innerWidth;
        particle.y = Math.random() * window.innerHeight;

        // Minimal drift (spec: < 0.05)
        particle.vx = (Math.random() - 0.5) * 0.08;
        particle.vy = (Math.random() - 0.5) * 0.08;

        // No acceleration
        particle.ax = 0;
        particle.ay = 0;

        // Visual (spec: 1-3px)
        particle.size = 1 + Math.random() * 2;
        particle.opacity = 0.3;
        particle.color = this.COLORS[Math.floor(Math.random() * this.COLORS.length)];

        // Random rotation for star shape variety
        particle.rotation = Math.random() * Math.PI / 4;
        particle.rotationSpeed = 0;

        // Lifecycle (persistent)
        particle.life = 0;
        particle.maxLife = Infinity;
        particle.phase = 'active';

        // Metadata for twinkle
        particle.meta.twinkleSeed = Math.random() * Math.PI * 2;
        particle.meta.twinkleSpeed = 0.003 + Math.random() * 0.004;
        particle.meta.isStarShape = Math.random() < 0.3; // 30% are star shapes
    }

    update(particle: Particle, deltaTime: number, canvas: HTMLCanvasElement): boolean {
        // Minimal drift
        particle.x += particle.vx * deltaTime;
        particle.y += particle.vy * deltaTime;

        // Wrap around screen
        if (particle.x < 0) particle.x = window.innerWidth;
        if (particle.x > window.innerWidth) particle.x = 0;
        if (particle.y < 0) particle.y = window.innerHeight;
        if (particle.y > window.innerHeight) particle.y = 0;

        // Twinkle formula (spec: 0.3 + Math.sin(time * 0.005 + seed) * 0.4)
        particle.life += deltaTime;
        const time = particle.life;
        particle.opacity = 0.3 + Math.sin(time * particle.meta.twinkleSpeed + particle.meta.twinkleSeed) * 0.4;

        // Always keep (persistent)
        return true;
    }

    render(ctx: CanvasRenderingContext2D, particle: Particle): void {
        ctx.save();
        ctx.globalAlpha = Math.max(0, particle.opacity);

        const color = typeof particle.color === 'string'
            ? particle.color
            : `rgb(${particle.color[0]}, ${particle.color[1]}, ${particle.color[2]})`;

        if (particle.meta.isStarShape) {
            // Draw 4-point star
            ctx.fillStyle = color;
            ctx.translate(particle.x, particle.y);
            ctx.rotate(particle.rotation);

            const size = particle.size;
            ctx.beginPath();
            for (let i = 0; i < 8; i++) {
                const angle = (Math.PI * i) / 4;
                const radius = i % 2 === 0 ? size : size * 0.4;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.fill();
        } else {
            // Draw dot
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size / 2, 0, Math.PI * 2);
            ctx.fill();
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
