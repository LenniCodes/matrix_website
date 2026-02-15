let selected_frame = -1;
const context_menu = document.getElementById("context-menu");
const delete_menu_item = document.getElementById("menu-delete");
const duplicate_menu_item = document.getElementById("menu-duplicate");

// Adds a context menu listener to the settings icon of a preview frame
function addContextMenu(preview_frame) {
  preview_frame
    .getElementsByClassName("settings-icon")[0]
    .addEventListener("pointerup", (e) => {
      showContextMenu(preview_frame, e);
    });
}

// Displays the context menu at the position of the pointer or adjusts it if needed
function showContextMenu(item, e) {
  let mouseX = e.clientX || e.touches[0].clientX;
  let mouseY = e.clientY || e.touches[0].clientY;
  let menuHeight = context_menu.getBoundingClientRect().height;
  let menuWidth = context_menu.getBoundingClientRect().width;
  let width = window.innerWidth;
  let height = window.innerHeight;

  //touch is near right corner
  if (width - mouseX <= menuWidth) {
    context_menu.style.left = width - menuWidth + "px";
    context_menu.style.top = mouseY + "px";
    //right bottom
    if (height - mouseY <= menuHeight) {
      context_menu.style.top = mouseY - menuHeight + "px";
      context_menu.style.borderRadius = "5px 5px 0 5px";
    }
  }

  //left
  else {
    context_menu.style.left = mouseX + "px";
    context_menu.style.top = mouseY + "px";
    //left bottom
    if (height - mouseY <= menuHeight) {
      context_menu.style.top = mouseY - menuHeight + "px";
      context_menu.style.borderRadius = "5px 5px 5px 0";
    }
  }

  //display the menu
  context_menu.style.visibility = "visible";
  selected_frame = getFrameID(item);
}

// Delete menu item: removes the selected frame
delete_menu_item.addEventListener("pointerup", () => {
  deleteFrame(selected_frame);
  context_menu.style.visibility = "hidden";
});

// Duplicate menu item: creates a copy of the selected frame
duplicate_menu_item.addEventListener("pointerup", () => {
  duplicateFrame(selected_frame);
  context_menu.style.visibility = "hidden";
});

// Deletes a frame at the specified index from the frame list
function deleteFrame(frame_index) {
  if (frame_index < 0 || frame_index >= getFrameCount() || getFrameCount() <= 1)
    return;

  const removing_current = curr_frame === frame_index;
  const removing_before = frame_index < curr_frame;

  if (removing_current) {
    const new_frame = (frame_index - 1 + getFrameCount()) % getFrameCount();
    setCurrFrame(new_frame);
    focusPreview();
  } else if (removing_before) {
    curr_frame -= 1;
    setCurrFrame(curr_frame);
  }

  getPreviewAt(frame_index).remove();
}

// Creates a duplicate of the frame at the specified index and inserts it after the original
function duplicateFrame(frame_index) {
  if (frame_index < 0 || frame_index >= getFrameCount()) return;
  let source_preview = getPreviewAt(frame_index);
  let new_preview = add_frame();
  new_canvas = new_preview.getElementsByClassName("preview-canvas")[0];
  new_canvas
    .getContext("2d")
    .drawImage(getCurrCanvas(), 0, 0, new_canvas.width, new_canvas.height);
  frame_list.insertBefore(new_preview, source_preview.nextSibling);
}

// Document pointer down: closes context menu when clicking outside it
document.addEventListener("pointerdown", function (e) {
  if (!context_menu.contains(e.target)) {
    context_menu.style.visibility = "hidden";
  }
});
