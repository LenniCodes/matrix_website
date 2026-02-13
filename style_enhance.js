
let scroll_div = document.getElementById("frame-list");

scroll_div.addEventListener("scroll", () => {
  if (scroll_div.scrollLeft > 0) {
    changeFrontGradient(true);
  } else {
    changeFrontGradient(false);
  }

  if (scroll_div.scrollLeft + scroll_div.clientWidth < scroll_div.scrollWidth - 10) {
    changeBackGradient(true);
  } else {
    changeBackGradient(false);
  }
});
function changeFrontGradient(isVisible) {
  document.getElementById("gradient-left").style.opacity = isVisible ? "1" : "0";
}

function changeBackGradient(isVisible) {
  document.getElementById("gradient-right").style.opacity = isVisible ? "1" : "0";
}

// TODO: automatic frame selection