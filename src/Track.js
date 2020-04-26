import { Path, Point, Shape } from 'isomer';
import DIR from './directions';
import Block from './Block';
import BlockGroup from './BlockGroup';

class Track extends BlockGroup {
  constructor(origin, length, direction) {
    const dx = direction === DIR.X ? Math.abs(length) : 1;
    const dy = direction === DIR.Y ? Math.abs(length) : 1;
    const dz = 1;
    super(origin, dx, dy, dz, direction);

    for (let d = 0; d < Math.abs(length); d += 1) {
      this.blocks.push(
        new Block(
          Point(
            origin.x + (direction === DIR.X ? d : 0),
            origin.y + (direction === DIR.Y ? d : 0),
            origin.z,
          ),
        ),
      );
    }
  }

  addStartExtrusion() {
    const origin = Point(
      this.origin.x - (this.direction === DIR.X ? 1 : 0),
      this.origin.y - (this.direction === DIR.Y ? 1 : 0),
      this.origin.z,
    );
    const path = new Path([
      origin,
      Point(origin.x + 1, origin.y, origin.z),
      Point(origin.x + 1, origin.y + 1, origin.z),
    ]);

    const block = new Block(origin, 1, 1, 1)
      .setColor(this.color)
      .setShape(Shape.extrude(path, 1));

    const rotationOrigin = Point(
      origin.x + 0.5,
      origin.y + 0.5,
      origin.z + 0.5,
    );

    this.blocks.push(
      this.direction === DIR.X
        ? block.rotateX(rotationOrigin, (-Math.PI * 3) / 2)
        : block
            .rotateY(rotationOrigin, (-Math.PI * 3) / 2)
            .rotateZ(rotationOrigin, Math.PI),
    );

    return this;
  }

  addEndExtrusion() {
    const origin = Point(
      this.origin.x + this.dx - (this.direction === DIR.Y ? 1 : 0),
      this.origin.y + this.dy - (this.direction === DIR.X ? 1 : 0),
      this.origin.z,
    );
    const path = new Path([
      origin,
      Point(origin.x + 1, origin.y, origin.z),
      Point(origin.x + 1, origin.y + 1, origin.z),
    ]);

    const block = new Block(origin, 1, 1, 1)
      .setColor(this.color)
      .setShape(Shape.extrude(path, 1));

    const rotationOrigin = Point(
      origin.x + 0.5,
      origin.y + 0.5,
      origin.z + 0.5,
    );

    this.blocks.push(
      this.direction === DIR.X
        ? block
            .rotateX(rotationOrigin, -Math.PI / 2)
            .rotateZ(rotationOrigin, Math.PI)
        : block.rotateY(rotationOrigin, -Math.PI / 2),
    );

    return this;
  }
}

export default Track;
