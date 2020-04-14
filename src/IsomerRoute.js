import Isomer, { Color, Shape, Point } from 'isomer';
import DIR from './directions';
import DirectedShape from './DirectedShape';
import {
  drawGrid,
  isEquivalent,
  isShapeInFront,
  sortByOverlapping,
} from './utils';

const blue = new Color(59, 188, 188);

class IsomerRoute {
  constructor(canvas, origin = Point(0, 0, 0), color = blue) {
    this.canvas = canvas;
    this.iso = new Isomer(canvas);
    this.iso.colorDifference = 0.35;
    this.origin = origin;
    this.gridSize = 16;
    this.shapes = [];
    this.direction = null;
    this.polarity = 1;
    this.color = color;
    this.rotation = 0;
    this.depth = 1;
    this.rotationQuadrant = 0;
    return this;
  }

  getEquivalentPoint = (point) => {
    const equivalentPoints = [];
    for (let i = 0; i < this.shapes.length; i++) {
      const shape = this.shapes[i];
      const { origin, dz, direction } = shape;
      if (direction === DIR.X) {
        for (let dx = 0; dx < shape.dx; dx++) {
          const p = Point(origin.x + dx, origin.y, origin.z + dz);
          if (isEquivalent(point, p, this.rotationQuadrant)) {
            equivalentPoints.push(p);
          }
        }
      }

      if (direction === DIR.Y) {
        for (let dy = 0; dy < shape.dy; dy++) {
          const p = Point(origin.x, origin.y + dy, origin.z + dz);
          if (isEquivalent(point, p, this.rotationQuadrant)) {
            equivalentPoints.push(p);
          }
        }
      }

      if (direction === DIR.DOWN) {
        const p = Point(origin.x, origin.y, origin.z + dz);
        if (isEquivalent(point, p, this.rotationQuadrant)) {
          equivalentPoints.push(p);
        }
      }

      if (direction === DIR.UP) {
        const p = Point(origin.x, origin.y, origin.z + dz);
        if (isEquivalent(point, p, this.rotationQuadrant)) {
          equivalentPoints.push(p);
        }
      }
    }

    if (equivalentPoints.length === 0) {
      return undefined;
    }

    return equivalentPoints.sort((p1, p2) => p2.z - p1.z)[0];
  };

  clearCanvas = () => {
    this.iso.canvas.ctx.clearRect(
      0,
      0,
      this.iso.canvas.elem.width,
      this.iso.canvas.elem.height,
    );
  };

  updateOrigin = (dx = 0, dy = 0, dz = 0) => {
    return this.setOrigin(
      Point(this.origin.x + dx, this.origin.y + dy, this.origin.z + dz),
    );
  };

  setOrigin = (origin) => {
    this.origin = origin;
    return this;
  };

  addColumn = (height, dir = DIR.UP, color = blue) => {
    const dx = 1;
    const dy = 1;

    if (dir === DIR.DOWN) {
      this.updateOrigin(0, 0, -1 * height + 1);
      const shape = new DirectedShape(
        this.origin,
        dx,
        dy,
        height - 1 + this.depth,
        dir,
        color,
      );
      this.shapes.push(shape);
      this.updateOrigin(0, 0, -1);
      return this;
    }

    const shape = new DirectedShape(this.origin, dx, dy, height, dir, color);
    this.shapes.push(shape);

    return this.updateOrigin(0, 0, height);
  };

  addPath = (length, dir = DIR.X, color) => {
    const dx = dir === DIR.X ? Math.abs(length) : 1;
    const dy = dir === DIR.Y ? Math.abs(length) : 1;
    const height = 1 * this.depth;

    if (length < 0) {
      this.updateOrigin(
        dir === DIR.X ? -1 * dx : 0,
        dir === DIR.Y ? -1 * dy : 0,
        0,
      );

      const shape = new DirectedShape(
        Point(
          this.origin.x +
            (this.polarity < 1 && this.direction === DIR.X ? 0 : 0),
          this.origin.y +
            (this.polarity < 1 && this.direction === DIR.Y ? 0 : 0),
          this.origin.z,
        ),
        dx + (dir === DIR.X ? 1 : 0),
        dy + (dir === DIR.Y ? 1 : 0),
        height,
        dir,
        color,
      );

      this.shapes.push(shape);
      this.polarity = -1;
      this.direction = dir;

      return this;
    }

    this.polarity = 1;
    this.direction = dir;

    this.updateOrigin(
      dir === DIR.X && this.direction !== DIR.X ? 1 : 0,
      dir === DIR.Y && this.direction !== DIR.Y ? 1 : 0,
    );
    const shape = new DirectedShape(this.origin, dx, dy, height, dir, color);

    this.shapes.push(shape);

    return this.updateOrigin(dir === DIR.X ? dx : 0, dir === DIR.Y ? dy : 0, 0);
  };

  addStairs = (height, dir = DIR.X, incrementPerStair = 5, color = blue) => {
    this.updateOrigin(
      dir === DIR.X ? 1 : 0,
      dir === DIR.Y ? 1 : 0,
      1 * this.depth,
    );

    [...Array(height).keys()].forEach((__, stairIndex) => {
      [...Array(incrementPerStair).keys()].forEach((__, increment) => {
        if (stairIndex !== 0 || increment !== 0) {
          this.origin = Point(
            this.origin.x + (dir === DIR.X ? 1 / incrementPerStair : 0),
            this.origin.y + (dir === DIR.Y ? 1 / incrementPerStair : 0),
            this.origin.z + 1 / incrementPerStair,
          );
        }

        const shape = new DirectedShape(
          this.origin,
          dir === DIR.X ? 1 / incrementPerStair : 1,
          dir === DIR.Y ? 1 / incrementPerStair : 1,
          1 / incrementPerStair,
          dir,
          color,
        );
        this.shapes.push(shape);
      });
    });

    this.updateOrigin(
      dir === DIR.X ? 1 / incrementPerStair : 0,
      dir === DIR.Y ? 1 / incrementPerStair : 0,
      -1 * this.depth + 1 / incrementPerStair,
    );

    this.direction = dir;
    return this;
  };

  split() {
    return new IsomerRoute(this.canvas, this.origin)
      .setRotation(this.rotation)
      .setDepth(this.depth);
  }

  rotate(rotation = Math.PI / 8) {
    return this.setRotation(this.rotation + rotation);
  }

  setRotation(rotation = Math.PI / 8) {
    this.rotation = rotation;
    this.rotationQuadrant =
      Math.abs(
        Math.round(
          ((Math.abs(2 * Math.PI - this.rotation) / Math.PI / 2) % 1) / 0.25,
        ) * 0.25,
      ) % 1;
    return this;
  }

  setDepth(depth = 1) {
    this.depth = depth;
    return this;
  }

  addShape = (shape) => {
    this.shapes.push(shape);
    return this;
  };

  addShapes = (shapes) => {
    this.shapes = this.shapes.concat(shapes);
    return this;
  };

  removeShapeById = (shapeId) => {
    this.shapes = this.shapes.filter((shape) => shape.id !== shapeId);
    return this;
  };

  // getShapeObj = (shape) => {
  //   shape = shape.
  //   return shape;
  // };

  drawGrid = (gridSize, drawNegative = false) => {
    this.gridSize = gridSize;
    drawGrid(this.iso, this.rotation, this.gridSize, drawNegative);
    return this;
  };

  draw = () => {
    // const orderedPaths = this.shapes
    //   .map(this.getShapeObj)
    //   .reduce((pathsAc, shape) => [...pathsAc, ...shape.paths], [])
    //   .sort((pathA, pathB) => pathB.depth() - pathA.depth());

    console.log(this.shapes);
    const orderedShapes = this.shapes.sort(sortByOverlapping);

    orderedShapes.forEach((shape) => {
      this.iso.add(
        shape.rotateZ(
          Point(this.gridSize / 2, this.gridSize / 2, 0),
          this.rotation,
        ),
        shape.color || blue,
      );
    });

    return this;
  };

  flush = () => {
    this.shapes = [];
    return this;
  };
}

export default IsomerRoute;
