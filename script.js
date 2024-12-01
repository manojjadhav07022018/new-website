let map, directionsService, directionsRenderer;
let currentTravelMode = 'DRIVING'; // Default travel mode is car
let userLatLng = null;

// Function to initialize the map
function initMap() {
    // Default map center (New York)
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 40.7128, lng: -74.0060 },
        zoom: 13
    });

    // DirectionsService and DirectionsRenderer to handle routing
    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer();
    directionsRenderer.setMap(map);  // Display route on the map

    // Try to get the user's current location and center the map on it
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            userLatLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            map.setCenter(userLatLng);
        }, function() {
            alert("Geolocation failed.");
        });
    }
}

// Change travel mode based on user input
function changeTravelMode() {
    currentTravelMode = document.getElementById('mode').value;
}

// Get and display the route from start to end
function calculateRoute() {
    const start = document.getElementById('start').value;
    const end = document.getElementById('end').value;

    if (!start || !end) {
        alert("Please enter both start and end locations.");
        return;
    }

    const request = {
        origin: start,
        destination: end,
        travelMode: google.maps.TravelMode[currentTravelMode]
    };

    directionsService.route(request, function(result, status) {
        if (status === google.maps.DirectionsStatus.OK) {
            directionsRenderer.setDirections(result);
        } else {
            alert("Directions request failed due to " + status);
        }
    });
}

// Use geolocation to set the user's location as the starting point
function geolocateUser() {
    if (userLatLng) {
        document.getElementById('start').value = 'Current Location';
        calculateRoute();
    } else {
        alert("Unable to detect your location.");
    }
}
