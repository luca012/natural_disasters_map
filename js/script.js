let results = [];


fetch("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson", 
{
    "method": "GET",
})
.then(resp => resp.json())
.then(result=>displayMap(result))
.catch(error => console.log("Si è verificato un errore!: " + error));

function displayMap(response) {
    results = response.features;
    console.log(results);   
    // genera la mappa settando latitudine, longitudine e zoom
    let map = L.map('map').setView([results[0].geometry.coordinates[1], results[0].geometry.coordinates[0]], 6);

    // aggiunge il layer di OpenStreetMap alla mappa creata (rende la mappa visibile al client in PNG)
    L.tileLayer('https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    }).addTo(map);

    // create the sidebar instance and add it to the map
        var sidebar = L.control.sidebar({ container: 'sidebar' })
        .addTo(map)
        .open('home');

    // be notified when a panel is opened
    sidebar.on('content', function (ev) {
        switch (ev.id) {
            case 'autopan':
            sidebar.options.autopan = true;
            break;
            default:
            sidebar.options.autopan = false;
        }
    });

    for (let i = 0; i < results.length; i++) {

        let circle = L.circleMarker([results[i].geometry.coordinates[1], results[i].geometry.coordinates[0]], {
            color: 'black',
            fillColor: 'orange',
            fillOpacity: 1,
            radius: 7,
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

    let table_body = document.getElementById("table");

    for (let i = 0; i < results.length; i++) {
    
    let data = new Date(results[i].properties["time"]);
    let tr = document.createElement('tr');

    tr.innerHTML = `     
        <td> <a style="color:blue" class="move-to">${results[i].properties["place"]}</a> </td>
        <td>${data}</td>  
        <td>${((results[i].properties["mag"]).toFixed(2))} </td>
    `;

        table_body.appendChild(tr);
    }

    let places = document.getElementsByClassName("move-to");
    
    function moveTo() {
        map.setView(new L.LatLng(results[10].geometry.coordinates[1], results[10].geometry.coordinates[0]), 13);
    }

    for (let i = 0; i < places.length; i++) {
        places[i].addEventListener("click", moveTo);
    }
}