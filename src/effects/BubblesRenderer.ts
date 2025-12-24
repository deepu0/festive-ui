import type { Particle, EffectOptions } from '../engine/types';
import { INTENSITY_MAP } from '../engine/types';
import type { EffectRenderer } from '../engine/ParticleEngine';

/**
 * Bubbles Effect Renderer (v2.0)
 * 
 * Specifications:
 * - Motion: vy: -0.8 to -1.5; Slight vx wobble; Growth: size += 0.01 until pop
 * - Visual: Stroke circle + gradient fill; High transparency (0.2–0.5); Highlight spot
 * - Max Particles: 25 (hard cap 30)
 * - Industry Rule: GPU-expensive, strict limit
 */
export class BubblesRenderer implements EffectRenderer {
    private readonly MAX_PARTICLES = 25;

    spawn(particle: Particle, options: EffectOptions): void {
        const intensity = options.intensity || 'medium';
        const config = INTENSITY_MAP[intensity];

        // Spawn from bottom
        particle.x = Math.random() * window.innerWidth;
        particle.y = window.innerHeight + 20;

        // Velocity (spec: vy -0.8 to -1.5)
        particle.vx = 0;
        particle.vy = (-0.8 - Math.random() * 0.7) * config.speedMultiplier;

        // No acceleration
        particle.ax = 0;
        particle.ay = 0;

        // Visual (start small, will grow)
        particle.size = 15 + Math.random() * 15;
        particle.opacity = 0.2 + Math.random() * 0.3; // 0.2-0.5
        particle.color = [200, 220, 255]; // Light blue

        // No rotation
        particle.rotation = 0;
        particle.rotationSpeed = 0;

        // Lifecycle
        particle.life = 0;
        particle.maxLife = (60 + Math.random() * 120); // Random pop time
        particle.phase = 'active';

        // Metadata
        particle.meta.wobbleOffset = Math.random() * Math.PI * 2;
        particle.meta.wobbleSpeed = 0.03 + Math.random() * 0.04;
        particle.meta.initialSize = particle.size;
        particle.meta.growthRate = 0.01;
        particle.meta.popped = false;
    }

    update(particle: Particle, deltaTime: number, canvas: HTMLCanvasElement): boolean {
        if (particle.meta.popped) {
            // Pop animation
            particle.meta.popProgress = (particle.meta.popProgress || 0) + 0.08 * deltaTime;
            particle.opacity = Math.max(0, 0.5 * (1 - particle.meta.popProgress));

            // Remove when pop complete
            return particle.meta.popProgress < 1;
        }

        // Wobble motion
        particle.meta.wobbleOffset += particle.meta.wobbleSpeed * deltaTime;
        const wobble = Math.sin(particle.meta.wobbleOffset) * 15;

        // Update position
        particle.x += wobble * 0.02 * deltaTime;
        particle.y += particle.vy * deltaTime;

        // Growth (spec: size += 0.01)
        particle.size += particle.meta.growthRate * deltaTime;

        // Increment life
        particle.life += deltaTime;

        // Pop when reaching top or max life
        if (particle.y < -particle.size || particle.life >= particle.maxLife) {
            particle.meta.popped = true;
        }

        return true;
    }

    render(ctx: CanvasRenderingContext2D, particle: Particle): void {
        if (particle.meta.popped) {
            // Draw pop burst
            ctx.save();
            ctx.globalAlpha = particle.opacity;
            const progress = particle.meta.popProgress || 0;

            for (let i = 0; i < 6; i++) {
                const angle = (Math.PI * 2 * i) / 6;
                const dist = progress * particle.size * 0.8;
                ctx.strokeStyle = `rgba(200, 220, 255, ${particle.opacity})`;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(particle.x, particle.y);
                ctx.lineTo(particle.x + Math.cos(angle) * dist, particle.y + Math.sin(angle) * dist);
                ctx.stroke();
            }
            ctx.restore();
            return;
        }

        ctx.save();
        ctx.globalAlpha = particle.opacity;

        // Gradient fill
        const gradient = ctx.createRadialGradient(
            particle.x - particle.size * 0.3,
            particle.y - particle.size * 0.3,
            0,
            particle.x,
            particle.y,
            particle.size
        );
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        gradient.addColorStop(0.3, 'rgba(200, 220, 255, 0.4)');
        gradient.addColorStop(0.7, 'rgba(150, 200, 255, 0.3)');
        gradient.addColorStop(1, 'rgba(100, 180, 255, 0.2)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();

        // Stroke
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.beginPath();
        ctx.arc(particle.x - particle.size * 0.3, particle.y - particle.size * 0.3, particle.size * 0.25, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    getMaxParticles(options: EffectOptions): number {
        // Hard cap at 30 (spec requirement)
        const intensity = options.intensity || 'medium';
        const config = INTENSITY_MAP[intensity];
        return Math.min(
            Math.floor(this.MAX_PARTICLES * config.countMultiplier),
            30 // Hard cap
        );
    }
}
