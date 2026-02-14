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
let curr_color = "#ff0000";

// Color picker input: updates the current drawing color
color_picker.addEventListener("input", (event) => {
  curr_color = color_picker.value;
  updatePickerFront();
});

// Updates the color picker button background to reflect the current color
function updatePickerFront() {
  color_tool.style.backgroundColor = curr_color;
}

// Tool buttons: selects different drawing tools
tools.forEach((tool) => {
  tool.addEventListener("pointerup", () => {
    if (curr_tool !== tool) {
      selectTool(tool);
    }
  });
});

// Selects a tool and updates the UI to show it as selected
function selectTool(tool) {
  curr_tool.classList.remove("selected-tool");
  tool.classList.add("selected-tool");
  curr_tool = tool;
}

// Eraser button: toggles eraser mode on/off
eraser_tool.addEventListener("pointerup", () => {
  is_erasing = !is_erasing;
  if (is_erasing) {
    eraser_tool.classList.add("selected-tool");
  } else {
    eraser_tool.classList.remove("selected-tool");
  }
});