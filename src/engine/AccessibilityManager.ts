/**
 * Accessibility Manager
 * Handles prefers-reduced-motion and other accessibility concerns
 */
export class AccessibilityManager {
    private reducedMotionMediaQuery: MediaQueryList | null = null;
    private listeners: Set<(prefersReducedMotion: boolean) => void> = new Set();
    private _prefersReducedMotion = false;

    constructor() {
        if (typeof window !== 'undefined' && window.matchMedia) {
            this.reducedMotionMediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
            this._prefersReducedMotion = this.reducedMotionMediaQuery.matches;

            // Listen for changes
            this.reducedMotionMediaQuery.addEventListener('change', this.handleMediaQueryChange);
        }
    }

    /**
     * Check if user prefers reduced motion
     */
    get prefersReducedMotion(): boolean {
        return this._prefersReducedMotion;
    }

    /**
     * Subscribe to reduced motion preference changes
     */
    subscribe(callback: (prefersReducedMotion: boolean) => void): () => void {
        this.listeners.add(callback);
        return () => this.listeners.delete(callback);
    }

    /**
     * Clean up event listeners
     */
    destroy(): void {
        if (this.reducedMotionMediaQuery) {
            this.reducedMotionMediaQuery.removeEventListener('change', this.handleMediaQueryChange);
        }
        this.listeners.clear();
    }

    /**
     * Apply accessibility attributes to canvas
     */
    applyCanvasAttributes(canvas: HTMLCanvasElement): void {
        canvas.setAttribute('aria-hidden', 'true');
        canvas.setAttribute('role', 'presentation');
    }

    /**
     * Get recommended settings based on accessibility preferences
     */
    getRecommendedSettings(): {
        shouldDisable: boolean;
        shouldUseStaticMode: boolean;
        shouldUseMinimalMotion: boolean;
    } {
        return {
            shouldDisable: this._prefersReducedMotion,
            shouldUseStaticMode: false, // Could be implemented as alternative
            shouldUseMinimalMotion: this._prefersReducedMotion,
        };
    }

    /**
     * Handle media query change
     */
    private handleMediaQueryChange = (event: MediaQueryListEvent): void => {
        this._prefersReducedMotion = event.matches;
        this.notifyListeners();
    };

    /**
     * Notify all listeners
     */
    private notifyListeners(): void {
        this.listeners.forEach(listener => {
            try {
                listener(this._prefersReducedMotion);
            } catch (error) {
                console.error('Error in accessibility listener:', error);
            }
        });
    }
}
