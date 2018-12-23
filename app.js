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
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {

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
                fillColor: getColor(feature.properties.mag),
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
            onEachFeature: onEachFeature,
            pointToLayer:pointToLayer,
            style: style
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

    //adding a legend
    var legend = L.control({
        position: 'bottomright'
    });
    legend.onAdd = function(map) {
        var div = L.DomUtil.create('div', 'info legend'),
            magnitudes = [0,1,2,3,4,5],
            labels = [];
        div.innerHTML += '<h4 style="margin:4px"> Magnitude </h4>'
        //loop and generate color square
        for (var i=0; i<magnitudes.length; i++) {
            div.innerHTML +=
                '<i style="background:' + getColor(magnitudes[i] + 1) + '"></i>' +
                magnitudes[i] + (magnitudes[i+1] ? '&ndash;' + magnitudes[i+1] +'<br>' : '+');
        }

        return div;
    };
    legend.addTo(myMap);
};
