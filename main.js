'use strict';

import Canvas3D from './canvas3d.js';
import Point3D from './point3d.js';
import { createCube } from './models/cube.js';
import { createSword } from './models/sword.js';
import { createSphere } from './models/sphere.js';
import { createStar } from './models/star.js';
import { createHeart } from './models/heart.js';
import { createPyramid } from './models/pyramid.js';
import { createPendulum } from './models/pendulum.js';
import { createKnot } from './models/knot.js';

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
const userLines = [];
let drawMode = false;
let drawing = false;
let currentLine = null;
let colors = ['red', 'blue','green','yellow','aqua','magenta','cyan','purple'];
let enableRotateX = false;
let enableRotateY = true;
let enableRotateZ = false;
let enableHWLineRen = false;
let previousTimestamp = null;
let statsVisible = false;
let enableBatchPoints = false;
let enableOcclusion = true;
const helpOverlay = document.getElementById('help-overlay');
const statsOverlay = document.getElementById('stats-overlay');
const pressHint = document.getElementById('press-hint');
const modelSelect = document.getElementById('model-select');
const drawToggleBtn = document.getElementById('draw-toggle');
const editorOverlay = document.getElementById('editor-overlay');
const xInput = document.getElementById('edit-x');
const yInput = document.getElementById('edit-y');
const zInput = document.getElementById('edit-z');
const colorInput = document.getElementById('edit-color');
const addPointBtn = document.getElementById('add-point-btn');
const updatePointBtn = document.getElementById('update-point-btn');
const pointsList = document.getElementById('points-list');
const pointsSelect = document.getElementById('points-select');
const urlParams = new URLSearchParams(window.location.search);
const editorEnabled = urlParams.has('edit');
let refreshEditorList = () => {};
if (editorEnabled) {
  editorOverlay.classList.remove('hidden');
  refreshEditorList = () => {
    const prevIdx = parseInt(pointsSelect.value)
    pointsList.innerHTML = ''
    pointsSelect.innerHTML = ''
    arr.forEach((p, idx) => {
      const li = document.createElement('li');
      li.textContent = `#${idx} x:${p.x.toFixed(2)} y:${p.y.toFixed(2)} z:${p.z.toFixed(2)} ${p.color}`;
      const btn = document.createElement('button');
      btn.textContent = 'X';
      btn.addEventListener('click', () => {
        arr.splice(idx, 1);
        refreshEditorList();
      });
      li.appendChild(btn);
      pointsList.appendChild(li);

      const option = document.createElement('option');
      option.value = idx;
      option.textContent = `#${idx}`;
      pointsSelect.appendChild(option);
    });
    if (!isNaN(prevIdx) && prevIdx < arr.length) {
      pointsSelect.value = prevIdx
    } else if (arr.length > 0) {
      pointsSelect.value = arr.length - 1
    }
    pointsSelect.dispatchEvent(new Event('change'))
  };
  pointsSelect.addEventListener('change', () => {
    const idx = parseInt(pointsSelect.value);
    const p = arr[idx];
    if (p) {
      xInput.value = p.x.toFixed(2);
      yInput.value = p.y.toFixed(2);
      zInput.value = p.z.toFixed(2);
      colorInput.value = p.color;
    }
  });
  updatePointBtn.addEventListener('click', () => {
    const idx = parseInt(pointsSelect.value);
    const p = arr[idx];
    if (p) {
      p.setPosition(
        parseFloat(xInput.value) || 0,
        parseFloat(yInput.value) || 0,
        parseFloat(zInput.value) || 0
      );
      p.setColor(colorInput.value);
      refreshEditorList();
      pointsSelect.value = idx;
    }
  });
  addPointBtn.addEventListener('click', () => {
    const p = new Point3D(
      parseFloat(xInput.value) || 0,
      parseFloat(yInput.value) || 0,
      parseFloat(zInput.value) || 0,
      true
    );
    p.setColor(colorInput.value);
    arr.push(p);
    refreshEditorList();
  });
  refreshEditorList();
} else {
  editorOverlay.classList.add('hidden');
}
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

const toggleDrawMode = () => {
  drawMode = !drawMode;
  drawToggleBtn.textContent = drawMode ? 'Draw: On' : 'Draw: Off';
};

const screenToWorld = (sx, sy, planeZ = 0) => {
  const factor = (planeZ + C3D.cameraPoint.z) / C3D.zoom;
  const temp = new Point3D(0, 0, 0);
  let x = (sx - C3D.cameraPoint.x) * factor;
  let y = (sy - C3D.cameraPoint.y) * factor;
  let z = planeZ;
  let rot = temp.rotateAroundZ(x, y, z, -C3D.worldRotation.z);
  rot = temp.rotateAroundY(rot.x, rot.y, rot.z, -C3D.worldRotation.y);
  rot = temp.rotateAroundX(rot.x, rot.y, rot.z, -C3D.worldRotation.x);
  return new Point3D(rot.x, rot.y, rot.z);
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
  if (drawMode) {
    drawing = true;
    const x = e.clientX / RENDER_SCALE;
    const y = e.clientY / RENDER_SCALE;
    currentLine = [screenToWorld(x, y, 0)];
    userLines.push(currentLine);
  } else {
    mouseDown = true;
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
  }
});

document.addEventListener('mouseup', () => {
  if (drawMode) {
    drawing = false;
    currentLine = null;
  }
  mouseDown = false;
});

document.addEventListener('mouseleave', () => {
  if (drawMode) {
    drawing = false;
    currentLine = null;
  }
  mouseDown = false;
});

document.addEventListener('mousemove', (e) => {
  if (drawMode) {
    if (!drawing) return;
    const x = e.clientX / RENDER_SCALE;
    const y = e.clientY / RENDER_SCALE;
    currentLine.push(screenToWorld(x, y, 0));
  } else {
    if (!mouseDown) return;
    const dx = e.clientX - lastMouseX;
    const dy = e.clientY - lastMouseY;
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
    C3D.rotateY(dx * MOUSE_SENSITIVITY);
    C3D.rotateX(dy * MOUSE_SENSITIVITY);
  }
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
  if (e.target.closest('#model-select') || e.target.closest('#draw-toggle')) return;
  if (drawMode) {
    if (e.touches.length === 1) {
      drawing = true;
      const x = e.touches[0].clientX / RENDER_SCALE;
      const y = e.touches[0].clientY / RENDER_SCALE;
      currentLine = [screenToWorld(x, y, 0)];
      userLines.push(currentLine);
    }
  } else {
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
  }
  // Prevent the browser from handling gestures like double tap to zoom
  e.preventDefault();
}, { passive: false });

document.addEventListener('touchmove', (e) => {
  if (e.target.closest('#model-select') || e.target.closest('#draw-toggle')) return;
  if (drawMode) {
    if (drawing && e.touches.length === 1) {
      const touch = e.touches[0];
      const x = touch.clientX / RENDER_SCALE;
      const y = touch.clientY / RENDER_SCALE;
      currentLine.push(screenToWorld(x, y, 0));
    }
  } else {
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
      // Scale pinch zoom much more aggressively so it matches mouse wheel zoom
      C3D.setZoom(pinchStartZoom + delta * 0.01 * 100);
    }
  }
  e.preventDefault();
}, { passive: false });

document.addEventListener('touchend', (e) => {
  if (e.target.closest('#model-select') || e.target.closest('#draw-toggle')) return;
  if (drawMode) {
    if (e.touches.length === 0) {
      drawing = false;
      currentLine = null;
    }
  } else {
    if (e.touches.length === 0) {
      mouseDown = false;
    }
  }
  // Make sure the current zoom persists after the gesture ends
  pinchStartZoom = C3D.zoom;
  // Prevent the browser from triggering click or zoom actions
  e.preventDefault();
}, { passive: false });

document.addEventListener('touchcancel', (e) => {
  if (e.target.closest('#model-select') || e.target.closest('#draw-toggle')) return;
  if (drawMode) {
    drawing = false;
    currentLine = null;
  }
  mouseDown = false;
  pinchStartZoom = C3D.zoom;
  e.preventDefault();
}, { passive: false });

window.addEventListener('keydown', (e) => {
  // console.log(e);
  const walk = (forward, strafe) => {
    const radY = C3D.worldRotation.y * Math.PI / 180;
    const dx = Math.sin(radY) * forward + Math.cos(radY) * strafe;
    const dz = Math.cos(radY) * forward - Math.sin(radY) * strafe;
    C3D.cameraPoint.translate(dx, 0, -dz);
  };

  if (e.code == 'ArrowLeft') {
    walk(0, -1);
  } else if (e.code  == 'ArrowUp') {
    walk(1, 0);
  } else if (e.code  == 'ArrowRight') {
    walk(0, 1);
  } else if (e.code  == 'ArrowDown') {
    walk(-1, 0);
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
    refreshEditorList();
  } else if (e.code == 'KeyV') {
    arr.splice(-10);
    refreshEditorList();
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
  if (modelSelect.value === 'knot') {
    updateKnot(delta);
  }

try {
  C3D.settings.occlusion = enableOcclusion;
  C3D.settings.hwLines = enableHWLineRen;
  C3D.settings.batch = enableBatchPoints;


    C3D.completeScreenDraw({
      lines: currentLines.concat(userLines),
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
  if (arr.length === 0) return;
  for (let k = 0; k < 100; k++) {
    const i = Math.floor(Math.random() * arr.length);
    const point = arr[i];
    if (!point || point.manual) continue;
    updatePoint(point);
  }
}

// start with no random points in space
for (let i = 0; i < 0; i++) {
  let point = new Point3D(0,0,0);
  updatePoint(point);
  arr.push(point);
}

const { points: cubePoints, lines: cubeLines } = createCube();
const { points: swordPoints, lines: swordLines } = createSword();
const { points: spherePoints, lines: sphereLines } = createSphere(16, 16, 2);
spherePoints.forEach(p => p.setColor('#ff0'));
const { points: starPoints, lines: starLines } = createStar(5, 2, 1, 0.4);
starPoints.forEach(p => p.setColor('#fa0'));
const { points: heartPoints, lines: heartLines } = createHeart();
const { points: pyramidPoints, lines: pyramidLines } = createPyramid(2, 2);
const { points: pendulumPoints, lines: pendulumLines, update: updatePendulum } = createPendulum(4, 1);
const { points: knotPoints, lines: knotLines, update: updateKnot } = createKnot();

let currentLines = swordLines;

const updateModel = () => {
  const value = modelSelect.value;
  if (value === 'cube') {
    currentLines = cubeLines;
  } else if (value === 'sphere') {
    currentLines = sphereLines;
  } else if (value === 'star') {
    currentLines = starLines;
  } else if (value === 'heart') {
    currentLines = heartLines;
  } else if (value === 'pyramid') {
    currentLines = pyramidLines;
  } else if (value === 'pendulum') {
    currentLines = pendulumLines;
  } else if (value === 'knot') {
    currentLines = knotLines;
  } else {
    currentLines = swordLines;
  }
};

modelSelect.addEventListener('change', updateModel);
drawToggleBtn.addEventListener('click', toggleDrawMode);
updateModel();

setInterval(updatePoints, 15);

requestAnimationFrame(raf);
