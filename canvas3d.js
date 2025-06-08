'use strict';

class Canvas3D {
  canvasElement = null;
  ctx = null;
  width = 0;
  height = 0;
  cameraPoint = null;
  zoom = 1;
  worldRotation = new Point3D(0,0,0);
  stats = {};
  settings = {
    occlusion: true,
    batch: false,
    hwLines: false
  };

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
    this.stats.drawnPoints = 0;
    this.stats.drawnLines = 0;
    this.stats.fillRects = 0;
    this.stats.clearScreenAt = Date.now();
  }

  drawPoints(points, clearScreen) {
    if(clearScreen)
      this.clearScreen();

    if (this.settings.batch) {
      this.drawBatchedPoints(points, clearScreen);
    } else {
      for (let i = 0; i < points.length; i++) {
        this.drawPoint(points[i]);
      }
    }
  }

  drawBatchedPoints(points, clearScreen) {
      if (clearScreen)
        this.clearScreen();

      let colors = {};

      for (let i = 0; i < points.length; i++) {
        if (!colors[points[i].color]) {
          colors[points[i].color] = [];
        }

        colors[points[i].color].push(points[i]);
      }

      for (let k in colors) {
        this.ctx.fillStyle = k;
        for (let i = 0; i < colors[k].length; i++) {
          this.drawPointNoColor(colors[k][i]);
        }
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
    this.stats.drawnLines ++;
    if (this.settings.hwLines) {
      this.drawLineHardware(pA.x,pA.y, pB.x, pB.y, pointA.color);
    } else {
      this.drawLineSoftware(pA.x,pA.y, pB.x, pB.y, pointA.color);
    }
  }

  drawLineHardware(x,y,x2,y2, color) {
    this.ctx.strokeStyle = color;
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
    this.ctx.lineTo(x2, y2);
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
      this.fillRectWithScreenTest(Math.round((this.lerp(x,x2,i/diagLength))), Math.round((this.lerp(y,y2,i/diagLength))),1,1);
    }
  }

  drawPointNoColor(point) {
    point.setOffset(this.cameraPoint.x, this.cameraPoint.y, this.cameraPoint.z);
    this.stats.drawnPoints ++;
    let p2d = point.getRotated2D(this.worldRotation, this.zoom);
    this.fillRectWithScreenTest(Math.round(p2d.x), Math.round(p2d.y), 1, 1);
  }

  fillRectWithScreenTest(x,y,w,h) {
    if (x <= this.width && x >= 0 && y <= this.height && y >= 0 || !this.settings.occlusion) {
      this.stats.fillRects ++;
      this.ctx.fillRect(x,y,w,h);

    }
  }

  drawPoint(point) {
    this.ctx.fillStyle = point.color;
    this.drawPointNoColor(point);
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

  completeScreenDraw(obj = {}) {
    this.start();
    this.clearScreen();
    if (obj.lines)
      this.drawLines(obj.lines, false);

    if (obj.points)
      this.drawPoints(obj.points, false);

    if (obj.texts)
      this.drawTexts(obj.texts, false);

    this.finish();

    if (obj.showStats)
      this.drawStats();
  }

  start() {
    this.stats.frameStartedAt = Date.now();
  }

  finish() {
    this.stats.frameEndedAt = Date.now();
    this.stats.spentOnFrame = this.stats.frameEndedAt - this.stats.frameStartedAt;
  }

  drawStats() {
    let size = 10;
    let i = 0;
    this.ctx.strokeColor = '#0f0';
    this.ctx.fillStyle = '#0f0';
    this.ctx.font = `bold ${size}px arial`;
    let toDraw = {
      ...this.stats,
      ...this.settings
    }
    for (let k in toDraw) {
      this.ctx.fillText(`${k}: ${toDraw[k]}`,size,size+ (size*i));
      i++;
    }
  }

  getStats() {
    return {
      ...this.stats,
      ...this.settings
    };
  }
  drawTexts(texts, clearScreen) {
    if (clearScreen)
      this.clearScreen();

    for (let i = 0; i < texts.length; i++) {
      this.drawText(texts[i].text, texts[i].x, texts[i].y, texts[i].color, texts[i].font);
    }
  }

  drawText(text, x, y, color = '#0f0', font = 'bold 10px arial') {
    this.ctx.fillStyle = color;
    this.ctx.font = font;
    this.ctx.fillText(text, x,y);
  }
}
