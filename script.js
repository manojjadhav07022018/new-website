let map, routingMachine;
let userLatLng = null;

// Initialize the map
function initMap() {
    map = L.map('map').setView([51.505, -0.09], 13);  // Default location: London

    // OpenStreetMap Tile Layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    // Initialize routing machine
    routingMachine = L.Routing.control({
        waypoints: [],
        routeWhileDragging: true,
        createMarker: function() { return null; } // No markers for waypoints
    }).addTo(map);
}

// Geolocate the user
function geolocateUser() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            userLatLng = [position.coords.latitude, position.coords.longitude];
            map.setView(userLatLng, 13);  // Set map center to user's location
            L.marker(userLatLng).addTo(map).bindPopup('You are here').openPopup();
        });
    } else {
        alert("Geolocation is not supported by your browser.");
    }
}

// Calculate route between start and end locations
function calculateRoute() {
    const start = document.getElementById('start').value;
    const end = document.getElementById('end').value;

    if (!start || !end) {
        alert("Please enter both start and end locations.");
        return;
    }

    // Use OpenCage Geocoding API to convert locations to lat/lng
    fetch(`https://api.opencagedata.com/geocode/v1/json?q=${start}&key=c34e29c1c3cb4633839af7cf72ab224e`)
        .then(response => response.json())
        .then(data => {
            const startCoords = data.results[0].geometry;
            const startLatLng = [startCoords.lat, startCoords.lng];

            fetch(`https://api.opencagedata.com/geocode/v1/json?q=${end}&key=c34e29c1c3cb4633839af7cf72ab224e`)
                .then(response => response.json())
                .then(data => {
                    const endCoords = data.results[0].geometry;
                    const endLatLng = [endCoords.lat, endCoords.lng];

                    // Update waypoints in the routing machine
                    routingMachine.setWaypoints([startLatLng, endLatLng]);

                    // Fetch and display weather info for destination
                    getWeather(endCoords.lat, endCoords.lng);
                });
        })
        .catch(error => {
            console.error("Error calculating route:", error);
        });
}

// Fetch weather info for the destination
function getWeather(lat, lon) {
    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=8b12ac433523f9f24fba9932331ca42e`)
        .then(response => response.json())
        .then(data => {
            const weatherInfo = `
                <strong>${data.weather[0].description}</strong><br>
                Temperature: ${Math.round(data.main.temp - 273.15)}°C<br>
                Humidity: ${data.main.humidity}%<br>
                Wind: ${data.wind.speed} m/s
            `;
            document.getElementById('weather').innerHTML = weatherInfo;
        })
        .catch(error => {
            console.error("Error fetching weather data:", error);
        });
}

// Initialize map when the page loads
window.onload = initMap;
