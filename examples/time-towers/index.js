const SIZE = 20;
const GRID_WIDTH = 5;
const GRID_HEIGHT = 12;
const TOWER_HEIGHT = 100;

const getHeight = (func, max) => {
  const now = new Date();
  return (now[func]() / max) * TOWER_HEIGHT;
};

/**
 * Example scene callback.
 *
 * @param {number} width - Width of the scene.
 * @param {number} height - Height of the scene.
 */
const exampleScene = (width, height) => {
  // Grid
  for (let y = 0; y < GRID_HEIGHT; y++) {
    for (let x = 0; x < GRID_WIDTH; x++) {
      Isometric.rect({
        x: x * SIZE,
        y: y * SIZE,
        z: 0,
        width: SIZE,
        height: SIZE,
      }, '#AAA');
    }
  }

  // Hour towers
  const hoursLocation = { x: 3 * SIZE, y: 6 * SIZE, z: 0 };
  Isometric.filledBox({
    ...hoursLocation, width: SIZE, height: SIZE,
    depth: getHeight('getHours', 24),
  }, '#AA0055');
  Isometric.box({
    ...hoursLocation, width: SIZE, height: SIZE,
    depth: getHeight('getHours', 24),
  }, '#000');
  Isometric.box({
    ...hoursLocation, width: SIZE, height: SIZE,
    depth: TOWER_HEIGHT,
  }, '#000');

  // Minute towers
  const minutesLocation = { x: 1 * SIZE, y: 7 * SIZE, z: 0 };
  Isometric.filledBox({
    ...minutesLocation, width: SIZE, height: SIZE,
    depth: getHeight('getMinutes', 60),
  }, '#0055FF');
  Isometric.box({
    ...minutesLocation, width: SIZE, height: SIZE,
    depth: getHeight('getMinutes', 60),
  }, '#000');
  Isometric.box({
    ...minutesLocation, width: SIZE, height: SIZE,
    depth: TOWER_HEIGHT,
  }, '#000');

  // Seconds towers
  const secondsLocation = { x: 2 * SIZE, y: 9 * SIZE, z: 0 };
  Isometric.filledBox({
    ...secondsLocation, width: SIZE, height: SIZE,
    depth: getHeight('getSeconds', 60),
  }, '#FFFF00');
  Isometric.box({
    ...secondsLocation, width: SIZE, height: SIZE,
    depth: getHeight('getSeconds', 60),
  }, '#000');
  Isometric.box({
    ...secondsLocation, width: SIZE, height: SIZE,
    depth: TOWER_HEIGHT,
  }, '#000');
};

/**
 * Main function.
 */
const main = () => {
  Isometric.init('#55AAAA', { x: 200, y: 50 });
  Isometric.renderScene(exampleScene);

  setInterval(() => Isometric.renderScene(exampleScene), 1000);
};

main();
