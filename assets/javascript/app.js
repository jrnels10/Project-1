// ==================================================================================================
// ============================ Map API =============================================================
// ==================================================================================================
var mapOne;
var mapTwo;
var mapThree;
var view;
require([
    "esri/tasks/Locator",
    // loads code specific to creating a map
    "esri/Map",
    // loads code that allows for viewing the map in 2D(Switch MapView to SceneView to turn map 3D)
    "esri/views/MapView",
    "esri/Graphic",
    "esri/widgets/Search",
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

        //definition for: hybri. Try one of these: "streets", "satellite",
        //"hybrid", "terrain", "topo", "gray", "dark-gray", "oceans", "national-geographic",
        //"osm", "dark-gray-vector", "gray-vector", "streets-vector", "topo-vector",
        //"streets-night-vector", "streets-relief-vector", "streets-navigation-vector"
        mapOne = new Map({
            basemap: "hybrid",
        });
        mapTwo = new Map({
            basemap: 'gray-vector',
        })
        mapThree = new Map({
            basemap: 'streets',
        })

        var locatorTask = new Locator({
            url: "https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer"
        })

        var maplocation = new Map({
            basemap: "streets",

        });

        view = new MapView({
            scale: 20000000,
            center: [-99.53613281247335, 36.77409249463308],
            container: "viewDiv",
            map: mapOne
        });
        //REMOVE EVENTS FROM DATABASE SO THE POINTS DONT SHOW UP FROM PREVIOUS SEARCHES
        database.ref("/events").remove();
        
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
            //THIS IS A FIX FOR CENTERING ON CONTINETS
            var alias_usa = ["usa", "united states", "united states of america", "america"];

            if (alias_usa.indexOf(event.target.searchTerm.toLowerCase()) !== -1) {
                long = -99.771;
                lat = 38.22;
                console.log("test");
            }

            var alias_canada = ["can", "canada"];

            if (alias_canada.indexOf(event.target.searchTerm.toLowerCase()) !== -1) {
                long = -100.65;
                lat = 55.101;
                console.log("test");
            }

            if (event.target.searchTerm.indexOf(',') !== -1) {
                var isComma = true;
            } else {
                var isComma = false;
            }

            centerMap(view, Point, lat, long, isComma); //center map
            //END OF FIX

            // console.log("Search started.");
            // console.log("results", event)

            database.ref("/events").remove();

            //CLEARS POINTS ON NEW SEARCH
            view.graphics.removeAll();

            database.ref().update({
                lat: lat,
                lon: long
            })

            meetupAPI();
        });
        //WHEN SEARCH IS DONE IT WILL TAKE INFO FROM DATABASE AND ADD POINTS WHERE THE EVENTS ARE
        database.ref("/events").on("child_added", function(snap) {
            console.log(snap.val());
            var point = {
                type: "point", // autocasts as new Point()
                longitude: snap.val().eventLon,
                latitude: snap.val().eventLat
            };

            // Create a symbol for drawing the point
            var markerSymbol = {
                type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
                color: [226, 119, 40],
                outline: { // autocasts as new SimpleLineSymbol()
                    color: [255, 255, 255],
                    width: 2
                }
            };

            // Create a graphic and add the geometry and symbol to it
            var pointGraphic = new Graphic({
                geometry: point,
                symbol: markerSymbol,
                popupTemplate: { // autocasts as new PopupTemplate()
                    title: "<a target='_blank' href='" + snap.val().eventLink + "'>" + snap.val().eventName + "</a>",
                    content: "<p>Group: " + snap.val().eventGroupName + "</p><p>Time: " + parseTime(snap.val().eventTime) + " Date: " + snap.val().eventDate + "</p>"
                    + "<p> RSVP Count: " + snap.val().eventRsvpCount + "  Waitlist: " + snap.val().eventWaitlist + "</p>"
                  }
            });
            view.graphics.add(pointGraphic);
        })
        //END OF ADDING POINTS
    }




);
//BUTTONS SO CHANGE BASE LAYER OF MAP
$('#grey-vector').on('click', function () {
    view.map = mapTwo;
})
$('#streets').on('click', function () {
    view.map = mapThree;
})
$('#hybrid').on('click', function () {
    view.map = mapOne;
})

//ZOOMS IN AND CENTERS MAP ON SEARCH
function centerMap(view, Point, lat, lon, zoom) {
    var pt = new Point({
        latitude: lat,
        longitude: lon
    });

    if (zoom === true) {
        var scaleValue = 300000;
    } else if (zoom === false) {
        var scaleValue = 20000000;
    }

    // go to the given point
    view.goTo({
        target: pt,
        scale: scaleValue
    });
}

// ==================================================================================================
// ============================= Initialize Firebase ================================================
// ==================================================================================================
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
// ============================ Meetup API ==========================================================
// ==================================================================================================
// &text=" + userMeetupText + "
var userMeetupText;
$('#add-user-search').on('click', function () {
    userMeetupText = $('#user-search').val();
})
var meetupAPI = function () {
    database.ref().once("value").then(function (snap) {
        console.log('user search: ' + userMeetupText);
        var url = "https://api.meetup.com/find/upcoming_events?&key=413e32034783f3038f567864804610&lat=" + snap.val().lat + "&lon=" + snap.val().lon + "&sign=true&photo-host=public&text=" + userMeetupText + "&page=50";
        $.ajax({

            dataType: 'jsonp',
            method: 'get',
            url: url,
            success: function (result) {
                console.log(result);
                for (i = 0; i < result.data.events.length; i++) {
                        database.ref("/events").push({
                            eventName: result.data.events[i].name,
                            eventLat: result.data.events[i].group.lat,
                            eventLon: result.data.events[i].group.lon,
                            // eventDescription: result.data.events[i].description,
                            // eventAddress: result.data.events[i].venue.address_1,
                            eventTime: result.data.events[i].local_time,
                            eventDate: result.data.events[i].local_date,
                            eventRsvpCount: result.data.events[i].yes_rsvp_count,
                            eventWaitlist: result.data.events[i].waitlist_count,
                            eventGroupName: result.data.events[i].group.name,
                            eventLink: result.data.events[i].link
                        })

                }

            }
        });

    })

}

var parseTime = function(timeInput) {
    var time = timeInput; // your input
    
    time = time.split(':'); // convert to array
    
    // fetch
    var hours = Number(time[0]);
    var minutes = Number(time[1]);
    // var seconds = Number(time[2]);
    
    // calculate
    var timeValue;
    
    if (hours > 0 && hours <= 12) {
      timeValue= "" + hours;
    } else if (hours > 12) {
      timeValue= "" + (hours - 12);
    } else if (hours == 0) {
      timeValue= "12";
    }
     
    timeValue += (minutes < 10) ? ":0" + minutes : ":" + minutes;  // get minutes
    // timeValue += (seconds < 10) ? ":0" + seconds : ":" + seconds;  // get seconds
    timeValue += (hours >= 12) ? " P.M." : " A.M.";  // get AM/PM

    return timeValue;
}
