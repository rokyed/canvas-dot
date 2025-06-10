import Point3D from '../point3d.js';

export function createStar(points = 5, outerRadius = 2, innerRadius = 1, thickness = 0.5) {
  const base = [];
  for (let i = 0; i < points * 2; i++) {
    const angle = (i * Math.PI) / points;
    const r = i % 2 === 0 ? outerRadius : innerRadius;
    base.push(new Point3D(r * Math.cos(angle), r * Math.sin(angle), 0));
  }
  const front = base.map(p => new Point3D(p.x, p.y, -thickness / 2));
  const back = base.map(p => new Point3D(p.x, p.y, thickness / 2));
  const all = [...front, ...back];
  const lines = [];
  const len = base.length;
  for (let i = 0; i < len; i++) {
    const next = (i + 1) % len;
    lines.push([all[i], all[next]]);
  }
  for (let i = 0; i < len; i++) {
    const next = (i + 1) % len;
    lines.push([all[i + len], all[next + len]]);
  }
  for (let i = 0; i < len; i++) {
    lines.push([all[i], all[i + len]]);
  }
  return { points: all, lines };
}
