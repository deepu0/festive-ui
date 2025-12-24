# Festive UI

> Lightweight, production-safe seasonal UI effects. Starting with snow ❄️

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

## Quick Start

### Vanilla JavaScript

```javascript
import { snow } from 'festive-ui';

// Start snow effect
const cleanup = snow();

// Stop effect (cleanup)
cleanup();
```

### React

```tsx
import { SnowEffect } from 'festive-ui/react';

function App() {
  return (
    <>
      <SnowEffect />
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

```bash
cd demo
npx http-server
```

Open `http://localhost:8080`

## Roadmap

- [ ] Additional effects (confetti, hearts, sparkles)
- [ ] Vue/Svelte adapters
- [ ] SSR-ready Next.js examples
- [ ] Date-based auto-triggers

## License

MIT © Deepak Sharma

---

**Why festive-ui?**

Most seasonal UI libraries are bloated (100kb+), lack accessibility, or cause performance issues. Festive UI is built for production - tiny, fast, and safe.
