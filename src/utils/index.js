import { Shape, Path, Point } from 'isomer';
import { blue, red } from '../colors';

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
  // iso.add(
  //   Shape.Prism(Point(0, 0, -gridSize), gridSize, gridSize, gridSize).rotateZ(
  //     Point(gridSize / 2, gridSize / 2, 0),
  //     rotation,
  //   ),
  //   blue,
  // );

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
export const spaceToIso = spacePos => {
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

export const getBoundingBoxFromShape = shape => {
  const bbox = {
    xmin: Infinity,
    xmax: -Infinity,
    ymin: Infinity,
    ymax: -Infinity,
    zmin: Infinity,
    zmax: -Infinity,
    hmin: Infinity,
    hmax: -Infinity,
  };

  shape.shape.paths.forEach(path => {
    path.points.forEach(point => {
      const isoPoint = spaceToIso(point);
      bbox.xmin = Math.min(bbox.xmin, Math.round(isoPoint.x * 1000) / 1000);
      bbox.xmax = Math.max(bbox.xmax, Math.round(isoPoint.x * 1000) / 1000);
      bbox.ymin = Math.min(bbox.ymin, Math.round(isoPoint.y * 1000) / 1000);
      bbox.ymax = Math.max(bbox.ymax, Math.round(isoPoint.y * 1000) / 1000);
      bbox.zmin = Math.min(bbox.zmin, Math.round(point.z * 1000) / 1000);
      bbox.zmax = Math.max(bbox.zmax, Math.round(point.z * 1000) / 1000);
      bbox.hmin = Math.min(bbox.hmin, Math.round(isoPoint.h * 1000) / 1000);
      bbox.hmax = Math.max(bbox.hmax, Math.round(isoPoint.h * 1000) / 1000);
    });
  });

  return bbox;
};

export const doBoundingBoxesOverlap = (box1, box2) => {
  // Boxes overlap if and only if all axis regions overlap.
  return (
    // test if x regions intersect.
    !(box1.xmin > box2.xmax || box2.xmin > box1.xmax) &&
    // test if y regions intersect.
    !(box1.ymin > box2.ymax || box2.ymin > box1.ymax) &&
    // test if h regions intersect.
    !(box1.hmin > box2.hmax || box2.hmin > box1.hmax)
  );
};

export const getMaxBoxDepth = box => box.xmax + box.ymax - 4 * box.zmax;

export const isBoxInFront = (box1, box2) =>
  getMaxBoxDepth(box1) <= getMaxBoxDepth(box2);

export const doShapesOverlap = (shape1, shape2) => {
  const box1 = getBoundingBoxFromShape(shape1);
  const box2 = getBoundingBoxFromShape(shape2);
  return doBoundingBoxesOverlap(box1, box2);
};
