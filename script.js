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


let map, mapEvent;

// Getting the latitudes and longitudes of our current location
// through the geolocation API.
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position => {
        const {latitude} = position.coords;
        const {longitude} = position.coords;
        // console.log(`https://www.google.com/maps/@${latitude},${longitude}`);
        const coords = [latitude, longitude];
        map = L.map('map').setView(coords, 13);

        L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&key=YOUR_GOOGLE_API_KEY', {
            attribution: '&copy; <a href="https://www.google.com/maps">Google Maps</a>',
        }).addTo(map);

        // Adding click event to the map.
        map.on('click', function (mapE) {
            mapEvent = mapE;
            form.classList.remove('hidden');
            inputDistance.focus();
        });
    }, () => {
        alert('Could not find your location!');
    });

    // Event handler to submit the form.
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Clear input fields of our form.
        inputDistance.value = inputCadence.value = inputDuration.value = inputElevation.value = '';

        const { lat, lng } = mapEvent.latlng;
        L.marker([lat, lng]).addTo(map)
            .bindPopup(
                L.popup({
                    maxWidth: 250,
                    minWidth: 100,
                    autoClose: false,
                    closeOnClick: false,
                    className: 'running-popup'
                })
            )
            .setPopupContent('Workout')
            .openPopup();
    });

    inputType.addEventListener('change', () => {
        inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
        inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    });

}