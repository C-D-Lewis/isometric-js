/**
 * Read a File as a data URL.
 *
 * @param {File} file - File to load.
 * @returns {Promise<string>} Promise resolving the data URL.
 */
const readFileDataURL = file =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result);
    reader.onerror = e => reject(e);
    reader.readAsDataURL(file);
  });

/**
 * Example scene callback.
 *
 * @param {number} width - Width of the scene.
 * @param {number} height - Height of the scene.
 */
const exampleScene = (width, height) => {
  let size = 200;
  let z = 0;
  while (size > 5) {
    let box = { x: 50, y: 50, z, width: size, height: size, depth: size };
    Isometric.filledBox(box, 'red');
    Isometric.box(box, 'black');

    z += size;
    size /= 2;
  }
};

/**
 * Main function.
 */
const main = () => {
  Isometric.init('black', { x: 220, y: 400 });
  Isometric.renderScene(exampleScene);

  // Allow to draw images from file in index.html
  document
    .getElementById('input_file')
    .addEventListener('change', async (e) => {
      const file = e.target.files[0];
      const dataUrl = await readFileDataURL(file);

      Isometric.imageDataUrl(dataUrl, { x: 0, y: 0, z: 0 }, 2);
    });
};

main();
