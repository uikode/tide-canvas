import type { EffectConfig, Particle } from '../types'
import { getThemeColors } from '../utils/color'
import { randomRange, randomAngle, applyGravity, applyFriction } from '../utils/physics'

/**
 * Creates a confetti burst effect.
 * Returns a FrameCallback that renders particles until they fade out.
 */
export function createConfetti(config: EffectConfig = {}): (ctx: CanvasRenderingContext2D, dt: number) => boolean {
  const count = config.count ?? 40
  const x = config.x ?? 0.5
  const y = config.y ?? 0.3
  const spread = config.spread ?? Math.PI * 0.6
  const gravity = config.gravity ?? 800
  const friction = config.friction ?? 2
  const colors = config.colors ?? getThemeColors()

  if (count < 0 || !Number.isFinite(count)) {
    throw new RangeError(`createConfetti: count must be finite non-negative, got ${count}`)
  }
  if (x < 0 || x > 1 || !Number.isFinite(x)) {
    throw new RangeError(`createConfetti: x must be 0-1, got ${x}`)
  }
  if (y < 0 || y > 1 || !Number.isFinite(y)) {
    throw new RangeError(`createConfetti: y must be 0-1, got ${y}`)
  }

  const particles: Particle[] = Array.from({ length: count }, () => {
    const angle = randomAngle(spread)
    const speed = randomRange(300, 600)
    return {
      x: 0,
      y: 0,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      size: randomRange(4, 8),
      color: colors[Math.floor(Math.random() * colors.length)] ?? '#C5A03F',
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: randomRange(-10, 10),
    }
  })

  return (ctx: CanvasRenderingContext2D, dt: number): boolean => {
    const dpr = window.devicePixelRatio || 1
    const w = ctx.canvas.width / dpr
    const h = ctx.canvas.height / dpr
    const cx = x * w
    const cy = y * h
    let alive = false

    for (const p of particles) {
      if (p.life <= 0) continue
      alive = true

      p.vy = applyGravity(p.vy, gravity, dt)
      p.vx = applyFriction(p.vx, friction, dt)
      p.x += p.vx * dt
      p.y += p.vy * dt
      p.rotation += p.rotationSpeed * dt
      p.life -= dt * 0.8

      ctx.save()
      ctx.translate(cx + p.x, cy + p.y)
      ctx.rotate(p.rotation)
      ctx.globalAlpha = Math.max(0, p.life)
      ctx.fillStyle = p.color
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6)
      ctx.restore()
    }

    return alive
  }
}

/**
 * Fires a single-color success confetti (accent color).
 */
export function fireSuccess(config?: EffectConfig): (ctx: CanvasRenderingContext2D, dt: number) => boolean {
  return createConfetti({ ...config, colors: config?.colors ?? [getThemeColors()[0] ?? '#C5A03F'] })
}

/**
 * Fires a full celebration confetti (wider spread, more particles).
 */
export function fireCelebration(config?: EffectConfig): (ctx: CanvasRenderingContext2D, dt: number) => boolean {
  return createConfetti({ count: 60, spread: Math.PI, ...config })
}
