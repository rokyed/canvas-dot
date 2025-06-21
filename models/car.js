import Point3D from '../point3d.js';

function rotatePointsY(points, angle, cx = 0, cy = 0, cz = 0) {
  points.forEach(p => {
    const rot = p.rotateAroundY(p.x - cx, p.y - cy, p.z - cz, angle);
    p.setPosition(rot.x + cx, rot.y + cy, rot.z + cz);
  });
}

function rotatePointsX(points, angle, cx = 0, cy = 0, cz = 0) {
  points.forEach(p => {
    const rot = p.rotateAroundX(p.x - cx, p.y - cy, p.z - cz, angle);
    p.setPosition(rot.x + cx, rot.y + cy, rot.z + cz);
  });
}

function rotatePointsZ(points, angle, cx = 0, cy = 0, cz = 0) {
  points.forEach(p => {
    const rot = p.rotateAroundZ(p.x - cx, p.y - cy, p.z - cz, angle);
    p.setPosition(rot.x + cx, rot.y + cy, rot.z + cz);
  });
}

function translatePoints(points, dx = 0, dy = 0, dz = 0) {
  points.forEach(p => {
    p.translate(dx, dy, dz);
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
  // Raise the wheels upwards by their radius
  const wheelOffsetY = 0;

  const { points: flp, lines: fll } = createWheel(wheelRadius, wheelWidth);
  flp.forEach(p => p.translate(-wheelOffsetX, wheelOffsetY, wheelOffsetZ));
  const { points: frp, lines: frl } = createWheel(wheelRadius, wheelWidth);
  frp.forEach(p => p.translate(wheelOffsetX, wheelOffsetY, wheelOffsetZ));
  const { points: blp, lines: bll } = createWheel(wheelRadius, wheelWidth);
  blp.forEach(p => p.translate(-wheelOffsetX, wheelOffsetY, -wheelOffsetZ));
  const { points: brp, lines: brl } = createWheel(wheelRadius, wheelWidth);
  brp.forEach(p => p.translate(wheelOffsetX, wheelOffsetY, -wheelOffsetZ));

  const headlightLeft = new Point3D(-bodyWidth / 4, bodyHeight * 0.5, wheelOffsetZ + 0.1);
  const headlightRight = new Point3D(bodyWidth / 4, bodyHeight * 0.5, wheelOffsetZ + 0.1);
  const stoplightLeft = new Point3D(-bodyWidth / 4, bodyHeight * 0.5, -wheelOffsetZ - 0.1);
  const stoplightRight = new Point3D(bodyWidth / 4, bodyHeight * 0.5, -wheelOffsetZ - 0.1);

  const bodyPoints = [...bottom, ...top, ...roof];
  const wheelPoints = [...flp, ...frp, ...blp, ...brp];
  const points = [
    ...bodyPoints,
    ...wheelPoints,
    headlightLeft,
    headlightRight,
    stoplightLeft,
    stoplightRight
  ];

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
  wheelPoints.forEach(p => p.setColor('#fff'));
  headlightLeft.setColor('#ff0');
  headlightRight.setColor('#ff0');
  stoplightLeft.setColor('#f00');
  stoplightRight.setColor('#f00');

  const wheelCenters = {
    fl: { x: -wheelOffsetX, y: wheelOffsetY, z: wheelOffsetZ },
    fr: { x: wheelOffsetX, y: wheelOffsetY, z: wheelOffsetZ },
    bl: { x: -wheelOffsetX, y: wheelOffsetY, z: -wheelOffsetZ },
    br: { x: wheelOffsetX, y: wheelOffsetY, z: -wheelOffsetZ }
  };

  const suspension = { fl: 0, fr: 0, bl: 0, br: 0 };
  let steerAngle = 0;
  let time = 0;
  let colorTimer = 0;

  const randomColor = () => '#'+Math.floor(Math.random()*0xffffff).toString(16).padStart(6,'0');

  const update = (delta) => {
    time += delta;
    colorTimer += delta;
    if (colorTimer >= 0.1) {
      const c = randomColor();
      bodyPoints.forEach(p => p.setColor(c));
      colorTimer = 0;
    }
    const spinDelta = 360 * delta;
    rotatePointsX(flp, spinDelta, wheelCenters.fl.x, wheelCenters.fl.y + suspension.fl, wheelCenters.fl.z);
    rotatePointsX(frp, spinDelta, wheelCenters.fr.x, wheelCenters.fr.y + suspension.fr, wheelCenters.fr.z);
    rotatePointsX(blp, spinDelta, wheelCenters.bl.x, wheelCenters.bl.y + suspension.bl, wheelCenters.bl.z);
    rotatePointsX(brp, spinDelta, wheelCenters.br.x, wheelCenters.br.y + suspension.br, wheelCenters.br.z);

    const newSteer = Math.sin(time * 2) * 30;
    rotatePointsY(flp, newSteer - steerAngle, wheelCenters.fl.x, wheelCenters.fl.y + suspension.fl, wheelCenters.fl.z);
    rotatePointsY(frp, newSteer - steerAngle, wheelCenters.fr.x, wheelCenters.fr.y + suspension.fr, wheelCenters.fr.z);
    steerAngle = newSteer;

    const amp = 0.1;
    const newSusp = {
      fl: Math.sin(time * 3) * amp,
      fr: Math.sin(time * 3 + Math.PI / 2) * amp,
      bl: Math.sin(time * 3 + Math.PI) * amp,
      br: Math.sin(time * 3 + (3 * Math.PI) / 2) * amp
    };

    translatePoints(flp, 0, newSusp.fl - suspension.fl, 0);
    translatePoints(frp, 0, newSusp.fr - suspension.fr, 0);
    translatePoints(blp, 0, newSusp.bl - suspension.bl, 0);
    translatePoints(brp, 0, newSusp.br - suspension.br, 0);
    wheelCenters.fl.y += newSusp.fl - suspension.fl;
    wheelCenters.fr.y += newSusp.fr - suspension.fr;
    wheelCenters.bl.y += newSusp.bl - suspension.bl;
    wheelCenters.br.y += newSusp.br - suspension.br;
    suspension.fl = newSusp.fl;
    suspension.fr = newSusp.fr;
    suspension.bl = newSusp.bl;
    suspension.br = newSusp.br;
  };

  return { points, lines, update };
}
