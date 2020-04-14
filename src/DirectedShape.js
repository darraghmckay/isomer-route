import { Color, Shape } from 'isomer';

const blue = new Color(59, 188, 188);

class DirectedShape extends Shape.Prism {
  constructor(origin, dx, dy, dz, direction, color = blue) {
    super(origin, dx, dy, dz);
    this.dx = dx;
    this.dy = dy;
    this.dz = dz;
    this.origin = origin;
    this.color = color;
    this.direction = direction;
  }

  rotateX() {
    const shape = new Shape(this.dx, this.dy, this.dz).rotateX(arguments);
    this.paths = shape.paths;
    return this;
  }

  rotateY() {
    const shape = new Shape(this.dx, this.dy, this.dz).rotateY(arguments);
    this.paths = shape.paths;
    return this;
  }

  rotateZ() {
    const shape = new Shape(this.dx, this.dy, this.dz).rotateZ(arguments);
    this.paths = shape.paths;
    return this;
  }
}

export default DirectedShape;
