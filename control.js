let curr_frame = -1;
let curr_color = "#ff0000";
let playing = false;

const drawing_canvas = document.getElementById("drawing-canvas");
const frame_list = document.getElementById("frames");
const preview_template = document.getElementById("preview-template");
const contextMenu = document.getElementById("context-menu");

const play_button = document.getElementById("play-button");
const next_button = document.getElementById("next-button");
const previous_button = document.getElementById("previous-button");

const add_button = document.getElementById("add-frame");
const import_button = document.getElementById("import-frame");

const color_picker = document.getElementById("color-picker");

// shape tools
const color_tool = document.getElementById("color-button");
const pencil_tool = document.getElementById("pencil-button");
const brush_tool = document.getElementById("brush-button");
const fill_tool = document.getElementById("fill-button");
const line_tool = document.getElementById("line-button");
const circle_tool = document.getElementById("circle-button");

// undo tools
const reset_tool = document.getElementById("reset-button");
const eraser_tool = document.getElementById("eraser-button");
const undo_tool = document.getElementById("undo-button");
const redo_tool = document.getElementById("redo-button");
let is_erasing = false;

const tools = [pencil_tool, brush_tool, fill_tool, line_tool, circle_tool];
let curr_tool = pencil_tool;

let selected_frame = -1;
const delete_menu_item = document.getElementById("menu-delete");
const duplicate_menu_item = document.getElementById("menu-duplicate");

let dragged;

/*window.onbeforeunload = function(){
    return "Did you save your stuff?";
};*/

// TODO: delete frame gesture, include global duration and per-frame duration settings
//        do style changes with css classes not with js
//      fix duplicate / delete issues with frame index order

// TODO after PC tests: make it work on smartphones!!!

// maybe todo after: include crossfade settings per frame, onion skinning option, own color picker, pixel perfect line/circle tool

// init

add_frame();
setCurrFrame(0);
updatePickerFront();

selectTool(pencil_tool);

// add frame

add_button.addEventListener("pointerup", () => {
  add_frame();
  setCurrFrame(getFrameCount() - 1);
  focusPreview();
});

function add_frame() {
  let new_preview = preview_template.content.firstElementChild.cloneNode(true);
  new_preview.draggable = true;

  new_preview.addEventListener("pointerup", () => {
    setCurrFrame(getFrameID(new_preview));
  });

  new_preview
    .getElementsByClassName("settings_icon")[0]
    .addEventListener("pointerup", (e) => {
      showContextMenu(new_preview);
    });

  addDragAndDrop(new_preview);

  frame_list.appendChild(new_preview);

  return new_preview;
}

frame_list.addEventListener("wheel", function (e) {
  e.preventDefault();
  frame_list.scrollLeft += e.deltaY;
});

function getFrameID(frame) {
  return Array.from(frame_list.children).indexOf(frame);
}

function getPreviewAt(frame_index) {
  return frame_list.children[frame_index];
}

function getCurrPreview() {
  return getPreviewAt(curr_frame);
}

function getCurrCanvas() {
  return getCurrPreview().getElementsByClassName("preview-canvas")[0];
}

function getFrameCount() {
  return frame_list.children.length;
}

// play / pause

play_button.addEventListener("pointerup", () => {
  triggerPlayPause();
});

document.addEventListener("keyup", (event) => {
  if (event.key == " " || event.code == "Space") {
    triggerPlayPause();
    event.preventDefault();
  }
});

function triggerPlayPause() {
  playing = !playing;
  if (playing) {
    play_button.innerHTML = '<i class="material-icons">pause</i>';
    playAnimation();
  } else {
    play_button.innerHTML = '<i class="material-icons">play_arrow</i>';
  }
}

// skip buttons

next_button.addEventListener("pointerup", () => {
  skipFrame(1);
});

document.addEventListener("keydown", (event) => {
  if (event.code == "ArrowRight") {
    skipFrame(1);
  }
});

previous_button.addEventListener("pointerup", () => {
  skipFrame(-1);
});

document.addEventListener("keydown", (event) => {
  if (event.code == "ArrowLeft") {
    skipFrame(-1);
  }
});

function skipFrame(direction) {
  let next_frame;
  if (direction > 0) {
    next_frame = (curr_frame + direction) % getFrameCount();
  } else if (direction < 0) {
    next_frame = (curr_frame + direction + getFrameCount()) % getFrameCount();
  }
  setCurrFrame(next_frame);
  focusPreview();
}

// rendering

function playAnimation() {
  if (!playing) return;
  let next_frame = (curr_frame + 1) % getFrameCount();
  setCurrFrame(next_frame);
  focusPreview();
  setTimeout(playAnimation, 100);
}

function setCurrFrame(frame_index) {
  if (curr_frame === frame_index) return;
  if (frame_index < 0 || frame_index >= getFrameCount()) return;

  if (curr_frame >= 0) {
    let former_preview = getCurrPreview();
    former_preview.classList.remove("selected-preview");
  }

  curr_frame = frame_index;
  let new_preview = getCurrPreview(); 
  new_preview.classList.add("selected-preview");

  // TODO: "source_canvas is undefined"
  transferToPreview(getCurrCanvas());
}

function focusPreview() {
  let curr_frame = getCurrPreview();
  curr_frame.scrollIntoView({
    //behavior: 'smooth',
    inline: "center",
    block: "nearest",
  });
}

// preview update

function transferToPreview(source_canvas) {
  let source_context = source_canvas.getContext("2d");
  source_context.clearRect(0, 0, source_canvas.width, source_canvas.height);
  source_context.drawImage(
    drawing_canvas,
    0,
    0,
    source_canvas.width,
    source_canvas.height,
  );
}

// color picker

color_picker.addEventListener("input", (event) => {
  curr_color = color_picker.value;
  updatePickerFront();
});

function updatePickerFront() {
  color_tool.getElementsByClassName("material-icons")[0].style.color =
    curr_color;
}

// tool selection

tools.forEach((tool) => {
  tool.addEventListener("pointerup", () => {
    if (curr_tool !== tool) {
      selectTool(tool);
    }
  });
});

function selectTool(tool) {
  curr_tool.classList.remove("selected-tool");
  tool.classList.add("selected-tool");
  curr_tool = tool;
}

eraser_tool.addEventListener("pointerup", () => {
  is_erasing = !is_erasing;
  if (is_erasing) {
    eraser_tool.classList.add("selected-tool");
  } else {
    eraser_tool.classList.remove("selected-tool");
  }
});

// context menu for frames

// TODO: change menu style etc.
function showContextMenu(item) {
  let mouseX = e.clientX || e.touches[0].clientX;
  let mouseY = e.clientY || e.touches[0].clientY;
  let menuHeight = contextMenu.getBoundingClientRect().height;
  let menuWidth = contextMenu.getBoundingClientRect().width;
  let width = window.innerWidth;
  let height = window.innerHeight;

  //If user pointerups/touches near right corner
  if (width - mouseX <= 200) {
    contextMenu.style.left = width - menuWidth + "px";
    contextMenu.style.top = mouseY + "px";
    //right bottom
    if (height - mouseY <= 200) {
      contextMenu.style.top = mouseY - menuHeight + "px";
      contextMenu.style.borderRadius = "5px 5px 0 5px";
    }
  }

  //left
  else {
    contextMenu.style.left = mouseX + "px";
    contextMenu.style.top = mouseY + "px";
    //left bottom
    if (height - mouseY <= 200) {
      contextMenu.style.top = mouseY - menuHeight + "px";
      contextMenu.style.borderRadius = "5px 5px 5px 0";
    }
  }

  //display the menu
  contextMenu.style.visibility = "visible";
  selected_frame = getFrameID(item);
}

delete_menu_item.addEventListener("pointerup", () => {
  deleteFrame(selected_frame);
  contextMenu.style.visibility = "hidden";
});

duplicate_menu_item.addEventListener("pointerup", () => {
  duplicateFrame(selected_frame);
  contextMenu.style.visibility = "hidden";
});

function deleteFrame(frame_index) {
  if (frame_index < 0 || frame_index >= getFrameCount() || getFrameCount() <= 1)
    return;

  if (curr_frame == frame_index) {
    let new_frame = (curr_frame - 1 + getFrameCount()) % getFrameCount();
    setCurrFrame(new_frame);
    focusPreview();
  }

  getPreviewAt(frame_index).remove();
}

function duplicateFrame(frame_index) {
  if (frame_index < 0 || frame_index >= getFrameCount()) return;
  let source_canvas = getPreviewAt(frame_index);
  let new_canvas = add_frame();
  new_canvas
    .getContext("2d")
    .drawImage(source_canvas, 0, 0, new_canvas.width, new_canvas.height);
  frame_list.insertBefore(new_canvas, source_canvas.nextSibling);
}

//click outside the menu to close it (for click devices)
document.addEventListener("pointerdown", function (e) {
  if (!contextMenu.contains(e.target)) {
    contextMenu.style.visibility = "hidden";
  }
});

// draggable frames

function addDragAndDrop(item) {
  item.addEventListener("dragstart", (e) => {
    dragged = e.target;
    e.dataTransfer.effectAllowed = "move";
  });

  item.addEventListener("dragover", (e) => {
    e.preventDefault();
    const target = e.target;
    if (target !== dragged) {
      const rect = target.getBoundingClientRect();
      const midpoint = rect.left + rect.width / 2;

      if (e.clientX < midpoint) {
        target.parentNode.insertBefore(dragged, target);
      } else {
        target.parentNode.insertBefore(dragged, target.nextElementSibling);
      }
    }
  });
}
