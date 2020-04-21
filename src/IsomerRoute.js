import { TopologicalSort } from 'topological-sort';
import Isomer, { Path, Point } from 'isomer';
import DIR from './directions';
import DirectedShape from './DirectedShape';
import DirectedPath from './DirectedPath';
import { blue } from './colors';
import {
  doBoundingBoxesOverlap,
  drawGrid,
  isEquivalent,
  isBoxInFront,
  getBoundingBoxFromShape,
} from './utils';

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
    this.delay = 0;
    this.topology = null;
    return this;
  }

  getEquivalentPoint = point => {
    const equivalentPoints = [];
    for (let i = 0; i < this.shapes.length; i++) {
      const shape = this.shapes[i];
      const { origin, dz, direction } = shape;
      if (direction === DIR.X) {
        const p = Point(origin.x + 1, origin.y, origin.z + dz);
        if (isEquivalent(point, p, this.rotationQuadrant)) {
          equivalentPoints.push(p);
        }
      }

      if (direction === DIR.Y) {
        const p = Point(origin.x, origin.y + 1, origin.z + dz);
        if (isEquivalent(point, p, this.rotationQuadrant)) {
          equivalentPoints.push(p);
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
        if (
          isEquivalent(point, p, this.rotationQuadrant) &&
          !isEquivalent(point, Point(p.x, p.y, p.z + 1))
        ) {
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

  setColor = color => {
    this.color = color;
    return this;
  };

  setDelay = delay => {
    this.delay = delay;
    return this;
  };

  updateOrigin = (dx = 0, dy = 0, dz = 0) => {
    return this.setOrigin(
      Point(this.origin.x + dx, this.origin.y + dy, this.origin.z + dz),
    );
  };

  setOrigin = origin => {
    this.origin = origin;
    return this;
  };

  setGridSize = gridSize => {
    this.gridSize = gridSize;
    return this;
  };

  addExtrusion = (pointsFromOrigin, depth, color, transformation) => {
    const pathPoints = pointsFromOrigin.map(
      p =>
        new Point(
          this.origin.x + p.x,
          this.origin.y + p.y,
          this.origin.z + p.z,
        ),
    );

    const shape = new DirectedPath(
      this.origin,
      new Path(pathPoints),
      depth,
      color,
      transformation,
    );
    this.shapes.push(shape);
    return this;
  };

  addColumn = (height, dir = DIR.UP, color, transformation) => {
    const dx = 1;
    const dy = 1;

    if (dir === DIR.DOWN) {
      this.updateOrigin(0, 0, -1 * height + 1);
      for (let d = 0; d < height; d++) {
        const shape = new DirectedShape(
          Point(this.origin.x, this.origin.y, this.origin.z + d),
          dx,
          dy,
          1 * this.depth,
          dir,
          color,
          transformation,
        );
        this.shapes.push(shape);
      }
      this.updateOrigin(0, 0, -1);
      return this;
    }

    for (let d = 0; d < height; d++) {
      const shape = new DirectedShape(
        Point(this.origin.x, this.origin.y, this.origin.z + d),
        dx,
        dy,
        1 * this.depth,
        dir,
        color,
        transformation,
      );
      this.shapes.push(shape);
    }

    return this.updateOrigin(0, 0, height);
  };

  addPath = (length, dir = DIR.X, color, transformation) => {
    const dx = dir === DIR.X ? Math.abs(length) : 1;
    const dy = dir === DIR.Y ? Math.abs(length) : 1;
    const height = 1 * this.depth;

    if (length < 0) {
      this.updateOrigin(
        dir === DIR.X ? -1 * dx : 0,
        dir === DIR.Y ? -1 * dy : 0,
        0,
      );

      for (let d = 0; d < Math.abs(length) + 1; d += 1) {
        const shape = new DirectedShape(
          Point(
            this.origin.x + (dir === DIR.X ? d : 0),
            this.origin.y + (dir === DIR.Y ? d : 0),
            this.origin.z,
          ),
          1,
          1,
          height,
          dir,
          color,
          transformation,
        );

        this.shapes.push(shape);
      }

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
    for (let d = 0; d < Math.abs(length); d += 1) {
      const shape = new DirectedShape(
        Point(
          this.origin.x + (dir === DIR.X ? d : 0),
          this.origin.y + (dir === DIR.Y ? d : 0),
          this.origin.z,
        ),
        1,
        1,
        height,
        dir,
        color,
        transformation,
      );

      this.shapes.push(shape);
    }

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

  addShape = shape => {
    this.shapes.push(shape);
    return this;
  };

  addShapes = shapes => {
    this.shapes = this.shapes.concat(shapes);
    return this;
  };

  drawGrid = (gridSize, drawNegative = false) => {
    this.gridSize = gridSize || this.gridSize;
    drawGrid(this.iso, this.rotation, this.gridSize, drawNegative);
    return this;
  };

  buildNodes = rotatedShapes => {
    const nodes = new Map();
    rotatedShapes.forEach(shape => {
      nodes.set(shape.getId(), shape);
    });

    this.topology = new TopologicalSort(nodes);
    return this;
  };

  addEdge = (shapeA, shapeB) => {
    const nodeA = this.topology.nodes.get(shapeA.getId());
    if (!nodeA.children.has(shapeB.getId())) {
      this.topology.addEdge(shapeA.getId(), shapeB.getId());
    }
    return this;
  };

  buildEdges = rotatedShapes => {
    rotatedShapes.forEach((shapeA, index) => {
      rotatedShapes.slice(index + 1).forEach(shapeB => {
        const boxA = getBoundingBoxFromShape(shapeA);
        const boxB = getBoundingBoxFromShape(shapeB);
        if (
          shapeA.getId() !== shapeB.getId() &&
          doBoundingBoxesOverlap(boxA, boxB)
        ) {
          if (isBoxInFront(boxA, boxB)) {
            this.addEdge(shapeA, shapeB);
          } else {
            this.addEdge(shapeB, shapeA);
          }
        }
      });
    });
    return this;
  };

  delayDraw = (shape, delay = 0) => {
    if (delay) {
      setTimeout(() => {
        this.iso.add(shape.shape, shape.color || blue);
      }, delay);
    } else {
      this.iso.add(shape.shape, shape.color || blue);
    }
    return this;
  };

  draw = () => {
    this.topology = null;
    this.nodes = new Map();
    const rotatedShapes = this.shapes.map(shape =>
      shape
        .transformation(shape)
        .rotateZ(Point(this.gridSize / 2, this.gridSize / 2, 0), this.rotation),
    );

    this.buildNodes(rotatedShapes);
    this.buildEdges(rotatedShapes);
    let sortedTopology = null;
    try {
      sortedTopology = this.topology.sort();
      [...sortedTopology.keys()].reverse().forEach((shapeId, index) => {
        const shape = sortedTopology.get(shapeId).node;
        this.delayDraw(shape, index * this.delay);
      });
    } catch (e) {
      console.log(e, console.log(this.topology));
    }

    return this;
  };

  flush = () => {
    this.shapes = [];
    return this;
  };
}

export default IsomerRoute;
