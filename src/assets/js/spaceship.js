import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Texture, SpriteMaterial, Sprite} from 'three'

function setupModel(data) {
  const model = data.scene;

  return model;
}

async function loadSpaceship(data) {
    const loader = new GLTFLoader();

    const spaceshipData = await loader.loadAsync('/images/tie_fighter.glb');

    console.log('Enemy ' + data['user'] + ' spotted!',);

    const spaceship = setupModel(spaceshipData);
    spaceship.position.set(data['position'].x, data['position'].y, data['position'].z);

    var canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    var ctx = canvas.getContext("2d");
    ctx.font = "64pt Arial";
    ctx.fillStyle = "red";
    ctx.textAlign = "center";
    ctx.fillText(data["user"], 256, 64);
    var tex = new Texture(canvas);
    tex.needsUpdate = true;
    var spriteMat = new SpriteMaterial({
      map: tex
    });
    var sprite = new Sprite(spriteMat);
    sprite.position.y = 3
    spaceship.add(sprite);

  return { spaceship }
}

export { loadSpaceship };