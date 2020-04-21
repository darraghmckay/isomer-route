import { Point, Shape } from 'isomer';
import { blue } from './colors';

const noOp = shape => shape;

class DirectedShape {
  constructor(origin, dx, dy, dz, direction, color = blue, transformation) {
    this.dx = dx;
    this.dy = dy;
    this.dz = dz;
    this.origin = Point(
      Math.round(origin.x * 1000) / 1000,
      Math.round(origin.y * 1000) / 1000,
      Math.round(origin.z * 1000) / 1000,
    );
    this.color = color;
    this.direction = direction;
    this.shape = new Shape.Prism(this.origin, this.dx, this.dy, this.dz);
    this.transformation = transformation || noOp;
  }

  getId() {
    return `${this.origin.x},${this.origin.y},${this.origin.z}--${this.dx}x${this.dy}x${this.dz}`;
  }

  clone() {
    return new DirectedShape(
      this.origin,
      this.dx,
      this.dy,
      this.dz,
      this.direction,
      this.color,
      this.transformation,
    );
  }

  rotateX() {
    const shape = this.shape.rotateX(...arguments);
    const directedShape = this.clone();
    directedShape.shape = shape;
    return directedShape;
  }

  rotateY() {
    const shape = this.shape.rotateY(...arguments);
    const directedShape = this.clone();
    directedShape.shape = shape;
    return directedShape;
  }

  rotateZ() {
    const shape = this.shape.rotateZ(...arguments);
    const directedShape = this.clone();
    directedShape.shape = shape;
    return directedShape;
  }
}

export default DirectedShape;
