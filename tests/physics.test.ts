import { describe, it, expect } from 'vitest'
import { randomRange, randomAngle, applyGravity, applyFriction, isAlive } from '../src/utils/physics'

describe('randomRange', () => {
  it('returns value within [min, max)', () => {
    for (let i = 0; i < 100; i++) {
      const val = randomRange(5, 10)
      expect(val).toBeGreaterThanOrEqual(5)
      expect(val).toBeLessThan(10)
    }
  })

  it('returns exact value when min === max', () => {
    expect(randomRange(7, 7)).toBe(7)
  })

  it('works with negative ranges', () => {
    for (let i = 0; i < 50; i++) {
      const val = randomRange(-10, -5)
      expect(val).toBeGreaterThanOrEqual(-10)
      expect(val).toBeLessThan(-5)
    }
  })

  it('throws on NaN min', () => {
    expect(() => randomRange(NaN, 5)).toThrow(RangeError)
  })

  it('throws on NaN max', () => {
    expect(() => randomRange(0, NaN)).toThrow(RangeError)
  })

  it('throws on Infinity', () => {
    expect(() => randomRange(0, Infinity)).toThrow(RangeError)
    expect(() => randomRange(-Infinity, 0)).toThrow(RangeError)
  })

  it('throws when min > max', () => {
    expect(() => randomRange(10, 5)).toThrow(RangeError)
  })
})

describe('randomAngle', () => {
  it('returns angle within spread arc around default center (-PI/2)', () => {
    const spread = Math.PI * 0.5
    for (let i = 0; i < 100; i++) {
      const angle = randomAngle(spread)
      expect(angle).toBeGreaterThanOrEqual(-Math.PI / 2 - spread / 2)
      expect(angle).toBeLessThanOrEqual(-Math.PI / 2 + spread / 2)
    }
  })

  it('returns exact center when spread is 0', () => {
    expect(randomAngle(0)).toBe(-Math.PI / 2)
    expect(randomAngle(0, Math.PI)).toBe(Math.PI)
  })

  it('respects custom center', () => {
    const spread = Math.PI
    for (let i = 0; i < 100; i++) {
      const angle = randomAngle(spread, 0)
      expect(angle).toBeGreaterThanOrEqual(-spread / 2)
      expect(angle).toBeLessThanOrEqual(spread / 2)
    }
  })

  it('throws on negative spread', () => {
    expect(() => randomAngle(-1)).toThrow(RangeError)
  })

  it('throws on NaN spread', () => {
    expect(() => randomAngle(NaN)).toThrow(RangeError)
  })

  it('throws on Infinity center', () => {
    expect(() => randomAngle(1, Infinity)).toThrow(RangeError)
  })
})

describe('applyGravity', () => {
  it('increases vy by gravity * dt', () => {
    expect(applyGravity(0, 800, 0.016)).toBeCloseTo(12.8, 5)
  })

  it('handles zero dt (no change)', () => {
    expect(applyGravity(100, 800, 0)).toBe(100)
  })

  it('handles negative gravity (upward force)', () => {
    expect(applyGravity(0, -500, 0.1)).toBeCloseTo(-50, 5)
  })

  it('handles zero gravity', () => {
    expect(applyGravity(42, 0, 1)).toBe(42)
  })

  it('throws on NaN vy', () => {
    expect(() => applyGravity(NaN, 800, 0.1)).toThrow(RangeError)
  })

  it('throws on NaN gravity', () => {
    expect(() => applyGravity(0, NaN, 0.1)).toThrow(RangeError)
  })

  it('throws on negative dt', () => {
    expect(() => applyGravity(0, 800, -1)).toThrow(RangeError)
  })

  it('throws on Infinity dt', () => {
    expect(() => applyGravity(0, 800, Infinity)).toThrow(RangeError)
  })
})

describe('applyFriction', () => {
  it('dampens velocity by friction factor', () => {
    // v * (1 - friction * dt) = 100 * (1 - 2 * 0.016) = 100 * 0.968 = 96.8
    expect(applyFriction(100, 2, 0.016)).toBeCloseTo(96.8, 5)
  })

  it('returns original velocity when friction is 0', () => {
    expect(applyFriction(100, 0, 0.5)).toBe(100)
  })

  it('returns original velocity when dt is 0', () => {
    expect(applyFriction(100, 5, 0)).toBe(100)
  })

  it('handles negative velocity', () => {
    expect(applyFriction(-50, 2, 0.1)).toBeCloseTo(-40, 5)
  })

  it('throws on NaN v', () => {
    expect(() => applyFriction(NaN, 2, 0.1)).toThrow(RangeError)
  })

  it('throws on negative friction', () => {
    expect(() => applyFriction(100, -1, 0.1)).toThrow(RangeError)
  })

  it('throws on negative dt', () => {
    expect(() => applyFriction(100, 2, -1)).toThrow(RangeError)
  })
})

describe('isAlive', () => {
  it('returns true when life > 0', () => {
    expect(isAlive({ life: 1 })).toBe(true)
    expect(isAlive({ life: 0.001 })).toBe(true)
  })

  it('returns false when life is 0', () => {
    expect(isAlive({ life: 0 })).toBe(false)
  })

  it('returns false when life is negative', () => {
    expect(isAlive({ life: -0.5 })).toBe(false)
  })

  it('throws on null particle', () => {
    expect(() => isAlive(null as never)).toThrow(TypeError)
  })

  it('throws on undefined particle', () => {
    expect(() => isAlive(undefined as never)).toThrow(TypeError)
  })

  it('throws on NaN life', () => {
    expect(() => isAlive({ life: NaN })).toThrow(RangeError)
  })

  it('throws on Infinity life', () => {
    expect(() => isAlive({ life: Infinity })).toThrow(RangeError)
  })
})
