let map, directionsService, directionsRenderer;
let currentTravelMode = 'DRIVING'; // Default to driving
let userLatLng = null;

// Google Maps styling (Professional look like Google Maps)
const mapStyle = [
    { "elementType": "geometry", "stylers": [{ "color": "#212121" }] },
    { "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] },
    { "elementType": "labels.text.fill", "stylers": [{ "color": "#757575" }] },
    { "elementType": "labels.text.stroke", "stylers": [{ "color": "#212121" }] },
    { "featureType": "administrative", "elementType": "geometry", "stylers": [{ "color": "#757575" }] },
    { "featureType": "administrative.country", "elementType": "labels.text.fill", "stylers": [{ "color": "#9e9e9e" }] },
    { "featureType": "landscape.man_made", "elementType": "geometry.fill", "stylers": [{ "color": "#6b6b6b" }] },
    { "featureType": "landscape.natural", "elementType": "geometry.fill", "stylers": [{ "color": "#8e8e8e" }] },
    { "featureType": "poi", "elementType": "geometry", "stylers": [{ "color": "#2e2e2e" }] },
    { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [{ "color": "#8a8a8a" }] },
    { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#5c5c5c" }] },
    { "featureType": "road.arterial", "elementType": "geometry", "stylers": [{ "color": "#5c5c5c" }] },
    { "featureType": "road.local", "elementType": "geometry", "stylers": [{ "color": "#5c5c5c" }] },
    { "featureType": "transit", "elementType": "geometry", "stylers": [{ "color": "#5c5c5c" }] },
    { "featureType": "transit.station", "elementType": "labels.text.fill", "stylers": [{ "color": "#8a8a8a" }] },
    { "featureType": "water", "elementType": "geometry.fill", "stylers": [{ "color": "#3a3a3a" }] }
];

// Initialize the map
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 40.7128, lng: -74.0060 }, // Default: New York City
        zoom: 13,
        styles: mapStyle // Apply professional styling
    });

    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer();
    directionsRenderer.setMap(map);

    // If geolocation is supported, center the map based on user's location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            userLatLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            map.setCenter(userLatLng);
        }, function() {
            alert("Geolocation failed.");
        });
    }
}

// Change the travel mode (car, bike, walk, public transport)
function changeTravelMode() {
    currentTravelMode = document.getElementById('mode').value;
}

// Calculate and display the route
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

// Use user's current location to set the start point
function geolocateUser() {
    if (userLatLng) {
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ 'location': userLatLng }, function(results, status) {
            if (status === 'OK' && results[0]) {
                document.getElementById('start').value = results[0].formatted_address;
            }
        });
    } else {
        alert("Unable to retrieve your location.");
    }
}
