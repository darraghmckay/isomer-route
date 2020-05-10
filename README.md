![isomer-route-portfolio-cover](https://user-images.githubusercontent.com/11474806/80754705-63a58a00-8b27-11ea-8088-ac1cf04ffbba.png)



# isomer-route
isomer-route allows you to draw complex isometric shapes and illusions with ease on the HTML5 canvas, extending on the great work of [isomer](https://github.com/jdan/isomer). Inspired by isometric illusions such as the Penrose triangleand the beautiful gameMonument Valley

Easily build _routes_ using `Track`s, `Column`s and `Stairs`, taking care of the hard things such as positioning, complex transformations and drawing order. 
 
## Installation

```bash
yarn add isomer-route
```

or with npm

```bash
npm install isomer-route --save
```

## Usage

```js
import IsomerRoute from 'isomer-route'

const canv = document.querySelector('#isomer-canvas');

new IsomerRoute(canv, Point(0, 0, 0))
 .setGridSize(6)
 .setRotation(rotation)
 .addTrack(6, DIR.X)
 .addTrack(6, DIR.Y)
 .addColumn(6, DIR.DOWN)
 .draw();


<canvas id="isomer-canvas" height="600" widht="600" />
```

## Documentation
Full documentation and reference is available on the [project page on my website](https://darraghmckay.com/projects/isomer-route)

## Examples
For more fun examples I made check out my [blog post](https://darraghmckay.com/blog/isometric-illusions)

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License
[MIT](https://choosealicense.com/licenses/mit/)
