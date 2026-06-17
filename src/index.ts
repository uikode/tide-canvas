// Core
export { CanvasRenderer } from './renderer'

// Types
export type { Particle, EffectConfig, AmbientConfig, ContourConfig, FrameCallback } from './types'

// Effects
export { createConfetti, fireSuccess, fireCelebration } from './effects/confetti'

// Utils
export { getCSSVar, getAccentColor, getThemeColors, hexToRgba, lerpColor } from './utils/color'
export { randomRange, randomAngle, applyGravity, applyFriction, isAlive } from './utils/physics'
