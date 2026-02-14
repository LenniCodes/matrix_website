const preview_template = document.getElementById("preview-template");
const add_button = document.getElementById("add-frame");

// init

add_frame();
setCurrFrame(0);
updatePickerFront();

selectTool(pencil_tool);

// Add frame button: creates a new animation frame
add_button.addEventListener("pointerup", () => {
  add_frame();
  setCurrFrame(getFrameCount() - 1);
  focusPreview();
});

// Adds a new frame with all necessary event listeners using the template to the list
function add_frame() {
  let new_preview = preview_template.content.firstElementChild.cloneNode(true);
  new_preview.draggable = true;

  addSelectable(new_preview);

  addContextMenu(new_preview);

  addDragAndDrop(new_preview);

  frame_list.appendChild(new_preview);

  return new_preview;
}