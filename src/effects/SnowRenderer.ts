import type { Particle, EffectOptions, IntensityLevel } from '../engine/types';
import { INTENSITY_MAP } from '../engine/types';
import type { EffectRenderer } from '../engine/ParticleEngine';

/**
 * Snow Effect Renderer (v2.0)
 * 
 * Specifications:
 * - Motion: vy: 0.5–1.5 px/frame; Drift: x += Math.sin(life * 0.02) * 0.5
 * - Visual: Circles, 2–5px, white #FFFFFF, opacity 0.5–0.85
 * - Composite: 'lighter' for glow overlap
 * - Max Particles: 80
 * - Industry Rule: Calming, no clustering, no speed variance > 2×
 */
export class SnowRenderer implements EffectRenderer {
    private readonly MAX_PARTICLES = 80;
    private readonly COLORS = ['#FFFFFF'];

    /**
     * Initialize/spawn a particle
     */
    spawn(particle: Particle, options: EffectOptions): void {
        const intensity = options.intensity || 'medium';
        const config = INTENSITY_MAP[intensity];

        // Random position at top of screen
        particle.x = Math.random() * window.innerWidth;
        particle.y = -10 - Math.random() * 50;

        // Velocity (follow spec: vy 0.5-1.5)
        particle.vx = 0;
        particle.vy = (0.5 + Math.random() * 1.0) * config.speedMultiplier;

        // No acceleration needed for snow
        particle.ax = 0;
        particle.ay = 0;

        // Visual
        particle.size = 2 + Math.random() * 3; // 2-5px
        particle.opacity = config.opacityRange[0] +
            Math.random() * (config.opacityRange[1] - config.opacityRange[0]);
        particle.color = '#FFFFFF';

        // No rotation for snow
        particle.rotation = 0;
        particle.rotationSpeed = 0;

        // Lifecycle
        particle.life = 0;
        particle.maxLife = Infinity; // Continuous until off-screen
        particle.phase = 'active';

        // Metadata for drift calculation
        particle.meta.driftOffset = Math.random() * Math.PI * 2;
    }

    /**
     * Update particle physics
     */
    update(particle: Particle, deltaTime: number, canvas: HTMLCanvasElement): boolean {
        // Apply drift formula from spec: x += Math.sin(life * 0.02) * 0.5
        const drift = Math.sin((particle.life + particle.meta.driftOffset) * 0.02) * 0.5;

        // Update position
        particle.x += drift * deltaTime;
        particle.y += particle.vy * deltaTime;

        // Increment life
        particle.life += deltaTime;

        // Respawn at top when off screen (spec requirement)
        if (particle.y > window.innerHeight + particle.size) {
            particle.y = -particle.size;
            particle.x = Math.random() * window.innerWidth;
            particle.life = 0;
        }

        // Keep particle alive (continuous effect)
        return true;
    }

    /**
     * Render particle to canvas
     */
    render(ctx: CanvasRenderingContext2D, particle: Particle): void {
        ctx.save();

        // Use 'lighter' composite for glow effect (spec requirement)
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = particle.opacity;

        // Draw circle
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size / 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    /**
     * Get maximum particles for this effect based on intensity
     */
    getMaxParticles(options: EffectOptions): number {
        const intensity = options.intensity || 'medium';
        const config = INTENSITY_MAP[intensity];

        return Math.min(
            Math.floor(this.MAX_PARTICLES * config.countMultiplier),
            this.MAX_PARTICLES
        );
    }
}
