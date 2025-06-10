import Point3D from '../point3d.js';
import { createSphere } from './sphere.js';

export function createPendulum(length = 4, bobSize = 0.5) {
  const pivot = new Point3D(0, 0, 0);
  const bobCenter = new Point3D(0, -length, 0);
  const { points: bobPoints, lines: bobLines } = createSphere(8, 8, bobSize);
  bobPoints.forEach(p => p.translate(0, -length, 0));
  const points = [pivot, bobCenter, ...bobPoints];
  const lines = [
    [pivot, bobCenter],
    ...bobLines
  ];

  points.forEach(p => p.setColor('#fff'));
  const base = points.map(p => ({ x: p.x, y: p.y, z: p.z }));
  let angle = 0;
  let direction = 1;
  const maxAngle = 30;
  const speed = 60;

  const update = (delta) => {
    angle += direction * speed * delta;
    if (angle > maxAngle) {
      angle = maxAngle;
      direction = -1;
    } else if (angle < -maxAngle) {
      angle = -maxAngle;
      direction = 1;
    }
    const rad = angle * Math.PI / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    for (let i = 0; i < points.length; i++) {
      const b = base[i];
      const x = b.x * cos - b.y * sin;
      const y = b.x * sin + b.y * cos;
      points[i].setPosition(x, y, b.z);
    }
  };

  return { points, lines, update };
}
