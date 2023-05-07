let url = "https://www.gdacs.org/gdacsapi/api/events/geteventlist/SEARCH?fromDate=" + startDate + "&toDate=" + endDate + "&alertlevel=Green;Orange;Red&eventlist=FL";
var results = [];
var currentPage = Number(document.getElementById("page-number").innerHTML);

function getFormattedDate(date) {
    date = new Date(date);
    return date.toLocaleString();
}

document.getElementById("earthquakes-link").href = "/html/earthquakes.html?startDate=" + startDate + "&endDate=" + endDate + "";
document.getElementById("wildfires-link").href = "/html/wildfires.html?startDate=" + startDate + "&endDate=" + endDate + "";

fetch(url, {
    "method": "GET",
})
.then(resp => resp.json())
.then(result=>displayMap(result))
.catch(error => console.log("Si è verificato un errore!: " + error));

function getColor(alertLevel) {
    return alertLevel >= 0 && alertLevel < 1 ? 'green' :
           alertLevel >= 1 && alertLevel < 2 ? 'orange' :
           alertLevel >= 2 && alertLevel < 3 ? 'red' : 
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
    grades = [0, 1, 2];
    div.innerHTML += " <a target='_blank' href='https://www.gdacs.org/Knowledge/models_FL.aspx'> <b>Alert score </a> </b><br><br>";
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(grades[i]) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i+1] + '<br>' : '+') + '<br>';
    }

    return div;
};

legend.addTo(map);

function displayMap(response) {

    results = response.features;
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
            fillColor: getColor(results[i].properties["alertscore"])
        });
        
        markers.addLayer(circle);

        let popupText = "<b>" + results[i].properties["name"] + "</b>" + "<br>" + 
                        "<b>" + "Alert level: " + "</b>" + results[i].properties["alertscore"] + "<br>" +
                        "<b>" + "IsCurrent: " + "</b>" + results[i].properties["iscurrent"] + "<br>" +
                        "<b>" + "From date: " + "</b>" + getFormattedDate(results[i].properties["fromdate"]) + "<br>" +
                        "<b>" + "To date: " + " </b>" + getFormattedDate(results[i].properties["todate"]) + "<br>";
        let popupLink = `<b> <a target='_blank' href='${results[i].properties.url["report"]}'>Click here for details</a> </b>`;
        circle.bindPopup(popupText + "<br>" + popupLink);
    }
    map.addLayer(markers);
    populateTable(results.slice(0, 10));
    document.getElementById("page-number").innerHTML = currentPage + " / " + Math.ceil(results.length / 10);
}

function populateTable(results) {
    let table_body = document.getElementById("table");
    table_body.innerHTML = "";

    for (let i = 0; i < results.length; i++) {
        let data = getFormattedDate(results[i].properties["fromdate"]);
        let tr = document.createElement("tr");
        
        let latLng = [results[i].geometry.coordinates[1], results[i].geometry.coordinates[0]];
        let place = results[i].properties["country"];
        if (place == null) place = "Unknown location";

        tr.innerHTML = `
            <td> 
            <button style="font-size: 12px;" class="btn btn-outline-primary btn-sm" onclick="moveTo(${latLng})">
                ${place} </button> </td>
            <td>${data}</td> 
            <td>${results[i].properties["alertscore"]} </td>
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

    if (selectValue == "alert-desc") {
        results.sort((a, b) => {
            return b.properties["alertscore"] - a.properties["alertscore"]
        });
    } else if (selectValue == "alert-asc") {
        results.sort((a, b) => {
            return a.properties["alertscore"] - b.properties["alertscore"]
        });
    } else if (selectValue == "newest") {
        results.sort((a, b) => {
            return (new Date(b.properties["fromdate"])) - (new Date(a.properties["fromdate"]))
        });
    } else if (selectValue == "oldest") {
        results.sort((a, b) => {
            return (new Date(a.properties["fromdate"])) - (new Date(b.properties["fromdate"]))
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