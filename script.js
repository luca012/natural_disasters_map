let results = [];

fetch("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson", 
{
    "method": "GET",
})
.then(resp => resp.json())
.then(result=>displayMap(result))
.catch(error => console.log("Si è verificato un errore!" + error));

function displayMap(response) {
    results = response.features;

    // genera la mappa settando latitudine, longitudine e zoom
    let map = L.map('map').setView([results[0].geometry.coordinates[1], results[0].geometry.coordinates[0]], 6);

    // aggiunge il layer di OpenStreetMap alla mappa creata (rende la mappa visibile al client in PNG)
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    for (let i = 0; i < results.length; i++) {
        let circle = L.circle([results[i].geometry.coordinates[1], results[i].geometry.coordinates[0]], {
            color: 'red',
            fillColor: '#f03',
            fillOpacity: 0.5,
            radius: 500
        }).addTo(map);

        circle.bindPopup(results[i].properties["title"]);
    }
}