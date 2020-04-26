import { Path, Point, Shape } from 'isomer';
import Block from './Block';
import BlockGroup from './BlockGroup';

class Column extends BlockGroup {
  constructor(origin, height, direction) {
    super(origin, 1, 1, height, direction);

    for (let h = 0; h < Math.abs(height); h += 1) {
      this.blocks.push(new Block(Point(origin.x, origin.y, origin.z + h)));
    }
  }

  addStartExtrusion() {
    const origin = Point(this.origin.x, this.origin.y, this.origin.z - 1);
    const path = new Path([
      origin,
      Point(origin.x + 1, origin.y, origin.z),
      Point(origin.x + 1, origin.y + 1, origin.z),
    ]);

    const rotationOrigin = Point(
      origin.x + 0.5,
      origin.y + 0.5,
      origin.z + 0.5,
    );

    this.blocks.push(
      new Block(origin, 1, 1, 1)
        .setColor(this.color)
        .setShape(Shape.extrude(path, 1))
        .rotateY(rotationOrigin, Math.PI / 2)
        .rotateX(rotationOrigin, (-Math.PI * 3) / 2),
    );

    return this;
  }

  addEndExtrusion() {
    const end = this.getRotationEndPoint();
    const origin = Point(end.x - 0.5, end.y - 0.5, end.z + 0.5);
    const path = new Path([
      origin,
      Point(origin.x + 1, origin.y, origin.z),
      Point(origin.x + 1, origin.y + 1, origin.z),
    ]);

    const rotationOrigin = Point(
      origin.x + 0.5,
      origin.y + 0.5,
      origin.z + 0.5,
    );

    this.blocks.push(
      new Block(origin, 1, 1, 1)
        .setColor(this.color)
        .setShape(Shape.extrude(path, 1))
        .rotateY(rotationOrigin, Math.PI / 2)
        .rotateX(rotationOrigin, -Math.PI / 2),
    );

    return this;
  }
}

export default Column;
