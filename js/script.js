var results = [];

fetch("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson", 
{
    "method": "GET",
})
.then(resp => resp.json())
.then(result=>displayMap(result))
.catch(error => console.log("Si è verificato un errore!: " + error));

// genera la mappa settando latitudine, longitudine e zoom
let map = L.map('map').setView([30, 0], 4);

// crea l'istanza della sidebar e la aggiunge alla mappa
let sidebar = L.control.sidebar({ container: 'sidebar' })
.addTo(map)
.open('home');

function displayMap(response) {
    results = response.features;
    console.log(results);

    // aggiunge i layer alla mappa creata (rende la mappa visibile al client in PNG)
    L.tileLayer('https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
        minZoom: 1,
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    }).addTo(map);

    L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-hybrid/{z}/{x}/{y}{r}.png', {
        attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        subdomains: 'abcd',
        minZoom: 0,
        maxZoom: 19,
    }).addTo(map);

    for (let i = 0; i < results.length; i++) {

        let circle = L.circleMarker([results[i].geometry.coordinates[1], results[i].geometry.coordinates[0]], {
            color: 'black',
            fillColor: 'orange',
            fillOpacity: 1,
            radius: 6,
            weight: 0.7
        }).addTo(map);

        if (results[i].properties["mag"] < 1) {
            circle.setStyle({
                fillColor: 'grey'
            })
        } else if (results[i].properties["mag"] >= 1 && results[i].properties["mag"] < 2) {
            circle.setStyle({
                fillColor: 'lightblue'
            })
        } else if (results[i].properties["mag"] >= 2 && results[i].properties["mag"] < 4) {
            circle.setStyle({
                fillColor: 'yellow'
            })
        } else if (results[i].properties["mag"] >= 4 && results[i].properties["mag"] < 5) {
            circle.setStyle({
                fillColor: 'orange'
            })
        } else if (results[i].properties["mag"] >= 5 && results[i].properties["mag"] < 6) {
            circle.setStyle({
                fillColor: 'red'
            })
        } else if (results[i].properties["mag"] >= 6) {
            circle.setStyle({
                fillColor: 'darkred'
            })
        }

        let popupText = "<b>" + results[i].properties["title"] + "</b>";
        let popupLink = "<b> <a target='_blank' href='http://www.cnn.com'>Click here for details</a> </b>";
        circle.bindPopup(popupText + "<br>" + popupLink);
    }

    populateTable(results);
}

function populateTable(results) {
    let table_body = document.getElementById("table");
    table_body.innerHTML = "";

    for (let i = 0; i < results.length; i++) {

        let data = new Date(results[i].properties["time"]);
        let tr = document.createElement('tr');

        tr.innerHTML = `
            <td> <button style="font-size: 12px;" class="btn btn-outline-primary btn-sm" onclick="moveTo(${i})">${results[i].properties["place"]}</button> </td>
            <td>${data.toLocaleString()}</td> 
            <td>${((results[i].properties["mag"]).toFixed(2))} </td>
        `;
            table_body.appendChild(tr);
    }
}

function moveTo(index) {
   map.flyTo(new L.LatLng(results[index].geometry.coordinates[1], results[index].geometry.coordinates[0]), 15, {
        "animate": true,
        "duration": 7
    }); 
}

function sortTable() {
    let selectValue = document.getElementById("sort").value;
    let modified = [];

    if (selectValue == 1) {    
        modified = results.sort((a, b) => {
            return b.properties["mag"] - a.properties["mag"]
        });
    } else if (selectValue == 2) {
        modified = results.sort((a, b) => {
            return a.properties["mag"] - b.properties["mag"]
        });
    } else if (selectValue == 3) {
        modified = results.sort((a, b) => {
            return (new Date(b.properties["time"])) - (new Date(a.properties["time"]))
        });
    } else if (selectValue == 4) {
        modified = results.sort((a, b) => {
            return (new Date(a.properties["time"])) - (new Date(b.properties["time"]))
        });
    }
    populateTable(modified);
}