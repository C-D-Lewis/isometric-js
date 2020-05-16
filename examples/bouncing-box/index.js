const CONTAINER = { x: 0, y: 0, z: 0, width: 200, height: 180 };

const rect = { x: 0, y: 0, z: 0, width: 30, height: 30 };
let dx = 1;
let dy = 1;

/**
 * Example scene callback.
 *
 * @param {number} width - Width of the scene.
 * @param {number} height - Height of the scene.
 */
const drawScene = (width, height) => {
  // Box movement logic
  rect.x += dx;
  rect.y += dy;
  if (rect.x > CONTAINER.width - rect.width) {
    dx = -1;
  }
  if (rect.x < CONTAINER.x) {
    dx = 1;
  }
  if (rect.y > CONTAINER.height - rect.height) {
    dy = -1;
  }
  if (rect.y < CONTAINER.y) {
    dy = 1;
  }

  Isometric.filledRect(rect, 'red');
  Isometric.rect(rect, 'white');
  Isometric.rect(CONTAINER, 'lightgrey');
};

const onFrame = () => {
  Isometric.renderScene(drawScene);
  window.requestAnimationFrame(onFrame);
};

/**
 * Main function.
 */
const main = () => {
  Isometric.init('black', { x: 300, y: 300 });

  window.requestAnimationFrame(onFrame);
};

main();
