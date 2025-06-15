'use strict';

import Point3D from './point3d.js';

export default class Canvas3D {
  canvasElement = null;
  ctx = null;
  width = 0;
  height = 0;
  cameraPoint = null;
  zoom = 1;
  // scale factor applied to point sizes when rendering
  pointSizeScale = 0.1;
  // scale factor applied to line widths when rendering
  lineWidthScale = 0.05;
  worldRotation = new Point3D(0,0,0);
  stats = {};
  colorCtx = null;
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
    this.colorCtx = document.createElement('canvas').getContext('2d');
    this.initCanvas();
    this.initScreen(width, height, scale);
  }

  setZoom(z) {
    // prevent negative or zero zoom values which break perspective
    this.zoom = Math.max(1, z);
  }

  initCanvas() {
    this.ctx = this.canvasElement.getContext('2d');
    this.ctx.msImageSmoothingEnabled = false;
    this.ctx.mozImageSmoothingEnabled = false;
    this.ctx.webkitImageSmoothingEnabled = false;
    this.ctx.imageSmoothingEnabled = false;
  }

  initScreen (width, height, scale) {
    this.width = width;
    this.height = height;
    this.cameraPoint.setPosition(width/2, height/2, this.cameraPoint.z);
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
    if (clearScreen)
      this.clearScreen();

    const sorted = [...points].sort((a, b) => {
      a.setOffset(this.cameraPoint.x, this.cameraPoint.y, this.cameraPoint.z);
      b.setOffset(this.cameraPoint.x, this.cameraPoint.y, this.cameraPoint.z);
      return b.getDistanceFromCamera(this.worldRotation) - a.getDistanceFromCamera(this.worldRotation);
    });

    if (this.settings.batch) {
      this.drawBatchedPoints(sorted, false);
    } else {
      for (let i = 0; i < sorted.length; i++) {
        this.drawPoint(sorted[i]);
      }
    }
  }

  drawBatchedPoints(points, clearScreen) {
      if (clearScreen)
        this.clearScreen();

      for (let i = 0; i < points.length; i++) {
        this.drawPoint(points[i]);
      }
  }

  drawLines(lines, clearScreen) {
    if (clearScreen)
      this.clearScreen();

    const segments = [];

    for (const line of lines) {
      if (!Array.isArray(line) || line.length < 2) continue;

      for (let i = 0; i < line.length - 1; i++) {
        const a = line[i];
        const b = line[i + 1];
        a.setOffset(this.cameraPoint.x, this.cameraPoint.y, this.cameraPoint.z);
        b.setOffset(this.cameraPoint.x, this.cameraPoint.y, this.cameraPoint.z);
        const dist = (
          a.getDistanceFromCamera(this.worldRotation) +
          b.getDistanceFromCamera(this.worldRotation)
        ) / 2;
        segments.push({ a, b, dist });
      }
    }

    segments.sort((s1, s2) => s2.dist - s1.dist);

    for (const { a, b } of segments) {
      this.drawLine(a, b);
    }
  }

  drawLine(pointA, pointB) {
    pointA.setOffset(this.cameraPoint.x, this.cameraPoint.y, this.cameraPoint.z);
    pointB.setOffset(this.cameraPoint.x, this.cameraPoint.y, this.cameraPoint.z);
    if (pointA.isBehindCamera(this.worldRotation) || pointB.isBehindCamera(this.worldRotation)) {
      return;
    }
    let pA = pointA.getRotated2D(this.worldRotation, this.zoom);
    let pB = pointB.getRotated2D(this.worldRotation, this.zoom);
    const scaleA = pointA.getScale(this.worldRotation, this.zoom);
    const scaleB = pointB.getScale(this.worldRotation, this.zoom);
    const thickness = Math.max(1, ((scaleA + scaleB) / 2) * this.lineWidthScale);
    this.stats.drawnLines ++;
    const dist = (pointA.getDistanceFromCamera(this.worldRotation) + pointB.getDistanceFromCamera(this.worldRotation)) / 2;
    const color = this.shadeColorByDistance(pointA.color, dist);
    if (this.settings.hwLines) {
      this.drawLineHardware(pA.x,pA.y, pB.x, pB.y, color);
    } else {
      this.drawLineSoftware(pA.x,pA.y, pB.x, pB.y, color, thickness);
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

  parseColor(color) {
    this.colorCtx.fillStyle = color;
    const computed = this.colorCtx.fillStyle;
    if (computed.startsWith('#')) {
      let hex = computed.slice(1);
      if (hex.length === 3) {
        hex = hex.split('').map(ch => ch + ch).join('');
      }
      const num = parseInt(hex, 16);
      return {
        r: (num >> 16) & 255,
        g: (num >> 8) & 255,
        b: num & 255
      };
    }
    const m = computed.match(/rgb\((\d+),\s*(\d+),\s*(\d+)/);
    if (m) {
      return { r: +m[1], g: +m[2], b: +m[3] };
    }
    return { r: 0, g: 0, b: 0 };
  }

  shadeColorByDistance(color, distance) {
    const rgb = this.parseColor(color);
    const factor = 1 / (1 + distance * 0.05);
    const r = Math.round(rgb.r * factor);
    const g = Math.round(rgb.g * factor);
    const b = Math.round(rgb.b * factor);
    return `rgb(${r},${g},${b})`;
  }

  drawLineSoftware(x,y, x2,y2, color, thickness = 1) {
    this.ctx.fillStyle = color;
    let maxPoints = Math.max(Math.abs(x2-x), Math.abs(y2-y));
    let diagLength = Math.sqrt(Math.pow(x2-x, 2) + Math.pow(y2-y, 2));

    for (let i = 0; i <= diagLength; i++) {
      const px = Math.round(this.lerp(x,x2,i/diagLength));
      const py = Math.round(this.lerp(y,y2,i/diagLength));
      const size = Math.round(thickness);
      this.fillRectWithScreenTest(Math.round(px - size/2), Math.round(py - size/2), size, size);
    }
  }

  drawPointNoColor(point) {
    point.setOffset(this.cameraPoint.x, this.cameraPoint.y, this.cameraPoint.z);
    if (point.isBehindCamera(this.worldRotation)) {
      return;
    }
    const dist = point.getDistanceFromCamera(this.worldRotation);
    this.ctx.fillStyle = this.shadeColorByDistance(point.color, dist);
    this.stats.drawnPoints ++;
    let p2d = point.getRotated2D(this.worldRotation, this.zoom);
    let size = point.getScale(this.worldRotation, this.zoom) * this.pointSizeScale;
    size = Math.max(1, size);
    this.fillRectWithScreenTest(Math.round(p2d.x - size/2), Math.round(p2d.y - size/2), Math.round(size), Math.round(size));
  }

  fillRectWithScreenTest(x,y,w,h) {
    if (x <= this.width && x >= 0 && y <= this.height && y >= 0 || !this.settings.occlusion) {
      this.stats.fillRects ++;
      this.ctx.fillRect(x,y,w,h);

    }
  }

  drawPoint(point) {
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

    // use current Y rotation value, not Z, when updating rotation vector
    this.worldRotation.setPosition(this.worldRotation.x, this.worldRotation.y, newAng);
  }

  completeScreenDraw(obj = {}) {
    this.start();
    this.clearScreen();
    const hasPoints = Array.isArray(obj.points);
    const hasLines = Array.isArray(obj.lines);

    if (hasPoints && hasLines) {
      const elements = [];
      for (const [a, b] of obj.lines) {
        a.setOffset(this.cameraPoint.x, this.cameraPoint.y, this.cameraPoint.z);
        b.setOffset(this.cameraPoint.x, this.cameraPoint.y, this.cameraPoint.z);
        const dist = (a.getDistanceFromCamera(this.worldRotation) +
          b.getDistanceFromCamera(this.worldRotation)) / 2;
        elements.push({ type: 'line', a, b, dist });
      }
      for (const p of obj.points) {
        p.setOffset(this.cameraPoint.x, this.cameraPoint.y, this.cameraPoint.z);
        const dist = p.getDistanceFromCamera(this.worldRotation);
        elements.push({ type: 'point', p, dist });
      }
      elements.sort((x, y) => y.dist - x.dist);
      for (const el of elements) {
        if (el.type === 'line') this.drawLine(el.a, el.b);
        else this.drawPoint(el.p);
      }
    } else {
      if (hasLines)
        this.drawLines(obj.lines, false);
      if (hasPoints)
        this.drawPoints(obj.points, false);
    }

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
    this.ctx.strokeStyle = '#0f0';
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
