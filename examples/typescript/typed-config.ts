import { snow, confetti, hearts } from 'festive-ui';
import type { EffectOptions, IntensityLevel } from 'festive-ui';

/**
 * TypeScript usage examples with full type safety
 */

// Typed configuration
const snowConfig: EffectOptions = {
    intensity: 'medium',
    disableOnReducedMotion: true,
};

// Start effect with typed config
const cleanup: () => void = snow(snowConfig);

// Type-safe intensity control
const intensities: IntensityLevel[] = ['low', 'medium', 'high'];
let currentIndex = 0;

const cycleIntensity = () => {
    const intensity = intensities[currentIndex];
    currentIndex = (currentIndex + 1) % intensities.length;

    const config: EffectOptions = { intensity };
    return confetti(config);
};

// Custom effect manager with TypeScript
class EffectManager {
    private effects = new Map<string, () => void>();

    start(name: string, effectFn: (options: EffectOptions) => () => void, options: EffectOptions = {}): void {
        if (this.effects.has(name)) {
            this.stop(name);
        }

        const cleanup = effectFn(options);
        this.effects.set(name, cleanup);
    }

    stop(name: string): void {
        const cleanup = this.effects.get(name);
        if (cleanup) {
            cleanup();
            this.effects.delete(name);
        }
    }

    stopAll(): void {
        this.effects.forEach(cleanup => cleanup());
        this.effects.clear();
    }

    isActive(name: string): boolean {
        return this.effects.has(name);
    }
}

// Usage
const manager = new EffectManager();
manager.start('snow', snow, { intensity: 'medium' });
manager.start('hearts', hearts, { intensity: 'low' });

// Later...
manager.stop('snow');
manager.stopAll();

export { manager, EffectManager };
