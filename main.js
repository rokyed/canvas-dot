'use strict';

window.C3D = new Canvas3D(document.querySelector('canvas'), 300,300,2,400);
let arr = [];
let cubePoints  = [];
let colors = ['red', 'blue','green','yellow','aqua','magenta','cyan','purple'];
window.C3D.cameraPoint.translate(0,0,-70)
C3D.rotateX(45);
C3D.rotateZ(45);

const tick = () => {
  C3D.rotateZ(1);
  C3D.rotateX(1);
  C3D.rotateY(1);
  C3D.clearScreen();
  C3D.drawPoints(arr);
  C3D.drawLines(cubeLines)
}
const updatePoint = (point) => {
  point.setPosition(Math.random() * 2 - 1,Math.random() * 2.0 - 1,Math.random() * 2.0 - 1);

}

const updatePoints = () => {
  let i = Math.floor(Math.random() * arr.length);
  updatePoint(arr[i]);
}

for (let i = 0; i < 10000; i++) {
  let point = new Point3D(0,0,0);
  point.setColor(colors[Math.floor(Math.random() * colors.length)]);
  updatePoint(point);
  arr.push(point);
}

cubePoints.push(new Point3D(-1,1, 1));
cubePoints.push(new Point3D(-1,1, -1));
cubePoints.push(new Point3D(-1,-1, 1));
cubePoints.push(new Point3D(-1,-1, -1));
cubePoints.push(new Point3D(1,-1, -1));
cubePoints.push(new Point3D(1,1, -1));
cubePoints.push(new Point3D(1,-1, 1));
cubePoints.push(new Point3D(1,1, 1));

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
  cubePoints[i].setColor('gray');
}



setInterval(updatePoints, 100);
setInterval(tick, 16);
