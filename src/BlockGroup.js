import { Point } from 'isomer';
import DIR from './directions';

class BlockGroup {
  constructor(origin, dx, dy, dz, direction) {
    this.dx = dx;
    this.dy = dy;
    this.dz = dz;
    this.origin = Point(
      Math.round(origin.x * 1000) / 1000,
      Math.round(origin.y * 1000) / 1000,
      Math.round(origin.z * 1000) / 1000,
    );
    this.direction = direction;
    this.color = undefined;
    this.blocks = [];
  }

  setColor = color => {
    this.color = color;
    this.blocks = this.blocks.map(block => block.setColor(color));
    return this;
  };

  getRotationStartPoint() {
    return Point(this.origin.x + 0.5, this.origin.y + 0.5, this.origin.z + 0.5);
  }

  getRotationCenterPoint() {
    return Point(
      this.origin.x + this.dx / 2,
      this.origin.y + this.dy / 2,
      this.origin.z + this.dz / 2,
    );
  }

  getRotationEndPoint() {
    return Point(
      this.origin.x + this.dx - 0.5,
      this.origin.y + this.dy - 0.5,
      this.origin.z + this.dz - 0.5,
    );
  }

  rotateXStart(rotation) {
    return this.rotateX(this.getRotationStartPoint(), rotation);
  }

  rotateXStart(rotation) {
    return this.rotateY(this.getRotationStartPoint(), rotation);
  }

  rotateZStart(rotation) {
    return this.rotateZ(this.getRotationStartPoint(), rotation);
  }

  rotateXCenter(rotation) {
    return this.rotateX(this.getRotationCenterPoint(), rotation);
  }

  rotateYCenter(rotation) {
    return this.rotateY(this.getRotationCenterPoint(), rotation);
  }

  rotateZCenter(rotation) {
    return this.rotateZ(this.getRotationCenterPoint(), rotation);
  }

  rotateXEnd(rotation) {
    return this.rotateX(this.getRotationEndPoint(), rotation);
  }

  rotateYEnd(rotation) {
    return this.rotateY(this.getRotationEndPoint(), rotation);
  }

  rotateZEnd(rotation) {
    return this.rotateZ(this.getRotationEndPoint(), rotation);
  }

  rotateAlongAxis(rotation) {
    const rotationOrigin = this.getRotationEndPoint();

    if (this.direction === DIR.UP || this.direction === DIR.DOWN) {
      return this.rotateZ(rotationOrigin, rotation);
    }

    return this.direction === DIR.X
      ? this.rotateX(rotationOrigin, rotation)
      : this.rotateY(rotationOrigin, rotation);
  }

  /**
   * Rotates a given block along the X axis around a given origin
   *
   * Simply a forward to Block#rotateX
   */
  rotateX() {
    this.blocks = this.blocks.map(block => block.rotateX(...arguments));
    return this;
  }

  /**
   * Rotates a given block along the Y axis around a given origin
   *
   * Simply a forward to Block#rotateY
   */
  rotateY() {
    this.blocks = this.blocks.map(block => block.rotateY(...arguments));
    return this;
  }

  /**
   * Rotates a given block along the Z axis around a given origin
   *
   * Simply a forward to Block#rotateZ
   */
  rotateZ() {
    this.blocks = this.blocks.map(block => block.rotateZ(...arguments));
    return this;
  }
}

export default BlockGroup;
