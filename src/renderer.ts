import type { FrameCallback } from './types'

/**
 * Manages a canvas overlay for decorative effects.
 * Creates a transparent canvas over the container, runs RAF loop,
 * and auto-stops when no effects are active (0 CPU idle).
 */
export class CanvasRenderer {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private effects: Set<FrameCallback> = new Set()
  private rafId: number | null = null
  private lastTime = 0
  private resizeHandler: () => void

  constructor(container: HTMLElement) {
    if (!container) throw new TypeError('CanvasRenderer: container element is required')
    if (!container.isConnected) throw new TypeError('CanvasRenderer: container must be in DOM')

    this.canvas = document.createElement('canvas')
    this.canvas.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:0;'
    this.ctx = this.canvas.getContext('2d')!
    if (!this.ctx) throw new Error('CanvasRenderer: failed to get 2D context')

    container.style.position = 'relative'
    container.appendChild(this.canvas)
    this.resize()
    this.resizeHandler = () => this.resize()
    window.addEventListener('resize', this.resizeHandler)
  }

  private resize(): void {
    const parent = this.canvas.parentElement
    if (!parent) return
    const dpr = window.devicePixelRatio || 1
    const rect = parent.getBoundingClientRect()
    this.canvas.width = rect.width * dpr
    this.canvas.height = rect.height * dpr
    this.canvas.style.width = rect.width + 'px'
    this.canvas.style.height = rect.height + 'px'
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }

  /**
   * Registers an effect frame callback.
   * Returns a dispose function to remove the effect.
   * The callback receives (ctx, deltaTime) and returns true while alive.
   */
  addEffect(cb: FrameCallback): () => void {
    if (!cb) throw new TypeError('CanvasRenderer.addEffect: callback is required')
    if (typeof cb !== 'function') throw new TypeError('CanvasRenderer.addEffect: callback must be a function')
    this.effects.add(cb)
    if (!this.rafId) this.start()
    return () => this.effects.delete(cb)
  }

  private start(): void {
    this.lastTime = performance.now()
    const loop = (now: number): void => {
      const dt = Math.min((now - this.lastTime) / 1000, 0.1) // cap at 100ms
      this.lastTime = now
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

      for (const effect of this.effects) {
        const alive = effect(this.ctx, dt)
        if (!alive) this.effects.delete(effect)
      }

      if (this.effects.size > 0) {
        this.rafId = requestAnimationFrame(loop)
      } else {
        this.rafId = null
      }
    }
    this.rafId = requestAnimationFrame(loop)
  }

  /** Stops the animation loop and removes the canvas from DOM. */
  destroy(): void {
    if (this.rafId) cancelAnimationFrame(this.rafId)
    this.rafId = null
    window.removeEventListener('resize', this.resizeHandler)
    this.canvas.remove()
    this.effects.clear()
  }

  /** Returns current number of active effects. */
  get activeEffects(): number {
    return this.effects.size
  }
}
