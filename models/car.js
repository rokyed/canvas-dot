import Point3D from '../point3d.js';

function rotatePointsY(points, angle, cx = 0, cy = 0, cz = 0) {
  points.forEach(p => {
    const rot = p.rotateAroundY(p.x - cx, p.y - cy, p.z - cz, angle);
    p.setPosition(rot.x + cx, rot.y + cy, rot.z + cz);
  });
}

function createWheel(radius = 0.5, width = 0.4, segments = 12) {
  const pts = [];
  for (let i = 0; i < segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    const y = radius * Math.cos(angle);
    const z = radius * Math.sin(angle);
    pts.push(new Point3D(-width / 2, y, z));
    pts.push(new Point3D(width / 2, y, z));
  }
  const lines = [];
  for (let i = 0; i < segments; i++) {
    const next = (i + 1) % segments;
    const aF = pts[i * 2];
    const aB = pts[i * 2 + 1];
    const bF = pts[next * 2];
    const bB = pts[next * 2 + 1];
    lines.push([aF, bF]);
    lines.push([aB, bB]);
    lines.push([aF, aB]);
  }
  return { points: pts, lines };
}

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

  const wheelRadius = 0.5;
  const wheelWidth = 0.4;
  const wheelOffsetX = bodyWidth / 2 - wheelWidth / 2;
  const wheelOffsetZ = bodyDepth / 2;
  const wheelOffsetY = -wheelRadius;

  const { points: flp, lines: fll } = createWheel(wheelRadius, wheelWidth);
  flp.forEach(p => p.translate(-wheelOffsetX, wheelOffsetY, wheelOffsetZ));
  rotatePointsY(flp, 90, -wheelOffsetX, wheelOffsetY, wheelOffsetZ);
  const { points: frp, lines: frl } = createWheel(wheelRadius, wheelWidth);
  frp.forEach(p => p.translate(wheelOffsetX, wheelOffsetY, wheelOffsetZ));
  rotatePointsY(frp, 90, wheelOffsetX, wheelOffsetY, wheelOffsetZ);
  const { points: blp, lines: bll } = createWheel(wheelRadius, wheelWidth);
  blp.forEach(p => p.translate(-wheelOffsetX, wheelOffsetY, -wheelOffsetZ));
  rotatePointsY(blp, 90, -wheelOffsetX, wheelOffsetY, -wheelOffsetZ);
  const { points: brp, lines: brl } = createWheel(wheelRadius, wheelWidth);
  brp.forEach(p => p.translate(wheelOffsetX, wheelOffsetY, -wheelOffsetZ));
  rotatePointsY(brp, 90, wheelOffsetX, wheelOffsetY, -wheelOffsetZ);

  const points = [...bottom, ...top, ...roof, ...flp, ...frp, ...blp, ...brp];

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

  lines.push(...fll, ...frl, ...bll, ...brl);

  points.forEach(p => p.setColor('#fff'));

  return { points, lines };
}
