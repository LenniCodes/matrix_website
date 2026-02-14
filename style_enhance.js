
let scroll_div = document.getElementById("frame-list");

// Frame list scroll: updates gradient visibility based on scroll position
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

// Changes the opacity of the left gradient indicator based on visibility
function changeFrontGradient(isVisible) {
  document.getElementById("gradient-left").style.opacity = isVisible ? "1" : "0";
}

// Changes the opacity of the right gradient indicator based on visibility
function changeBackGradient(isVisible) {
  document.getElementById("gradient-right").style.opacity = isVisible ? "1" : "0";
}