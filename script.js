const OPEN_CAGE_API_KEY = 'c34e29c1c3cb4633839af7cf72ab224e';  // OpenCage API Key for location
const OPEN_WEATHER_API_KEY = '8b12ac433523f9f24fba9932331ca42e';  // OpenWeather API Key for weather

let map = L.map('map').setView([51.505, -0.09], 13);

// Add OpenStreetMap tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

let routeControl = L.Routing.control({
    waypoints: [],
    routeWhileDragging: true
}).addTo(map);

// Default mode: car
let routeMode = 'car';

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

    // Update the routing control with the new location as a starting point
    routeControl.spliceWaypoints(0, 1, L.latLng(lat, lng));
}

// Function to change transport mode
function changeTransportMode() {
    routeMode = document.getElementById('transportMode').value;
    updateRoute();
}

// Function to update route based on the selected mode of transport
function updateRoute() {
    // Define the available routing profiles for car, bike, walk
    let routeProfiles = {
        'car': 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        'bike': 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        'walk': 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    };

    // Clear existing waypoints
    routeControl.setWaypoints([]);

    // If the mode is car, bike, or walk, we add routing
    if (routeMode === 'car' || routeMode === 'bike' || routeMode === 'walk') {
        L.Routing.control({
            waypoints: [L.latLng(51.505, -0.09), L.latLng(51.515, -0.1)],
            router: L.Routing.osrmv1({
                profile: routeMode
            }),
            routeWhileDragging: true
        }).addTo(map);
    }
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

        // Display the distance result
        distanceResult.innerHTML = `Distance between ${locationInput} and ${destinationInput} is ${distance.toFixed(2)} km.`;

        // Plot the route between the two locations on the map
        routeControl.setWaypoints([L.latLng(startLat, startLng), L.latLng(endLat, endLng)]);
    });
}

// Function to get user's current location
function getUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            // Center the map on user's location
            map.setView([lat, lon], 13);

            // Add a marker at the user's location
            L.marker([lat, lon]).addTo(map)
                .bindPopup("You are here")
                .openPopup();

            // Update routing control with the user's location as the starting point
            routeControl.spliceWaypoints(0, 1, L.latLng(lat, lon));
        });
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}
