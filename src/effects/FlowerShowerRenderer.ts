import type { Particle, EffectOptions } from '../engine/types';
import { INTENSITY_MAP } from '../engine/types';
import type { EffectRenderer } from '../engine/ParticleEngine';

/**
 * Flower Shower Effect Renderer (v2.0)
 * 
 * Specifications:
 * - Motion: vy: 0.5–1.2; Gentle rotation; Float pattern
 * - Visual: Petal shapes (ellipse or path); Marigold, rose, jasmine colors
 * - Size: 8–18px
 * - Max Particles: 35
 * - Industry Rule: Abstract petals only, no photorealism
 */
export class FlowerShowerRenderer implements EffectRenderer {
    private readonly MAX_PARTICLES = 35;
    private readonly COLORS = ['#FF9933', '#FFD700', '#FF6347', '#FFDB58', '#FFA07A'];

    spawn(particle: Particle, options: EffectOptions): void {
        const intensity = options.intensity || 'medium';
        const config = INTENSITY_MAP[intensity];

        // Spawn from top
        particle.x = Math.random() * window.innerWidth;
        particle.y = -20;

        // Gentle fall (spec: vy 0.5-1.2)
        particle.vx = 0;
        particle.vy = (0.5 + Math.random() * 0.7) * config.speedMultiplier;

        // No acceleration
        particle.ax = 0;
        particle.ay = 0;

        // Visual (spec: 8-18px)
        particle.size = 8 + Math.random() * 10;
        particle.opacity = config.opacityRange[0] +
            Math.random() * (config.opacityRange[1] - config.opacityRange[0]);
        particle.color = this.COLORS[Math.floor(Math.random() * this.COLORS.length)];

        // Gentle rotation
        particle.rotation = Math.random() * Math.PI * 2;
        particle.rotationSpeed = (Math.random() - 0.5) * 0.04;

        // Lifecycle
        particle.life = 0;
        particle.maxLife = Infinity;
        particle.phase = 'active';

        // Metadata for float pattern
        particle.meta.floatOffset = Math.random() * Math.PI * 2;
        particle.meta.floatSpeed = 0.03 + Math.random() * 0.03;
    }

    update(particle: Particle, deltaTime: number, canvas: HTMLCanvasElement): boolean {
        // Float pattern
        particle.meta.floatOffset += particle.meta.floatSpeed * deltaTime;
        const floatX = Math.sin(particle.meta.floatOffset) * 0.5;

        // Update position
        particle.x += floatX * deltaTime;
        particle.y += particle.vy * deltaTime;

        // Update rotation
        particle.rotation += particle.rotationSpeed * deltaTime;

        // Increment life
        particle.life += deltaTime;

        // Respawn at top when off-screen
        if (particle.y > window.innerHeight + particle.size) {
            particle.y = -20;
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

        const color = typeof particle.color === 'string'
            ? particle.color
            : `rgb(${particle.color[0]}, ${particle.color[1]}, ${particle.color[2]})`;
        ctx.fillStyle = color;

        // Draw abstract petal (simple oval)
        ctx.beginPath();
        ctx.ellipse(0, 0, particle.size * 0.3, particle.size * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Add petal details (smaller ovals)
        ctx.globalAlpha = particle.opacity * 0.6;
        ctx.beginPath();
        ctx.ellipse(-particle.size * 0.15, 0, particle.size * 0.15, particle.size * 0.3, Math.PI / 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(particle.size * 0.15, 0, particle.size * 0.15, particle.size * 0.3, -Math.PI / 6, 0, Math.PI * 2);
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
