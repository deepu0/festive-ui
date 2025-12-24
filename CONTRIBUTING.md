# Contributing to Festive UI

Thank you for considering contributing to Festive UI! 🎉

## Code of Conduct

Be respectful, inclusive, and constructive in all interactions.

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in [Issues](https://github.com/deepu0/festive-ui/issues)
2. Create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Browser/OS information
   - Code sample if applicable

### Suggesting Features

1. Check existing issues and discussions
2. Create a new issue with:
   - Clear use case
   - Proposed API
   - Why it benefits users
   - Any implementation ideas

### Pull Requests

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-effect`
3. Make your changes
4. Add tests if applicable
5. Update documentation
6. Commit with clear messages
7. Push and create a PR

## Development Setup

```bash
# Clone your fork
git clone https://github.com/yourname/festive-ui.git
cd festive-ui

# Install dependencies
npm install

# Start development
npm run dev

# Build
npm run build

# Check bundle size
npm run size
```

## Project Structure

```
festive-ui/
├── src/
│   ├── engine/           # Core particle engine
│   │   ├── ParticleEngine.ts
│   │   ├── ParticlePool.ts
│   │   ├── PerformanceMonitor.ts
│   │   └── types.ts
│   ├── effects/          # Effect renderers
│   │   ├── SnowRenderer.ts
│   │   ├── ConfettiRenderer.ts
│   │   └── ...
│   └── index.ts          # Main exports
├── demo/                 # Demo pages
├── examples/             # Code examples
└── dist/                 # Built files
```

## Creating a New Effect

1. Create `/src/effects/YourEffectRenderer.ts`:

```typescript
import type { Particle, EffectOptions } from '../engine/types';
import { INTENSITY_MAP } from '../engine/types';
import type { EffectRenderer } from '../engine/ParticleEngine';

export class YourEffectRenderer implements EffectRenderer {
  private readonly MAX_PARTICLES = 50;

  spawn(particle: Particle, options: EffectOptions): void {
    // Initialize particle
  }

  update(particle: Particle, deltaTime: number, canvas: HTMLCanvasElement): boolean {
    // Update physics
    // Return false to remove particle
    return true;
  }

  render(ctx: CanvasRenderingContext2D, particle: Particle): void {
    // Draw particle
  }

  getMaxParticles(options: EffectOptions): number {
    const intensity = options.intensity || 'medium';
    const config = INTENSITY_MAP[intensity];
    return Math.floor(this.MAX_PARTICLES * config.countMultiplier);
  }
}
```

2. Export in `/src/effects/index.ts`
3. Register in `/src/index.ts`
4. Add wrapper function
5. Update documentation
6. Create demo

## Performance Guidelines

- Target < 8ms frame time
- Use object pooling (don't create objects in update loop)
- Batch rendering when possible
- Respect max particle limits
- Test on low-end devices

## Code Style

- Use TypeScript
- Follow existing patterns
- Add JSDoc comments
- Keep functions focused
- Use meaningful names

## Testing

Manual testing checklist:
- [ ] Works in Chrome, Firefox, Safari, Edge
- [ ] Mobile responsive
- [ ] Respects prefers-reduced-motion
- [ ] No memory leaks
- [ ] 60 FPS sustained
- [ ] Clean effect shutdown

## Documentation

- Update README for public API changes
- Add JSDoc comments
- Create examples for new features
- Update CHANGELOG

## Questions?

Open a [Discussion](https://github.com/yourusername/festive-ui/discussions) or ask in your PR!

Thank you for contributing! 🙏
