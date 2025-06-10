import Point3D from '../point3d.js';

export function createPyramid(size = 2, height = 2) {
  const half = size / 2;
  const p0 = new Point3D(-half, 0, half);
  const p1 = new Point3D(half, 0, half);
  const p2 = new Point3D(half, 0, -half);
  const p3 = new Point3D(-half, 0, -half);
  const apex = new Point3D(0, height, 0);
  const points = [p0, p1, p2, p3, apex];
  const lines = [
    [p0, p1], [p1, p2], [p2, p3], [p3, p0],
    [p0, apex], [p1, apex], [p2, apex], [p3, apex]
  ];
  points.forEach(p => p.setColor('#0f0'));
  return { points, lines };
}
