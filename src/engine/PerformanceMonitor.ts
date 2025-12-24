import { PERFORMANCE_BUDGET, type PerformanceMetrics } from './types';

/**
 * Performance Monitor
 * Tracks frame time, FPS, and memory usage
 * Provides auto-degradation when performance budgets are exceeded
 */
export class PerformanceMonitor {
    private frameTimes: number[] = [];
    private frameCount = 0;
    private lastFrameTime = 0;
    private droppedFrames = 0;
    private readonly maxSamples = 60; // Track last 60 frames

    private listeners: Set<(metrics: PerformanceMetrics) => void> = new Set();

    constructor() {
        this.lastFrameTime = performance.now();
    }

    /**
     * Record start of frame
     */
    startFrame(): number {
        return performance.now();
    }

    /**
     * Record end of frame and calculate metrics
     */
    endFrame(startTime: number, particleCount: number): PerformanceMetrics {
        const frameTime = performance.now() - startTime;

        // Track frame time
        this.frameTimes.push(frameTime);
        if (this.frameTimes.length > this.maxSamples) {
            this.frameTimes.shift();
        }

        // Track dropped frames
        if (frameTime > PERFORMANCE_BUDGET.MAX_FRAME_TIME) {
            this.droppedFrames++;
        }

        this.frameCount++;

        const metrics = this.getMetrics(particleCount, frameTime);

        // Notify listeners
        this.notifyListeners(metrics);

        return metrics;
    }

    /**
     * Get current performance metrics
     */
    getMetrics(particleCount: number, currentFrameTime?: number): PerformanceMetrics {
        const avgFrameTime = this.getAverageFrameTime();
        const fps = avgFrameTime > 0 ? 1000 / avgFrameTime : 60;

        return {
            particleCount,
            frameTime: currentFrameTime ?? avgFrameTime,
            fps: Math.round(fps),
            droppedFrames: this.droppedFrames,
            memoryUsage: this.estimateMemoryUsage(particleCount),
        };
    }

    /**
     * Get average frame time over recent frames
     */
    getAverageFrameTime(): number {
        if (this.frameTimes.length === 0) return 0;
        const sum = this.frameTimes.reduce((a, b) => a + b, 0);
        return sum / this.frameTimes.length;
    }

    /**
     * Check if performance is degraded
     */
    isDegraded(): boolean {
        const avgFrameTime = this.getAverageFrameTime();
        return avgFrameTime > 12; // Threshold for auto-degradation
    }

    /**
     * Check if performance is critical
     */
    isCritical(): boolean {
        const avgFrameTime = this.getAverageFrameTime();
        return avgFrameTime > PERFORMANCE_BUDGET.MAX_FRAME_TIME;
    }

    /**
     * Subscribe to performance updates
     */
    subscribe(callback: (metrics: PerformanceMetrics) => void): () => void {
        this.listeners.add(callback);
        return () => this.listeners.delete(callback);
    }

    /**
     * Reset metrics
     */
    reset(): void {
        this.frameTimes = [];
        this.frameCount = 0;
        this.droppedFrames = 0;
    }

    /**
     * Estimate memory usage based on particle count
     * Rough estimate: ~200 bytes per particle
     */
    private estimateMemoryUsage(particleCount: number): number {
        const bytesPerParticle = 200;
        return particleCount * bytesPerParticle;
    }

    /**
     * Notify all listeners of metrics update
     */
    private notifyListeners(metrics: PerformanceMetrics): void {
        this.listeners.forEach(listener => {
            try {
                listener(metrics);
            } catch (error) {
                console.error('Error in performance listener:', error);
            }
        });
    }
}
