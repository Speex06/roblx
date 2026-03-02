export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function smoothstep(edge0, edge1, x) {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

// Simple hash-based 2D noise for terrain generation
function hash(x, z) {
  let h = x * 374761393 + z * 668265263;
  h = (h ^ (h >> 13)) * 1274126177;
  h = h ^ (h >> 16);
  return h;
}

function fade(t) {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

function lerpN(a, b, t) {
  return a + t * (b - a);
}

function grad2D(hash, x, z) {
  const h = hash & 3;
  const u = h < 2 ? x : -x;
  const v = h === 0 || h === 3 ? z : -z;
  return u + v;
}

export function noise2D(x, z) {
  const xi = Math.floor(x);
  const zi = Math.floor(z);
  const xf = x - xi;
  const zf = z - zi;

  const u = fade(xf);
  const v = fade(zf);

  const n00 = grad2D(hash(xi, zi), xf, zf);
  const n10 = grad2D(hash(xi + 1, zi), xf - 1, zf);
  const n01 = grad2D(hash(xi, zi + 1), xf, zf - 1);
  const n11 = grad2D(hash(xi + 1, zi + 1), xf - 1, zf - 1);

  const nx0 = lerpN(n00, n10, u);
  const nx1 = lerpN(n01, n11, u);

  return lerpN(nx0, nx1, v) * 0.5 + 0.5;
}

export function fbm2D(x, z, octaves = 4, lacunarity = 2, gain = 0.5) {
  let sum = 0;
  let amplitude = 1;
  let frequency = 1;
  let maxAmplitude = 0;

  for (let i = 0; i < octaves; i++) {
    sum += noise2D(x * frequency, z * frequency) * amplitude;
    maxAmplitude += amplitude;
    amplitude *= gain;
    frequency *= lacunarity;
  }

  return sum / maxAmplitude;
}
