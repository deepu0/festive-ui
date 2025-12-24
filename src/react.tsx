import { useEffect } from 'react';
import { snow, type SnowConfig } from './snow';

/**
 * React component for snow effect
 * 
 * @example
 * ```tsx
 * <SnowEffect intensity="medium" />
 * ```
 */
export function SnowEffect(props: SnowConfig = {}) {
    useEffect(() => {
        const cleanup = snow(props);
        return cleanup;
    }, [props.intensity, props.zIndex, props.disableOnReducedMotion]);

    return null;
}

export type { SnowConfig };
