"use strict";

// prettier-ignore
//const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector(".form");
const containerWorkouts = document.querySelector(".workouts");
const inputType = document.querySelector(".form__input--type");
const inputDistance = document.querySelector(".form__input--distance");
const inputDuration = document.querySelector(".form__input--duration");
const inputCadence = document.querySelector(".form__input--cadence");
const inputElevation = document.querySelector(".form__input--elevation");
const signin = document.getElementById("submit");
const username = document.getElementById("Uname");
const password = document.getElementById("pwd");
//let workout;
const latitude = 51.5044913;
const longitude = -0.0586754;

class Workout {
  date = new Date();
  id = (Date.now() + " ").slice(-10);
  clicks = 0;
  constructor(coords, distance, duration) {
    this.coords = coords;
    this.distance = distance; // in km
    this.duration = duration; //in min
    this._setDescription();
    this.click();
  }

  _setDescription() {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    this.description = `${this.type} on ${
      months[this.date.getMonth()]
    } ${this.date.getDate()}`;
  }

  click() {
    this.clicks++;
  }
}

class Running extends Workout {
  type = "running";
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    // this.type = "running";
    this.countPace();
    this._setDescription();
  }
  countPace() {
    //min&km
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}

class Cycling extends Workout {
  type = "cycling";
  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    this.elevationGain = elevationGain;
    //this.type = "cycling";
    this.countSpeed();
    this._setDescription();
  }
  countSpeed() {
    //km/hr
    this.speed = this.distance / this.duration;
    return this.speed;
  }
}

/*
const run1 = new Running([39, -12], 5.2, 24, 134);
const cycle = new Cycling([39, -12], 5.2, 24, 134);
console.log(run1, cycle);
*/

//////////////introduction////////////////////
introJs()
  .setOptions({
    steps: [
      {
        title: "Welcome!😉",
        intro: "This is running && cycling, marking your workout now👈",
      },
      {
        title: "Marking a position👐",
        element: document.querySelector("#map"),
        intro:
          "Firstly, you are able to click randomly on the map showing a marker😜",
      },
      {
        title: "Showing a workout👋",
        element: document.querySelector("#form"),
        intro:
          "And then😋, this will show a form hoping you fill in your options😏",
      },
    ],
    showProgress: true,
  })
  .start();

///////////application architechture///////
class App {
  #map;
  #mapEvent;
  #workouts = [];

  constructor() {
    // this._getPosition();
    this._loadMap(latitude, longitude);

    // attach event handlers(form),inputType,containerWorkout addeventlistener
    form.addEventListener("submit", this._newWorkout.bind(this));
    inputType.addEventListener("change", this._toggleElevationField);

    containerWorkouts.addEventListener("click", this._moveToPopup.bind(this));
  }

  /*
  _getPosition() {
    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          alert("could not get your position");
        }
      );
  }
*/
  _loadMap(position) {
    /* 
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    console.log(position);
    console.log(`https://www.google.pt/maps/@${latitude},${longitude}`);
    */
    const coords = [latitude, longitude];
    this.#map = L.map("map").setView(coords, 13);
    //console.log(map);

    L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    //handling clicks on map
    this.#map.on("click", this._showForm.bind(this));
    this.#workouts.forEach((work) => {
      this._renderWorkerMarker(work);
    });
  }

  _showForm(mapE) {
    this.#mapEvent = mapE;
    form.classList.remove("hidden");
    inputDistance.focus();
    //console.log(mapEvent);
  }

  _hiddenForm() {
    //Empty inputs
    inputDistance.value =
      inputDuration.value =
      inputCadence.value =
      inputElevation.value =
        "";
    form.style.display = "none";
    form.classList.add("hidden");
    setTimeout(() => (form.style.display = "grid"), 1000);
  }

  _toggleElevationField() {
    inputElevation.closest(".form__row").classList.toggle("form__row--hidden");
    inputCadence.closest(".form__row").classList.toggle("form__row--hidden");
  }

  _newWorkout(e) {
    const validInput = (...inputs) =>
      inputs.every((inp) => Number.isFinite(inp));
    const allPositive = (...inputs) => inputs.every((inp) => inp > 0);

    e.preventDefault();

    // get data from form
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const { lat, lng } = this.#mapEvent.latlng;
    let workout;

    //if workout is running; running create runing object
    if (type === "running") {
      const cadence = +inputCadence.value;
      // identify if workout is a positive integer
      if (
        /*
        !Number.isFinite(distance) ||
        !Number.isFinite(cadence) ||
        !Number.isFinite(duration)
        */
        !validInput(distance, duration, cadence) ||
        !allPositive(distance, duration, cadence)
      ) {
        return alert("please enter a positive number");
      }
      workout = new Running([lat, lng], distance, duration, cadence, type);
    }

    // if workout is cycling; cycling create cycling object
    if (type === "cycling") {
      const elevation = +inputElevation.value;
      if (
        // identify if workout is a positive integer
        !validInput(distance, duration, elevation) ||
        !allPositive(distance, duration, elevation)
        /*
        !Number.isFinite(distance) ||
        !Number.isFinite(cadence) ||
        !Number.isFinite(elevation)
        */
      ) {
        return alert("please enter a positive number");
      }
      workout = new Cycling([lat, lng], distance, duration, elevation, type);
    }
    //add workout list
    //console.log(workout);

    this.#workouts.push(workout);
    // render workout on map as marker
    this._renderWorkerMarker(workout);
    //render workout
    this._renderWorkout(workout);
    //hide form+ clear input field
    this._hiddenForm();
  }

  _renderWorkerMarker(workout) {
    //icon setting
    const myIcon = L.icon({
      iconUrl: "tuceng5.png",
      iconSize: [45, 45],
      iconAnchor: [26, 79],
      popupAnchor: [-3, -76],
    });

    //setting marker to on map
    L.marker(workout.coords, { icon: myIcon })
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnclick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent(
        `${workout.type === "running" ? "🏃‍♂️" : "🚴‍♀️"} ${workout.description}`
      )
      .openPopup();
  }

  _renderWorkout(workout) {
    let html = `<li class="workout workout--${workout.type}" data-id="${
      workout.id
    }" >
        <h2 class="workout__title">${workout.description}</h2>
        <div class="workout__details">
          <span class="workout__icon">${
            workout.type === "running" ? "🏃‍♂️" : "🚴‍♀️"
          }</span>
          <span class="workout__value">${workout.distance}</span>
          <span class="workout__unit">km</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">⏱</span>
          <span class="workout__value">${workout.duration}</span>
          <span class="workout__unit">min</span>
        </div>
      `;
    if (workout.type === "running")
      html += `<div class="workout__details">
    <span class="workout__icon">⚡️</span>
    <span class="workout__value">${workout.pace.toFixed(1)}</span>
    <span class="workout__unit">min/km</span>
  </div>
  <div class="workout__details">
    <span class="workout__icon">🦶🏼</span>
    <span class="workout__value">${workout.cadence}</span>
    <span class="workout__unit">spm</span>
  </div>`;

    if (workout.type === "cycling")
      html += `<div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.speed.toFixed(1)}</span>
            <span class="workout__unit">km/h</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⛰</span>
            <span class="workout__value">${workout.elevationGain}</span>
            <span class="workout__unit">m</span>
          </div></li>`;
    form.insertAdjacentHTML("afterend", html);
  }

  _moveToPopup(e) {
    const workoutEl = e.target.closest(".workout");
    //console.log(workoutEl);
    if (!workoutEl) return;
    const workout = this.#workouts.find(
      (work) => work.id === workoutEl.dataset.id
    );

    this.#map.setView(workout.coords, 13, {
      animate: true,
      pan: {
        duration: 0.75,
        easeLinearity: 0.5,
      },
    });
    //using the pulic interface;
    //workout.click();

    //renderopup
    this._renderWorkerMarker(workout);
  }
}

const app = new App();
