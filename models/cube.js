import Point3D from '../point3d.js';

export function createCube() {
  const cubeCenter = new Point3D(0, -3, 0);
  const points = [
    new Point3D(-1 + cubeCenter.x, 1 + cubeCenter.y, 1 + cubeCenter.z),
    new Point3D(-1 + cubeCenter.x, 1 + cubeCenter.y, -1 + cubeCenter.z),
    new Point3D(-1 + cubeCenter.x, -1 + cubeCenter.y, 1 + cubeCenter.z),
    new Point3D(-1 + cubeCenter.x, -1 + cubeCenter.y, -1 + cubeCenter.z),
    new Point3D(1 + cubeCenter.x, -1 + cubeCenter.y, -1 + cubeCenter.z),
    new Point3D(1 + cubeCenter.x, 1 + cubeCenter.y, -1 + cubeCenter.z),
    new Point3D(1 + cubeCenter.x, -1 + cubeCenter.y, 1 + cubeCenter.z),
    new Point3D(1 + cubeCenter.x, 1 + cubeCenter.y, 1 + cubeCenter.z)
  ];

  const lines = [
    [points[0], points[1]],
    [points[0], points[7]],
    [points[0], points[2]],
    [points[6], points[7]],
    [points[6], points[2]],
    [points[6], points[4]],
    [points[3], points[1]],
    [points[3], points[2]],
    [points[3], points[4]],
    [points[5], points[1]],
    [points[5], points[7]],
    [points[5], points[4]]
  ];

  points.forEach(p => p.setColor('#f0f'));

  return { points, lines };
}
