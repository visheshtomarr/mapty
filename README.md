# Mapty - Workout Tracking App

Mapty is a simple workout tracking application that allows users to log their running and cycling activities on a map. The app uses geolocation to display the user's current location and allows them to add workouts by clicking on the map. Workouts are saved in local storage, so they persist even after the page is refreshed.

## Features

- **Geolocation**: Automatically detects the user's current location and centers the map on it.
- **Workout Logging**: Users can log running and cycling workouts by clicking on the map and filling out a form.
- **Workout Details**: Each workout includes details such as distance, duration, pace (for running), speed (for cycling), and elevation gain (for cycling).
- **Local Storage**: Workouts are saved in the browser's local storage, so they persist across page reloads.
- **Interactive Map**: The map is interactive, allowing users to click to add workouts and view existing workouts.

## Technologies Used

- **HTML5**: For structuring the web page.
- **CSS3**: For styling the application.
- **JavaScript**: For handling the logic and interactivity.
- **Leaflet.js**: For rendering the interactive map.
- **Google Maps Tiles**: For displaying the map tiles.

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/visheshtomarr/mapty.git
2. Open the index.html file in your browser.

## Customization

*   **Google Maps API Key**: If you want to use your own Google Maps API key, replace `YOUR_GOOGLE_API_KEY` in the `script.js` file with your actual API key.
    
*   **Styling**: You can customize the app's appearance by modifying the `style.css` file.
    

## Credits

*   **Jonas Schmedtmann**: The original design and concept of this project are based on @[jonasschmedtmann](https://github.com/jonasschmedtmann)'s work. You can find more about him on [Twitter](https://twitter.com/jonasschmedtman).
    

## License

This project is licensed under the MIT License. Feel free to use it for learning purposes or in your portfolio. However, do not use it to teach or claim it as your own.