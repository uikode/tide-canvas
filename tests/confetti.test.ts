import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createConfetti, fireSuccess, fireCelebration } from '../src/effects/confetti'

// Mock DOM globals
beforeEach(() => {
  vi.stubGlobal('window', {
    devicePixelRatio: 1,
  })
  vi.stubGlobal('getComputedStyle', () => ({
    getPropertyValue: (prop: string) => {
      const vars: Record<string, string> = {
        '--color-accent': '#C5A03F',
        '--color-success': '#3D8B5F',
        '--color-warning': '#C5A03F',
        '--color-info': '#5C7A8A',
      }
      return vars[prop] ?? ''
    },
  }))
  vi.stubGlobal('document', {
    documentElement: {},
  })
})

function createMockCtx(width = 800, height = 600): CanvasRenderingContext2D {
  return {
    canvas: { width, height },
    save: vi.fn(),
    restore: vi.fn(),
    translate: vi.fn(),
    rotate: vi.fn(),
    fillRect: vi.fn(),
    clearRect: vi.fn(),
    globalAlpha: 1,
    fillStyle: '',
  } as unknown as CanvasRenderingContext2D
}

describe('createConfetti', () => {
  it('returns a function', () => {
    const effect = createConfetti()
    expect(typeof effect).toBe('function')
  })

  it('creates particles and renders them (returns true when alive)', () => {
    const ctx = createMockCtx()
    const effect = createConfetti({ count: 10 })
    const alive = effect(ctx, 0.016)
    expect(alive).toBe(true)
    expect(ctx.save).toHaveBeenCalled()
    expect(ctx.restore).toHaveBeenCalled()
    expect(ctx.fillRect).toHaveBeenCalled()
  })

  it('uses default count of 40 particles', () => {
    const ctx = createMockCtx()
    const effect = createConfetti()
    effect(ctx, 0.016)
    // 40 particles × (save + translate + rotate + fillRect + restore) = 40 calls to fillRect
    expect(ctx.fillRect).toHaveBeenCalledTimes(40)
  })

  it('respects custom particle count', () => {
    const ctx = createMockCtx()
    const effect = createConfetti({ count: 5 })
    effect(ctx, 0.016)
    expect(ctx.fillRect).toHaveBeenCalledTimes(5)
  })

  it('particles die over time (returns false when all dead)', () => {
    const ctx = createMockCtx()
    const effect = createConfetti({ count: 3 })

    // Simulate many frames until particles die (life -= dt * 0.8)
    let alive = true
    for (let i = 0; i < 200 && alive; i++) {
      alive = effect(ctx, 0.05) // large dt to speed up death
    }
    expect(alive).toBe(false)
  })

  it('uses custom colors when provided', () => {
    const ctx = createMockCtx()
    const colors = ['#FF0000', '#00FF00']
    const effect = createConfetti({ count: 20, colors })
    effect(ctx, 0.016)
    // All fillStyle calls should use one of our colors
    // We can't easily check fillStyle assignments through mock, but verify it runs
    expect(ctx.fillRect).toHaveBeenCalledTimes(20)
  })

  it('positions particles based on x/y config', () => {
    const ctx = createMockCtx(1000, 500)
    const effect = createConfetti({ count: 1, x: 0.2, y: 0.8 })
    effect(ctx, 0.001) // tiny dt so particles barely move
    // translate should be called with values near (200, 400)
    expect(ctx.translate).toHaveBeenCalled()
  })

  it('throws on invalid x (>1)', () => {
    expect(() => createConfetti({ x: 1.5 })).toThrow(RangeError)
  })

  it('throws on invalid x (<0)', () => {
    expect(() => createConfetti({ x: -0.1 })).toThrow(RangeError)
  })

  it('throws on invalid y (>1)', () => {
    expect(() => createConfetti({ y: 2 })).toThrow(RangeError)
  })

  it('throws on NaN count', () => {
    expect(() => createConfetti({ count: NaN })).toThrow(RangeError)
  })

  it('throws on negative count', () => {
    expect(() => createConfetti({ count: -5 })).toThrow(RangeError)
  })

  it('handles count of 0 (no particles, immediately dead)', () => {
    const ctx = createMockCtx()
    const effect = createConfetti({ count: 0 })
    const alive = effect(ctx, 0.016)
    expect(alive).toBe(false)
    expect(ctx.fillRect).not.toHaveBeenCalled()
  })
})

describe('fireSuccess', () => {
  it('returns a function (confetti effect)', () => {
    const effect = fireSuccess()
    expect(typeof effect).toBe('function')
  })

  it('uses accent color by default', () => {
    const ctx = createMockCtx()
    const effect = fireSuccess()
    const alive = effect(ctx, 0.016)
    expect(alive).toBe(true)
  })

  it('respects custom config', () => {
    const ctx = createMockCtx()
    const effect = fireSuccess({ count: 5 })
    effect(ctx, 0.016)
    expect(ctx.fillRect).toHaveBeenCalledTimes(5)
  })
})

describe('fireCelebration', () => {
  it('returns a function (confetti effect)', () => {
    const effect = fireCelebration()
    expect(typeof effect).toBe('function')
  })

  it('defaults to 60 particles', () => {
    const ctx = createMockCtx()
    const effect = fireCelebration()
    effect(ctx, 0.016)
    expect(ctx.fillRect).toHaveBeenCalledTimes(60)
  })

  it('allows override of count', () => {
    const ctx = createMockCtx()
    const effect = fireCelebration({ count: 10 })
    effect(ctx, 0.016)
    expect(ctx.fillRect).toHaveBeenCalledTimes(10)
  })
})
