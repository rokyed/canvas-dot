import Point3D from '../point3d.js';

export function createHeart(steps = 60, scale = 0.2, thickness = 0.5) {
  const base = [];
  for (let i = 0; i < steps; i++) {
    const t = (i / steps) * Math.PI * 2;
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
    base.push(new Point3D(x * scale, y * scale, 0));
  }

  const front = base.map(p => new Point3D(p.x, p.y, -thickness / 2));
  const back = base.map(p => new Point3D(p.x, p.y, thickness / 2));
  const points = [...front, ...back];
  const lines = [];
  const len = base.length;

  for (let i = 0; i < len; i++) {
    const next = (i + 1) % len;
    lines.push([points[i], points[next]]);
    lines.push([points[i + len], points[next + len]]);
    lines.push([points[i], points[i + len]]);
  }

  points.forEach(p => p.setColor('#f00'));

  return { points, lines };
}
