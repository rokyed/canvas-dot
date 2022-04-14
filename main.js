'use strict';

window.C3D = new Canvas3D(document.querySelector('canvas'), 200,200,4,200);
let arr = [];
let cubePoints  = [];
let colors = ['red', 'blue','green','yellow','aqua','magenta','cyan','purple'];
let enableRotateX = false;
let enableRotateY = true;
let enableRotateZ = false;
let enableHWLineRen = false;
let previousTimestamp = null;
window.C3D.cameraPoint.translate(0,0,-10)

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
  } else if (e.code == 'NumpadSubtract') {
    C3D.cameraPoint.translate(0,0,-1);
  } else if (e.code == 'NumpadAdd') {
    C3D.cameraPoint.translate(0,0,1);
  } else if (e.code == 'KeyX') {
    C3D.zoom -= 1;
  } else if (e.code == 'KeyS') {
    C3D.zoom += 1;
  } else if (e.code == 'KeyQ') {
    enableRotateX = !enableRotateX;
  } else if (e.code == 'KeyW') {
    enableRotateY = !enableRotateY;
  } else if (e.code == 'KeyE') {
    enableRotateZ = !enableRotateZ;
  } else if (e.code == 'KeyR') {
    enableHWLineRen = !enableHWLineRen;
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

try {
  C3D.clearScreen();
  C3D.drawPoints(arr);
  C3D.drawLines(cubeLines, false, enableHWLineRen);
} catch(e) {
  console.log('out of bounds')
}
  previousTimestamp = timestamp;
  requestAnimationFrame(raf);
}

const updatePoint = (point) => {
  point.setPosition(Math.random() * 2 - 1,Math.random() * 4.0 - 2,Math.random() * 2.0 - 1);

}

const updatePoints = () => {
  let i = Math.floor(Math.random() * arr.length);
  updatePoint(arr[i]);
}

for (let i = 0; i < 500; i++) {
  let point = new Point3D(0,0,0);
  point.setColor(colors[Math.floor(Math.random() * colors.length)]);
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

for (let i =0; i < cubePoints.length; i++) {
  cubePoints[i].setColor('#f0f');
}

setInterval(updatePoints, 100);

requestAnimationFrame(raf);
