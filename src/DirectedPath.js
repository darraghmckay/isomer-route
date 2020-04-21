import { Shape } from 'isomer';
import DirectedShape from './DirectedShape';
import { blue } from './colors';

const noOp = shape => shape;

class DirectedPath extends DirectedShape {
  constructor(origin, path, depth, color = blue, transformation) {
    super(origin, 1, 1, depth, null, color, transformation);
    this.path = path;
    this.shape = new Shape.extrude(path);
    this.transformation = transformation || noOp;
  }

  clone() {
    return new DirectedPath(
      this.origin,
      this.path,
      this.dz,
      this.color,
      this.transformation,
    );
  }

  rotateX() {
    const shape = this.shape.rotateX(...arguments);
    const DirectedPath = this.clone();
    DirectedPath.shape = shape;
    return DirectedPath;
  }

  rotateY() {
    const shape = this.shape.rotateY(...arguments);
    const DirectedPath = this.clone();
    DirectedPath.shape = shape;
    return DirectedPath;
  }

  rotateZ() {
    const shape = this.shape.rotateZ(...arguments);
    const DirectedPath = this.clone();
    DirectedPath.shape = shape;
    return DirectedPath;
  }
}

export default DirectedPath;
