import { useEffect } from 'react';
import { snow, type SnowConfig } from './snow';
import { confetti, type ConfettiConfig } from './confetti';
import { hearts, type HeartsConfig } from './hearts';
import { sparkles, type SparklesConfig } from './sparkles';

export function SnowEffect(props: SnowConfig = {}) {
    useEffect(() => {
        const cleanup = snow(props);
        return cleanup;
    }, [props.intensity, props.zIndex, props.disableOnReducedMotion]);

    return null;
}

export function ConfettiEffect(props: ConfettiConfig = {}) {
    useEffect(() => {
        const cleanup = confetti(props);
        return cleanup;
    }, [props.intensity, props.zIndex, props.disableOnReducedMotion]);

    return null;
}

export function HeartsEffect(props: HeartsConfig = {}) {
    useEffect(() => {
        const cleanup = hearts(props);
        return cleanup;
    }, [props.intensity, props.zIndex, props.disableOnReducedMotion]);

    return null;
}

export function SparklesEffect(props: SparklesConfig = {}) {
    useEffect(() => {
        const cleanup = sparkles(props);
        return cleanup;
    }, [props.intensity, props.zIndex, props.disableOnReducedMotion]);

    return null;
}
