

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
    "esri/Graphic",
    "esri/geometry/Point",
    // ensures the DOM is available before executing code.
    "dojo/domReady!"
], function (
    Locator,
    Map,
    MapView,
    Graphic,
    Search,
    Point) {
        var meetPoint = {
            type: "point", // autocasts as new Point()
            longitude: -49.97,
            latitude: 41.73
        };
        // Create a graphic and add the geometry and symbol to it
        var pointGraphic = new Graphic({
            geometry: point,
            symbol: markerSymbol
        });

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
            //Center map to closest location
            var lat = event.results[0].results[0].extent.center.latitude; //get lat from 1st address result
            var long = event.results[0].results[0].extent.center.longitude; //get long from 1st address result

            centerMap(view, Point, lat, long); //center map

            console.log("Search started.");
            console.log("results", event)
            console.log("result", event.target.searchTerm)
            searchTermGiphy = event.target.searchTerm

            database.ref().update({
                searchTermGiphy: event.target.searchTerm
            })
            createGif();
        });

        view.on(function (event) {
            view.popup.open({
                // Set the popup's title to the coordinates of the clicked location
                title: "Reverse geocode: [" + lon + ", " + lat + "]",
                location: event.mapPoint // Set the location of the popup to the clicked location
            });
        })

        view.on("click", function (event) {
            event.stopPropagation();

            // Get the coordinates of the click on the view
            // around the decimals to 3 decimals
            var lat = Math.round(event.mapPoint.latitude * 1000) / 1000;
            var lon = Math.round(event.mapPoint.longitude * 1000) / 1000;
            console.log("This is the Jacob Branch");

            database.ref().update({
                lat: lat,
                lon: lon
            })

<<<<<<< HEAD



=======
            
            meetupAPI();
            setTimeout(function() {
                database.ref().once("value").then(function (snap) {
                    var eventName;
                    eventName = snap.val().eventName
                    view.popup.open({
                        // Set the popup's title to the coordinates of the clicked location
                        title: eventName,
                        content: lat + " " + lon,
                        location: {latitude: snap.val().eventLat, longitude: snap.val().eventLon} // Set the location of the popup to the clicked location
                    });
                })
            }, 1000)

            console.log("map", event.mapPoint);
            
            

>>>>>>> 87ac048f7c17f8d60afeeb26344a080fa438c18f
            // Execute a reverse geocode using the clicked location
            locatorTask.locationToAddress(event.mapPoint).then(function (response) {
                console.log("response", response)
                console.log("City", response.attributes.City)
                console.log("PLace Name", response.attributes.PlaceName)
                database.ref().update({
                    searchTermGiphy: response.attributes.City
                })
                createGif();
                // If an address is successfully found, show it in the popup's content
                view.popup.content = response.address;
                console.log(view.popup.content)
            }).catch(function (err) {
                // If the promise fails and no result is found, show a generic message
                view.popup.content = "No address was found for this location";
            });

            centerMap(view, Point, lat, lon);
        });
    });

function centerMap(view, Point, lat, lon) {
<<<<<<< HEAD
=======

>>>>>>> 87ac048f7c17f8d60afeeb26344a080fa438c18f
    var pt = new Point({
        latitude: lat,
        longitude: lon
    });

    // go to the given point
    view.goTo(pt);
}

console.log('hello')
// Initialize Firebase
var config = {
    apiKey: "AIzaSyCHcwv7DP-PmycL-kcR7RVl4RrIWI6M358",
    authDomain: "photoaggregator-b3ee4.firebaseapp.com",
    databaseURL: "https://photoaggregator-b3ee4.firebaseio.com",
    projectId: "photoaggregator-b3ee4",
    storageBucket: "photoaggregator-b3ee4.appspot.com",
    messagingSenderId: "793722329004"
};
firebase.initializeApp(config);

var database = firebase.database();

database.ref().update({
    something: "something"
})

// ==================================================================================================
// ============================ Create Gifs ==========================================================
// ==================================================================================================

// database.ref("/searchTermGiphy").on("value", function (snap) {
//     var searchTermGiphy = snap.val()
//     console.log("searchTermGiphy", searchTermGiphy);
//     var emptyArray = [];
//     var searchTermGiphy;
//     var queryURL = "https://api.giphy.com/v1/gifs/search?q=" + searchTermGiphy + "&api_key=4yRpEILyq50dh9npI0IKoifeIPUZKgdT&rating=pg&limit=10";
//     // var queryURL = "https://pixabay.com/api/?key=9333797-288852953f23c75ab55a617e3&q=" + searchTermGiphy + "=photo";

//     var createGif = function () {

//         $("#gif-div").empty();
//         //call on API to get info
//         console.log("queryURL", queryURL)

//         //ajax call to api to obtain info to put on site
//         $.ajax({
//             url: queryURL,
//             method: 'GET'

//         }).then(function (response) {

//             for (i = 0; i < 10; i++) {

//                 var results = response.data;
//                 var imgURL = results[i].images.downsized.url;
//                 console.log(results);
//                 // var picDiv = $('<div>').addClass("pic-div float");
//                 // var image = $('<img>').attr('src', imgURL);
//                 // picDiv.append(image);
//                 // $("#gif-div").append(picDiv);

//                 var cardCol = $("<div>").addClass("col s12 m4");
//                 $("#gif-div").append(cardCol);

//                 var card = $("<div>").addClass("card small");
//                 $(cardCol).append(card);

//                 cardImage = $("<div>");
//                 $(cardImage).addClass("card-image");
//                 $(card).append(cardImage);

//                 var img = $("<img>").attr("src", imgURL);
//                 $(cardImage).append(img);

//                 var cardContent = $("<div>");
//                 $(cardContent).addClass("card-content");
//                 $(card).append(cardContent);

//                 var cardTitle = $("<span>");
//                 $(cardTitle).addClass("card-title");
//                 $(cardTitle).text("Placeholder");
//                 $(cardContent).append(cardTitle);

//                 // var cardp = $("<p>");
//                 // $(cardp).text("Rating: " + gifRating);
//                 // $(cardContent).append(cardTitle);

//                 var cardAction = $("<div>");
//                 $(cardAction).addClass("card-action");
//                 $(card).append(cardAction);

//                 var a = $("<a>");
//                 $(a).attr("href", "#");
//                 $(a).text("Download");
//                 $(cardAction).append(a);
//                 console.log("ran")

//             }
//         });
//     }
//     createGif();
// })


// ==================================================================================================
// ============================ Meetup API ==========================================================
// ==================================================================================================


var meetupAPI = function () {

    database.ref().once("value").then(function (snap) {
        var url = "https://api.meetup.com/find/upcoming_events?&key=413e32034783f3038f567864804610&lat=" + snap.val().lat + "&lon=" + snap.val().lon + "&sign=true&photo-host=public&page=20";
        $.ajax({

            dataType: 'jsonp',
            method: 'get',
            url: url,
            success: function (result) {
                // console.log('back with ' + result.data.length +' results');
                console.log(result);
<<<<<<< HEAD
                var signedURL = result.data.events;
                for (var i = 0; i < signedURL.length; i++) {
                    var meetupDetails = [];
                    var grouplabel = signedURL[i].group.name;
                    var groupLat = signedURL[i].group.lat;
                    var groupLon = signedURL[i].group.lon;
                    console.log('group: ' + grouplabel + ', lat: ' + groupLat + ', lon: ' + groupLon);
                }
=======

                database.ref().update({
                    eventName: result.data.events["6"].name,
                    eventLat: result.data.events["6"].venue.lat ,
                    eventLon: result.data.events["6"].venue.lon
                })

>>>>>>> 87ac048f7c17f8d60afeeb26344a080fa438c18f
            }
        });

    })

}
<<<<<<< HEAD
meetupAPI();
=======
>>>>>>> 87ac048f7c17f8d60afeeb26344a080fa438c18f
