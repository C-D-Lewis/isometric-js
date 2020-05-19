const GRID_WIDTH = 16;
const GRID_HEIGHT = 16;
const GRID_DEPTH = 16;
const BLOCK_SIZE = 6;
const SKY_HEIGHT = GRID_DEPTH * BLOCK_SIZE;
const MAX_CLOUDS = 5;
const CLOUD_SPAWN_CHANCE = 95;
const SAND_SEED_CHANCE = 95;
const SAND_CLUMP_CHANCE = 60;
const SAND_NEIGHBORS = 5;
const WATER_CLUMP_CHANCE = 75;
const WATER_NEIGHBORS = 8;
const WORLD_CONTAINER = {
  x: 0, y: 0, z: 0,
  width: GRID_WIDTH * BLOCK_SIZE,
  height: GRID_HEIGHT * BLOCK_SIZE,
  depth: GRID_DEPTH * BLOCK_SIZE,
};
const TYPES = ['air', 'grass', 'cloud', 'sand', 'water', 'stone'];
const COLORS = {
  air: '#0000',
  grass: 'rgb(20, 158, 68)',
  cloud: 'white',
  sand: 'rgb(252, 254, 153)',
  water: 'rgb(1, 55, 255)',
  stone: 'rgb(154, 154, 154)',
  outline: '#444',
};

const blocks = [];
const clouds = [];

const randomInt = (max) => Math.floor(Math.random() * max);

class Block {
  constructor (pos) {
    this.bounds = {
      x: pos.x * BLOCK_SIZE,
      y: pos.y * BLOCK_SIZE,
      z: pos.z * BLOCK_SIZE,
      width: BLOCK_SIZE,
      height: BLOCK_SIZE,
      depth: BLOCK_SIZE,
    };
    this.setType('air');
  }

  setType (newType) {
    if (!TYPES.includes(newType)) throw new Error(`Invalid type: ${newType}`);

    this.type = newType;
    this.color = COLORS[newType];
  }

  getType () {
    return this.type;
  }

  update () {}

  render () {
    Isometric.filledBox(this.bounds, COLORS[this.type]);

    if (this.type !== 'air') {
      Isometric.box(this.bounds, COLORS.outline);
    }
  }
}

class Cloud extends Block {
  constructor () {
    super({ x: 0, y: 0, z: GRID_DEPTH });

    this.type = 'cloud';
    this.isVisible = true;
  }

  respawn () {
    this.bounds.y = 0;
    this.bounds.x = randomInt(GRID_WIDTH * BLOCK_SIZE);
    this.isVisible = true;
  }

  update () {
    super.update();

    this.bounds.y ++;
    if (this.bounds.y > GRID_HEIGHT * BLOCK_SIZE) {
      this.isVisible = false;
    }

    if (!this.isVisible && randomInt(100) > CLOUD_SPAWN_CHANCE) {
      this.respawn();
    }
  }

  render () {
    if (!this.isVisible) return;

    super.render();
  }
}

const drawScene = (width, height) => {
  // Draw world
  for (let z = 0; z < GRID_DEPTH; z++) {
    for (let y = 0; y < GRID_HEIGHT; y++) {
      for (let x = 0; x < GRID_WIDTH; x++) {
        blocks[z][y][x].render();
      }
    }
  }

  // Draw clouds
  clouds.forEach(p => p.render());

  // World container
  Isometric.box(WORLD_CONTAINER, COLORS.outline);
};

const isNearType = (pos, type) => {
  for (let y = pos.y - 1; y < pos.y + 2; y++) {
    for (let x = pos.x -1; x < pos.x + 2; x++) {
      if (x < 0 || y < 0 || x >= GRID_WIDTH || y >= GRID_HEIGHT) continue;

      if (blocks[pos.z][y][x].getType() === type) {
        return true;
      }
    }
  }

  return false;
};

const isNearNumberOfType = (pos, number, type) => {
  let result = 0;
  for (let y = pos.y - 1; y < pos.y + 2; y++) {
    for (let x = pos.x -1; x < pos.x + 2; x++) {
      if (x < 0 || y < 0 || x >= GRID_WIDTH || y >= GRID_HEIGHT) continue;

      if (blocks[pos.z][y][x].getType() === type) {
        result ++;
      }
    }
  }

  return result === number;
};

const generateWorld = () => {
  blocks.length = 0;
  for (let z = 0; z < GRID_DEPTH; z++) {
    if (!blocks[z]) blocks[z] = [];
    for (let y = 0; y < GRID_HEIGHT; y++) {
      if (!blocks[z][y]) blocks[z][y] = [];
      for (let x = 0; x < GRID_WIDTH; x++) {
        blocks[z][y][x] = new Block({ x, y, z });
      }
    }
  }

  // Grassy floor
  for (let y = 0; y < GRID_HEIGHT; y++) {
    for (let x = 0; x < GRID_WIDTH; x++) {
      blocks[0][y][x].setType('grass');
    }
  }

  // Seed sand
  for (let y = 0; y < GRID_HEIGHT; y++) {
    for (let x = 0; x < GRID_WIDTH; x++) {
      if (randomInt(100) > SAND_SEED_CHANCE) {
        blocks[0][y][x].setType('sand');
      }
    }
  }

  // Clump sand
  for (let y = 0; y < GRID_HEIGHT; y++) {
    for (let x = 0; x < GRID_WIDTH; x++) {
      if (randomInt(100) > SAND_CLUMP_CHANCE && isNearType({ x, y, z: 0 }, 'sand')) {
        blocks[0][y][x].setType('sand');
      }
    }
  }
  for (let y = 0; y < GRID_HEIGHT; y++) {
    for (let x = 0; x < GRID_WIDTH; x++) {
      if (isNearNumberOfType({ x, y, z: 0 }, SAND_NEIGHBORS, 'sand')) {
        blocks[0][y][x].setType('sand');
      }
    }
  }

  // Water in sand areas
  for (let y = 0; y < GRID_HEIGHT; y++) {
    for (let x = 0; x < GRID_WIDTH; x++) {
      if (isNearNumberOfType({ x, y, z: 0 }, WATER_NEIGHBORS, 'sand')) {
        blocks[0][y][x].setType('water');
      }
    }
  }
  for (let y = 0; y < GRID_HEIGHT; y++) {
    for (let x = 0; x < GRID_WIDTH; x++) {
      if (randomInt(100) > WATER_CLUMP_CHANCE && isNearType({ x, y, z: 0 }, 'water')) {
        blocks[0][y][x].setType('water');
      }
    }
  }

  // Castle walls
  let x = 2;
  let y = 6;
  for (y = 6; y < 10; y++) {
    for (let z = 0; z < 6; z++) {
      blocks[z][y][x].setType('stone');
    }
  }
  y = 12;
  for (x = 2; x < 6; x++) {
    for (let z = 0; z < 6; z++) {
      blocks[z][y][x].setType('stone');
    }
  }
  y = 6;
  for (x = 2; x < 6; x++) {
    for (let z = 0; z < 6; z++) {
      blocks[z][y][x].setType('stone');
    }
  }
  x = 6;
  for (y = 6; y < 10; y++) {
    for (let z = 0; z < 6; z++) {
      blocks[z][y][x].setType('stone');
    }
  }
  let z = 6;
  for (y = 6; y < 10; y++) {
    for (x = 2; x < 7; x++) {
      blocks[z][y][x].setType('stone');
    }
  }

  // Clouds
  while (clouds.length < MAX_CLOUDS) {
    clouds.push(new Cloud());
  }
};

const onFrame = () => {
  Isometric.renderScene(drawScene);

  // Simulate
  for (let z = 0; z < GRID_DEPTH; z++) {
    for (let y = 0; y < GRID_HEIGHT; y++) {
      for (let x = 0; x < GRID_WIDTH; x++) {
        blocks[z][y][x].update();
      }
    }
  }

  clouds.forEach(p => p.update());

  window.requestAnimationFrame(onFrame);
};

/**
 * Main function.
 */
const main = () => {
  Isometric.init('black', { x: 150, y: 150 });
  generateWorld();

  document.getElementById('button_generate').addEventListener('click', () => {
    generateWorld();
    window.requestAnimationFrame(onFrame);
  });

  window.requestAnimationFrame(onFrame);
};

main();
