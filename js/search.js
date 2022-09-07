const searchWrapper = document.querySelector(".search-restaurant");
const input = searchWrapper.querySelector("input");
const suggestBox = searchWrapper.querySelector(".auto-complete");

// if user press any key then show below
input.onkeyup = (e) => {
  let userData = e.target.value;
  let emptyArray = [];
  if (userData) {
    emptyArray.filter();
  }
};
