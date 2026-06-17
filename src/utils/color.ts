/**
 * Reads a CSS custom property from an element.
 * @param name - Variable name without `--color-` prefix
 * @param el - Target element (defaults to documentElement)
 * @returns Trimmed CSS value or empty string
 */
export function getCSSVar(name: string, el?: HTMLElement): string {
  if (!name) throw new TypeError('getCSSVar: name is required')
  if (typeof name !== 'string') throw new TypeError('getCSSVar: name must be a string')
  const target = el ?? document.documentElement
  return getComputedStyle(target).getPropertyValue(`--color-${name}`).trim()
}

/**
 * Returns the current accent color from CSS vars.
 * Falls back to #C5A03F if not defined.
 */
export function getAccentColor(el?: HTMLElement): string {
  return getCSSVar('accent', el) || '#C5A03F'
}

/**
 * Returns an array of theme colors for particle effects.
 * Reads accent, success, warning, info from CSS vars.
 */
export function getThemeColors(el?: HTMLElement): string[] {
  return [
    getCSSVar('accent', el) || '#C5A03F',
    getCSSVar('success', el) || '#3D8B5F',
    getCSSVar('warning', el) || '#C5A03F',
    getCSSVar('info', el) || '#5C7A8A',
  ]
}

/**
 * Converts a hex color to rgba string.
 * @param hex - 3, 4, 6, or 8 char hex (with or without #)
 * @param alpha - Opacity 0-1 (default 1)
 */
export function hexToRgba(hex: string, alpha: number = 1): string {
  if (!hex) throw new TypeError('hexToRgba: hex is required')
  if (typeof hex !== 'string') throw new TypeError('hexToRgba: hex must be a string')
  if (!Number.isFinite(alpha) || alpha < 0 || alpha > 1) {
    throw new RangeError(`hexToRgba: alpha must be 0-1, got ${alpha}`)
  }

  let h = hex.replace(/^#/, '')
  if (h.length === 3) h = h[0]! + h[0]! + h[1]! + h[1]! + h[2]! + h[2]!
  if (h.length === 4) h = h[0]! + h[0]! + h[1]! + h[1]! + h[2]! + h[2]! + h[3]! + h[3]!

  if (h.length !== 6 && h.length !== 8) {
    throw new RangeError(`hexToRgba: invalid hex length, got "${hex}"`)
  }
  if (!/^[0-9a-fA-F]+$/.test(h)) {
    throw new RangeError(`hexToRgba: invalid hex characters in "${hex}"`)
  }

  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)

  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

/**
 * Linearly interpolates between two hex colors.
 * @param color1 - Start hex color
 * @param color2 - End hex color
 * @param t - Interpolation factor 0-1
 */
export function lerpColor(color1: string, color2: string, t: number): string {
  if (!color1) throw new TypeError('lerpColor: color1 is required')
  if (!color2) throw new TypeError('lerpColor: color2 is required')
  if (!Number.isFinite(t) || t < 0 || t > 1) {
    throw new RangeError(`lerpColor: t must be 0-1, got ${t}`)
  }

  const parse = (hex: string): [number, number, number] => {
    let h = hex.replace(/^#/, '')
    if (h.length === 3) h = h[0]! + h[0]! + h[1]! + h[1]! + h[2]! + h[2]!
    return [
      parseInt(h.slice(0, 2), 16),
      parseInt(h.slice(2, 4), 16),
      parseInt(h.slice(4, 6), 16),
    ]
  }

  const [r1, g1, b1] = parse(color1)
  const [r2, g2, b2] = parse(color2)

  const r = Math.round(r1 + (r2 - r1) * t)
  const g = Math.round(g1 + (g2 - g1) * t)
  const b = Math.round(b1 + (b2 - b1) * t)

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}
