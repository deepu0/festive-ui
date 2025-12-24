import type { Particle, EffectOptions } from '../engine/types';
import { INTENSITY_MAP } from '../engine/types';
import type { EffectRenderer } from '../engine/ParticleEngine';

/**
 * Gulaal (Holi Powder) Effect Renderer (v2.0)
 * 
 * Specifications:
 * - Motion: Radial burst; velocity *= 0.92 decay; Spread angle: 360° or directional
 * - Visual: Soft circles with blur; Vibrant Holi colors
 * - Composite: 'screen' or 'lighter' for color mixing
 * - Max Particles: 60 per burst
 * - Industry Rule: Abstract powder clouds, stay minimal
 */
export class GulaalRenderer implements EffectRenderer {
    private readonly MAX_PARTICLES = 60;
    private readonly COLORS = ['#FF1493', '#FFD700', '#00CED1', '#FF6347', '#9370DB'];

    spawn(particle: Particle, options: EffectOptions): void {
        const intensity = options.intensity || 'medium';
        const config = INTENSITY_MAP[intensity];

        // Burst from center or random point
        particle.x = window.innerWidth / 2;
        particle.y = window.innerHeight / 2;

        // Radial burst velocity
        const angle = Math.random() * Math.PI * 2;
        const speed = (2 + Math.random() * 4) * config.speedMultiplier;
        particle.vx = Math.cos(angle) * speed;
        particle.vy = Math.sin(angle) * speed;

        // No acceleration
        particle.ax = 0;
        particle.ay = 0.05; // Slight gravity

        // Visual
        particle.size = 10 + Math.random() * 20;
        particle.opacity = 0.6 + Math.random() * 0.3;
        particle.color = this.COLORS[Math.floor(Math.random() * this.COLORS.length)];

        // No rotation
        particle.rotation = 0;
        particle.rotationSpeed = 0;

        // Lifecycle (burst: 1-2s)
        particle.life = 0;
        particle.maxLife = (60 + Math.random() * 60); // 1-2s at 60fps
        particle.phase = 'active';
    }

    update(particle: Particle, deltaTime: number, canvas: HTMLCanvasElement): boolean {
        // Deceleration (spec: v *= 0.92)
        particle.vx *= Math.pow(0.92, deltaTime);
        particle.vy *= Math.pow(0.92, deltaTime);

        // Apply gravity
        particle.vy += particle.ay * deltaTime;

        // Update position
        particle.x += particle.vx * deltaTime;
        particle.y += particle.vy * deltaTime;

        // Grow slightly
        particle.size += 0.1 * deltaTime;

        // Increment life
        particle.life += deltaTime;

        // Fade out
        const fadeStart = particle.maxLife * 0.5;
        if (particle.life > fadeStart) {
            const fadeProgress = (particle.life - fadeStart) / (particle.maxLife - fadeStart);
            particle.opacity = Math.max(0, 0.8 * (1 - fadeProgress));
        }

        // Remove when dead
        return particle.life < particle.maxLife;
    }

    render(ctx: CanvasRenderingContext2D, particle: Particle): void {
        ctx.save();

        // Use screen/lighter composite for color mixing
        ctx.globalCompositeOperation = 'screen';
        ctx.globalAlpha = particle.opacity;

        const color = typeof particle.color === 'string'
            ? particle.color
            : `rgb(${particle.color[0]}, ${particle.color[1]}, ${particle.color[2]})`;

        // Soft powder cloud (radial gradient)
        const gradient = ctx.createRadialGradient(
            particle.x, particle.y, 0,
            particle.x, particle.y, particle.size
        );
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, color.replace(')', ', 0)').replace('rgb', 'rgba'));

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
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
