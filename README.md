# Festive UI

> Lightweight, production-safe seasonal UI effects library with 14 amazing effects! 🎉

[![Bundle Size](https://img.shields.io/badge/bundle%20size-931%20bytes-success)](https://bundlephobia.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## Features

✨ **Tiny** - Under 1kb gzipped  
⚡️ **Fast** - Pure CSS animations, 60 FPS  
♿️ **Accessible** - Respects `prefers-reduced-motion`  
🔧 **Zero config** - Works out of the box  
🌲 **Tree-shakable** - Import only what you need  
🎯 **Framework agnostic** - Vanilla JS + React adapter  

## Installation

```bash
npm install festive-ui
```

## Available Effects (14 Total)

### Original Effects
- ❄️ **Snow** - Gentle snowfall for winter themes
- 🎉 **Confetti** - Celebratory bursts for achievements  
- ❤️ **Hearts** - Romantic floating hearts
- ✨ **Sparkles** - Magical twinkling effects

### General Festive
- 🎆 **Fireworks** - Explosive bursts for celebrations
- 🍂 **Autumn Leaves** - Falling leaves for fall themes
- 🎈 **Balloons** - Interactive floating balloons
- ⭐ **Stars** - Twinkling starfield
- 🫧 **Bubbles** - Floating bubbles with shimmer

### Indian Festivals
- 🎨 **Gulaal** - Holi colored powder bursts
- 🪔 **Diyas** - Diwali oil lamps with flickering flames
- 🌺 **Flower Shower** - Falling petals for celebrations
- 🎇 **Chakri** - Spinning Diwali fireworks
- 🏮 **Sky Lanterns** - Glowing floating lanterns

## Quick Start

### Vanilla JavaScript

```javascript
import { snow, fireworks, gulaal, diyas } from 'festive-ui';

// Start any effect
const cleanup = snow({ intensity: 'medium' });

// Indian festival effects
const holiCleanup = gulaal({ intensity: 'high' });
const diwaliCleanup = diyas({ intensity: 'medium' });

// Stop effects (cleanup)
cleanup();
```

### React

```tsx
import { SnowEffect, FireworksEffect, DiyasEffect } from 'festive-ui/react';

function App() {
  return (
    <>
      <SnowEffect intensity="medium" />
      <DiyasEffect intensity="low" />
      {/* Your app content */}
    </>
  );
}
```

## Configuration

```javascript
snow({
  intensity: 'medium',  // 'low' | 'medium' | 'high'
  zIndex: 9999,
  disableOnReducedMotion: true  // Respects accessibility
});
```

### Intensity Levels

| Intensity | Particles | Best For |
|-----------|-----------|----------|
| `low` | 50 | Subtle background effect |
| `medium` | 100 | Balanced visual impact |
| `high` | 150 | Maximum wow factor |

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- All modern mobile browsers

## Performance

- **Bundle size**: 931 bytes gzipped
- **FPS**: Stable 60 FPS
- **CLS**: 0 (no layout shifts)
- **Memory**: < 5MB
- Automatically pauses on tab blur

## Accessibility

✅ Automatically disabled when `prefers-reduced-motion` is set  
✅ Non-interactive overlay (`pointer-events: none`)  
✅ `aria-hidden` for screen readers  
✅ No color contrast interference  

## Demo

The demo is already running at:
```
http://localhost:8080/demo
```

Or start it manually:
```bash
npx serve
```

Visit the demo page to see all 14 effects in action!

## Roadmap

- [x] Additional effects (confetti, hearts, sparkles) ✅
- [x] General festive effects (fireworks, leaves, balloons, stars, bubbles) ✅
- [x] Indian festival effects (gulaal, diyas, flowers, chakri, lanterns) ✅
- [ ] Vue/Svelte adapters
- [ ] SSR-ready Next.js examples
- [ ] Date-based auto-triggers

## License

MIT © Deepak Sharma

---

**Why festive-ui?**

Most seasonal UI libraries are bloated (100kb+), lack accessibility, or cause performance issues. Festive UI is built for production - tiny, fast, and safe.
