const frame_duration = 100;

const play_button = document.getElementById("play-button");
const next_button = document.getElementById("next-button");
const previous_button = document.getElementById("previous-button");

let playing = false;

// Play button: toggles animation play/pause
play_button.addEventListener("pointerup", () => {
  triggerPlayPause();
});

// Spacebar key up: triggers play/pause with keyboard
document.addEventListener("keyup", (event) => {
  if (event.key == " " || event.code == "Space") {
    triggerPlayPause();
    event.preventDefault();
  }
});

// Toggles the play/pause state of the animation and updates the button icon
function triggerPlayPause() {
  playing = !playing;
  if (playing) {
    play_button.innerHTML = '<img src="assets/icons/pause.svg">';
    playAnimation();
  } else {
    play_button.innerHTML = '<img src="assets/icons/play_arrow.svg">';
  }
}

// Next button: advances to the next frame
next_button.addEventListener("pointerup", () => {
  skipFrame(1);
});

// Right arrow key down: advances to the next frame
document.addEventListener("keydown", (event) => {
  if (event.code == "ArrowRight") {
    skipFrame(1);
  }
});

// Previous button: goes back to the previous frame
previous_button.addEventListener("pointerup", () => {
  skipFrame(-1);
});

// Left arrow key down: goes back to the previous frame
document.addEventListener("keydown", (event) => {
  if (event.code == "ArrowLeft") {
    skipFrame(-1);
  }
});

// Advances the current frame by the specified direction (1 for next, -1 for previous)
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

// Plays the animation by incrementing the frame and scheduling the next frame
function playAnimation() {
  if (!playing) return;
  let next_frame = (curr_frame + 1) % getFrameCount();
  setCurrFrame(next_frame);
  focusPreview();
  setTimeout(playAnimation, frame_duration);
}

// Sets the current frame to the specified index and updates UI accordingly
function setCurrFrame(frame_index) {
  if (curr_frame === frame_index) return;
  if (frame_index < 0 || frame_index >= getFrameCount()) return;

  Array.from(frame_list.children).forEach((preview) => {
    preview.classList.remove("selected-preview");
  });

  curr_frame = frame_index;
  let new_preview = getCurrPreview();
  curr_preview = new_preview;

  new_preview.classList.add("selected-preview");

  transferFromPreview();
}

// Scrolls the frame list to center the current frame in the viewport
function focusPreview() {
  let curr_frame = getCurrPreview();
  curr_frame.scrollIntoView({
    //behavior: 'smooth',
    inline: "center",
    block: "nearest",
  });
}