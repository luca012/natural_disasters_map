function getDifferenceBetweenDates() {
    return (new Date(endDate) - new Date(startDate)) / (1000 * 3600 * 24);
}

function convertTime(time) {
    if (time.length == 1) {
        time = "000" + time;
    } else if (time.length == 2) {
        time = "00" + time;
    } else if (time.length == 3) {
        time = "0" + time;
    }
    let hours = time.substring(0, 2);
    let minutes = time.substring(2, 4);

    return hours + ":" + minutes;
}

function getFormattedDate(date, time) {
    let formatted = new Date(date + " " + convertTime(time));
    return (formatted.toLocaleString()).substring(0, 15);
}

let url = "https://firms.modaps.eosdis.nasa.gov/api/area/csv/92317e974dc2057ade12ec3906a41677/VIIRS_SNPP_NRT/world/" + getDifferenceBetweenDates() + "/" + startDate + "/";
var results = [];
var currentPage = Number(document.getElementById("page-number").innerHTML);
var mapSpinner = document.getElementById("map-spinner");
var tableSpinner = document.getElementById("table-spinner");
var mapDiv = document.getElementById("map");
var tableTag = document.getElementById("table-tag");
var paginationDiv = document.getElementById("pagination");

function csvToJSON(csv) {
    var lines = csv.split("\n");
    var js_object_response = [];
    var headers = lines[0].split(",");
    for (var i = 1; i < lines.length; i++) {
        var obj = {};
        var currentLine = lines[i].split(",");
        for (var j = 0; j < headers.length; j++) {
            obj[headers[j]] = currentLine[j];
        }
        js_object_response.push(obj);
    }
    return js_object_response;
}

document.getElementById("earthquakes-link").href = "/html/earthquakes.html?startDate=" + startDate + "&endDate=" + endDate + "";
document.getElementById("floods-link").href = "/html/floods.html?startDate=" + startDate + "&endDate=" + endDate + "";

mapDiv.classList.add("blur");
mapSpinner.style.display = "block";
fetch(url, {
    "method": "GET",
})
.then(resp => resp.text())
.then(result => displayMap(csvToJSON(result)))
.catch(error => console.log("1) Si è verificato un errore!: " + error));

// genera la mappa settando latitudine, longitudine e zoom
var map = L.map('map').setView([30, 0], 4);

// crea l'istanza della sidebar e la aggiunge alla mappa
var sidebar = L.control.sidebar({ container: 'sidebar' }).addTo(map);

// crea un layer di markers e li raggruppa in un cluster
var markers = L.markerClusterGroup();

function displayMap(response) {
    mapDiv.classList.remove("blur");
    mapSpinner.style.display = "none";
    results = response;

    console.log(response);
    // aggiunge layer alla mappa creata (rende la mappa visibile al client in PNG)
    L.tileLayer('https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
        maxZoom: 13,
        minZoom: 2,
    }).addTo(map);

    L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-hybrid/{z}/{x}/{y}{r}.png', {
        attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        subdomains: 'abcd',
        maxZoom: 13,
        minZoom: 2, 
    }).addTo(map);

    for (let i = 0; i < results.length; i++) {

        let circle = L.circleMarker([results[i].latitude, results[i].longitude], {
            color: 'black',
            fillColor: 'red',
            fillOpacity: 1,
            radius: 6,
            weight: 0.7
        });
        markers.addLayer(circle);

        let popupText = "<b>Latitude: </b>" + results[i].latitude + "<br>" +
        "<b>Longitude: </b>" + results[i].longitude + "<br>" +
        "<b>DateTime: </b>" + getFormattedDate(results[i].acq_date, results[i].acq_time) + "<br>" +
        "<b>Confidence: </b>" + results[i].confidence + "<br>" +
        "<b>Frp: </b>" + results[i].frp + "<br>" +
        "<b>Daynight: </b>" + results[i].daynight + "<br>" +
        "<b>Satellite: </b>" + results[i].satellite + "<br>" +
        "<b>Instrument: </b>" + results[i].instrument + "<br>" +
        "<b>Version: </b>" + results[i].version + "<br>" +
        "<b>Brightness: </b>" + results[i].bright_ti5 + "<br>" +
        "<b>Scan: </b>" + results[i].scan + "<br>" +
        "<b>Track: </b>" + results[i].track + "<br>"
        "<b> <a href='https://www.earthdata.nasa.gov/learn/find-data/near-real-time/firms/viirs-i-band-375-m-active-fire-data'> Info about parameters </a> <br>";
        circle.bindPopup(popupText);
    }
    map.addLayer(markers);
    
    populateTable(results.slice(0, 10));
    document.getElementById("page-number").innerHTML = currentPage + " / " + Math.ceil(results.length / 10);
}

async function populateTable(results) {
    let table_body = document.getElementById("table");
    table_body.innerHTML = "";

    let places = [];
    
    for (let i = 0; i < results.length; i++) {

        let geocodingUrl = "https://nominatim.openstreetmap.org/reverse?format=geojson&lat=" 
        + results[i].latitude + "&lon=" + results[i].longitude +"&zoom=10&addressdetails=0";
        
        tableTag.classList.add("blur");
        tableSpinner.style.display = "block";
        paginationDiv.style.display = "none";

        const request = await fetch(geocodingUrl, {
            "method": "GET",
        })

        const geocodingResult = await request.json();

        let formattedDate = getFormattedDate(results[i].acq_date, results[i].acq_time);
        let tr = document.createElement("tr");
        let latLng = [(results[i].latitude), (results[i].longitude)];
        tr.innerHTML = `
            <td>
            <button style="font-size: 12px;" class="btn btn-outline-primary btn-sm" onclick="moveTo(${latLng})">
                ${geocodingResult.features[0].properties.display_name}  </button> </td>
            <td>${formattedDate}</td>
            <td>${results[i].bright_ti5}</td>
        `;
        places.push(tr);
    }


    for (let i = 0; i < places.length; i++) {
        table_body.appendChild(places[i]);
    }
    tableTag.classList.remove("blur");
    tableSpinner.style.display = "none";
    paginationDiv.style.display = "block";
}

function moveTo(lat, lng) {
    map.flyTo(new L.LatLng(lat, lng), 13, {
        "animate": true,
        "duration": 6
    });
}

function sortTable() {
    let selectValue = document.getElementById("sort").value;
    let modified = [];

    if (selectValue == "bright-desc") {
        modified = results.sort((a, b) => {
            return b.bright_ti5 - a.bright_ti5
        });
    } else if (selectValue == "bright-asc") {
        modified = results.sort((a, b) => {
            return a.bright_ti5 - b.bright_ti5
        });
    } else if (selectValue == "newest") {
        modified = results.sort((a, b) => {
            return (new Date(getFormattedDate(b.acq_date, b.acq_time)) 
            - (new Date(getFormattedDate(a.acq_date, a.acq_time))))
        });
    } else if (selectValue == "oldest") {
        modified = results.sort((a, b) => {
            return (new Date(getFormattedDate(a.acq_date, a.acq_time)) 
            - (new Date(getFormattedDate(b.acq_date, b.acq_time))))
        });
    }
    populateTable(modified.slice(0, 10));
    currentPage = 1;
    document.getElementById("page-number").innerHTML = "1 / " + Math.ceil(modified.length / 10);
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