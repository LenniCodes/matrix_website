const drawing_canvas = document.getElementById("drawing-canvas");
const context = drawing_canvas.getContext('2d');
const MATRIX_WIDTH = 10;

let isDrawing = false;
let mouse_down = false;
let x = 0;
let y = 0;
var offsetX;
var offsetY;

let undo_stack = [];
let redo_stack = [];
let MAX_UNDO = 25;
let last_frame_id = curr_frame;

context.imageSmoothingEnabled = false;

// Saves the current canvas state to the undo stack for later usage
function saveCanvasState() {
  checkSession();
  if (undo_stack.length >= MAX_UNDO) {
    undo_stack.shift();
  }
  undo_stack.push(context.getImageData(0, 0, MATRIX_WIDTH, MATRIX_WIDTH));

  // clear redo stack on new action
  redo_stack = [];
}

// Checks if the current frame has changed and resets undo/redo stacks if needed
function checkSession() {
  if (last_frame_id !== curr_frame) {
    undo_stack = [];
    redo_stack = [];
    last_frame_id = curr_frame;
  }
}

// Undo button: restores the previous canvas state
undo_tool.addEventListener("pointerup", () => {
  checkSession();
  if (undo_stack.length > 0) {
    redo_stack.push(context.getImageData(0, 0, MATRIX_WIDTH, MATRIX_WIDTH));
    context.putImageData(undo_stack.pop(), 0, 0);
    transferToPreview();
  }
});

// Redo button: restores the next canvas state
redo_tool.addEventListener("pointerup", () => {
  checkSession();
  if (redo_stack.length > 0) {
    undo_stack.push(context.getImageData(0, 0, MATRIX_WIDTH, MATRIX_WIDTH));
    context.putImageData(redo_stack.pop(), 0, 0);
    transferToPreview();
  }
});

// Global pointer up: stops drawing regardless of location
document.addEventListener('pointerup', (e) => {
  mouse_down = false;
  isDrawing = false;
});

// Canvas pointer down: initializes drawing and saves state
drawing_canvas.addEventListener('pointerdown', (e) => {
  mouse_down = true;
  saveCanvasState();
});

// Canvas pointer move: tracks movement and updates drawing
drawing_canvas.addEventListener('pointermove', (e) => {
  if (!isDrawing && mouse_down) {
    x = e.offsetX;
    y = e.offsetY;
    isDrawing = true;
    buffer_canvas = context.getImageData(0, 0, MATRIX_WIDTH, MATRIX_WIDTH);
  }

  if (isDrawing) {
    holdingDraw(e.offsetX, e.offsetY);
  }
});

// Canvas pointer up: finalizes drawing action
drawing_canvas.addEventListener('pointerup', (e) => {
  if (isDrawing) {
    x = 0;
    y = 0;
    isDrawing = false;
  } else {
    pointDraw(e.offsetX, e.offsetY);
  }
  mouse_down = false;
  transferToPreview();
});

// Canvas mouse leave: transfers drawing to preview when pointer leaves
drawing_canvas.addEventListener("mouseleave", () => {
  transferToPreview();
});

// Handles continuous drawing while the pointer is held down with the current tool
function holdingDraw(offsetX, offsetY) {
  if (curr_tool === pencil_tool) {
    drawPixel(offsetX, offsetY);
    x = offsetX;
    y = offsetY;
  } else if (curr_tool === brush_tool) {
    drawLine(x, y, offsetX, offsetY);
    x = offsetX;
    y = offsetY;
  } else if (curr_tool === line_tool) {
    fallbackToBuffer();
    drawLine(x, y, offsetX, offsetY);
  } else if (curr_tool === circle_tool) {
    fallbackToBuffer();
    drawCircle(x, y, offsetX, offsetY);
  }
}

// Handles a single point draw action (pencil click or fill action)
function pointDraw(x, y) {
  if (curr_tool === fill_tool) {
    fill();
    transferToPreview();
  } else {
    drawPixel(x, y);
    transferToPreview();
  }
}

// Reset button: clears the entire canvas
reset_tool.addEventListener("click", () => {
    reset();
    transferToPreview();
});

// Draws a single pixel on the canvas at the specified coordinates
function drawPixel(x, y) {
  context.beginPath();
  if (is_erasing) {
    context.clearRect(fromBigToSmall(x), fromBigToSmall(y), 1, 1);
    return;
  }
  context.fillStyle = curr_color;
  context.fillRect(fromBigToSmall(x), fromBigToSmall(y), 1, 1);
}

// Converts a large canvas coordinate to small canvas coordinate using the scale factor
function fromBigToSmall(coord) {
  let canvas_width = drawing_canvas.offsetWidth;
  let scale_factor = MATRIX_WIDTH / canvas_width;
  return Math.floor(coord * scale_factor);
}

// Draws a line between two points on the canvas
function drawLine(x1, y1, x2, y2) {
  context.beginPath();
  if (is_erasing) {
    context.strokeStyle = '#202020';
  } else {
    context.strokeStyle = curr_color;
  }
  context.lineWidth = 1;
  context.moveTo(fromBigToSmall(x1) + 0.5, fromBigToSmall(y1) + 0.5);
  context.lineTo(fromBigToSmall(x2) + 0.5, fromBigToSmall(y2) + 0.5);
  context.stroke();
  context.closePath();
}

// Draws a circle on the canvas with center at (x, y) and edge at (offsetX, offsetY)
function drawCircle(x, y, offsetX, offsetY) {
  let radius = Math.sqrt(Math.pow((offsetX - x), 2) + Math.pow((offsetY - y), 2));
  context.beginPath();
  if (is_erasing) {
    // TODO: better eraser circle
    context.strokeStyle = "#202020";
  } else {
    context.strokeStyle = curr_color;
  }
  context.lineWidth = 1;
  context.arc(fromBigToSmall(x) + 0.5, fromBigToSmall(y) + 0.5, fromBigToSmall(radius), 0, 2 * Math.PI);
  context.stroke();
  context.closePath();
} 
  
// Restores the canvas to the last state from the undo stack buffer
function fallbackToBuffer() {
  if (undo_stack.length > 0) {
    context.putImageData(undo_stack[undo_stack.length - 1], 0, 0);
  }
}

// Fills the entire canvas with the current color
function fill() {
  context.beginPath();
  context.fillStyle = curr_color;
  context.rect(0, 0, MATRIX_WIDTH, MATRIX_WIDTH);
  context.fill();
}

// Clears the entire canvas, removing all drawings
function reset() {
  context.clearRect(0, 0, MATRIX_WIDTH, MATRIX_WIDTH);
}


// Transfers the current drawing canvas state to the preview canvas for the current frame
function transferToPreview() {
  let dest_canvas = getCurrCanvas();
  let dest_context = dest_canvas.getContext("2d");
  dest_context.clearRect(0, 0, dest_canvas.width, dest_canvas.height);
  dest_context.drawImage(
    drawing_canvas,
    0,
    0,
    dest_canvas.width,
    dest_canvas.height,
  );
}

// Transfers the current frame's preview canvas state back to the main drawing canvas
function transferFromPreview() {
  let source_canvas = getCurrCanvas();
  let dest_context = drawing_canvas.getContext("2d");
  dest_context.clearRect(0, 0, drawing_canvas.width, drawing_canvas.height);
  dest_context.drawImage(
    source_canvas,
    0, 0,
    drawing_canvas.width,
    drawing_canvas.height,
  );
}