let map, routingMachine;
let currentTravelMode = 'DRIVING';
let userLatLng = null;

// Initialize the map
function initMap() {
    map = L.map('map').setView([51.505, -0.09], 13);  // Default location: London

    // Custom Map Tile Layer (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    // Routing Machine for calculating routes
    routingMachine = L.Routing.control({
        waypoints: [],
        routeWhileDragging: true,
        createMarker: function() { return null; } // Disable marker for route
    }).addTo(map);
}

// Geolocation functionality
function geolocateUser() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            userLatLng = [position.coords.latitude, position.coords.longitude];
            map.setView(userLatLng, 13);  // Center map to user location
            L.marker(userLatLng).addTo(map).bindPopup('You are here').openPopup();
        });
    } else {
        alert("Geolocation not supported.");
    }
}

// Change travel mode (car, walking, bike, transit)
function changeTravelMode() {
    currentTravelMode = document.getElementById('mode').value;
}

// Calculate route between start and end locations
function calculateRoute() {
    const start = document.getElementById('start').value;
    const end = document.getElementById('end').value;

    if (!start || !end) {
        alert("Please enter both start and end locations.");
        return;
    }

    // Use OpenCage Geocoding API to convert locations to latitude and longitude
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

                    // Set waypoints and get directions
                    routingMachine.setWaypoints([startLatLng, endLatLng]);

                    // Fetch weather for destination
                    getWeather(endCoords.lat, endCoords.lng);
                });
        });
}

// Fetch weather info for destination
function getWeather(lat, lon) {
    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=8b12ac433523f9f24fba9932331ca42e`)
        .then(response => response.json())
        .then(data => {
            const weather = `Weather: ${data.weather[0].description}<br>Temperature: ${Math.round(data.main.temp - 273.15)}°C`;
            document.getElementById('weather').innerHTML = weather;
        });
}

// Initialize map when the page loads
window.onload = initMap;
