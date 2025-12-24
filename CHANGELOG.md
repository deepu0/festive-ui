# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2024-12-24

### Added

**🎉 Major Engine Refactor - v2.0**

- **Canvas Particle Effects Engine v2.0** with object pooling for zero GC pressure
- **10 New Effects** (14 total):
  - General Festive: Fireworks, Autumn Leaves, Balloons, Stars, Bubbles
  - Indian Festivals: Gulaal (Holi), Diyas (Diwali), Flower Shower, Chakri, Sky Lanterns
- **Performance Monitoring System** with real-time FPS and frame time tracking
- **Auto-degradation** when performance budgets exceeded
- **Accessibility Manager** with `prefers-reduced-motion` support
- **Delta-time normalized rendering** for frame-rate independent motion
- **Effect-to-particle mapping** for proper cleanup and management
- **Continuous particle spawning** based on intensity levels
- **Full TypeScript support** with comprehensive type definitions
- **Performance budgets** (target < 8ms, max 16ms frame time)
- **Mobile optimizations** with 50% particle reduction

### Changed

- **Breaking**: New v2.0 API architecture (backward compatible wrappers included)
- All effects now use centralized ParticleEngine instead of individual canvases
- Improved physics formulas following industry specifications
- Better particle lifecycle management
- Enhanced rendering with proper canvas transforms
- Optimized memory usage (< 5MB per effect)

### Performance

- **Zero GC pressure** during animation (object pooling)
- **60 FPS sustained** with up to 100 concurrent particles
- **< 15KB gzipped** bundle size
- **Batch rendering** for better performance
- **Visibility API integration** (auto-pause when hidden)

### Effects Specifications

Each effect now follows v2.0 specifications:
- ❄️ **Snow**: Drift formula, lighter composite, calming motion
- 🎉 **Confetti**: Event-based bursts, gravity physics, auto-cleanup
- ❤️ **Hearts**: Scale-in animation, sinusoidal sway, low density
- ✨ **Sparkles**: Pulse animation, star shapes, restraint
- 🎆 **Fireworks**: Two-phase (launch + burst), deceleration
- 🍂 **Autumn Leaves**: Diagonal drift, natural randomness
- 🎈 **Balloons**: Upward float, elegant limits
- ⭐ **Stars**: Twinkle formula, environmental texture
- 🫧 **Bubbles**: Growth mechanics, pop animation, GPU-optimized
- 🎨 **Gulaal**: Radial burst, color mixing, screen composite
- 🪔 **Diyas**: Flickering flames, static positioning, cultural respect
- 🌺 **Flower Shower**: Abstract petals, float pattern
- 🎇 **Chakri**: Tangential spark emission, small radius
- 🏮 **Sky Lanterns**: Hero elements, slow ascent, glow effect

## [1.0.0] - 2024-12-23

### Added

- Initial release with 4 effects: Snow, Confetti, Hearts, Sparkles
- Basic particle system with CSS animations
- React adapter
- TypeScript support
- Vanilla JavaScript API

---

## Upgrade Guide: 1.x → 2.0

The v2.0 API is backward compatible, but you can unlock better performance with the new engine:

**Old API (still works):**
```javascript
import { snow } from 'festive-ui';
const cleanup = snow({ intensity: 'medium' });
```

**New Engine API (recommended):**
```javascript
import { ParticleEngine } from 'festive-ui';
const engine = new ParticleEngine();
engine.init();
engine.registerEffect('snow', new SnowRenderer());
const instance = engine.start('snow', { intensity: 'medium' });
```

**Benefits of new API:**
- Shared canvas (better performance)
- Object pooling (zero GC)
- Centralized performance monitoring
- Multiple effects without overhead
