$(document).ready(function(){

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
            map: mapTwo
        });
        //REMOVE EVENTS FROM DATABASE SO THE POINTS DONT SHOW UP FROM PREVIOUS SEARCHES
        database.ref("/events").remove();

        // to search by name on map
        var searchWidget = new Search({
            view: view
        });

        // Add the search widget to the top right corner of the view
        view.ui.add(searchWidget, {
            position: "top-right",
            className: "search-box-close"
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
            setTimeout(function () { view.popup.close(); }, 1300);

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
        database.ref("/events").on("child_added", function (snap) {
            view.popup.visible = true;
            var rsvpTag;
            if ((snap.val().eventWaitlist) >= 1) {
                console.log('rsvp is full')
                rsvpTag = ("<p id='wait'>  Waitlist: " + snap.val().eventWaitlist + "</p>")
            }
            else {
                rsvpTag = ("<p id='rsvp'> RSVP Count: " + snap.val().eventRsvpCount + "</p>");
            }

            console.log(snap.val());
            var point = {
                type: "point", // autocasts as new Point()
                className: "btn waves-effect waves-light light-blue accent-3 animated infinite rubberBand",
                longitude: snap.val().eventLon,
                latitude: snap.val().eventLat
            };

            // Create a symbol for drawing the point
            var markerSymbol = {
                type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
                color: [107, 0, 120],
                outline: { // autocasts as new SimpleLineSymbol()
                    color: [176, 0, 178],
                    width: 1
                }
            };
            // markerSymbol.addClass('test');

            // Create a graphic and add the geometry and symbol to it
            var pointGraphic = new Graphic({
                geometry: point,
                symbol: markerSymbol,
                popupTemplate: { // autocasts as new PopupTemplate()

                    title: "<a class='pop-up-title' target='_blank' href='" + snap.val().eventLink + "'>" + snap.val().eventName + "</a>",
                    content: "<p>Group: " + snap.val().eventGroupName + "</p><p> Date: " + snap.val().eventDate + " / Time: " + snap.val().eventTime + "</p>"
                        + rsvpTag
                }
            });

            // pointGraphic.className('hello');
            view.graphics.add(pointGraphic);
        })
        //END OF ADDING POINTS
        database.ref("usersearch").on("value", function () {
            view.graphics.removeAll();
        })
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


$('.first-drop').dropdown({
    inDuration: 500,
    outDuration: 500,
    closeOnClick: true,
    coverTrigger: false,
});
$('.second-drop').dropdown({
    // hover: true,
    // constrainWidth: false,
    inDuration: 500,
    outDuration: 500,
    closeOnClick: false,
    coverTrigger: false, // Displays dropdown below the button
});

// &text=" + userMeetupText + "
var userMeetupText = 'all';
var today = new Date();
var dd = today.getDate();

var mm = today.getMonth() + 1;
var yyyy = today.getFullYear();
if (dd < 10) {
    dd = '0' + dd;
}

if (mm < 10) {
    mm = '0' + mm;
}
today = yyyy + '-' + mm + '-' + dd;
var endDate = (yyyy + 1) + '-' + mm + '-' + dd;;
var userMeetupDateStart = today;
// console.log(today)
var userMeetupDateEnd = endDate;
console.log('before click ' + userMeetupDateStart)
console.log('before click ' + userMeetupDateEnd)

$('.add-user-search').on('click', function (view, Point) {
    $('.second-drop').dropdown({
        closeOnClick: false,
        outDuration: 500,
    });
    database.ref("/events").remove();
    database.ref().update({
        usersearch: $("#user-search").val()
    });
    database.ref().update({
        usersearch: ""
    });
    userMeetupText = $('#user-search').val();
    console.log('search term: ' + userMeetupText)
    meetupAPI();
    if (($('#start-date').val() == '') && ($('#end-date').val() == '')) {
        console.log('start date is blank');
        database.ref("/events").remove();
        database.ref('user-search').set(true);
        userMeetupDateStart = today;
        userMeetupDateEnd = endDate;
        meetupAPI();

    }
    else if (($('#start-date').val()) && ($('#end-date').val() == '')) {
        console.log('start date but no end date');
        database.ref("/events").remove();
        database.ref('user-search').set(true);
        userMeetupDateStart = $('#start-date').val();
        userMeetupDateEnd = endDate;
        meetupAPI();

    }
    else if (($('#start-date').val() == '') && ($('#end-date').val())) {
        console.log('end date but no start date');
        database.ref("/events").remove();
        database.ref('user-search').set(true);
        userMeetupDateStart = today;
        userMeetupDateEnd = $('#end-date').val();
        meetupAPI();

    }
    else {
        database.ref("/events").remove();
        database.ref('user-search').set(true);
        userMeetupDateStart = $('#start-date').val();
        userMeetupDateEnd = $('#end-date').val();
        meetupAPI();
        console.log('start date: ' + userMeetupDateStart);
        console.log('end date: ' + userMeetupDateEnd);
    }
})
var meetupAPI = function () {
    database.ref().once("value").then(function (snap) {
        console.log('user search: ' + userMeetupText);
        var url = "https://api.meetup.com/find/upcoming_events?&key=413e32034783f3038f567864804610&lat=" + snap.val().lat + "&lon=" + snap.val().lon + "&sign=true&photo-host=public&self_groups=include&end_date_range=" + userMeetupDateEnd + "T01%3A01%3A01&start_date_range=" + userMeetupDateStart + "T01%3A01%3A01&text=" + userMeetupText + "&Radius=100&page=50";
        $.ajax({


            dataType: 'jsonp',
            method: 'get',
            url: url,
            success: function (result) {
                console.log(result);
                var eventLat;
                var eventLon;
                for (i = 0; i < result.data.events.length; i++) {
                    console.log("ran")
                    if (result.data.events[i].venue) {
                        eventLat = result.data.events[i].venue.lat;
                        eventLon = result.data.events[i].venue.lon;
                    }
                    else {
                        eventLat = result.data.events[i].group.lat;
                        eventLon = result.data.events[i].group.lon;
                    }

                    database.ref("/events").push({
                        eventName: result.data.events[i].name,
                        eventLat,
                        eventLon,
                        eventTime: convertTime(result.data.events[i].time),
                        eventDate: convertDate(result.data.events[i].time),
                        eventRsvpCount: result.data.events[i].yes_rsvp_count,
                        eventWaitlist: result.data.events[i].waitlist_count,
                        eventGroupName: result.data.events[i].group.name,
                        eventLink: result.data.events[i].link



                    });

                }

            }
        });
    });
}


    var parseTime = function (timeInput) {
        var time = timeInput; // your input

        time = time.split(':'); // convert to array

        // fetch
        var hours = Number(time[0]);
        var minutes = Number(time[1]);
        // var seconds = Number(time[2]);

        // calculate
        var timeValue;

        if (hours > 0 && hours <= 12) {
            timeValue = "" + hours;
        } else if (hours > 12) {
            timeValue = "" + (hours - 12);
        } else if (hours == 0) {
            timeValue = "12";
        }

        timeValue += (minutes < 10) ? ":0" + minutes : ":" + minutes;  // get minutes
        // timeValue += (seconds < 10) ? ":0" + seconds : ":" + seconds;  // get seconds
        timeValue += (hours >= 12) ? " P.M." : " A.M.";  // get AM/PM

        return timeValue;
    }



    function convertTime(UNIX_timestamp) {
        var a = new Date(UNIX_timestamp);
        var hour = a.getHours();
        var min = a.getMinutes();
        var sec = a.getSeconds();
        var time = hour + ':' + min + ':' + sec;
        return parseTime(time);
    }

    console.log(parseTime(convertTime(1531357200000)));

    function convertDate(UNIX_timestamp) {
        var a = new Date(UNIX_timestamp);
        var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        var year = a.getFullYear();
        var month = months[a.getMonth()];
        var date = a.getDate();
        var time = date + ' ' + month + ' ' + year;
        return time;
    }

    console.log(convertDate(1531357200000));

    $(document).ready(function () {
        $('.sidenav').sidenav();
    });
});
