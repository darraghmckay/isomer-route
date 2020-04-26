# isomer-route

An abstraction of the popular isometric graphics library [isomer](https://github.com/jdan/isomer) which allows you to easily build _routes_ using `Track`s, `Column`s and `Stairs`, taking care of the hard things such as positioning, complext transformations and drawing order. 

 
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
Coming soon

## Examples
For now, checkout the simple examples I made on my [blog](https://darraghmckay.com/blog/isometric-illusions)

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License
[MIT](https://choosealicense.com/licenses/mit/)