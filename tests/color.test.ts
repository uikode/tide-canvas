import { describe, it, expect, beforeEach, vi } from 'vitest'
import { hexToRgba, lerpColor } from '../src/utils/color'

// Mock getComputedStyle for getCSSVar tests
const mockGetComputedStyle = vi.fn()

beforeEach(() => {
  vi.stubGlobal('getComputedStyle', mockGetComputedStyle)
  mockGetComputedStyle.mockReturnValue({
    getPropertyValue: vi.fn((prop: string) => {
      const vars: Record<string, string> = {
        '--color-accent': '#C5A03F',
        '--color-success': '#3D8B5F',
        '--color-warning': '#C5A03F',
        '--color-info': '#5C7A8A',
      }
      return vars[prop] ?? ''
    }),
  })
})

describe('hexToRgba', () => {
  it('converts 6-char hex to rgba', () => {
    expect(hexToRgba('#FF0000')).toBe('rgba(255, 0, 0, 1)')
    expect(hexToRgba('#00FF00')).toBe('rgba(0, 255, 0, 1)')
    expect(hexToRgba('#0000FF')).toBe('rgba(0, 0, 255, 1)')
  })

  it('converts 3-char hex to rgba', () => {
    expect(hexToRgba('#F00')).toBe('rgba(255, 0, 0, 1)')
    expect(hexToRgba('#0F0')).toBe('rgba(0, 255, 0, 1)')
  })

  it('works without # prefix', () => {
    expect(hexToRgba('FF0000')).toBe('rgba(255, 0, 0, 1)')
    expect(hexToRgba('abc')).toBe('rgba(170, 187, 204, 1)')
  })

  it('applies alpha', () => {
    expect(hexToRgba('#FF0000', 0.5)).toBe('rgba(255, 0, 0, 0.5)')
    expect(hexToRgba('#000000', 0)).toBe('rgba(0, 0, 0, 0)')
  })

  it('handles mixed case', () => {
    expect(hexToRgba('#fF00aA')).toBe('rgba(255, 0, 170, 1)')
  })

  it('throws on empty string', () => {
    expect(() => hexToRgba('')).toThrow(TypeError)
  })

  it('throws on invalid hex chars', () => {
    expect(() => hexToRgba('#GGGGGG')).toThrow(RangeError)
  })

  it('throws on wrong length', () => {
    expect(() => hexToRgba('#12345')).toThrow(RangeError)
    expect(() => hexToRgba('#1')).toThrow(RangeError)
  })

  it('throws on alpha out of range', () => {
    expect(() => hexToRgba('#FF0000', 1.5)).toThrow(RangeError)
    expect(() => hexToRgba('#FF0000', -0.1)).toThrow(RangeError)
  })

  it('throws on NaN alpha', () => {
    expect(() => hexToRgba('#FF0000', NaN)).toThrow(RangeError)
  })
})

describe('lerpColor', () => {
  it('returns color1 at t=0', () => {
    expect(lerpColor('#000000', '#FFFFFF', 0)).toBe('#000000')
  })

  it('returns color2 at t=1', () => {
    expect(lerpColor('#000000', '#FFFFFF', 1)).toBe('#ffffff')
  })

  it('returns midpoint at t=0.5', () => {
    const result = lerpColor('#000000', '#FFFFFF', 0.5)
    // 127 or 128 depending on rounding
    expect(result).toMatch(/^#(7f7f7f|808080)$/)
  })

  it('works with 3-char hex', () => {
    expect(lerpColor('#000', '#FFF', 0)).toBe('#000000')
  })

  it('interpolates individual channels', () => {
    // #FF0000 → #00FF00 at t=0.5 → #808000 (128, 128, 0)
    const result = lerpColor('#FF0000', '#00FF00', 0.5)
    expect(result).toMatch(/^#(7f7f|8080)00$/)
  })

  it('throws on empty color1', () => {
    expect(() => lerpColor('', '#FFFFFF', 0.5)).toThrow(TypeError)
  })

  it('throws on empty color2', () => {
    expect(() => lerpColor('#000000', '', 0.5)).toThrow(TypeError)
  })

  it('throws on t < 0', () => {
    expect(() => lerpColor('#000', '#FFF', -0.1)).toThrow(RangeError)
  })

  it('throws on t > 1', () => {
    expect(() => lerpColor('#000', '#FFF', 1.1)).toThrow(RangeError)
  })

  it('throws on NaN t', () => {
    expect(() => lerpColor('#000', '#FFF', NaN)).toThrow(RangeError)
  })
})

describe('getCSSVar', () => {
  // We import dynamically after mocks are set up
  it('reads CSS variable from document.documentElement', async () => {
    const { getCSSVar } = await import('../src/utils/color')
    const result = getCSSVar('accent')
    expect(result).toBe('#C5A03F')
    expect(mockGetComputedStyle).toHaveBeenCalledWith(document.documentElement)
  })

  it('reads from custom element', async () => {
    const { getCSSVar } = await import('../src/utils/color')
    const el = document.createElement('div')
    getCSSVar('accent', el)
    expect(mockGetComputedStyle).toHaveBeenCalledWith(el)
  })

  it('throws on empty name', async () => {
    const { getCSSVar } = await import('../src/utils/color')
    expect(() => getCSSVar('')).toThrow(TypeError)
  })

  it('returns empty string for undefined var', async () => {
    const { getCSSVar } = await import('../src/utils/color')
    const result = getCSSVar('nonexistent')
    expect(result).toBe('')
  })
})

describe('getAccentColor', () => {
  it('returns accent color from CSS var', async () => {
    const { getAccentColor } = await import('../src/utils/color')
    expect(getAccentColor()).toBe('#C5A03F')
  })

  it('falls back to #C5A03F when var empty', async () => {
    mockGetComputedStyle.mockReturnValue({
      getPropertyValue: () => '',
    })
    const { getAccentColor } = await import('../src/utils/color')
    expect(getAccentColor()).toBe('#C5A03F')
  })
})

describe('getThemeColors', () => {
  it('returns array of 4 theme colors', async () => {
    const { getThemeColors } = await import('../src/utils/color')
    const colors = getThemeColors()
    expect(colors).toHaveLength(4)
    expect(colors[0]).toBe('#C5A03F')
    expect(colors[1]).toBe('#3D8B5F')
    expect(colors[2]).toBe('#C5A03F')
    expect(colors[3]).toBe('#5C7A8A')
  })
})
