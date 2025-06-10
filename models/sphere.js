import Point3D from '../point3d.js';

export function createSphere(segments = 16, loops = 16, radius = 2) {
  const points = [];
  const lines = [];
  for (let i = 0; i <= loops; i++) {
    const phi = (i / loops) * Math.PI - Math.PI / 2;
    const cosPhi = Math.cos(phi);
    const sinPhi = Math.sin(phi);
    for (let j = 0; j <= segments; j++) {
      const theta = (j / segments) * Math.PI * 2;
      const x = radius * cosPhi * Math.cos(theta);
      const y = radius * sinPhi;
      const z = radius * cosPhi * Math.sin(theta);
      points.push(new Point3D(x, y, z));
    }
  }
  for (let i = 0; i < loops; i++) {
    for (let j = 0; j < segments; j++) {
      const a = i * (segments + 1) + j;
      const b = a + 1;
      const c = a + (segments + 1);
      lines.push([points[a], points[b]]);
      lines.push([points[a], points[c]]);
    }
  }
  return { points, lines };
}
