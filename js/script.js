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
    // genera la mappa settando latitudine, longitudine e zoom
    let map = L.map('map').setView([results[0].geometry.coordinates[1], results[0].geometry.coordinates[0]], 6);

    // aggiunge il layer di OpenStreetMap alla mappa creata (rende la mappa visibile al client in PNG)
    L.tileLayer('https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    // create the sidebar instance and add it to the map
        var sidebar = L.control.sidebar({ container: 'sidebar' })
        .addTo(map)
        .open('home');

    // add panels dynamically to the sidebar
    sidebar
        .addPanel({
            id:   'js-api',
            tab:  '<i class="fa fa-gear"></i>',
            title: 'JS API',
            pane: '<p>The Javascript API allows to dynamically create or modify the panel state.<p/><p><button onclick="sidebar.enablePanel(\'mail\')">enable mails panel</button><button onclick="sidebar.disablePanel(\'mail\')">disable mails panel</button></p><p><button onclick="addUser()">add user</button></b>',
        })
        // add a tab with a click callback, initially disabled
        .addPanel({
            id:   'mail',
            tab:  '<i class="fa fa-envelope"></i>',
            title: 'Messages',
            button: function() { alert('opened via JS callback') },
            disabled: true,
        })

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

    var userid = 0
    function addUser() {
        sidebar.addPanel({
            id:   'user' + userid++,
            tab:  '<i class="fa fa-user"></i>',
            title: 'User Profile ' + userid,
            pane: '<p>user ipsum dolor sit amet</p>',
        });
    }

    for (let i = 0; i < results.length; i++) {

        let circle = L.circleMarker([results[i].geometry.coordinates[1], results[i].geometry.coordinates[0]], {
            color: 'black',
            fillColor: 'orange',
            fillOpacity: 1,
            radius: 7,
            weight: 0.7
        }).addTo(map);

        let popupText = "<b>" + results[i].properties["title"] + "</b>";
        let popupLink = "<b> <a style='width:100%;text-align:center;' target='_blank' href='http://www.cnn.com'>Click here for details</a> </b>";
        circle.bindPopup(popupText + "<br>" + popupLink);
    }
}