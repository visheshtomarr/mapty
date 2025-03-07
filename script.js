'use strict';

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

    _setDescription() {
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${months[this.date.getMonth()]} ${this.date.getDate()}`;
    }
}

class Running extends Workout {
    type = 'running';
    constructor(coords, duration, distance, cadence) {
        super(coords, duration, distance);
        this.cadence = cadence;
        this.calculatePace();
        this._setDescription();
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
        this._setDescription();
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
    #mapZoomLevel = 13;
    constructor() {
        // Get user's position.
        this._getPosition();

        // Get data from the local storage.
        this._getLocalStorage();

        // Event handlers.
        form.addEventListener('submit', this._newWorkout.bind(this));
        inputType.addEventListener('change', this._toggleElevationField);
        containerWorkouts.addEventListener('click', this._moveMapToPopup.bind(this));

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
        this.#map = L.map('map').setView(coords, this.#mapZoomLevel);

        L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&key=YOUR_GOOGLE_API_KEY', {
            attribution: '&copy; <a href="https://www.google.com/maps">Google Maps</a>',
        }).addTo(this.#map);

        // Handling clicks on map.
        this.#map.on('click', this._showForm.bind(this));

        // Load markers (if already existing)
        this.#workouts.forEach(workout => this._renderWorkoutMarker(workout));
    }

    _showForm(mapE) {
        this.#mapEvent = mapE;
        form.classList.remove('hidden');
        inputDistance.focus();
    }

    _hideForm() {
        // Empty input fields.
        inputCadence.value = inputDistance.value = inputDuration.value = inputElevation.value = '';
        inputCadence.blur() || inputElevation.blur();
        form.style.display = 'none';
        form.classList.add('hidden');
        setTimeout(() => form.style.display = 'grid', 1000);
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
        this._renderWorkoutMarker(workout);

        // Render workout in the list.
        this._renderWorkout(workout);

        //  Hide form and clear input fields.
        this._hideForm();

        // Store data to local storage.
        this._setToLocalStorage();
    }

    _renderWorkoutMarker(workout) {
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
        .setPopupContent(`${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'} ${workout.description}`)
        .openPopup();
    }

    _renderWorkout(workout) {
        let html = `
            <li class="workout workout--${workout.type}" data-id="${workout.id}">
                <h2 class="workout__title">${workout.description}</h2>
                <div class="workout__details">
                    <span class="workout__icon">${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'}</span>
                    <span class="workout__value">${workout.distance}</span>
                    <span class="workout__unit">km</span>
                </div>
                <div class="workout__details">
                    <span class="workout__icon">⏱</span>
                    <span class="workout__value">${workout.duration}</span>
                    <span class="workout__unit">min</span>
                </div>
        `;

        if (workout.type === 'running') {
            html += `
                <div class="workout__details">
                    <span class="workout__icon">⚡️</span>
                    <span class="workout__value">${workout.pace.toFixed(1)}</span>
                    <span class="workout__unit">min/km</span>
                </div>
                <div class="workout__details">
                    <span class="workout__icon">🦶🏼</span>
                    <span class="workout__value">${workout.cadence}</span>
                    <span class="workout__unit">spm</span>
                </div>
            </li>
            `;
        }
        
        if (workout.type === 'cycling') {
            html += `
                <div class="workout__details">
                    <span class="workout__icon">⚡️</span>
                    <span class="workout__value">${workout.speed.toFixed(1)}</span>
                    <span class="workout__unit">km/h</span>
                </div>
                <div class="workout__details">
                    <span class="workout__icon">🏔️</span>
                    <span class="workout__value">${workout.elevationGain}</span>
                    <span class="workout__unit">m</span>
                </div>
            </li>
            `;
        }

        form.insertAdjacentHTML('afterend', html);
    }

    _moveMapToPopup(e) {
        const workoutEl = e.target.closest('.workout');
        // console.log(workoutEl);
        
        // Guard clause
        if (!workoutEl) return;

        // Finding the correct workout from the 'workouts' list.
        const workout = this
            .#workouts
            .find(workout => workout.id === workoutEl.dataset.id);
        
        this.#map.setView(workout.coords, this.#mapZoomLevel, {
            animate: true,
            pan: {
                duration: 1
            }
        })
    }

    _setToLocalStorage() {
        localStorage.setItem('workouts', JSON.stringify(this.#workouts));
    }

    _getLocalStorage() {
        const data = JSON.parse(localStorage.getItem('workouts'));

        if (!data) return;

        this.#workouts = data;
        this.#workouts.forEach(workout => this._renderWorkout(workout));
    }

    _reset() {
        localStorage.removeItem('workouts');
        location.reload();
    }
}

const app = new App();