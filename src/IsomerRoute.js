import { TopologicalSort } from 'topological-sort';
import Isomer, { Point } from 'isomer';
import DIR from './directions';
import { blue } from './colors';
import {
  doBoundingBoxesOverlap,
  drawGrid,
  isEquivalent,
  isBoxInFront,
  getBoundingBoxFromBlock,
} from './utils';
import Track from './Track';
import Column from './Column';
import Stairs from './Stairs';

const identity = block => block;

class IsomerRoute {
  constructor(canvas, origin = Point(0, 0, 0), color = blue) {
    this.canvas = canvas;
    this.iso = new Isomer(canvas);
    this.iso.colorDifference = 0.35;
    this.origin = origin;
    this.gridSize = 16;
    this.blockGroups = [];
    this.direction = null;
    this.color = color;
    this.rotation = 0;
    this.rotationQuadrant = 0;
    this.delay = 0;
    this.topology = null;
    return this;
  }

  getEquivalentPoint = point => {
    const equivalentPoints = [];
    for (let i = 0; i < this.blockGroups.length; i++) {
      const shape = this.blockGroups[i];
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

  addColumn = (height, dir = DIR.UP, transformation = identity) => {
    if (dir === DIR.DOWN) {
      this.updateOrigin(0, 0, -1 * (height - 1));
    }

    this.blockGroups.push(
      transformation(new Column(this.origin, height, dir)),
    );

    if (dir === DIR.DOWN) {
      this.updateOrigin(0, 0, -1);
    }

    return this.updateOrigin(0, 0, height);
  };

  addTrack = (length, dir = DIR.X, transformation = identity) => {
    const dx = dir === DIR.X ? Math.abs(length) : 1;
    const dy = dir === DIR.Y ? Math.abs(length) : 1;

    if (length < 0) {
      this.updateOrigin(
        dir === DIR.X ? -1 * (dx - 1) : 0,
        dir === DIR.Y ? -1 * (dy - 1) : 0,
        0,
      );

      const transformedBlock = transformation(
        new Track(this.origin, length, dir),
      );

      this.blockGroups.push(transformedBlock);

      this.direction = dir;

      return this;
    }

    this.direction = dir;

    this.updateOrigin(
      dir === DIR.X && this.direction !== DIR.X ? 1 : 0,
      dir === DIR.Y && this.direction !== DIR.Y ? 1 : 0,
    );

    const transformedBlock = transformation(
      new Track(this.origin, length, dir),
    );
    this.blockGroups.push(transformedBlock);

    return this.updateOrigin(dir === DIR.X ? dx : 0, dir === DIR.Y ? dy : 0, 0);
  };

  addStairs = (
    height,
    dir = DIR.X,
    incrementPerStair = 5,
    transformation = identity,
  ) => {
    this.updateOrigin(dir === DIR.X ? 1 : 0, dir === DIR.Y ? 1 : 0, 1);

    this.blockGroups.push(
      transformation(new Stairs(this.origin, height, dir, incrementPerStair)),
    );

    this.updateOrigin(
      dir === DIR.X ? height : 0,
      dir === DIR.Y ? height : 0,
      height - 1,
    );

    this.direction = dir;
    return this;
  };

  split() {
    return new IsomerRoute(this.canvas, this.origin).setRotation(this.rotation);
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

  addBlock = shape => {
    this.blockGroups.push(shape);
    return this;
  };

  addBlocks = blocks => {
    this.blockGroups = this.blockGroups.concat(blocks);
    return this;
  };

  drawGrid = (gridSize, drawNegative = false) => {
    this.gridSize = gridSize || this.gridSize;
    drawGrid(this.iso, this.rotation, this.gridSize, drawNegative);
    return this;
  };

  buildNodes = rotatedBlocks => {
    const nodes = new Map();
    rotatedBlocks.forEach(block => {
      nodes.set(block.getId(), block);
    });

    this.topology = new TopologicalSort(nodes);
    return this;
  };

  addEdge = (blockA, blockB) => {
    const nodeA = this.topology.nodes.get(blockA.getId());
    if (!nodeA.children.has(blockB.getId())) {
      this.topology.addEdge(blockA.getId(), blockB.getId());
    }
    return this;
  };

  buildEdges = rotatedBlocks => {
    rotatedBlocks.forEach((blockA, index) => {
      rotatedBlocks.slice(index + 1).forEach(blockB => {
        const boxA = getBoundingBoxFromBlock(blockA);
        const boxB = getBoundingBoxFromBlock(blockB);
        if (
          blockA.getId() !== blockB.getId() &&
          doBoundingBoxesOverlap(boxA, boxB)
        ) {
          if (isBoxInFront(boxA, boxB)) {
            this.addEdge(blockA, blockB);
          } else {
            this.addEdge(blockB, blockA);
          }
        }
      });
    });
    return this;
  };

  delayDraw = (block, delay = 0) => {
    if (delay) {
      setTimeout(() => {
        this.iso.add(block.shape, block.color || this.color);
      }, delay);
    } else {
      this.iso.add(block.shape, block.color || this.color);
    }
    return this;
  };

  draw = () => {
    this.topology = null;
    this.nodes = new Map();
    const blocks = this.blockGroups.reduce(
      (acc, connectedBlock) => [...acc, ...connectedBlock.blocks],
      [],
    );

    const rotatedBlocks = blocks.map(block => {
      return block.rotateZ(
        Point(this.gridSize / 2, this.gridSize / 2, 0),
        this.rotation,
      );
    });

    this.buildNodes(rotatedBlocks);
    this.buildEdges(rotatedBlocks);
    let sortedTopology = null;
    try {
      sortedTopology = this.topology.sort();
      [...sortedTopology.keys()].reverse().forEach((blockId, index) => {
        const block = sortedTopology.get(blockId).node;
        this.delayDraw(block, index * this.delay);
      });
    } catch (e) {
      console.log(e, console.log(this.topology));
    }

    return this;
  };

  flush = () => {
    this.blockGroups = [];
    return this;
  };
}

export default IsomerRoute;
