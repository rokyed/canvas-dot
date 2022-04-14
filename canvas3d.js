'use strict';

class Canvas3D {
  canvasElement = null;
  ctx = null;
  width = 0;
  height = 0;
  cameraPoint = null;
  zoom = 1;
  worldRotation = new Point3D(0,0,0);

  constructor (canvasElement, width, height, scale, zoom) {
    this.canvasElement = canvasElement;
    this.width = width;
    this.height = height;
    this.zoom = zoom || 1;
    this.cameraPoint =  new Point3D(width/2,height/2, 0);
    this.initCanvas();
    this.initScreen(width, height, scale);
  }

  initCanvas() {
    this.ctx = this.canvasElement.getContext('2d');
    this.ctx.msImageSmoothingEnabled = false;
    this.ctx.mozImageSmoothingEnabled = false;
    this.ctx.webkitImageSmoothingEnabled = false;
    this.ctx.imageSmoothingEnabled = false;
  }

  initScreen (width, height, scale) {
    this.canvasElement.setAttribute('width', `${width}px`);
    this.canvasElement.setAttribute('height', `${height}px`);
    this.canvasElement.setAttribute('style', `width:${Math.round(width * scale)}px;height:${Math.round(height * scale)}px;image-rendering: pixelated;`)
  }

  clearScreen() {
    this.ctx.clearRect(0,0, this.width, this.height);
  }

  drawPoints(points, clearScreen) {
    if(clearScreen)
      this.clearScreen();

    for (let i = 0; i < points.length; i++) {
      this.drawPoint(points[i]);
    }
  }

  drawLines(lines, clearScreen) {
    if (clearScreen)
      this.clearScreen();

    for (let i =0; i< lines.length; i++) {
      this.drawLine(lines[i][0], lines[i][1]);
    }
  }

  drawLine(pointA, pointB) {
    pointA.setOffset(this.cameraPoint.x, this.cameraPoint.y, this.cameraPoint.z);
    pointB.setOffset(this.cameraPoint.x, this.cameraPoint.y, this.cameraPoint.z);
    let pA = pointA.getRotated2D(this.worldRotation, this.zoom);
    let pB = pointB.getRotated2D(this.worldRotation, this.zoom);
    this.drawLineSoftware(pA.x,pA.y, pB.x, pB.y, pointA.color);
  }

  drawLineHardware(x,y,x2,y2, color) {
    this.ctx.strokeStyle = pointA.color;
    this.ctx.beginPath();
    this.ctx.moveTo(pA.x, pA.y);
    this.ctx.lineTo(pB.x, pB.y);
    this.ctx.stroke();
  }
  lerp(a,b,x) {
    return a + ((b-a)* x);
  }

  drawLineSoftware(x,y, x2,y2, color) {
    this.ctx.fillStyle = color;
    let maxPoints = Math.max(Math.abs(x2-x), Math.abs(y2-y));
    let diagLength = Math.sqrt(Math.pow(x2-x, 2) + Math.pow(y2-y, 2));

    for (let i = 0; i <= diagLength; i++) {
      this.ctx.fillRect(Math.round((this.lerp(x,x2,i/diagLength))), Math.round((this.lerp(y,y2,i/diagLength))),1,1);
    }
  }

  drawPoint(point) {
    point.setOffset(this.cameraPoint.x, this.cameraPoint.y, this.cameraPoint.z);
    
    let p2d = point.getRotated2D(this.worldRotation, this.zoom);
    this.ctx.fillStyle = point.color;
    this.ctx.fillRect(Math.round(p2d.x), Math.round(p2d.y), 1, 1);
  }

  rotateY(ang) {
    let newAng = this.worldRotation.y + ang;

    if (newAng > 360)
      newAng -= 360;

    this.worldRotation.setPosition(this.worldRotation.x, newAng, this.worldRotation.z);
  }
  rotateX(ang) {
    let newAng = this.worldRotation.x + ang;

    if (newAng > 360)
      newAng -= 360;

    this.worldRotation.setPosition(newAng, this.worldRotation.y, this.worldRotation.z);
  }
  rotateZ(ang) {
    let newAng = this.worldRotation.z + ang;

    if (newAng > 360)
      newAng -= 360;

    this.worldRotation.setPosition(this.worldRotation.x, this.worldRotation.z, newAng);
  }

}
