'use strict';

const RENDER_SCALE = 2; // canvas is scaled up 2x so rendering is at half resolution

const getScreenSize = () => ({
  width: window.innerWidth,
  height: window.innerHeight
});

const { width: screenWidth, height: screenHeight } = getScreenSize();
const renderWidth = screenWidth / RENDER_SCALE;
const renderHeight = screenHeight / RENDER_SCALE;

window.C3D = new Canvas3D(
  document.querySelector('canvas'),
  renderWidth,
  renderHeight,
  RENDER_SCALE,
  200
);
let arr = [];
let cubePoints  = [];
let colors = ['red', 'blue','green','yellow','aqua','magenta','cyan','purple'];
let enableRotateX = false;
let enableRotateY = true;
let enableRotateZ = false;
let enableHWLineRen = false;
let previousTimestamp = null;
let statsVisible = false;
let enableBatchPoints = false;
let enableOcclusion = false;
const helpOverlay = document.getElementById('help-overlay');
const statsOverlay = document.getElementById('stats-overlay');
const pressHint = document.getElementById('press-hint');
const modelSelect = document.getElementById('model-select');
pressHint.classList.add('hidden');
let helpVisible = true;
let mouseDown = false;
let lastMouseX = 0;
let lastMouseY = 0;
let pinchStartDist = 0;
let pinchStartZoom = 0;
const MOUSE_SENSITIVITY = 0.2;
const ZOOM_SENSITIVITY = 10;
const toggleHelp = () => {
  helpVisible = !helpVisible;
  if (helpVisible) {
    helpOverlay.classList.remove('hidden');
    pressHint.classList.add('hidden');
  } else {
    helpOverlay.classList.add('hidden');
    pressHint.classList.remove('hidden');
  }
};
const toggleStats = () => {
  statsVisible = !statsVisible;
  if (statsVisible) {
    statsOverlay.classList.remove('hidden');
  } else {
    statsOverlay.classList.add('hidden');
  }
};

let fullscreen = false;

const updateScreenSize = () => {
  const { width, height } = getScreenSize();
  const renderWidth = width / RENDER_SCALE;
  const renderHeight = height / RENDER_SCALE;
  C3D.initScreen(renderWidth, renderHeight, RENDER_SCALE);
};

const toggleFullscreen = () => {
  fullscreen = !fullscreen;
  if (fullscreen) {
    if (document.body.requestFullscreen)
      document.body.requestFullscreen();
  } else {
    if (document.exitFullscreen)
      document.exitFullscreen();
  }
  updateScreenSize();
};

document.addEventListener('fullscreenchange', updateScreenSize);
window.addEventListener('resize', updateScreenSize);

window.C3D.cameraPoint.translate(0,0,-10)

document.addEventListener('mousedown', (e) => {
  mouseDown = true;
  lastMouseX = e.clientX;
  lastMouseY = e.clientY;
});

document.addEventListener('mouseup', () => {
  mouseDown = false;
});

document.addEventListener('mouseleave', () => {
  mouseDown = false;
});

document.addEventListener('mousemove', (e) => {
  if (!mouseDown) return;
  const dx = e.clientX - lastMouseX;
  const dy = e.clientY - lastMouseY;
  lastMouseX = e.clientX;
  lastMouseY = e.clientY;
  C3D.rotateY(dx * MOUSE_SENSITIVITY);
  C3D.rotateX(dy * MOUSE_SENSITIVITY);
});

document.addEventListener('wheel', (e) => {
  e.preventDefault();
  if (e.deltaY < 0) {
    C3D.setZoom(C3D.zoom + ZOOM_SENSITIVITY);
  } else {
    C3D.setZoom(C3D.zoom - ZOOM_SENSITIVITY);
  }
}, { passive: false });

document.addEventListener('touchstart', (e) => {
  if (e.target.closest('#model-select')) return;
  if (e.touches.length === 1) {
    mouseDown = true;
    lastMouseX = e.touches[0].clientX;
    lastMouseY = e.touches[0].clientY;
  } else if (e.touches.length === 2) {
    pinchStartDist = Math.hypot(
      e.touches[0].clientX - e.touches[1].clientX,
      e.touches[0].clientY - e.touches[1].clientY
    );
    pinchStartZoom = C3D.zoom;
  }
  // Prevent the browser from handling gestures like double tap to zoom
  e.preventDefault();
}, { passive: false });

document.addEventListener('touchmove', (e) => {
  if (e.target.closest('#model-select')) return;
  if (e.touches.length === 1 && mouseDown) {
    const touch = e.touches[0];
    const dx = touch.clientX - lastMouseX;
    const dy = touch.clientY - lastMouseY;
    lastMouseX = touch.clientX;
    lastMouseY = touch.clientY;
    C3D.rotateY(dx * MOUSE_SENSITIVITY);
    C3D.rotateX(dy * MOUSE_SENSITIVITY);
  } else if (e.touches.length === 2) {
    const dist = Math.hypot(
      e.touches[0].clientX - e.touches[1].clientX,
      e.touches[0].clientY - e.touches[1].clientY
    );
    const delta = dist - pinchStartDist;
    C3D.setZoom(pinchStartZoom + delta * 0.01);
  }
  e.preventDefault();
}, { passive: false });

document.addEventListener('touchend', (e) => {
  if (e.target.closest('#model-select')) return;
  if (e.touches.length === 0) {
    mouseDown = false;
  }
  // Make sure the current zoom persists after the gesture ends
  pinchStartZoom = C3D.zoom;
  // Prevent the browser from triggering click or zoom actions
  e.preventDefault();
}, { passive: false });

document.addEventListener('touchcancel', (e) => {
  if (e.target.closest('#model-select')) return;
  mouseDown = false;
  pinchStartZoom = C3D.zoom;
  e.preventDefault();
}, { passive: false });

window.addEventListener('keydown', (e) => {
  // console.log(e);
  if (e.code == 'ArrowLeft') {
    C3D.cameraPoint.translate(-1, 0,0);
  } else if (e.code  == 'ArrowUp') {
    C3D.cameraPoint.translate(0,- 1,0);
  } else if (e.code  == 'ArrowRight') {
    C3D.cameraPoint.translate(1, 0,0);
  } else if (e.code  == 'ArrowDown') {
    C3D.cameraPoint.translate(0,1,0);
  } else if (e.code == 'NumpadSubtract' || e.code == 'KeyA') {
    C3D.cameraPoint.translate(0,0,-1);
  } else if (e.code == 'NumpadAdd' || e.code == 'KeyZ') {
    C3D.cameraPoint.translate(0,0,1);
  } else if (e.code == 'KeyX') {
    C3D.setZoom(C3D.zoom - ZOOM_SENSITIVITY);
  } else if (e.code == 'KeyS') {
    C3D.setZoom(C3D.zoom + ZOOM_SENSITIVITY);
  } else if (e.code == 'KeyQ') {
    enableRotateX = !enableRotateX;
  } else if (e.code == 'KeyW') {
    enableRotateY = !enableRotateY;
  } else if (e.code == 'KeyE') {
    enableRotateZ = !enableRotateZ;
  } else if (e.code == 'KeyR') {
    enableHWLineRen = !enableHWLineRen;
  }  else if (e.code == 'KeyM') {
    toggleStats();
  } else if (e.code == 'KeyF') {
    for (let i =0; i< 10; i++) {
      let point = new Point3D(0,0,0);
      point.setColor(colors[Math.floor(Math.random() * colors.length)]);
      updatePoint(point);
      arr.push(point);
    }
  } else if (e.code == 'KeyV') {
    arr.splice(-10);
  } else if (e.code == 'KeyB') {
    enableBatchPoints = !enableBatchPoints;
  } else if (e.code == 'KeyO') {
    enableOcclusion =  !enableOcclusion;
  } else if (e.code == 'KeyL') {
    toggleFullscreen();
  } else if (e.code == 'KeyH') {
    toggleHelp();
  }
});



const raf = (timestamp) => {
  if (!previousTimestamp)
    previousTimestamp = timestamp;

  let delta = (timestamp - previousTimestamp)/1000;
  // console.log(delta)
  if (enableRotateX)
    C3D.rotateX(10 * delta);
  if (enableRotateY)
    C3D.rotateY(10 * delta);
  if (enableRotateZ)
    C3D.rotateZ(10 * delta);

  if (modelSelect.value === 'pendulum') {
    updatePendulum(delta);
  }

try {
  C3D.settings.occlusion = enableOcclusion;
  C3D.settings.hwLines = enableHWLineRen;
  C3D.settings.batch = enableBatchPoints;


    C3D.completeScreenDraw({
      lines: currentLines,
      points: arr,
      showStats: false
    })
    if (statsVisible) {
      const stats = C3D.getStats();
      statsOverlay.innerHTML = Object.keys(stats)
        .map(k => `${k}: ${stats[k]}`)
        .join('<br>');
    }
  } catch(e) {
  console.warn(e);
  console.log('out of bounds')
}
  previousTimestamp = timestamp;
  requestAnimationFrame(raf);
}

const updatePoint = (point) => {
  point.setColor(colors[Math.floor(Math.random() * colors.length)]);
  point.setPosition(Math.random() * 2 - 1,Math.random() * 4.0 - 2,Math.random() * 2.0 - 1);

}

const updatePoints = () => {
  for (let k = 0; k < 100; k++) {
    let i = Math.floor(Math.random() * arr.length);
    updatePoint(arr[i]);
  }
}

// start with no random points in space
for (let i = 0; i < 0; i++) {
  let point = new Point3D(0,0,0);
  updatePoint(point);
  arr.push(point);
}
let cubeCenter = new Point3D(0,-3,0);

cubePoints.push(new Point3D(-1+cubeCenter.x,1+cubeCenter.y, 1+cubeCenter.z));
cubePoints.push(new Point3D(-1+cubeCenter.x,1+cubeCenter.y, -1+cubeCenter.z));
cubePoints.push(new Point3D(-1+cubeCenter.x,-1+cubeCenter.y, 1+cubeCenter.z));
cubePoints.push(new Point3D(-1+cubeCenter.x,-1+cubeCenter.y, -1+cubeCenter.z));
cubePoints.push(new Point3D(1+cubeCenter.x,-1+cubeCenter.y, -1+cubeCenter.z));
cubePoints.push(new Point3D(1+cubeCenter.x,1+cubeCenter.y, -1+cubeCenter.z));
cubePoints.push(new Point3D(1+cubeCenter.x,-1+cubeCenter.y, 1+cubeCenter.z));
cubePoints.push(new Point3D(1+cubeCenter.x,1+cubeCenter.y, 1+cubeCenter.z));

let cubeLines = [
  [cubePoints[0], cubePoints[1]],
  [cubePoints[0], cubePoints[7]],
  [cubePoints[0], cubePoints[2]],
  [cubePoints[6], cubePoints[7]],
  [cubePoints[6], cubePoints[2]],
  [cubePoints[6], cubePoints[4]],
  [cubePoints[3], cubePoints[1]],
  [cubePoints[3], cubePoints[2]],
  [cubePoints[3], cubePoints[4]],
  [cubePoints[5], cubePoints[1]],
  [cubePoints[5], cubePoints[7]],
  [cubePoints[5], cubePoints[4]],
]

// base points for a flat sword model
const baseSwordPoints = [];
baseSwordPoints.push(new Point3D(0, 3, 0));     // tip
baseSwordPoints.push(new Point3D(-0.2, 1, 0));  // left blade base
baseSwordPoints.push(new Point3D(0.2, 1, 0));   // right blade base
baseSwordPoints.push(new Point3D(-1, 0.8, 0));  // crossguard left end
baseSwordPoints.push(new Point3D(1, 0.8, 0));   // crossguard right end
baseSwordPoints.push(new Point3D(-0.2, 0, 0));  // handle left top
baseSwordPoints.push(new Point3D(0.2, 0, 0));   // handle right top
baseSwordPoints.push(new Point3D(-0.2, -1.5, 0)); // handle left bottom
baseSwordPoints.push(new Point3D(0.2, -1.5, 0));  // handle right bottom
baseSwordPoints.push(new Point3D(0, -1.7, 0));  // pommel

// give the sword some thickness by duplicating points on the Z axis
const SWORD_THICKNESS = 0.2;
const HALF_THICKNESS = SWORD_THICKNESS / 2;
const swordFrontPoints = baseSwordPoints.map(p => new Point3D(p.x, p.y, -HALF_THICKNESS));
const swordBackPoints = baseSwordPoints.map(p => new Point3D(p.x, p.y, HALF_THICKNESS));

let swordPoints = [...swordFrontPoints, ...swordBackPoints];

const baseSwordLines = [
  [0, 1], [0, 2], [1, 2], [1, 3], [2, 4], [3, 4],
  [1, 5], [2, 6], [5, 6], [5, 7], [6, 8], [7, 8],
  [7, 9], [8, 9]
];

let swordLines = [];
// front face lines
for (const [a, b] of baseSwordLines) {
  swordLines.push([swordPoints[a], swordPoints[b]]);
}
// back face lines
for (const [a, b] of baseSwordLines) {
  swordLines.push([swordPoints[a + baseSwordPoints.length], swordPoints[b + baseSwordPoints.length]]);
}
// side lines connecting front and back points
for (let i = 0; i < baseSwordPoints.length; i++) {
  swordLines.push([swordPoints[i], swordPoints[i + baseSwordPoints.length]]);
}

for (let i =0; i < cubePoints.length; i++) {
  cubePoints[i].setColor('#f0f');
}

for (let i =0; i < swordPoints.length; i++) {
  swordPoints[i].setColor('#0ff');
}

// create a sphere model with 16 segments and 16 loops
const createSphere = (segments = 16, loops = 16, radius = 2) => {
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
};

const { points: spherePoints, lines: sphereLines } = createSphere(16, 16, 2);
spherePoints.forEach(p => p.setColor('#ff0'));

const createStar = (points = 5, outerRadius = 2, innerRadius = 1, thickness = 0.5) => {
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
};

const { points: starPoints, lines: starLines } = createStar(5, 2, 1, 0.4);
starPoints.forEach(p => p.setColor('#fa0'));

// create a simple pyramid with a square base
const createPyramid = (size = 2, height = 2) => {
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
  return { points, lines };
};

const { points: pyramidPoints, lines: pyramidLines } = createPyramid(2, 2);
pyramidPoints.forEach(p => p.setColor('#0f0'));

// create a simple swinging pendulum
const createPendulum = (length = 4, bobSize = 0.5) => {
  const pivot = new Point3D(0, 0, 0);
  const bob = new Point3D(0, -length, 0);
  const left = new Point3D(-bobSize, -length, 0);
  const right = new Point3D(bobSize, -length, 0);
  const points = [pivot, bob, left, right];
  const lines = [
    [pivot, bob],
    [left, right]
  ];
  return { points, lines };
};

const { points: pendulumPoints, lines: pendulumLines } = createPendulum(4, 1);
pendulumPoints.forEach(p => p.setColor('#fff'));
const pendulumBase = pendulumPoints.map(p => ({ x: p.x, y: p.y, z: p.z }));
let pendulumAngle = 0;
let pendulumDirection = 1;
const pendulumMaxAngle = 30;
const pendulumSpeed = 60;

const updatePendulum = (delta) => {
  pendulumAngle += pendulumDirection * pendulumSpeed * delta;
  if (pendulumAngle > pendulumMaxAngle) {
    pendulumAngle = pendulumMaxAngle;
    pendulumDirection = -1;
  } else if (pendulumAngle < -pendulumMaxAngle) {
    pendulumAngle = -pendulumMaxAngle;
    pendulumDirection = 1;
  }
  const rad = pendulumAngle * Math.PI / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  for (let i = 0; i < pendulumPoints.length; i++) {
    const b = pendulumBase[i];
    const x = b.x * cos - b.y * sin;
    const y = b.x * sin + b.y * cos;
    pendulumPoints[i].setPosition(x, y, b.z);
  }
};

let currentLines = swordLines;

const updateModel = () => {
  const value = modelSelect.value;
  if (value === 'cube') {
    currentLines = cubeLines;
  } else if (value === 'sphere') {
    currentLines = sphereLines;
  } else if (value === 'star') {
    currentLines = starLines;
  } else if (value === 'pyramid') {
    currentLines = pyramidLines;
  } else if (value === 'pendulum') {
    currentLines = pendulumLines;
  } else {
    currentLines = swordLines;
  }
};

modelSelect.addEventListener('change', updateModel);
updateModel();

setInterval(updatePoints, 15);

requestAnimationFrame(raf);
