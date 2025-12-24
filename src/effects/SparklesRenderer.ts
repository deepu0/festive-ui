import type { Particle, EffectOptions } from '../engine/types';
import { INTENSITY_MAP } from '../engine/types';
import type { EffectRenderer } from '../engine/ParticleEngine';

/**
 * Sparkles Effect Renderer (v2.0)
 * 
 * Specifications:
 * - Motion: Scale: 0 → 1 → 0 (ease-out-in); Drift: optional ±0.1 px/frame
 * - Visual: 4-point or 6-point star; Colors: #FFFFFF, #FFD700; Opacity pulse
 * - Composite: 'lighter'
 * - Max Particles: 30
 * - Industry Rule: Restraint suggests magic, no travel paths
 */
export class SparklesRenderer implements EffectRenderer {
    private readonly MAX_PARTICLES = 30;
    private readonly COLORS = ['#FFFFFF', '#FFD700', '#FFF8DC'];

    spawn(particle: Particle, options: EffectOptions): void {
        const intensity = options.intensity || 'medium';
        const config = INTENSITY_MAP[intensity];

        // Random screen placement
        particle.x = Math.random() * window.innerWidth;
        particle.y = Math.random() * window.innerHeight;

        // Minimal drift
        particle.vx = (Math.random() - 0.5) * 0.2;
        particle.vy = (Math.random() - 0.5) * 0.2;

        // No acceleration
        particle.ax = 0;
        particle.ay = 0;

        // Visual
        particle.size = 4 + Math.random() * 4;
        particle.opacity = config.opacityRange[0];
        particle.color = this.COLORS[Math.floor(Math.random() * this.COLORS.length)];

        // No rotation
        particle.rotation = Math.random() * Math.PI * 2;
        particle.rotationSpeed = 0;

        // Lifecycle (600-1200ms)
        particle.life = 0;
        particle.maxLife = (36 + Math.random() * 36); // 600-1200ms at 60fps
        particle.phase = 'spawning';

        // Metadata
        particle.meta.pointCount = Math.random() < 0.5 ? 4 : 6;
        particle.meta.scale = 0;
    }

    update(particle: Particle, deltaTime: number, canvas: HTMLCanvasElement): boolean {
        // Scale animation: 0 → 1 → 0
        const halfLife = particle.maxLife / 2;
        if (particle.life < halfLife) {
            // Growing phase
            particle.meta.scale = this.easeOut(particle.life / halfLife);
            particle.phase = 'spawning';
        } else {
            // Shrinking phase
            const shrinkProgress = (particle.life - halfLife) / halfLife;
            particle.meta.scale = 1 - this.easeIn(shrinkProgress);
            particle.phase = 'dying';
        }

        // Optional drift
        particle.x += particle.vx * deltaTime;
        particle.y += particle.vy * deltaTime;

        // Opacity pulse
        particle.opacity = 0.6 + Math.sin(particle.life * 0.15) * 0.3;

        // Increment life
        particle.life += deltaTime;

        // Remove when animation complete
        return particle.life < particle.maxLife;
    }

    render(ctx: CanvasRenderingContext2D, particle: Particle): void {
        ctx.save();

        // Use 'lighter' composite
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = particle.opacity * particle.meta.scale;
        ctx.translate(particle.x, particle.y);
        ctx.rotate(particle.rotation);

        const color = typeof particle.color === 'string'
            ? particle.color
            : `rgb(${particle.color[0]}, ${particle.color[1]}, ${particle.color[2]})`;
        ctx.fillStyle = color;

        // Draw star
        const points = particle.meta.pointCount;
        const outerRadius = particle.size * particle.meta.scale;
        const innerRadius = outerRadius * 0.4;

        ctx.beginPath();
        for (let i = 0; i < points * 2; i++) {
            const angle = (Math.PI * i) / points;
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
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

    private easeOut(t: number): number {
        return 1 - Math.pow(1 - t, 3);
    }

    private easeIn(t: number): number {
        return Math.pow(t, 3);
    }
}
