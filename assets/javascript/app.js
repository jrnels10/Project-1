require([
    // loads code specific to creating a map
    "esri/Map",
    // loads code that allows for viewing the map in 2D(Switch MapView to SceneView to turn map 3D)
    "esri/views/MapView",
    "esri/widgets/Search",
    // ensures the DOM is available before executing code.
    "dojo/domReady!"
], function (
    Map,
    SceneView,
    Search) {

        var map = new Map({
            basemap: "streets",
            ground: "world-elevation"
        });

        var view = new SceneView({
            scale: 123456789,
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
    });
    console.log('hello')
