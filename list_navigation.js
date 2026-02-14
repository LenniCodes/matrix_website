const MOVE_THRESHOLD = 8;
const DRAG_THRESHOLD_MS = 300;

const frame_list = document.getElementById("frames");
const frame_list_container = document.getElementById("frame-list");

let curr_frame = -1;
let curr_preview = null;

let gesture = "undecided";
let action_happened = false;
let dragged = null;
let dragging = false;

let pointerStartTime = -1;
let pointerStartX = 0;
let pointerStartY = 0;

// Adds a click/selection listener to a preview frame
function addSelectable(preview_frame) {
  preview_frame.addEventListener("pointerup", () => {
    if(!dragging) {
      setCurrFrame(getFrameID(preview_frame));
      focusPreview();
      dragging = false;
    }
  });
}

// Document pointer move: handles scrolling and dragging operations
document.addEventListener("pointermove", (e) => {
  if (!dragged) return;

  const dx = e.clientX - pointerStartX;
  const dy = e.clientY - pointerStartY;

  if (gesture === "undecided") {
    if (Math.abs(dx) > MOVE_THRESHOLD) {
      gesture = "scroll";
      dragging = true;
    } else if (Math.abs(dy) > MOVE_THRESHOLD && Date.now() - pointerStartTime > DRAG_THRESHOLD_MS) {
      startDrag();
    } else {
      return;
    }
  }

  if (gesture === "scroll") {
    frame_list_container.scrollLeft -= dx;
    pointerStartX = e.clientX;
  }

  if (gesture === "drag") {
    e.preventDefault();
    updateDrag(e);
  }
});

// Updates the drag operation by repositioning the dragged element relative to other frames
function updateDrag(e) {
  if (!dragged) return;

  const target = document
    .elementFromPoint(e.clientX, e.clientY)
    ?.closest(".preview-frame");

  if (!target || target === dragged) return;

  const rect = target.getBoundingClientRect();
  const midpoint = rect.left + rect.width / 2;

  if (e.clientX < midpoint) {
    target.parentNode.insertBefore(dragged, target);
  } else {
    target.parentNode.insertBefore(dragged, target.nextElementSibling);
  }
}

// Initiates a drag operation by adding the dragging class to the dragged element
function startDrag() {
  if (!dragged) return;

  gesture = "drag";
  dragging = true;

  dragged.classList.add("dragging");
}

// Document pointer up: ends dragging operation
document.addEventListener("pointerup", (e) => {
  stopDragging();
});

// Document pointer cancel: cancels dragging if interrupted
document.addEventListener("pointercancel", (e) => {
  stopDragging();
});

// Adds drag and drop event listeners to a frame element
function addDragAndDrop(item) {
    item.addEventListener("pointerdown", (e) => {
    pointerStartX = e.clientX;
    pointerStartY = e.clientY;
    pointerStartTime = Date.now();
    dragged = item;
    dragging = false;
    gesture = "undecided";

    setTimeout(() => {
      if(gesture==="undecided") {
        startDrag();
      }
    }, 400);
  });

  item.addEventListener("dragstart", (e) => {
    e.preventDefault();
  });

}

// Document context menu: prevents default right-click menu
document.addEventListener("contextmenu", (e) => {
  e.preventDefault();
});

// Ends the drag operation and resets gesture state variables
function stopDragging() {
  // If we were dragging, finalize it
  if (gesture === "drag" && dragged) {
    dragged.classList.remove("dragging");

    if(dragged == curr_preview) {
      curr_frame = getFrameID(dragged);
    }
  }

  // Reset all gesture state
  gesture = null;
  dragged = null;

  pointerStartX = 0;
  pointerStartY = 0;
  pointerStartTime = 0;
}

// Returns the index of a frame element in the frame list
function getFrameID(frame) {
  return Array.from(frame_list.children).indexOf(frame);
}

// Returns the preview canvas element at the specified frame index
function getPreviewAt(frame_index) {
  return frame_list.children[frame_index];
}

// Returns the current preview canvas element
function getCurrPreview() {
  return getPreviewAt(curr_frame);
}

// Returns the canvas element at the specified frame index
function getCanvasAt(frame_index) {
  return getPreviewAt(frame_index).getElementsByClassName("preview-canvas")[0];
}

// Returns the current frame's canvas element
function getCurrCanvas() {
  return getCanvasAt(curr_frame);
}


// Returns the total number of frames}
function getFrameCount() {
  return frame_list.children.length;
}