const locationUrl = "https://zomatoajulypi.herokuapp.com/location";
const restUrl = "https://zomatoajulypi.herokuapp.com/restaurant?stateId=";
const locationEl = document.querySelector("#location");
const restaurants = document.querySelector("#restaurants");
let x = document.querySelector(".icon");
let y = document.querySelector(".temp");
// const apiKey = "d53b30e762e1e9d395a2c30f3e4cca52";
// const units = "metric";
// const url = `https://api.openweathermap.org/data/2.5/weather?q=${query}&appid=${apiKey}&units=${units}`;

const callLocation = async function (url) {
  const location = await fetch(url);
  const data = await location.json();

  data.map((location) => {
    let markup = document.createElement("option");
    let stateName = document.createTextNode(location.state);
    markup.appendChild(stateName);
    markup.value = location.state_id;
    locationEl.appendChild(markup);
  });
};

const callRest = async function () {
  let locationValue = locationEl.value;
  if (restaurants.length > 0) restaurants.innerHTML = "";

  const restaurant = await fetch(`${restUrl}${locationValue}`);
  const data = await restaurant.json();
  data.map((rest) => {
    let markup = document.createElement("option");
    let restName = document.createTextNode(rest.restaurant_name);

    markup.appendChild(restName);
    restaurants.appendChild(markup);
  });
};

function geolocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition);
    console.log(showPosition);
  } else {
    x.innerText = "Geo Not Supported";
  }
}
function showPosition(data) {
  // console.log(data);
  let latitude = data.coords.latitude;
  let longitude = data.coords.longitude;
  const url = `https://api.openweathermap.org/data/2.5/forecast/daily?lat=${latitude}&lon=${longitude}&mode=json&units=metric&cnt=5&appid=fbf712a5a83d7305c3cda4ca8fe7ef29`;
  //api calling
  // https://api.openweathermap.org/data/2.5/weather?q=${query}&appid=${apiKey}&units=${units}

  fetch(url)
    //return promise
    .then((res) => res.json())
    // resolve promise
    .then((data) => {
      let icon = data.list[0].weather[0].icon;
      // console.log(cityName);
      let temp = data.list[0].temp.day;
      const imgURL = `http://openweathermap.org/img/wn/${icon}@2x.png`;

      x.src = imgURL;
      y.innerHTML = `${temp}° C`;
    });

  // x.innerText = `Latitude is ${latitude} and Longitude is ${longitude}`;
}
callLocation(locationUrl);
locationEl.onchange = callRest;
window.addEventListener("load", geolocation);
