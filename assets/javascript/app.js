// Initialize Firebase
var config = {
    apiKey: "AIzaSyCHcwv7DP-PmycL-kcR7RVl4RrIWI6M358",
    authDomain: "photoaggregator-b3ee4.firebaseapp.com",
    databaseURL: "https://photoaggregator-b3ee4.firebaseio.com",
    projectId: "photoaggregator-b3ee4",
    storageBucket: "",
    messagingSenderId: "793722329004"
};
firebase.initializeApp(config);

var database = firebase.database();


// ==================================================================================================
// ============================ Map API =============================================================
// ==================================================================================================

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
    MapView,
    Search) {

        var locatorTask = new Locator({
            url: "https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer"
        })

        var maplocation = new Map({
            basemap: "streets",
            ground: "world-elevation"

        });

        var view = new MapView({
            scale: 20000000,
            center: [-99.53613281247335, 36.77409249463308],
            container: "viewDiv",
            map: maplocation
        });
        // to search by name on map
        var searchWidget = new Search({
            view: view
        });

        // Add the search widget to the top right corner of the view
        view.ui.add(searchWidget, {
            position: "top-right"
        });
        searchWidget.on("search-complete", function (event) {
            console.log("Search started.");
            console.log("results", event)
            console.log("result", event.target.searchTerm)
            searchTermGiphy = event.target.searchTerm

            database.ref().update({
                searchTermGiphy: event.target.searchTerm
            })
            createGif();
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
                console.log("response", response)
                console.log("City", response.attributes.City)
                console.log("PLace Name", response.attributes.PlaceName)
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
// .target.results["0"].results["0"].name

// ==================================================================================================
// ============================ Giphy API =============================================================
// ==================================================================================================
// var emptyArray = [];
// var searchTermGiphy;
// var queryURL = "https://api.giphy.com/v1/gifs/search?q=" + searchTermGiphy + "&api_key=4yRpEILyq50dh9npI0IKoifeIPUZKgdT&limit=10";

// var createGif = function () {

//     $("#gif-div").empty();
//     //call on API to get info
//     console.log("queryURL", queryURL)

//     $.ajax({
//         url: queryURL,
//         method: 'GET'

//     }).then(function (response) {

//         for (i = 0; i < 10; i++) {

//             var results = response.data;
//             var imgURL = results[i].images.downsized.url;
//             console.log(results);
//             var picDiv = $('<div>').addClass("pic-div float");
//             var image = $('<img>').attr('src', imgURL);
//             picDiv.append(image);
//             $("#gif-div").append(picDiv);
//         }
//     });
// }
// createGif();


database.ref("/searchTermGiphy").on("value", function (snap) {
    var searchTermGiphy = snap.val()
    console.log("searchTermGiphy", searchTermGiphy);
    var emptyArray = [];
    var searchTermGiphy;
    var queryURL = "https://api.giphy.com/v1/gifs/search?q=" + searchTermGiphy + "&api_key=4yRpEILyq50dh9npI0IKoifeIPUZKgdT&limit=10";

    var createGif = function () {

        $("#gif-div").empty();
        //call on API to get info
        console.log("queryURL", queryURL)

        $.ajax({
            url: queryURL,
            method: 'GET'

        }).then(function (response) {

            for (i = 0; i < 10; i++) {

                var results = response.data;
                var imgURL = results[i].images.downsized.url;
                console.log(results);
                var picDiv = $('<div>').addClass("pic-div float");
                var image = $('<img>').attr('src', imgURL);
                picDiv.append(image);
                $("#gif-div").append(picDiv);
            }
        });
    }
    createGif();
})



/////////////////////////////////
// function newSearch () {

//     $('#gif-div').empty();

// for (i = 0; i < emptyArray.length; i++) {

// }
