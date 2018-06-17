require([
    "esri/tasks/Locator",
    // loads code specific to creating a map
    "esri/Map",
    // loads code that allows for viewing the map in 2D(Switch MapView to SceneView to turn map 3D)
    "esri/views/MapView",
    "esri/widgets/Search",
    // ensures the DOM is available before executing code.
    "dojo/domReady!"
], function (
    Locator,
    Map,
    SceneView,
    Search) {

        var locatorTask = new Locator({
            url: "https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer"
        })

        var map = new Map({
            basemap: "streets",
            ground: "world-elevation"
        });

        var view = new SceneView({
            scale: 24000,
            container: "viewDiv",
            map: map
        });

        var searchWidget = new Search({
            view: view
        });

        // Add the search widget to the top right corner of the view
        view.ui.add(searchWidget, {
            position: "top-right"
        });


        view.on("click", function (event) {
            event.stopPropagation();

            // Get the coordinates of the click on the view
            // around the decimals to 3 decimals
            var lat = Math.round(event.mapPoint.latitude * 1000) / 1000;
            var lon = Math.round(event.mapPoint.longitude * 1000) / 1000;

            view.popup.open({
                // Set the popup's title to the coordinates of the clicked location
                title: "Reverse geocode: [" + lon + ", " + lat + "]",
                location: event.mapPoint // Set the location of the popup to the clicked location
            });
            // Execute a reverse geocode using the clicked location
            locatorTask.locationToAddress(event.mapPoint).then(function (response) {
                console.log(response.FindAsync)
                // If an address is successfully found, show it in the popup's content
                view.popup.content = response.address;
                console.log(view.popup.content)
            }).catch(function (err) {
                // If the promise fails and no result is found, show a generic message
                view.popup.content = "No address was found for this location";
            });
        });
    });
console.log('hello')
