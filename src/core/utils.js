export const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export const lerp = (start, end, alpha) => start + (end - start) * alpha;

export const randRange = (min, max) => Math.random() * (max - min) + min;

export const timestamp = () => performance.now();
