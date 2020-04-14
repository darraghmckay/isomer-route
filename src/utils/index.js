import { Color, Path, Point } from 'isomer';

const blue = new Color(59, 188, 188);
const red = new Color(160, 60, 50);

export const isEquivalent = (p1, p2, rotationQuadrant = 0) => {
  const xDif = Math.round(p1.x) - Math.round(p2.x);
  const yDif = Math.round(p1.y) - Math.round(p2.y);
  const zDif = Math.round(p1.z) - Math.round(p2.z);
  switch (rotationQuadrant) {
    case 0.25:
      return xDif === zDif && yDif === -zDif;
    case 0.5:
      return xDif === zDif && yDif === zDif;
    case 0.75:
      return xDif === -zDif && yDif === zDif;
    case 0:
    default:
      return xDif === -zDif && yDif === -zDif;
  }
};

export const drawGrid = (
  iso,
  rotation = (2 * Math.PI) / 4,
  gridSize = 16,
  drawNegative = false,
) => {
  for (let x = drawNegative ? -gridSize : 0; x <= gridSize; x += 1) {
    iso.add(
      new Path([
        new Point(x, (drawNegative ? -1 : 0) * gridSize, 0),
        new Point(x, gridSize, 0),
        new Point(x, (drawNegative ? -1 : 0) * gridSize, 0),
      ]).rotateZ(Point(gridSize / 2, gridSize / 2, 0), rotation),
      blue,
    );
    iso.add(
      new Path([
        new Point((drawNegative ? -1 : 0) * gridSize, x, 0),
        new Point(gridSize, x, 0),
        new Point((drawNegative ? -1 : 0) * gridSize, x, 0),
      ]).rotateZ(Point(gridSize / 2, gridSize / 2, 0), rotation),
      red,
    );
  }
};

// Convert a 3D space position to a 2D isometric position.
export const pointToIso = (point) => {
  // New XY position simply adds Z to X and Y.
  var isoX = spacePos.x + spacePos.z;
  var isoY = spacePos.y + spacePos.z;

  return {
    x: isoX,
    y: isoY,

    // Compute horizontal distance from origin.
    h: (isoX - isoY) * Math.cos(Math.PI / 6),

    // Compute vertical distance from origin.
    v: (isoX + isoY) / 2,
  };
};

export const getBoundingBoxFromShape = (shape) => {
  const bbox = {
    xmin: Infinity,
    xmax: -Infinity,
    ymin: Infinity,
    ymax: -Infinity,
    zmin: Infinity,
    zmax: -Infinity,
  };
  shape.paths.forEach((path) => {
    path.points.forEach((point) => {
      bbox.xmin = Math.min(bbox.xmin, point.x);
      bbox.xmax = Math.max(bbox.xmax, point.x);
      bbox.ymin = Math.min(bbox.ymin, point.y);
      bbox.ymax = Math.max(bbox.ymax, point.y);
      bbox.zmin = Math.min(bbox.zmin, point.z);
      bbox.zmax = Math.max(bbox.zmax, point.z);
    });
  });

  return bbox;
};

function doBoundingBoxesOverlap(box1, box2) {
  // Boxes overlap if and only if all axis regions overlap.
  return (
    // test if x regions intersect.
    !(box1.xmin >= box2.xmax || box2.xmin >= box1.xmax) &&
    // test if y regions intersect.
    !(box1.ymin >= box2.ymax || box2.ymin >= box1.ymax) &&
    // test if h regions intersect.
    !(box1.zmin >= box2.zmax || box2.zmin >= box1.zmax)
  );
}

export const isShapeInFront = (shape1, shape2) => {
  const box1 = getBoundingBoxFromShape(shape1);
  const box2 = getBoundingBoxFromShape(shape2);

  // test for intersection x-axis
  // (lower x value is in front)
  if (box1.xmin >= box2.xmax) {
    return false;
  } else if (box2.xmin >= box1.xmax) {
    return true;
  }

  // test for intersection y-axis
  // (lower y value is in front)
  if (box1.ymin >= box2.ymax) {
    return false;
  } else if (box2.ymin >= box1.ymax) {
    return true;
  }

  // test for intersection z-axis
  // (higher z value is in front)
  if (box1.zmin >= box2.zmax) {
    return true;
  } else if (box2.zmin >= box1.zmax) {
    return false;
  }
};

export const sortByOverlapping = (shape1, shape2) => {
  const box1 = getBoundingBoxFromShape(shape1);
  const box2 = getBoundingBoxFromShape(shape2);
  if (!doBoundingBoxesOverlap(box1, box2)) {
    return 0;
  }

  return isShapeInFront(shape1, shape2) ? 1 : -1;
};
