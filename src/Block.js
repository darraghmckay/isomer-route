import { Point, Shape } from 'isomer';

class Block {
  constructor(origin, dx = 1, dy = 1, dz = 1) {
    this.dx = dx;
    this.dy = dy;
    this.dz = dz;
    this.origin = Point(
      Math.round(origin.x * 1000) / 1000,
      Math.round(origin.y * 1000) / 1000,
      Math.round(origin.z * 1000) / 1000,
    );
    this.color = undefined;
    this.shape = new Shape.Prism(origin, dx, dy, dz);
  }

  setColor = color => {
    this.color = color;
    return this;
  };

  setShape = shape => {
    this.shape = shape;
    return this;
  };

  getId() {
    return `${this.origin.x},${this.origin.y},${this.origin.z}--${this.dx}x${this.dy}x${this.dz}`;
  }

  getShapeOrigin() {
    const numPaths = this.shape.paths.length;
    return Point(
      this.shape.paths.reduce(
        (pathSum, path) =>
          pathSum +
          path.points.reduce((sum, point) => sum + point.x, 0) /
            path.points.length,
        0,
      ) /
        numPaths -
        this.dx / 2,
      this.shape.paths.reduce(
        (pathSum, path) =>
          pathSum +
          path.points.reduce((sum, point) => sum + point.y, 0) /
            path.points.length,
        0,
      ) /
        numPaths -
        this.dy / 2,
      this.shape.paths.reduce(
        (pathSum, path) =>
          pathSum +
          path.points.reduce((sum, point) => sum + point.z, 0) /
            path.points.length,
        0,
      ) /
        numPaths -
        this.dz / 2,
    );
  }

  /**
   * Rotates a given block along the X axis around a given origin
   *
   * Simply a forward to Shape#rotateX
   */
  rotateX() {
    this.shape = this.shape.rotateX(...arguments);
    return this;
  }

  /**
   * Rotates a given block along the Y axis around a given origin
   *
   * Simply a forward to Shape#rotateY
   */
  rotateY() {
    this.shape = this.shape.rotateY(...arguments);
    return this;
  }

  /**
   * Rotates a given block along the Z axis around a given origin
   *
   * Simply a forward to Shape#rotateZ
   */
  rotateZ() {
    this.shape = this.shape.rotateZ(...arguments);
    return this;
  }
}

export default Block;
