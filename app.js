//function to determine marker size based on magnitude
function markerSize(mag) {
    return mag * 4;
}

//function to get color
function getColor(num) {
    if (num > 5) {
        return 'red';
    } else if (num > 4) {
        return 'darkorange';
    } else if (num > 3) {
        return 'orange';
    } else if (num > 2) {
        return 'yellow';
    }else if (num > 1) {
        return 'yellowgreen';
    } else {
        return 'green';
    }
};

// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2014-01-01&endtime=" +
"2014-01-02&maxlongitude=-69.52148437&minlongitude=-123.83789062&maxlatitude=48.74894534&minlatitude=25.16517337";

// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
    // variable to store earthquake info for circleMarkers
    var quakes = data.features;
    //send to GeoJSON
    var earthquakes = L.geoJSON(quakes, {
        pointToLayer: function(feature, latlng) {
            return new L.CircleMarker(latlng, {
                radius: markerSize(feature.properties.mag),
                fillOpacity: 0.7,
                fillColor: getColor(feature.properties.mag),
                weight: 1
            });
        }
    });
    // Once we get a response, send the data.features object to the createFeatures function
    createFeatures(data.features);


function createFeatures(earthquakeData) {

    //create circle markers
    function pointToLayer(feature, latlng) {
        return L.circleMarker(latlng, {
            radius: markerSize(feature.properties.mag)
        })
    };

    function style(feature) {
        return{
            fillColor: getColor(feature.properties.mag)
            fillOpacity: 0.7,
            weight: 0.1,
            color: 'black'
        }
    }

    // Define a function we want to run once for each feature in the features array
    // Give each feature a popup describing the place and time of the earthquake
    function onEachFeature(feature, layer) {
        layer.bindPopup("<h3>" + feature.properties.place +
        "<br>" + "Magnitude: " + feature.properties.mag +
        "</h3><hr><p>" + new Date(feature.properties.time) +
        "<br>" + "Coordinates: (" + feature.geometry.coordinates[1] + ", " + feature.geometry.coordinates[0] + ")</p>");
    }

    // Create a GeoJSON layer containing the features array on the earthquakeData object
    // Run the onEachFeature function once for each piece of data in the array
    var earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: onEachFeature
    });

    // Sending our earthquakes layer to the createMap function
    createMap(earthquakes);
    };
})


function createMap(earthquakes) {
    // Define streetmap and darkmap layers
    var streetmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.streets",
        accessToken: API_KEY
    });

    var darkmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.dark",
        accessToken: API_KEY
    });

    var OpenTopoMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
	    maxZoom: 17,
	    attribution: 'Map data: &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
        accessToken: API_KEY
    });

    // Define a baseMaps object to hold our base layers
    var baseMaps = {
        "Street Map": streetmap,
        "Dark Map": darkmap,
        "Topographic Map": OpenTopoMap
    };

    // Create overlay object to hold our overlay layer
    var overlayMaps = {
        Earthquakes: earthquakes
    };

    // Create our map, giving it the streetmap and earthquakes layers to display on load
    var myMap = L.map("map", {
        center: [
            33.45 , -112.06
        ],
        zoom: 5,
        layers: [streetmap, earthquakes]
    });

    // Create a layer control
    // Pass in our baseMaps and overlayMaps
    // Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);
}
