'use strict';

window.C3D = new Canvas3D(document.querySelector('canvas'), 400,400,2,200);
let arr = [];
let cubePoints  = [];
let colors = ['red', 'blue','green','yellow','aqua','magenta','cyan','purple'];
let enableRotateX = false;
let enableRotateY = true;
let enableRotateZ = false;
let enableHWLineRen = false;
let previousTimestamp = null;
let enableStats = false;
let enableBatchPoints = false;
let enableOcclusion = false;
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
  } else if (e.code == 'NumpadSubtract' || e.code == 'KeyA') {
    C3D.cameraPoint.translate(0,0,-1);
  } else if (e.code == 'NumpadAdd' || e.code == 'KeyZ') {
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
  }  else if (e.code == 'KeyM') {
    enableStats = !enableStats;
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
  C3D.settings.occlusion = enableOcclusion;
  C3D.settings.hwLines = enableHWLineRen;
  C3D.settings.batch = enableBatchPoints;


  C3D.completeScreenDraw({
    lines: cubeLines,
    points: arr,
    showStats: enableStats,
    texts: [
      {
        text: 'Press: QWERAZSXVFBMO',
        x: 0,
        y: 390
      }
    ]
  })
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

for (let i = 0; i < 10000; i++) {
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

for (let i =0; i < cubePoints.length; i++) {
  cubePoints[i].setColor('#f0f');
}

setInterval(updatePoints, 15);

requestAnimationFrame(raf);
