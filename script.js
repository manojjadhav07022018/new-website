const OPEN_CAGE_API_KEY = 'c34e29c1c3cb4633839af7cf72ab224e';
const OPEN_WEATHER_API_KEY = '8b12ac433523f9f24fba9932331ca42e';

// Initialize the Leaflet map
let map = L.map('map').setView([51.505, -0.09], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

// Function to get weather and location information
async function getWeather() {
    const locationInput = document.getElementById('location').value;
    const weatherResult = document.getElementById('weatherResult');

    if (locationInput === '') {
        alert("Please enter a location.");
        return;
    }

    // Fetch location data from OpenCage API
    const locationResponse = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(locationInput)}&key=${OPEN_CAGE_API_KEY}`);
    const locationData = await locationResponse.json();

    if (locationData.results.length === 0) {
        weatherResult.innerHTML = 'Location not found. Please try again.';
        return;
    }

    const { lat, lng } = locationData.results[0].geometry;
    const city = locationData.results[0].formatted;

    // Fetch weather data from OpenWeather API
    const weatherResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${OPEN_WEATHER_API_KEY}&units=metric`);
    const weatherData = await weatherResponse.json();

    if (weatherData.cod !== 200) {
        weatherResult.innerHTML = 'Weather information not available.';
        return;
    }

    // Display weather information
    weatherResult.innerHTML = `
        <h2>Weather in ${city}</h2>
        <p><strong>Temperature:</strong> ${weatherData.main.temp}°C</p>
        <p><strong>Humidity:</strong> ${weatherData.main.humidity}%</p>
        <p><strong>Weather:</strong> ${weatherData.weather[0].description}</p>
        <p><strong>Wind Speed:</strong> ${weatherData.wind.speed} m/s</p>
    `;

    // Update map with location marker
    map.setView([lat, lng], 13);
    L.marker([lat, lng]).addTo(map)
        .bindPopup(`<b>${city}</b><br>Latitude: ${lat}, Longitude: ${lng}`)
        .openPopup();
}

// Function to calculate distance between two locations
function calculateDistance() {
    const locationInput = document.getElementById('location').value;
    const destinationInput = document.getElementById('destination').value;
    const distanceResult = document.getElementById('distanceResult');

    if (locationInput === '' || destinationInput === '') {
        alert("Please enter both locations.");
        return;
    }

    // Fetch location data for both the starting and destination locations
    Promise.all([
        fetch(`https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(locationInput)}&key=${OPEN_CAGE_API_KEY}`),
        fetch(`https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(destinationInput)}&key=${OPEN_CAGE_API_KEY}`)
    ])
    .then(responses => Promise.all(responses.map(response => response.json())))
    .then(data => {
        const start = data[0].results[0].geometry;
        const end = data[1].results[0].geometry;

        if (!start || !end) {
            distanceResult.innerHTML = "One or both locations not found.";
            return;
        }

        const startLat = start.lat, startLng = start.lng;
        const endLat = end.lat, endLng = end.lng;

        // Calculate the distance using the Haversine formula (in km)
        const R = 6371; // Radius of Earth in km
        const dLat = (endLat - startLat) * Math.PI / 180;
        const dLng = (endLng - startLng) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(startLat * Math.PI / 180) * Math.cos(endLat * Math.PI / 180) *
                  Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c; // Distance in km

        distanceResult.innerHTML = `Distance between locations: ${distance.toFixed(2)} km`;
    })
    .catch(err => {
        distanceResult.innerHTML = "Error calculating distance.";
    });
}
