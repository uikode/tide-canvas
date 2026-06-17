/**
 * Returns a random number in [min, max).
 */
export function randomRange(min: number, max: number): number {
  if (!Number.isFinite(min)) throw new RangeError(`randomRange: min must be finite, got ${min}`)
  if (!Number.isFinite(max)) throw new RangeError(`randomRange: max must be finite, got ${max}`)
  if (min > max) throw new RangeError(`randomRange: min (${min}) must be <= max (${max})`)
  return min + Math.random() * (max - min)
}

/**
 * Returns a random angle within a spread arc centered on `center`.
 * @param spread - Total arc width in radians
 * @param center - Center angle (default: -PI/2 = upward)
 */
export function randomAngle(spread: number, center: number = -Math.PI / 2): number {
  if (!Number.isFinite(spread)) throw new RangeError(`randomAngle: spread must be finite, got ${spread}`)
  if (!Number.isFinite(center)) throw new RangeError(`randomAngle: center must be finite, got ${center}`)
  if (spread < 0) throw new RangeError(`randomAngle: spread must be non-negative, got ${spread}`)
  return center + (Math.random() - 0.5) * spread
}

/**
 * Applies gravity to vertical velocity.
 */
export function applyGravity(vy: number, gravity: number, dt: number): number {
  if (!Number.isFinite(vy)) throw new RangeError(`applyGravity: vy must be finite, got ${vy}`)
  if (!Number.isFinite(gravity)) throw new RangeError(`applyGravity: gravity must be finite, got ${gravity}`)
  if (!Number.isFinite(dt) || dt < 0) throw new RangeError(`applyGravity: dt must be finite non-negative, got ${dt}`)
  return vy + gravity * dt
}

/**
 * Applies friction dampening to a velocity component.
 */
export function applyFriction(v: number, friction: number, dt: number): number {
  if (!Number.isFinite(v)) throw new RangeError(`applyFriction: v must be finite, got ${v}`)
  if (!Number.isFinite(friction)) throw new RangeError(`applyFriction: friction must be finite, got ${friction}`)
  if (!Number.isFinite(dt) || dt < 0) throw new RangeError(`applyFriction: dt must be finite non-negative, got ${dt}`)
  if (friction < 0) throw new RangeError(`applyFriction: friction must be non-negative, got ${friction}`)
  return v * (1 - friction * dt)
}

/**
 * Checks if a particle is still alive (life > 0).
 */
export function isAlive(particle: { life: number }): boolean {
  if (particle == null) throw new TypeError('isAlive: particle is required')
  if (!Number.isFinite(particle.life)) throw new RangeError(`isAlive: particle.life must be finite, got ${particle.life}`)
  return particle.life > 0
}
