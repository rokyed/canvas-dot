import Point3D from '../point3d.js';

export function createSword() {
  const baseSwordPoints = [];
  baseSwordPoints.push(new Point3D(0, 3, 0));
  baseSwordPoints.push(new Point3D(-0.2, 1, 0));
  baseSwordPoints.push(new Point3D(0.2, 1, 0));
  baseSwordPoints.push(new Point3D(-1, 0.8, 0));
  baseSwordPoints.push(new Point3D(1, 0.8, 0));
  baseSwordPoints.push(new Point3D(-0.2, 0, 0));
  baseSwordPoints.push(new Point3D(0.2, 0, 0));
  baseSwordPoints.push(new Point3D(-0.2, -1.5, 0));
  baseSwordPoints.push(new Point3D(0.2, -1.5, 0));
  baseSwordPoints.push(new Point3D(0, -1.7, 0));

  const SWORD_THICKNESS = 0.2;
  const HALF_THICKNESS = SWORD_THICKNESS / 2;
  const swordFrontPoints = baseSwordPoints.map(p => new Point3D(p.x, p.y, -HALF_THICKNESS));
  const swordBackPoints = baseSwordPoints.map(p => new Point3D(p.x, p.y, HALF_THICKNESS));
  const points = [...swordFrontPoints, ...swordBackPoints];

  const baseSwordLines = [
    [0, 1], [0, 2], [1, 2], [1, 3], [2, 4], [3, 4],
    [1, 5], [2, 6], [5, 6], [5, 7], [6, 8], [7, 8],
    [7, 9], [8, 9]
  ];

  const lines = [];
  for (const [a, b] of baseSwordLines) {
    lines.push([points[a], points[b]]);
  }
  for (const [a, b] of baseSwordLines) {
    lines.push([points[a + baseSwordPoints.length], points[b + baseSwordPoints.length]]);
  }
  for (let i = 0; i < baseSwordPoints.length; i++) {
    lines.push([points[i], points[i + baseSwordPoints.length]]);
  }

  points.forEach(p => p.setColor('#0ff'));

  return { points, lines };
}
