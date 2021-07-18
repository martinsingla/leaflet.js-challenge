
function colorSelector(value){
    if(value < 10){
        return '#1a9850'
    } else if (value > 10 & value < 30) {
        return '#91cf60'
    } else if (value > 30 & value < 50) {
        return '#d9ef8b'
    } else if (value > 50 & value < 70) {
        return '#fee08b'
    } else if (value > 70 & value < 90) {
        return '#fc8d59'
    } else {
        return '#d73027'
    }
}

//////////////////////////////////////////////////////////////////////
// Base Tiles

// Satelite View Tile (ESRI)
var ESRI = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/ESRI",
    accessToken: API_KEY
});

// Open Tool Map Tile (OTM)
var OTM = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
    tileSize: 512,
    maxZoom: 17,
    zoomOffset: -1,
    id: "mapbox/OTM",
    accessToken: API_KEY
});

// Black and White View Tile (CARTO)
var CARTO = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
	subdomains: 'abcd',
	maxZoom: 19,
    tileSize: 512,
    zoomOffset: -1,
    id: "mapbox/Carto",
    accessToken: API_KEY
});

// Base Tile Controler
var baseMaps = {
    'Satellite View (ESRI)': ESRI,
    'Open Tool Map (OTM)': OTM,
    'B&W View (Carto)': CARTO
};

//////////////////////////////////////////////////////////////////////
// Overlay Maps

// Tectonic Plates
var tectonic_plates = new L.LayerGroup()
d3.json(plates_data).then(plates_data, function() {
    L.geoJson(plates_data, {
        style: {
            color: 'red',
            fillColor: 'transparent',
            fillOpacity: 0.5,
            weight: 2
        }
    }).addTo(tectonic_plates);
});

// Earthwake data

var earthwake_dat = new L.LayerGroup()
var query = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson'
d3.json(query).then(function(data) {
    L.geoJson(data, {
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, {
                radius: feature.properties.mag * 2,
                fillColor: colorSelector(feature.geometry.coordinates[2]),
                color: 'transparent',
                weight: 0.5,
                opacity: 0.8,
                fillOpacity: 0.8
            }).bindPopup('<h3>Earthwake</h3><h4>Location:</h4>' + feature.properties.place + '<h4>Magnitude:</h4>' + feature.properties.mag + ' Richter Mag. Scale' + 
            '<h4>USGS Code:</h4>' + feature.properties.code);
        }
    }).addTo(earthwake_dat);
});

// Layer Selector
var layerMaps = {
    'Tectonic Plates': tectonic_plates,
    'Earthwakes': earthwake_dat
}


//////////////////////////////////////////////////////////////////////
// Base Map
var myMap = L.map('map', {
    center: [10.81, -33.48],
    zoom: 3,
    layers: [ESRI, tectonic_plates, earthwake_dat]
});

L.control.layers(baseMaps, layerMaps, {collapsed:false}).addTo(myMap);

//////////////////////////////////////////////////////////////////////
// Legend

var legend = L.control({position: 'bottomright'});

legend.onAdd = function (myMap) {

    var div = L.DomUtil.create('div', 'info legend'),
        grades = [10, 30, 50, 70, 90];

    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            `<i style=background: ${colorSelector(grades[i] + 1)} ></i>` +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }

    return div;
};

legend.addTo(myMap);
