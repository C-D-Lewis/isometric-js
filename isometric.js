let canvas;
let ctx;
let bgColor;
let projOffset;

/**
 * Draw a line on HTML Canvas.
 *
 * @param {Object} from - { x, y } start location.
 * @param {Object} to - { x, y } end location.
 * @param {string} color - Color to draw.
 */
const drawLine = (from, to, color) => {
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  ctx.stroke();
};

/**
 * Draw a filled polygon (because we can now on Canvas) which is a lot
 * cheaper than rastering lots of lines.
 *
 * @param {Object} tl - { x, y } top left point.
 * @param {Object} tr - { x, y } top right point.
 * @param {Object} br - { x, y } bottom right point.
 * @param {Object} bl - { x, y } bottom left point.
 */
const drawFilledPoly = (tl, tr, br, bl, color) => {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(tl.x, tl.y);
  ctx.lineTo(tr.x, tr.y);
  ctx.lineTo(br.x, br.y);
  ctx.lineTo(bl.x, bl.y);
  ctx.closePath();
  ctx.fill();
};

/**
 * Project a coordinate into isometric space.
 *
 * @param {Object} vec - { x, y, z } to project.
 * @returns {Object} { x, y } projected point for drawing.
 */
const project = ({ x, y, z = 0 }) => ({
  x: projOffset.x + (x - y),
  y: projOffset.y + ((x / 2) + (y / 2)) - z,
});

/**
 * Draw a projected pixel.
 *
 * @param {Object} vec - { x, y, z } to draw.
 * @param {string} color - Color to draw.
 */
const projectPixel = (vec, color) => {
  ctx.fillStyle = 'yellow';
  const out = project(vec);
  ctx.fillRect(out.x, out.y, 1, 1);
};

/**
 * Draw a projected rectangle outline.
 *
 * @param {Object} rect - { x, y, z, width, height } to draw.
 * @param {string} color - Color to draw.
 */
const projectRect = (rect, color) => {
  const { x, y, z, width, height } = rect;

  // Top
  let from = project(rect);
  let to = project({ x: x + width, y, z });
  drawLine(from, to, color);

  // Left
  from = project({ x: x + width, y, z });
  to = project({ x: x + width, y: y + height, z });
  drawLine(from, to, color);

  // Bottom
  from = project({ x, y: y + height, z });
  to = project({ x: x + width, y: y + height, z });
  drawLine(from, to, color);

  // Right
  from = project(rect);
  to = project({ x, y: y + height, z });
  drawLine(from, to, color);
};

/**
 * Draw a projected filled box rectangle.
 *
 * @param {Object} rect - { x, y, z, width, height } to draw.
 * @param {string} color - Color to draw.
 */
const projectFilledRect = (rect, color) => {
  const { x, y, z, width, height } = rect;

  drawFilledPoly(
    project({ x, y, z }),
    project({ x: x + width, y, z }),
    project({ x: x + width, y: y + height, z }),
    project({ x, y: y + height, z }),
    color,
  );
};

/**
 * Draw a projected filled box.
 *
 * @param {Object} rect - { x, y, z, width, height } to draw.
 * @param {number} zHeight - Z height of the box.
 * @param {string} color - Color to draw.
 */
const projectFilledBox = (rect, zHeight, color) => {
  const { x, y, z, width, height } = rect;

  // LHS
  drawFilledPoly(
    project({ x, y: y + height, z }),
    project({ x: x + width, y: y + height, z }),
    project({ x: x + width, y: y + height, z: z + zHeight }),
    project({ x, y: y + height, z: z + zHeight }),
    color,
  );

  // RHS
  drawFilledPoly(
    project({ x: x + width, y: y + height, z }),
    project({ x: x + width, y, z }),
    project({ x: x + width, y, z: z + zHeight }),
    project({ x: x + width, y: y + height, z: z + zHeight }),
    color,
  );

  // Top
  projectFilledRect({ x, y, z: z + zHeight - 1, width, height }, color);
};

/**
 * Draw a projected box outline.
 *
 * @param {Object} rect - { x, y, z, width, height } to draw.
 * @param {number} zHeight - Z height of the box.
 * @param {string} color - Color to draw.
 */
const projectBox = (rect, zHeight, color) => {
  const { x, y, z, width, height } = rect;

  // Bottom
  let from = project({ x: x + width, y, z });
  let to = project({ x: x + width, y: y + height, z });
  drawLine(from, to, color);
  from = project({ x, y: y + height, z });
  to = project({ x: x + width, y: y + height, z });
  drawLine(from, to, color);

  // Top
  projectRect({ x, y, z: z + zHeight, width, height }, color);

  // Sides
  from = project({ x, y: y + height, z });
  to = project({ x, y: y + height, z: z + zHeight });
  drawLine(from, to, color);

  from = project({ x: x + width, y: y + height, z });
  to = project({ x: x + width, y: y + height, z: z + zHeight });
  drawLine(from, to, color);

  from = project({ x: x + width, y, z });
  to = project({ x: x + width, y, z: z + zHeight });
  drawLine(from, to, color);
};

/**
 * Load image data and canvas context from data URL.
 *
 * @param {string} dataUrl - Image data URL.
 * @returns {Promise<Object>} Object containing img element and Canvas.
 */
const loadImageData = dataUrl => new Promise((resolve) => {
  const img = document.createElement('img');
  img.src = dataUrl;
  img.addEventListener('load', () => {
    const imgCanvas = document.createElement('canvas');
    imgCanvas.width = img.width;
    imgCanvas.height = img.height;
    resolve({ img, imgCanvas });
  });
});

/**
 * Draw a projected image from a data URL.
 *
 * @param {string} dataUrl - Image data URL.
 * @param {Object} origin - { x, y, z } origin of the image.
 * @param {number} [pixelSize] - Optional specific pixel size.
 */
const projectImageDataUrl = async (dataUrl, origin, pixelSize = 1) => {
  const { img, imgCanvas } = await loadImageData(dataUrl);
  const imgCtx = imgCanvas.getContext('2d');
  imgCtx.drawImage(img, 0, 0, img.width, img.height);

  for (let y = 0; y < img.height; y++) {
    for (let x = 0; x < img.width; x++) {
      const [r, g, b, a] = imgCtx.getImageData(x, y, 1, 1).data;
      projectFilledRect({
        x: origin.x + (x * pixelSize),
        y: origin.y + (y * pixelSize),
        z: origin.z,
        width: pixelSize,
        height: pixelSize,
      }, `rgb(${r},${g},${b},${a})`);
    }
  }
};

/**
 * Initialise the library.
 *
 * @param {string} color - Scene background color.
 * @param {Object} offset - { x, y } projection offset.
 */
const init = (color, offset) => {
  bgColor = color;
  projOffset = offset;

  canvas = document.createElement('canvas');
  canvas.style.width = window.innerWidth;
  canvas.style.height = window.innerHeight;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);

  ctx = canvas.getContext('2d');
};

/**
 * Render a scene using sceneCb.
 *
 * @param {Function} sceneCb - Callback for drawing the scene.
 */
const renderScene = (sceneCb) => {
  if (!canvas) init('black', { x: 50, y: 50 });

  const width = canvas.scrollWidth;
  const height = canvas.scrollHeight;

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, width, height);

  sceneCb(width, height);
};

window.Isometric = {
  init,
  renderScene,
  pixel: projectPixel,
  rect: projectRect,
  box: projectBox,
  filledRect: projectFilledRect,
  filledBox: projectFilledBox,
  imageDataUrl: projectImageDataUrl,
};
