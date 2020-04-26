import { Point } from 'isomer';
import DIR from './directions';
import Block from './Block';
import BlockGroup from './BlockGroup';

class Stairs extends BlockGroup {
  constructor(origin, height, direction, incrementPerStair = 5) {
    const dx = direction === DIR.X ? height : 1;
    const dy = direction === DIR.Y ? height : 1;
    const dz = height;
    super(origin, dx, dy, dz, direction);

    let stairOrigin = origin;
    [...Array(height).keys()].forEach((__, stairIndex) => {
      [...Array(incrementPerStair).keys()].forEach((__, increment) => {
        if (stairIndex !== 0 || increment !== 0) {
          stairOrigin = Point(
            stairOrigin.x + (direction === DIR.X ? 1 / incrementPerStair : 0),
            stairOrigin.y + (direction === DIR.Y ? 1 / incrementPerStair : 0),
            stairOrigin.z + 1 / incrementPerStair,
          );
        }

        this.blocks.push(
          new Block(
            stairOrigin,
            direction === DIR.X ? 1 / incrementPerStair : 1,
            direction === DIR.Y ? 1 / incrementPerStair : 1,
            1 / incrementPerStair,
          ),
        );
      });
    });
  }
}

export default Stairs;
