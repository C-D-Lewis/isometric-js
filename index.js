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
  const box = { x: 150, y: 50, z: 0, width: 80, height: 80 };
  Isometric.filledBox(box, 50, 'red');

  const rect = { x: 150, y: 50, z: 20, width: 40, height: 40 };
  Isometric.filledRect(rect, 'yellow');
};

/**
 * Main function.
 */
const main = () => {
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
