import Point3D from '../point3d.js';

export function createCar() {
  const bodyWidth = 4;
  const bodyHeight = 1;
  const bodyDepth = 2;

  // Lower rectangle (bottom of the car body)
  const bottom = [
    new Point3D(-bodyWidth / 2, 0, bodyDepth / 2),
    new Point3D(bodyWidth / 2, 0, bodyDepth / 2),
    new Point3D(bodyWidth / 2, 0, -bodyDepth / 2),
    new Point3D(-bodyWidth / 2, 0, -bodyDepth / 2)
  ];

  // Upper rectangle (top of the car body)
  const top = [
    new Point3D(-bodyWidth / 2, bodyHeight, bodyDepth / 2),
    new Point3D(bodyWidth / 2, bodyHeight, bodyDepth / 2),
    new Point3D(bodyWidth / 2, bodyHeight, -bodyDepth / 2),
    new Point3D(-bodyWidth / 2, bodyHeight, -bodyDepth / 2)
  ];

  const roofHeight = bodyHeight + 0.8;
  const roofWidth = bodyWidth * 0.6;
  const roofDepth = bodyDepth * 0.8;

  const roof = [
    new Point3D(-roofWidth / 2, roofHeight, roofDepth / 2),
    new Point3D(roofWidth / 2, roofHeight, roofDepth / 2),
    new Point3D(roofWidth / 2, roofHeight, -roofDepth / 2),
    new Point3D(-roofWidth / 2, roofHeight, -roofDepth / 2)
  ];

  const points = [...bottom, ...top, ...roof];

  const lines = [
    // Body base
    [points[0], points[1]],
    [points[1], points[2]],
    [points[2], points[3]],
    [points[3], points[0]],
    // Body top
    [points[4], points[5]],
    [points[5], points[6]],
    [points[6], points[7]],
    [points[7], points[4]],
    // Vertical edges
    [points[0], points[4]],
    [points[1], points[5]],
    [points[2], points[6]],
    [points[3], points[7]],
    // Roof
    [points[8], points[9]],
    [points[9], points[10]],
    [points[10], points[11]],
    [points[11], points[8]],
    // Roof supports
    [points[4], points[8]],
    [points[5], points[9]],
    [points[6], points[10]],
    [points[7], points[11]]
  ];

  points.forEach(p => p.setColor('#fff'));

  return { points, lines };
}
