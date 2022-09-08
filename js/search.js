const searchWrapper = document.querySelector(".search-restaurant");
const inputData = document.querySelector("input");
const suggestBox = document.querySelector(".search-results");
const url = "https://poke-us.herokuapp.com/mealtype";

let suggestions = [];

const typesOfMeal = async function () {
  try {
    const meals = await fetch(url);
    const data = await meals.json();
    data.map((item) => {
      suggestions.push([item.mealtype, item.mealtype_id]);
    });
  } catch (e) {
    console.error(e);
  }
};
typesOfMeal();

// if user press any key then show below
inputData.onkeyup = (e) => {
  let userData = e.target.value;
  let emptyArray = [];
  if (userData) {
    emptyArray = suggestions.filter((data) => {
      return data[0]
        .toLocaleLowerCase()
        .startsWith(userData.toLocaleLowerCase());
    });
    emptyArray = emptyArray.map((data) => {
      // console.log(data);
      return (data = `<li value="${data[1]}">${data[0]}</li>`);
    });
    suggestBox.classList.add("active-Search");
    showSuggestions(emptyArray);
    let allList = suggestBox.querySelectorAll("li");
    allList.forEach((item) => {
      // console.log(item);
      item.setAttribute("onclick", "select(this)");
    });
  } else {
    suggestBox.classList.remove("active-Search");
  }
};

function select(element) {
  let selectUserData = element.value;
  console.log(selectUserData);
}

function showSuggestions(list) {
  let listData;
  if (!list.length) {
    suggestBox.classList.remove("active-Search");
  } else {
    listData = list.join("");
  }
  suggestBox.innerHTML = listData;
}
