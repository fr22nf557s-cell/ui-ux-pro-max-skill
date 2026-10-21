/**
 * Cheap, cached WebGL capability probe.
 *
 * The hero renders a real 3D drone when the GPU can take it and an animated
 * SVG drone when it cannot (old devices, blocked WebGL, headless crawlers).
 * We create one throwaway context and never touch it again.
 */
let cached = null

export function supportsWebGL() {
  if (cached !== null) return cached
  if (typeof window === 'undefined') return (cached = false)
  try {
    const canvas = document.createElement('canvas')
    cached = Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl')),
    )
  } catch {
    cached = false
  }
  return cached
}
