# Festive UI v2.0 🎉

> Lightweight, production-ready particle effects library with 14 stunning animations

[![NPM Version](https://img.shields.io/npm/v/festive-ui.svg)](https://www.npmjs.com/package/festive-ui)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/festive-ui.svg)](https://bundlephobia.com/package/festive-ui)
[![License](https://img.shields.io/npm/l/festive-ui.svg)](https://github.com/deepu0/festive-ui/blob/main/LICENSE)

**Zero GC pressure • ~7KB gzipped core • 60 FPS budget • Full TypeScript support**

Perfect for celebrations, seasonal themes, and interactive experiences. Built with a production-grade particle effects engine featuring object pooling, performance monitoring, and accessibility support.

## ✨ Features

- 🎯 **14 Effects** across 3 categories (Original, General Festive, Indian Festivals)
- 🚀 **Object Pooling** - Zero garbage collection during animation
- 📊 **Performance Monitoring** - Real-time FPS tracking and auto-degradation
- ♿ **Accessible** - Respects `prefers-reduced-motion`
- 📦 **Tiny Bundle** - ~7KB gzipped core (6.8KB, measured on the v2.0.0 npm tarball)
- 🎨 **Framework Agnostic** - Works with vanilla JS, React, or any framework
- 📱 **Mobile Optimized** - Automatic particle reduction
- 💪 **TypeScript** - Full type definitions included

## 📦 Installation

```bash
npm install festive-ui
```

```bash
yarn add festive-ui
```

```bash
pnpm add festive-ui
```

## 🚀 Quick Start

### Vanilla JavaScript

```javascript
import { snow } from 'festive-ui';

// Start snow effect
const cleanup = snow({ intensity: 'medium' });

// Stop when done
cleanup();
```

### React

```tsx
import { useEffect } from 'react';
import { confetti } from 'festive-ui';

function Celebration() {
  useEffect(() => {
    const cleanup = confetti({ intensity: 'high' });
    return cleanup; // Cleanup on unmount
  }, []);

  return <div>🎉 Celebrating!</div>;
}
```

### CDN (No Build Step)

```html
<script type="module">
  import { snow } from 'https://cdn.jsdelivr.net/npm/festive-ui@2/dist/index.esm.js';
  snow({ intensity: 'medium' });
</script>
```

## 🎨 All 14 Effects

### Original Effects (4)

| Effect | Import | Description |
|--------|--------|-------------|
| ❄️ Snow | `snow` | Gentle snowfall with drift |
| 🎉 Confetti | `confetti` | Celebratory bursts |
| ❤️ Hearts | `hearts` | Floating hearts with sway |
| ✨ Sparkles | `sparkles` | Twinkling stars |

### General Festive (5)

| Effect | Import | Description |
|--------|--------|-------------|
| 🎆 Fireworks | `fireworks` | Two-phase launch + burst |
| 🍂 Autumn Leaves | `autumnLeaves` | Falling leaves |
| 🎈 Balloons | `balloons` | Floating balloons |
| ⭐ Stars | `stars` | Starfield background |
| 🫧 Bubbles | `bubbles` | Floating bubbles |

### Indian Festivals (5)

| Effect | Import | Description |
|--------|--------|-------------|
| 🎨 Gulaal | `gulaal` | Holi colored powder |
| 🪔 Diyas | `diyas` | Diwali oil lamps |
| 🌺 Flower Shower | `flowerShower` | Falling petals |
| 🎇 Chakri | `chakri` | Spinning fireworks |
| 🏮 Sky Lanterns | `skyLanterns` | Floating lanterns |

## 📖  API Reference

### Basic Usage

All effects follow the same API pattern:

```typescript
import { effectName } from 'festive-ui';

const cleanup = effectName(options);
// ... effect runs ...
cleanup(); // Stop effect
```

### Configuration Options

```typescript
interface EffectOptions {
  intensity?: 'off' | 'low' | 'medium' | 'high'; // Default: 'medium'
  colors?: string[];                              // Custom colors
  bounds?: DOMRect;                              // Containment bounds
  duration?: number;                             // Duration in ms (for bursts)
  zIndex?: number;                               // Canvas z-index
  disableOnReducedMotion?: boolean;              // Default: true
}
```

### Examples

```javascript
// Custom intensity
snow({ intensity: 'high' });

// Custom colors
confetti({ colors: ['#FF6B6B', '#4ECDC4', '#FFE66D'] });

// Time-limited effect
const cleanup = sparkles({ duration: 5000 });
setTimeout(cleanup, 5000);

// Multiple effects
const cleanupSnow = snow({ intensity: 'low' });
const cleanupConfetti = confetti({ intensity: 'medium' });
```

## 🎯 Advanced Usage

### Using the Particle Engine Directly

For maximum control and performance:

```typescript
import { ParticleEngine } from 'festive-ui';

const engine = new ParticleEngine();
engine.init(); // Creates shared canvas

// Start multiple effects efficiently
const snow = engine.start('snow', { intensity: 'medium' });
const stars = engine.start('stars', { intensity: 'low' });

// Monitor performance
const metrics = engine.getMetrics();
console.log(`FPS: ${metrics.fps}, Particles: ${metrics.particleCount}`);

// Cleanup
snow.stop();
stars.stop();
engine.destroy();
```

### Performance Monitoring

```typescript
import { ParticleEngine } from 'festive-ui';

const engine = new ParticleEngine();
engine.init();

engine.on('performance', (metrics) => {
  console.log(`FPS: ${metrics.fps}`);
  console.log(`Frame Time: ${metrics.frameTime}ms`);
  console.log(`Particles: ${metrics.particleCount}`);
});
```

## ⚡ Performance

Festive UI v2.0 is built for production with these performance characteristics:

- **Zero GC pressure** - Object pooling eliminates garbage collection during animation
- **60 FPS budget** - Global 100-particle cap and auto-degradation are designed to hold frame time under 16ms; verify on your target hardware with the built-in performance monitor (`engine.getMetrics()`)
- **~7KB gzipped core** - `index.esm.js` from the v2.0.0 npm tarball is 30.3KB raw / 6.8KB gzipped (measured Sep 19, 2026; reproduce with `curl -sL $(npm view festive-ui dist.tarball) | tar xz && gzip -c package/dist/index.esm.js | wc -c`)
- **Auto-degradation** - Automatically reduces particle count if FPS drops
- **Visibility API** - Pauses when tab is hidden
- **Mobile optimized** - 50% particle reduction on mobile devices

### Performance Budgets

- Target frame time: < 8ms
- Maximum frame time: 16ms (60 FPS)
- Global particle cap: 100
- Memory per effect: < 5MB

## 🌐 Browser Support

| Browser | Version |
|---------|---------|
| Chrome | 90+ |
| Firefox | 88+ |
| Safari | 14+ |
| Edge | 90+ |

## ♿ Accessibility

Festive UI respects user preferences:

- **Respects `prefers-reduced-motion`** - Automatically disables effects
- **No layout shifts** - Effects don't affect page layout
- **No focus interference** - Canvas has `pointer-events: none`
- **Screen reader friendly** - Canvas is marked `aria-hidden="true"`

## 📝 TypeScript

Full TypeScript support with comprehensive type definitions:

```typescript
import { snow, type EffectOptions, type EffectInstance } from 'festive-ui';

const options: EffectOptions = {
  intensity: 'medium',
  colors: ['#FFFFFF'],
};

const cleanup: () => void = snow(options);
```

## 🎭 React Integration

### Hook Pattern

```tsx
import { useEffect } from 'react';
import { snow } from 'festive-ui';

function useSnow(intensity: 'low' | 'medium' | 'high') {
  useEffect(() => {
    const cleanup = snow({ intensity });
    return cleanup;
  }, [intensity]);
}

function App() {
  useSnow('medium');
  return <div>Winter Wonderland ❄️</div>;
}
```

### Conditional Effects

```tsx
function Celebration({ isActive }: { isActive: boolean }) {
  useEffect(() => {
    if (!isActive) return;
    const cleanup = confetti({ intensity: 'high' });
    return cleanup;
  }, [isActive]);

  return <button>Celebrate!</button>;
}
```

## 🎯 Use Cases

- **Celebrations** - Birthdays, achievements, milestones
- **Seasonal Themes** - Christmas, New Year, festivals
- **Cultural Events** - Diwali, Holi, regional celebrations
- **Interactive Experiences** - Gamification, rewards
- **Marketing** - Product launches, announcements
- **E-commerce** - Sale events, special offers

## 📚 Examples

Check out the `/examples` directory for:
- Basic vanilla JS usage
- React integration patterns
- TypeScript configuration
- Advanced engine API
- Performance optimization
- Custom effect creation

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

## 📜 Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history and migration guides.

## 📄 License

MIT © [Deepak Sharma](https://github.com/deepu0)

---

## 🔗 Links

- [NPM Package](https://www.npmjs.com/package/festive-ui)
- [GitHub Repository](https://github.com/deepu0/festive-ui)
- [Issue Tracker](https://github.com/deepu0/festive-ui/issues)
- Demo: no hosted demo yet — open [`demo/index.html`](demo/index.html) locally in a browser (no build step needed)

---

**Made with ❤️ for the web**
