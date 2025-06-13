import Point3D from '../point3d.js';

export function createKnot(p = 2, q = 3, radius = 3, tube = 0.8, segments = 200) {
  const points = [];
  const lines = [];

  for (let i = 0; i < segments; i++) {
    const t = (i / segments) * Math.PI * 2;
    const x = (radius + tube * Math.cos(q * t)) * Math.cos(p * t);
    const y = (radius + tube * Math.cos(q * t)) * Math.sin(p * t);
    const z = tube * Math.sin(q * t);
    points.push(new Point3D(x, y, z));
  }

  for (let i = 0; i < segments; i++) {
    const a = points[i];
    const b = points[(i + 1) % segments];
    lines.push([a, b]);
  }

  points.forEach(p => p.setColor('#0ff'));

  const base = points.map(p => ({ x: p.x, y: p.y, z: p.z }));
  let rot = 0;
  const speed = 30; // degrees per second

  const update = (delta) => {
    rot += speed * delta;
    const rad = rot * Math.PI / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    for (let i = 0; i < points.length; i++) {
      const b = base[i];
      const x = b.x * cos - b.z * sin;
      const z = b.x * sin + b.z * cos;
      points[i].setPosition(x, b.y, z);
    }
  };

  return { points, lines, update };
}
