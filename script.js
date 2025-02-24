'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

class Workout {
    date = new Date();
    id = (Date.now() + '').slice(-10);
    
    constructor(coords, duration, distance) {
        this.coords = coords;   // [lat, lng]
        this.duration = duration;   // in minutes
        this.distance = distance;   // in km
    }
}

class Running extends Workout {
    type = 'running';
    constructor(coords, duration, distance, cadence) {
        super(coords, duration, distance);
        this.cadence = cadence;
        this.calculatePace();
    }

    calculatePace() {
        this.pace = this.duration / this.distance;  // min/km
        return this.pace; 
    }
}
class Cycling extends Workout {
    type = 'cycling';
    constructor(coords, duration, distance, elevationGain) {
        super(coords, duration, distance);
        this.elevationGain = elevationGain;
        this.calculateSpeed();
    }

    calculateSpeed() {
        this.speed = this.distance / (this.duration / 60);  // km/hr
        return this.speed;
    }
}

class App {
    #map;
    #mapEvent;
    #workouts = [];
    constructor() {
        this._getPosition();
        // Event handler to submit the form.
        form.addEventListener('submit', this._newWorkout.bind(this));

        // Event handler to detect change in input type.
        inputType.addEventListener('change', this._toggleElevationField);
    }

    // Getting the latitudes and longitudes of our current location
    // through the geolocation API.
    _getPosition() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(this._loadMap.bind(this), () => {
                alert('Could not find your location!');
            });
        }
    }

    _loadMap(position) {
        const { latitude } = position.coords;
        const { longitude } = position.coords;
        const coords = [latitude, longitude];
        this.#map = L.map('map').setView(coords, 13);

        L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&key=YOUR_GOOGLE_API_KEY', {
            attribution: '&copy; <a href="https://www.google.com/maps">Google Maps</a>',
        }).addTo(this.#map);

        // Handling clicks on map.
        this.#map.on('click', this._showForm.bind(this));
    }

    _showForm(mapE) {
        this.#mapEvent = mapE;
        form.classList.remove('hidden');
        inputDistance.focus();
    }

    _toggleElevationField() {
        inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
        inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    }

    _newWorkout(e) {
        e.preventDefault();
        // Function to check whether given no. of inputs are valid or not.
        const validInputs = (...inputs) => 
            inputs.every(input => Number.isFinite(input));

        // Function to check whether given no. of inputs are positive or not.
        const allPositives = (...inputs) =>
            inputs.every(input => input > 0);

        // Get data from the form.
        const type = inputType.value;
        const duration = Number(inputDuration.value);
        const distance = Number(inputDistance.value);
        const { lat, lng } = this.#mapEvent.latlng;
        let workout;

        // Check if the data is valid.
        // If workout is running, we create a running object.
        if (type === 'running') {
            const cadence = Number(inputCadence.value);
            if (
                !validInputs(duration, distance, cadence) || 
                !allPositives(duration, distance, cadence)
            )
                return alert('Input must be a positive number!');
            
            workout = new Running([lat, lng], duration, distance, cadence);
        }
        // If workout is cycling, we create a cycling object.
        if (type === 'cycling') {
            const elevation = Number(inputElevation.value);
            if (
                !validInputs(duration, distance, elevation) || 
                !allPositives(duration, distance)
            )
                return alert('Input must be a positive number!');

            workout = new Cycling([lat, lng], duration, distance, elevation);
        }

        // Add new object to workout array.
        this.#workouts.push(workout);
        // console.log(workout);

        // Render workout on map as marker
        this.renderWorkout(workout);

        // Render workout in the list.

        //  Hide form and clear input fields.
        inputCadence.value = inputDistance.value = inputDuration.value = inputElevation.value = '';
        inputCadence.blur() || inputElevation.blur();
        form.classList.add('hidden');
    }

    renderWorkout(workout) {
        L.marker(workout.coords).addTo(this.#map)
        .bindPopup(
            L.popup({
                maxWidth: 250,
                minWidth: 100,
                autoClose: false,
                closeOnClick: false,
                className: `${workout.type}-popup`
            })
        )
        .setPopupContent(workout.type)
        .openPopup();
    }
}

const app = new App();