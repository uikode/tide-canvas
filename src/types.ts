export interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  size: number
  color: string
  rotation: number
  rotationSpeed: number
}

export interface EffectConfig {
  x?: number
  y?: number
  count?: number
  spread?: number
  gravity?: number
  friction?: number
  colors?: string[]
}

export interface AmbientConfig {
  intensity?: number
  color?: string
  pulse?: boolean
  reactive?: boolean
}

export interface ContourConfig {
  path: string
  duration?: number
  color?: string
  width?: number
}

export type FrameCallback = (ctx: CanvasRenderingContext2D, dt: number) => boolean
