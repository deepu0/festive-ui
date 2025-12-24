import { ParticleEngine } from 'festive-ui';
import type { EffectOptions, PerformanceMetrics } from 'festive-ui';

/**
 * Advanced: Using the ParticleEngine directly for maximum control
 */

// Create and initialize engine
const engine = new ParticleEngine();
engine.init(document.body);

// Start multiple effects efficiently (shared canvas)
const snowInstance = engine.start('snow', { intensity: 'medium' });
const starsInstance = engine.start('stars', { intensity: 'low' });

// Monitor performance
let metricsInterval = setInterval(() => {
    const metrics: PerformanceMetrics = engine.getMetrics();

    console.log('Performance Metrics:', {
        particleCount: metrics.particleCount,
        fps: metrics.fps,
        frameTime: `${metrics.frameTime.toFixed(2)}ms`,
        droppedFrames: metrics.droppedFrames,
    });

    // Auto-adjust based on performance
    if (metrics.fps < 50) {
        console.warn('Low FPS detected, reducing intensity');
        engine.setIntensity('low');
    }
}, 1000);

// Listen to engine events
engine.on('start', (data) => {
    console.log(`Effect started: ${data.type}`);
});

engine.on('stop', (data) => {
    console.log(`Effect stopped: ${data.type}`);
});

// Cleanup when done
setTimeout(() => {
    clearInterval(metricsInterval);
    snowInstance.stop();
    starsInstance.stop();
    engine.destroy();
}, 60000); // Run for 1 minute

export { engine };
