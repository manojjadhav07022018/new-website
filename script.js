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

let routeMode = 'car'; // Default route mode is car

// Function to change the transport mode
function changeTransportMode() {
    routeMode = document.getElementById('transportMode').value;
    updateRoute();
}

// Function to update the route based on the selected mode
function updateRoute() {
    const startInput = document.getElementById('location').value;
    const endInput = document.getElementById('destination').value;

    if (!startInput || !endInput) {
        alert("Please provide both the start and destination locations.");
        return;
    }

    // Fetch locations and update route
    Promise.all([
        fetch(`https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(startInput)}&key=${OPEN_CAGE_API_KEY}`),
        fetch(`https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(endInput)}&key=${OPEN_CAGE_API_KEY}`)
    ])
    .then(responses => Promise.all(responses.map(response => response.json())))
    .then(data => {
        const start = data[0].results[0].geometry;
        const end = data[1].results[0].geometry;

        if (!start || !end) {
            alert("Could not find one or both locations.");
            return;
        }

        const startLat = start.lat, startLng = start.lng;
        const endLat = end.lat, endLng = end.lng;

        // Update the route using Leaflet Routing Machine
        routeControl.setWaypoints([L.latLng(startLat, startLng), L.latLng(endLat, endLng)]);

        // Change routing profile based on selected transport mode
        routeControl.getRouter().options.profile = routeMode;
    });
}

// Function to get the user's location and set it as the starting point
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

            // Update the location input field
            document.getElementById('location').value = `Latitude: ${lat}, Longitude: ${lon}`;

            // Set user's location as start point in the route
            routeControl.spliceWaypoints(0, 1, L.latLng(lat, lon));
        });
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}
