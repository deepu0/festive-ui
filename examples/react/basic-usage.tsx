import { useEffect, useState } from 'react';
import { snow, confetti, hearts } from 'festive-ui';
import type { EffectOptions } from 'festive-ui';

/**
 * Basic usage example with React
 */
export function BasicExample() {
  const [showSnow, setShowSnow] = useState(false);

  useEffect(() => {
    if (!showSnow) return;
    
    const cleanup = snow({ intensity: 'medium' });
    return cleanup; // Cleanup on unmount
  }, [showSnow]);

  return (
    <div>
      <button onClick={() => setShowSnow(!showSnow)}>
        {showSnow ? 'Stop' : 'Start'} Snow
      </button>
    </div>
  );
}

/**
 * Example with intensity control
 */
export function WithIntensityControl() {
  const [intensity, setIntensity] = useState<'low' | 'medium' | 'high'>('medium');
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    
    const cleanup = confetti({ intensity });
    return cleanup;
  }, [enabled, intensity]);

  return (
    <div>
      <button onClick={() => setEnabled(!enabled)}>
        {enabled ? 'Stop' : 'Start'} Confetti
      </button>
      
      <select value={intensity} onChange={(e) => setIntensity(e.target.value as any)}>
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>
    </div>
  );
}

/**
 * Custom hook for effect management
 */
function useEffect(
  effectFn: (options: EffectOptions) => () => void,
  options: EffectOptions,
  enabled: boolean
) {
  useEffect(() => {
    if (!enabled) return;
    const cleanup = effectFn(options);
    return cleanup;
  }, [effectFn, options, enabled]);
}

export function WithCustomHook() {
  const [showHearts, setShowHearts] = useState(false);

  useEffectHook(hearts, { intensity: 'medium' }, showHearts);

  return (
    <button onClick={() => setShowHearts(!showHearts)}>
      {showHearts ? 'Hide' : 'Show'} Hearts
    </button>
  );
}
