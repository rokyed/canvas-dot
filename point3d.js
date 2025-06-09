'use strict';

class Point3D {
  x = 0;
  y = 0;
  z = 0;
  rotationX = 0;
  rotationY = 0;
  rotationZ = 0;
  offsetX = 0;
  offsetY = 0;
  offsetZ = 0;
  color = 'blue';

  constructor(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  translate(x, y, z) {
    this.x += x;
    this.y += y;
    this.z += z;
  }

  setColor(c) {
    this.color = c;
  }

  setPosition(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  setOffset(x, y, z) {
    this.offsetX = x;
    this.offsetY = y;
    this.offsetZ = z;
  }

  toRad(angle) {
    return angle * (Math.PI / 180);
  }

  toDeg(rads) {
    return rads / (Math.PI / 180);
  }

  rotateAroundY(x, y, z, ang) {
    return {
      x: x * Math.cos(this.toRad(ang)) - z * Math.sin(this.toRad(ang)),
      y: y,
      z: x * Math.sin(this.toRad(ang)) + z * Math.cos(this.toRad(ang))
    }
  }
  rotateAroundX(x, y, z, ang) {
    return {
      x: x ,
      y: y * Math.cos(this.toRad(ang)) - z * Math.sin(this.toRad(ang)),
      z: y * Math.sin(this.toRad(ang)) + z * Math.cos(this.toRad(ang))
    }
  }
  rotateAroundZ(x, y, z, ang) {
    return {
      x: x * Math.cos(this.toRad(ang)) - y * Math.sin(this.toRad(ang)),
      y: x * Math.sin(this.toRad(ang)) + y * Math.cos(this.toRad(ang)),
      z: z
    }
  }


  getRotated2D (worldRotation, zoom = 1) {
    let rot = this.rotateAroundX(this.x, this.y, this.z, worldRotation.x);
    rot = this.rotateAroundY(rot.x, rot.y, rot.z, worldRotation.y);
    rot = this.rotateAroundZ(rot.x, rot.y, rot.z, worldRotation.z);
    try {
      let rx = this.offsetX + (rot.x / ((rot.z + this.offsetZ)/zoom));
      let ry =  this.offsetY + (rot.y / ((rot.z + this.offsetZ)/zoom));

      return {
        x: rx,
        y: ry
      }
    } catch (e) {
      return {
        x: 0,
        y: 0
      }
    }
  }

  getScale(worldRotation, zoom = 1) {
    let rot = this.rotateAroundX(this.x, this.y, this.z, worldRotation.x);
    rot = this.rotateAroundY(rot.x, rot.y, rot.z, worldRotation.y);
    rot = this.rotateAroundZ(rot.x, rot.y, rot.z, worldRotation.z);
    const dx = rot.x;
    const dy = rot.y;
    const dz = rot.z + this.offsetZ;
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
    if (distance === 0) return 0;
    return zoom / distance;
  }

  getDistanceFromCamera(worldRotation) {
    let rot = this.rotateAroundX(this.x, this.y, this.z, worldRotation.x);
    rot = this.rotateAroundY(rot.x, rot.y, rot.z, worldRotation.y);
    rot = this.rotateAroundZ(rot.x, rot.y, rot.z, worldRotation.z);
    const dx = rot.x;
    const dy = rot.y;
    const dz = rot.z + this.offsetZ;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  get2D (zoom = 1) {
    try {
      let rx = this.offsetX + (this.x / ((this.z + this.offsetZ)/zoom));
      let ry =  this.offsetY + (this.y / ((this.z + this.offsetZ)/zoom));

      return {
        x: rx,
        y: ry
      }
    } catch (e) {
      return {
        x: 0,
        y: 0
      }
    }
  }
}
