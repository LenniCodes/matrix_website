const context = drawing_canvas.getContext('2d');
let isDrawing = false;
let mouse_down = false;
let x = 0;
let y = 0;
var offsetX;
var offsetY;

context.imageSmoothingEnabled = false;

// TODO: handle frame switch -> clear buffers

let undo_stack = [];
let redo_stack = [];
let MAX_UNDO = 25;
let last_frame_id = curr_frame;

function saveCanvasState() {
  checkSession();
  if(undo_stack.length >= MAX_UNDO) {
    undo_stack.shift();
  }
  undo_stack.push(context.getImageData(0,0,10,10));

  // clear redo stack on new action
  redo_stack = [];
}

function checkSession() {
  if(last_frame_id !== curr_frame) {
    undo_stack = [];
    redo_stack = [];
    last_frame_id = curr_frame;
  }
}

undo_tool.addEventListener("click", () => {
  checkSession();
  if(undo_stack.length > 0) {
    redo_stack.push(context.getImageData(0,0,10,10));
    context.putImageData(undo_stack.pop(), 0,0);
    transferToPreview();
  }
});

redo_tool.addEventListener("click", () => {
  checkSession();
  if(redo_stack.length > 0) {
    undo_stack.push(context.getImageData(0,0,10,10));
    context.putImageData(redo_stack.pop(), 0,0);
    transferToPreview();
  }
});

document.addEventListener('pointerup', (e) => {
    mouse_down = false;
    isDrawing = false;
});

drawing_canvas.addEventListener('pointerdown', (e) => {
    mouse_down = true;
    saveCanvasState();
});

  drawing_canvas.addEventListener('pointermove', (e) => {
    if(!isDrawing && mouse_down) {
      x = e.offsetX;
      y = e.offsetY;
      isDrawing = true;
      buffer_canvas = context.getImageData(0,0,10,10);
    }

    if (isDrawing) {
      holdingDraw(e.offsetX, e.offsetY);
    }
  });

  drawing_canvas.addEventListener('pointerup', (e) => {
    if (isDrawing) {
      x = 0;
      y = 0;
      isDrawing = false;
    } else {
      pointDraw(e.offsetX, e.offsetY);
    }
    mouse_down = false;
  });

  document.getElementById("drawing-canvas").addEventListener("pointerup", () => {
    transferToPreview();
  });

  document.getElementById("drawing-canvas").addEventListener("mouseleave", () => {
      transferToPreview();
  });

  function holdingDraw(offsetX, offsetY) {
    if(curr_tool === pencil_tool) {
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

function pointDraw(x, y) {
  if (curr_tool === fill_tool) {
      fill();
    transferToPreview();
    } else {
      drawPixel(x, y);
      transferToPreview();
    }
}

reset_tool.addEventListener("click", () => {
    reset();
    transferToPreview();
});

function drawPixel(x, y) {
    context.beginPath();
    if(is_erasing) {
      context.clearRect(Math.floor(x/40), Math.floor(y/40), 1, 1);
      return;
    } 
    context.fillStyle = curr_color;
    context.fillRect(Math.floor(x/40), Math.floor(y/40), 1, 1);
}

function drawLine(x1, y1, x2, y2) {
    context.beginPath();
    if(is_erasing) {
      // TODO: better eraser line
      context.strokeStyle = '#202020';
    } else {
      context.strokeStyle = curr_color;
    }
    context.lineWidth = 1;
    context.moveTo(Math.floor(x1/40) + 0.5, Math.floor(y1/40) + 0.5);
    context.lineTo(Math.floor(x2/40) + 0.5, Math.floor(y2/40) + 0.5);
    context.stroke();
    context.closePath();
}

function drawCircle(x, y, offsetX, offsetY) {
  let radius = Math.sqrt(Math.pow((offsetX - x), 2) + Math.pow((offsetY - y), 2));
      context.beginPath();
      if(is_erasing) {
         // TODO: better eraser circle
        context.strokeStyle = "#202020";
      } else {
        context.strokeStyle = curr_color;
      }
      context.lineWidth = 1;
      context.arc(Math.floor(x/40), Math.floor(y/40), radius/40, 0, 2*Math.PI);
      context.stroke();
      context.closePath();
    }


function fallbackToBuffer() {
    if(undo_stack.length > 0) {
      context.putImageData(undo_stack[undo_stack.length - 1], 0,0);
    }
}

function fill() {
   context.beginPath();
   context.fillStyle = curr_color;
   context.rect(0,0,10,10);
   context.fill();
}

function reset() {
  context.reset();
}