let url = "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=" + startDate + "&endtime=" + endDate;

var results = [];
var currentPage = Number(document.getElementById("page-number").innerHTML);
var mapSpinner = document.getElementById("map-spinner");
var mapDiv = document.getElementById("map");

document.getElementById("wildfires-link").href = "/html/wildfires.html?startDate=" + startDate + "&endDate=" + endDate + "";
document.getElementById("floods-link").href = "/html/floods.html?startDate=" + startDate + "&endDate=" + endDate + "";

mapDiv.classList.add("blur");
mapSpinner.style.display = "block";
fetch(url, {
    "method": "GET",
})
.then(resp => resp.json())
.then(result=>displayMap(result))
.catch(error => console.log("Si è verificato un errore!: " + error));

function getColor(mag) {
    return mag < 1 ? 'grey' :
           mag >= 1 & mag < 2 ? 'lightblue' :
           mag >= 2 & mag < 4  ? 'yellow' :
           mag >= 4 & mag < 5  ? 'orange' :
           mag >= 5 & mag < 6  ? 'red' :
           mag >= 6 ? 'darkred' :
                      'white';
}
// genera la mappa settando latitudine, longitudine e zoom
var map = L.map('map').setView([30, 0], 4);

// crea l'istanza della sidebar e la aggiunge alla mappa
var sidebar = L.control.sidebar({ container: 'sidebar' }).addTo(map);

// crea un layer di markers e li raggruppa in un cluster
var markers = L.markerClusterGroup();

var legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'info legend');
    grades = [-1, 1, 2, 4, 5, 6];
    div.innerHTML += "<b>Magnitude</b><br><br>";
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(grades[i]) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i+1] + '<br>' : '+') + '<br>';
    }
    return div;
};

legend.addTo(map);

function displayMap(response) {
    console.log(response);
    mapDiv.classList.remove("blur");
    mapSpinner.style.display = "none";
    results = response.features;
    console.log(results)
    // aggiunge layer alla mappa creata (rende la mappa visibile al client come immagine)
    L.tileLayer('https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 16,
        minZoom: 2,
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    }).addTo(map);

    L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-hybrid/{z}/{x}/{y}{r}.png', {
        subdomains: 'abcd',
        maxZoom: 16,
        minZoom: 2,
        attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    for (let i = 0; i < results.length; i++) {

        let circle = L.circleMarker([results[i].geometry.coordinates[1], results[i].geometry.coordinates[0]], {
            color: 'black',
            fillColor: 'orange',
            fillOpacity: 1,
            radius: 6,
            weight: 0.7
        });

        circle.setStyle({
            fillColor: getColor(results[i].properties["mag"])
        });
        
        markers.addLayer(circle);

        let popupText = "<b>" + results[i].properties["title"] + "</b>" + "<br>" +
        "<b>Latitude</b>" + ": " + results[i].geometry.coordinates[1] + "<br>" +
        "<b>Longitude</b>" + ": " + results[i].geometry.coordinates[0] + "<br>" +
        "<b>Depth</b>" + ": " + results[i].geometry.coordinates[2] + "<br>" +
        "<b>Event type</b>" + ": " + results[i].properties["type"];
        circle.bindPopup(popupText);
    }
    map.addLayer(markers);
    populateTable(results.slice(0, 10));
    document.getElementById("page-number").innerHTML = currentPage + " / " + Math.ceil(results.length / 10);
}

function populateTable(results) {
    let table_body = document.getElementById("table");
    table_body.innerHTML = "";

    for (let i = 0; i < results.length; i++) {
        let data = new Date(results[i].properties["time"]);
        let tr = document.createElement("tr");
        
        let latLng = [results[i].geometry.coordinates[1], results[i].geometry.coordinates[0]];
        let place = results[i].properties["place"];
        if (place == null) place = "Unknown location";

        tr.innerHTML = `
            <td> 
            <button style="font-size: 12px;" class="btn btn-outline-primary btn-sm" onclick="moveTo(${latLng})">
                ${place} </button> </td>
            <td>${data.toLocaleString()}</td> 
            <td>${((results[i].properties["mag"]).toFixed(2))} </td>
        `;
        table_body.appendChild(tr);
    }
}

function moveTo(lat, lng) {
    map.flyTo(new L.LatLng(lat, lng), 16, {
        "animate": true,
        "duration": 6
    });
}

function sortTable() {
    let selectValue = document.getElementById("sort").value;

    if (selectValue == "mag-asc") {
        results.sort((a, b) => {
            return b.properties["mag"] - a.properties["mag"]
        });
    } else if (selectValue == "mag-desc") {
        results.sort((a, b) => {
            return a.properties["mag"] - b.properties["mag"]
        });
    } else if (selectValue == "newest") {
        results.sort((a, b) => {
            return (new Date(b.properties["time"])) - (new Date(a.properties["time"]))
        });
    } else if (selectValue == "oldest") {
        results.sort((a, b) => {
            return (new Date(a.properties["time"])) - (new Date(b.properties["time"]))
        });
    }   
    populateTable(results.slice(0, 10));
    currentPage = 1;
    document.getElementById("page-number").innerHTML = "1 / " + Math.ceil(results.length / 10);
}

function previousPage() {
    if (currentPage > 1) {
        currentPage--;
        let pageResults = results.slice((currentPage - 1) * 10, currentPage * 10);
        populateTable(pageResults);
        document.getElementById("page-number").innerHTML = currentPage + " / " + Math.ceil(results.length / 10);
    } else {
        currentPage = Math.ceil(results.length / 10);
        let pageResults = results.slice((currentPage - 1) * 10, currentPage * 10);
        populateTable(pageResults);
        document.getElementById("page-number").innerHTML = currentPage + " / " + Math.ceil(results.length / 10);
    }
}

function nextPage() {
    if (currentPage < results.length / 10) {
        currentPage++;
        let pageResults = results.slice((currentPage - 1) * 10, currentPage * 10);
        populateTable(pageResults);
        document.getElementById("page-number").innerHTML = currentPage + " / " + Math.ceil(results.length / 10);
    } else {
        currentPage = 1;
        let pageResults = results.slice((currentPage - 1) * 10, currentPage * 10);
        populateTable(pageResults);
        document.getElementById("page-number").innerHTML = currentPage + " / " + Math.ceil(results.length / 10);
    }
}