var sidebarListCreated = false;
var sidebarListItemCount = 0;
var sidebarListItems = {};
var sidebarView;
var sideBarPoint;
var sideBarGraphic;

var clientSessionKey = 0;
var serverSessionKey = 0;

var favoritesArray = [];
var favoritesArrayIdentifiers = [];
// ==================================================================================================
// ============================ Map API =============================================================
// ==================================================================================================
var mapOne;
var mapTwo;
var mapThree;
var view;

window.onload = function () {

    var myOldStorageString = localStorage.getItem("favorites");

    if (myOldStorageString && myOldStorageString.length > 0) {
        var tempArray = myOldStorageString.split("|");
        var oldIndex = 0;
        tempArray.forEach(function (oldFavorite) {

            favoritesArray[oldIndex] = JSON.parse(oldFavorite);
            favoritesArrayIdentifiers.push(favoritesArray[oldIndex].link);
            oldIndex++;
        });
    }

    $(".esri-view-surface.esri-view-surface--inset-outline").on("click", function () {

        setTimeout(function () {
            if ($("#needyStar")[0] !== undefined) {
                $("#needyStar").css("top", $("#needyStar")[0].parentElement.children[2].offsetTop - 6);
                if (favoritesArrayIdentifiers.indexOf($(".pop-up-title")[0].href) !== -1) {
                    $($("#needyStar")[0].firstChild.firstChild).css("fill", "#ffd055");
                }
                else {
                    $($("#needyStar")[0].firstChild.firstChild).css("fill", "#d8d8d8");
                }
            }

        }, 350);

    });

    //check size for menu
    if (window.innerWidth <= 992) {
        if (window.innerWidth <= 600) {
            var styleHeight = 'style=\"height: 47px; line-height: 43px;\"';
        }
        else {
            var styleHeight = "";
        }

        $("body").append("<div id='hamburger' " + styleHeight + " onClick='menuTime()'>&#9776;</div>");
    }
};

var menuOnTheGrill = false;

function menuTime() {
    if (menuOnTheGrill) {
        $("#hamburger-menu").css("animation", "none");
        setTimeout(function () {
            $("#hamburger-menu").css("animation", "fadeInRight 250ms reverse forwards");
        }, 30);
        setTimeout("$('#hamburger-menu').remove(); menuOnTheGrill = false", 280);
        return;
    }
    else {
        menuOnTheGrill = true;
        $("body").append("<div id='hamburger-menu'><div class='ham' onClick='$(\"#render-favorites-lanucher\").trigger(\"click\"); menuTime()'>Favorites</div><div class='ham' onClick='window.location=\"about.html\"'>About</div></div>");
    }
}

window.onresize = function () { 
	if(window.innerWidth <= 992)
	{
		if(window.innerWidth <= 600)
		{
			var styleHeight = 'style=\"height: 47px; line-height: 43px;\"';
		}
		else
		{
			var styleHeight = "";
		}

		if($("#hamburger")[0] === undefined)
		{
			$("body").append("<div id='hamburger' " + styleHeight + " onClick='menuTime()'>&#9776;</div>");
        }
        else {
            $('#hamburger').attr("style", styleHeight.substr(7, styleHeight.length -9))
          }
	}
	else
	{
		if($("#hamburger")[0] !== undefined)
		{
			$("#hamburger").remove();
		}
	}
};


//Keyboard Events
$(document).ready(function () {

    $("#user-search")[0].onkeydown = formKeyCapture;
    $("#start-date")[0].onkeydown = formKeyCapture;
    $("#end-date")[0].onkeydown = formKeyCapture;

});

function formKeyCapture(e) {
    if (e.keyCode === 13) {
        $('.add-user-search').trigger('click');
    }
}


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


        sidebarView = view;
        sidebarPoint = Point;
        sidebarGraphic = Graphic;

        searchWidget.on("search-complete", function (event) {
            //Center map to closest location
            var lat = event.results[0].results[0].extent.center.latitude; //get lat from 1st address result
            var long = event.results[0].results[0].extent.center.longitude; //get long from 1st address result
            //THIS IS A FIX FOR CENTERING ON CONTINETS
            var alias_usa = ["usa", "united states", "united states of america", "america"];

            if (alias_usa.indexOf(event.target.searchTerm.toLowerCase()) !== -1) {
                long = -99.771;
                lat = 38.22;
            }

            var alias_canada = ["can", "canada"];

            if (alias_canada.indexOf(event.target.searchTerm.toLowerCase()) !== -1) {
                long = -100.65;
                lat = 55.101;
            }

            if (event.target.searchTerm.indexOf(',') !== -1) {
                var isComma = true;
            } else {
                var isComma = false;
            }

            centerMap(view, Point, lat, long, isComma); //center map
            setTimeout(function () { view.popup.close(); }, 1300);

            //END OF FIX

            console.log("Search started.");
            // console.log("results", event)

            database.ref("/events").remove();

            //CLEARS POINTS ON NEW SEARCH
            view.graphics.removeAll();

            database.ref().update({
                lat: lat,
                lon: long
            })

            meetupAPI();

            //Logic for creating event list sidebar
            if (sidebarListCreated) {
                //set list item count to 0
                sidebarListItemCount = 0;
                sidebarListItems = {};

                //delete Sidebar
                hideSidebarList();
            }
            else {
                sidebarListCreated = true;

                if (window.innerWidth <= 500) {
                    var notVisible = "display: none;";
                }
                else {
                    var notVisible = "";
                }

                //create sidebar button
                $("body").prepend("<a class='btn' style='" + notVisible + "position: absolute; top: 145px; left: 5px; font-family: \"Boogaloo\"; z-index: 50; opacity: 0; transition: opacity 1s; width: 240px; text-align: center;' href='javascript:createSidebarList()' id='event-list-button'>Show Event List</a>");
                setTimeout(function () { $("#event-list-button").css({ opacity: "1" }); }, 1000);
            }
        });

        database.ref("/user-session-unique").on("child_added", function (snap) {
            console.log("user-session-unique", snap.val());
            //Desync from server
            serverSessionKey = snap.val();

        });

        $("#render-favorites-lanucher").on("click", function () {

            sidebarView.popup.close();

            //Logic for creating event list sidebar
            if (sidebarListCreated) {
                //set list item count to 0
                sidebarListItemCount = 0;
                sidebarListItems = {};

                //delete Sidebar
                hideSidebarList();
            }
            else {
                sidebarListCreated = true;

                if (window.innerWidth <= 500) {
                    var notVisible = "display: none;";
                }
                else {
                    var notVisible = "";
                }

                //create sidebar button
                $("body").prepend("<a class='btn' style='" + notVisible + "position: absolute; top: 145px; left: 5px; font-family: \"Boogaloo\"; z-index: 50; opacity: 0; transition: opacity 1s; width: 240px; text-align: center;' href='javascript:createSidebarList()' id='event-list-button'>Show Event List</a>");
                setTimeout(function () { $("#event-list-button").css({ opacity: "1" }); }, 1000);
            }

            view.graphics.removeAll();

            for (var favoriteEvent = 0; favoriteEvent < favoritesArray.length; favoriteEvent++) {
                var rsvpTag = favoritesArray[favoriteEvent].rsvp;

                var point = {
                    type: "point", // autocasts as new Point()
                    className: "btn waves-effect waves-light light-blue accent-3 animated infinite rubberBand",
                    longitude: favoritesArray[favoriteEvent].lon,
                    latitude: favoritesArray[favoriteEvent].lat
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

                //it's a favorite.
                var goldStar = "fill: #ffd055";

                // Create a graphic and add the geometry and symbol to it
                var pointGraphic = new Graphic({
                    geometry: point,
                    symbol: markerSymbol,
                    popupTemplate: { // autocasts as new PopupTemplate()

                        title: "<a class='pop-up-title' target='_blank' href='" + favoritesArray[favoriteEvent].link + "'>" + favoritesArray[favoriteEvent].name + "</a>",
                        content: "<p>Group: " + favoritesArray[favoriteEvent].group + "</p><p> Date: " + favoritesArray[favoriteEvent].date + " / Time: " + favoritesArray[favoriteEvent].time + "</p>"
                            + rsvpTag + '<div class="stars" data-stars="1" style="position: absolute; top: 126px; right: 8px; z-index: 50;" id="needyStar" onClick="addListItemToFavoritesPopUp(this)">' +
                            '<svg height="25" width="23" class="star rating" data-rating="1">' +
                            '<polygon points="9.9, 1.1, 3.3, 21.78, 19.8, 8.58, 0, 8.58, 16.5, 21.78" style="fill-rule:nonzero; ' + goldStar + '"/>' +
                            '</svg>' +
                            '</div>'
                    }
                });

                // pointGraphic.className('hello');
                view.graphics.add(pointGraphic);

                //Logic for creating event object and adding data per each item
                sidebarListItems[sidebarListItemCount] = {};
                sidebarListItems[sidebarListItemCount].lon = favoritesArray[favoriteEvent].lon;
                sidebarListItems[sidebarListItemCount].lat = favoritesArray[favoriteEvent].lat;
                sidebarListItems[sidebarListItemCount].link = favoritesArray[favoriteEvent].link;
                sidebarListItems[sidebarListItemCount].name = favoritesArray[favoriteEvent].name;
                sidebarListItems[sidebarListItemCount].group = favoritesArray[favoriteEvent].group;
                sidebarListItems[sidebarListItemCount].date = favoritesArray[favoriteEvent].date;
                sidebarListItems[sidebarListItemCount].time = favoritesArray[favoriteEvent].time;
                sidebarListItems[sidebarListItemCount].rsvp = rsvpTag;

                //Logic for creating event list sidebar button
                sidebarListItemCount++;
                $("#event-list-button").text("Show Event List (" + sidebarListItemCount + ")");
            }
        });

        //WHEN SEARCH IS DONE IT WILL TAKE INFO FROM DATABASE AND ADD POINTS WHERE THE EVENTS ARE
        database.ref("/events").on("child_added", function (snap) {

            if (serverSessionKey != clientSessionKey) {
                //console.log(false, serverSessionKey, clientSessionKey);
                return;
            }
            else {
                //console.log(true, serverSessionKey, clientSessionKey);
            }


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
            //Check if it's a favorite
            if (favoritesArrayIdentifiers.indexOf(snap.val().eventLink) !== -1) {
                var goldStar = "fill: #ffd055";
            }
            else {
                var goldStar = "";
            }

            // Create a graphic and add the geometry and symbol to it
            var pointGraphic = new Graphic({
                geometry: point,
                symbol: markerSymbol,
                popupTemplate: { // autocasts as new PopupTemplate()

                    title: "<a class='pop-up-title' target='_blank' href='" + snap.val().eventLink + "'>" + snap.val().eventName + "</a>",
                    content: "<p>Group: " + snap.val().eventGroupName + "</p><p> Date: " + snap.val().eventDate + " / Time: " + snap.val().eventTime + "</p>"
                        + rsvpTag + '<div class="stars" data-stars="1" style="position: absolute; top: 126px; right: 8px; z-index: 50;" id="needyStar" onClick="addListItemToFavoritesPopUp(this)">' +
                        '<svg height="25" width="23" class="star rating" data-rating="1">' +
                        '<polygon points="9.9, 1.1, 3.3, 21.78, 19.8, 8.58, 0, 8.58, 16.5, 21.78" style="fill-rule:nonzero; ' + goldStar + '" onLoad="javascript:console.log(\"check me\")"/>' +
                        '</svg>' +
                        '</div>'
                }
            });

            // pointGraphic.className('hello');
            view.graphics.add(pointGraphic);

            //Logic for creating event object and adding data per each item
            sidebarListItems[sidebarListItemCount] = {};
            sidebarListItems[sidebarListItemCount].lon = snap.val().eventLon;
            sidebarListItems[sidebarListItemCount].lat = snap.val().eventLat;
            sidebarListItems[sidebarListItemCount].link = snap.val().eventLink;
            sidebarListItems[sidebarListItemCount].name = snap.val().eventName;
            sidebarListItems[sidebarListItemCount].group = snap.val().eventGroupName;
            sidebarListItems[sidebarListItemCount].date = snap.val().eventDate;
            sidebarListItems[sidebarListItemCount].time = snap.val().eventTime;
            sidebarListItems[sidebarListItemCount].rsvp = rsvpTag;

            //Logic for creating event list sidebar button
            sidebarListItemCount++;
            $("#event-list-button").text("Show Event List (" + sidebarListItemCount + ")");

        })
        //END OF ADDING POINTS
        database.ref("usersearch").on("value", function () {

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

//Show Event List Button

function createSidebarList() {
    $("#event-list-button").text("Hide Event List (" + sidebarListItemCount + ")");
    $("#event-list-button").attr("href", "javascript:hideSidebarList()");

    sidebarView.popup.close();

    if (window.innerWidth <= 500) {
        var notVisible = "display: none;";
    }
    else {
        var notVisible = "";
    }

    //create sidebar div
    $("body").append("<div id='sidebar-list-div' style='" + notVisible + "position: absolute; top: 255px; left: 15px; z-index: 50; border: 1px solid gray; background-color: rgba(128, 0, 128, 0.5); width: 240px; height: 0vh; transition: height 500ms; overflow-y: scroll;'></div>");
    setTimeout(function () { $("#sidebar-list-div").css({ height: "65vh" }); }, 10);

    $("body").prepend("<a class='btn' style='" + notVisible + "position: absolute; top: 195px; left: 5px; font-family: \"Boogaloo\"; z-index: 50; opacity: 0; transition: opacity 1s, width 250ms, color 250ms; width: 240px; text-align: center;' href='javascript:showSortOptions()' id='sort-list-button'>Sort List</a>");
    setTimeout(function () { $("#sort-list-button").css({ opacity: "1" }); }, 10);

    //inject content
    for (var sidebarEvent in sidebarListItems) {
        //check if it's a favorite
        if (favoritesArrayIdentifiers.indexOf(sidebarListItems[sidebarEvent].link) !== -1) {
            var goldStar = "fill: #ffd055";
        }
        else {
            var goldStar = "";
        }

        $("#sidebar-list-div").append("<div class='esri-widget' style='position: relative; background-color: #ca00d7; padding: 5px; line-height: 1.3em; color: white; border: 4px solid rgb(128, 0, 128); margin-bottom: 10px; font-weight: bold; font-size: 20px; padding-bottom: 0px;'>" +
            "<a target='_blank' href='" + sidebarListItems[sidebarEvent].link + "' style='color: white; padding-right: 25px; display: block;'>" + sidebarListItems[sidebarEvent].name + "</a>" +
            "<p style='font-size: 12px; font-weight: normal; margin-top: 4px; padding-right: 25px;'>Group: " +
            sidebarListItems[sidebarEvent].group +
            "</p>" +
            "<p style='font-size: 12px; font-weight: normal; margin-top: -8px; padding-right: 25px;'>Date: " +
            sidebarListItems[sidebarEvent].date +
            " / Time: " +
            sidebarListItems[sidebarEvent].time +
            "</p>" +
            "<p id='" + $(sidebarListItems[sidebarEvent].rsvp).attr('id') + "' style='font-size: 12px; margin-top: -8px;'>" +
            $(sidebarListItems[sidebarEvent].rsvp).text() +
            " &nbsp; " +
            '<div class="stars" data-stars="1" style="position: absolute; bottom: 7px; right: 30px;">' +
            '<svg height="25" width="23" class="star rating" data-rating="1">' +
            '<polygon points="9.9, 1.1, 3.3, 21.78, 19.8, 8.58, 0, 8.58, 16.5, 21.78" style="fill-rule:nonzero;' + goldStar + '"/>' +
            '</svg>' +
            '</div>' +
            "<div style='position: absolute; top: 0px; right: 0px; width: 25px; height: 100%; line-height: 100%; background-color: rgb(128, 0, 128); display: flex; align-items: center; justify-content: center; cursor: pointer;' id='arrow-" + sidebarEvent + "' onClick='centerOnEvent(this.id)'><span style='display: inline-block; font-weight: normal; font-size: 10px;'>&gt;</span></div></div>");
    }

    //add stars event
    $(".stars").on("click", addListItemToFavorites);
}

function addListItemToFavorites(e) {
    var identifier = e.target.parentElement.firstChild.href;

    var indexOfIdentifier = favoritesArrayIdentifiers.indexOf(identifier);
    if (indexOfIdentifier !== -1) {
        //console.log("Already a favorite");
        $(e.target.firstChild.firstChild).css("fill", "#d8d8d8");

        //remove it from favorites
        favoritesArray.splice(indexOfIdentifier, 1);
        favoritesArrayIdentifiers.splice(indexOfIdentifier, 1);

        //update local storage
        storeFavorites();

        return;
    }

    favoritesArrayIdentifiers.push(identifier);

    $(e.target.firstChild.firstChild).css("fill", "#ffd055");

    var quickLinkArray = [];
    for (var props in sidebarListItems) {
        quickLinkArray.push(sidebarListItems[props].link);
    }

    var whichIndex = quickLinkArray.indexOf(identifier);

    favoritesArray.push(sidebarListItems[whichIndex]);

    storeFavorites();
}

function addListItemToFavoritesPopUp(e) {
    var identifier = $(".pop-up-title")[0].href;

    var indexOfIdentifier = favoritesArrayIdentifiers.indexOf(identifier);
    if (indexOfIdentifier !== -1) {
        console.log("Already a favorite");
        $(e.firstChild.firstChild).css("fill", "#d8d8d8");

        //remove it from favorites
        favoritesArray.splice(indexOfIdentifier, 1);
        favoritesArrayIdentifiers.splice(indexOfIdentifier, 1);

        //update local storage
        storeFavorites();

        return;
    }

    favoritesArrayIdentifiers.push(identifier);

    $(e.firstChild.firstChild).css("fill", "#ffd055");

    var quickLinkArray = [];
    for (var props in sidebarListItems) {
        quickLinkArray.push(sidebarListItems[props].link);
    }

    var whichIndex = quickLinkArray.indexOf(identifier);
    favoritesArray.push(sidebarListItems[whichIndex]);

    storeFavorites();
}

function storeFavorites() {
    var myStorageString = "";

    for (var mss = 0; mss < favoritesArray.length; mss++) {
        myStorageString += "|" + JSON.stringify(favoritesArray[mss]);
    }

    myStorageString = myStorageString.substr(1);

    localStorage.setItem("favorites", myStorageString);
}

function hideSidebarList() {
    sortState = 0;
    sortOrder = [];

    $("#event-list-button").text("Show Event List (" + sidebarListItemCount + ")");
    $("#event-list-button").attr("href", "#");

    //remove sidebar div
    $("#sidebar-list-div").css({ height: "0vh" });
    setTimeout(function () {
        $("#sidebar-list-div").remove();
        $("#sort-list-button").css({ opacity: "0" });
    }, 500);

    setTimeout(function () {
        $("#sort-list-button").remove();
        $("#event-list-button").attr("href", "javascript:createSidebarList()");
    }, 1000);
}

var sortState = 0;
var sortColors = ["", "white", "white", "white", "white"];
function showSortOptions() {
    $("#sort-list-button").attr("href", "#");
    $("#sort-list-button").css({ width: "440px", color: "#ca00d7" });

    sortColors = ["", "white", "white", "white", "white"];
    sortColors[sortState] = "rgb(36, 230, 212)";

    setTimeout(function () {
        $("#sort-list-button").html("<a href='javascript:sortSidebarList(\"name1\")' style='color: " + sortColors[1] + ";'>Name (A-Z)</a>&nbsp; &nbsp;" +
            "<a href='javascript:sortSidebarList(\"name2\")' style='color: " + sortColors[2] + ";'>Name (Z-A)</a>&nbsp; &nbsp;" +
            "<a href='javascript:sortSidebarList(\"date1\")' style='color: " + sortColors[3] + ";'>Date (^)</a>&nbsp; &nbsp;" +
            "<a href='javascript:sortSidebarList(\"date2\")' style='color: " + sortColors[4] + ";'>Date (<span style='display: inline-block; transform: rotate(180deg)'>^</span>)</a>");
    }, 250);
}

var sortOrder = [];
function sortSidebarList(category) {
        sortOrder = [];
	
	var myArray = [];
	var myArray2 = [];
	var myDuplicateArray = [];
	var myDuplicateLabel = 0;
	var mySortedArray;

	if(category === "name1" || category === "name2")
	{
		sortState = 1;
		for(var props in sidebarListItems)
		{
			myArray.push(sidebarListItems[props].name);
			myArray2.push(sidebarListItems[props].name);
		}
	}
	else if(category === "date1" || category === "date2")
	{	
		sortState = 3;
		for(var props in sidebarListItems)
		{
			var dateString = sidebarListItems[props].date;

			var dayMask = /([^\s]+)/;
			var dayNumber = dayMask.exec(dateString);

			var monthNameMask = /[a-z]{3}/i;
			var monthName = monthNameMask.exec(dateString);
			var monthNumber = new Date(Date.parse(monthName[0] +" 1, 2012")).getMonth() + 1;

			var yearMask = /[0-9]{4}/;
			var yearNumber = yearMask.exec(dateString);

			var dateUTC = Date.UTC(yearNumber[0], monthNumber, dayNumber[0]);

			myArray.push(dateUTC);
			myArray2.push(dateUTC);
		}
	}

	//get list of duplicates
	for(var i = 0; i < myArray.length; i++) 
	{
		var duplicateIndex = 0;
		for(var q = i; q < myArray.length - i; q++)
		{
			if(myArray[i] === myArray[q])
			{
				if(myDuplicateArray.indexOf(myArray[i]) === -1)
				{
					myDuplicateArray.push(myArray[i]);
				}
			}
		}
	}

	//make all duplicates unique
	for(var x = 0; x < myArray.length; x++) 
	{
		if(myDuplicateArray.indexOf(myArray[x]) !== -1)
		{
			//if our entry was a duplicate
			myDuplicateLabel++;
			myArray2[x] += myDuplicateLabel;
		}
	}

	//sort the array
	mySortedArray = myArray2.slice(0).sort();

	//we reverse the array if the sort chosen was the reverse state
	if(category === "name2" || category === "date2")
	{
		sortState++;
		mySortedArray.reverse();	
	}

	//we get the new positions of all elements and push it to an array called sortOrder
        //later, we will remove the div and write it with the new order in sortOrder
	for(var y = 0; y < mySortedArray.length; y++) 
	{
		var theNewIndex = myArray2.indexOf(mySortedArray[y]);

		sortOrder.push(theNewIndex);
	}

	//restore button attrs
	$("#sort-list-button").html("Sort List");
	$("#sort-list-button").css({width: "240px", color: "white"});

	setTimeout(function () { $("#sort-list-button").attr("href", "javascript:showSortOptions()");
	}, 250);

	applyNewSortOrder();
}

function applyNewSortOrder() {
    lastHighlight = "7";
    $("#sidebar-list-div").empty();

    //inject sorted content
    for (var sidebarEvent in sidebarListItems) {
        var originalEvent = sidebarEvent;
        sidebarEvent = sortOrder[sidebarEvent];

        //check if it's a favorite
        if (favoritesArrayIdentifiers.indexOf(sidebarListItems[sidebarEvent].link) !== -1) {
            var goldStar = "fill: #ffd055";
        }
        else {
            var goldStar = "";
        }

        $("#sidebar-list-div").append("<div class='esri-widget' style='position: relative; background-color: #ca00d7; padding: 5px; line-height: 1.3em; color: white; border: 4px solid rgb(128, 0, 128); margin-bottom: 10px; font-weight: bold; font-size: 20px; padding-bottom: 0px;'>" +
            "<a target='_blank' href='" + sidebarListItems[sidebarEvent].link + "' style='color: white; padding-right: 25px; display: block;'>" + sidebarListItems[sidebarEvent].name + "</a>" +
            "<p style='font-size: 12px; font-weight: normal; margin-top: 4px; padding-right: 25px;'>Group: " +
            sidebarListItems[sidebarEvent].group +
            "</p>" +
            "<p style='font-size: 12px; font-weight: normal; margin-top: -8px; padding-right: 25px;'>Date: " +
            sidebarListItems[sidebarEvent].date +
            " / Time: " +
            sidebarListItems[sidebarEvent].time +
            "</p>" +
            "<p id='" + $(sidebarListItems[sidebarEvent].rsvp).attr('id') + "' style='font-size: 12px; margin-top: -8px;'>" +
            $(sidebarListItems[sidebarEvent].rsvp).text() +
            " &nbsp; " +
            '<div class="stars" data-stars="1" style="position: absolute; bottom: 7px; right: 30px;">' +
            '<svg height="25" width="23" class="star rating" data-rating="1">' +
            '<polygon points="9.9, 1.1, 3.3, 21.78, 19.8, 8.58, 0, 8.58, 16.5, 21.78" style="fill-rule:nonzero; ' + goldStar + '"/>' +
            '</svg>' +
            '</div>' +
            "<div style='position: absolute; top: 0px; right: 0px; width: 25px; height: 100%; line-height: 100%; background-color: rgb(128, 0, 128); display: flex; align-items: center; justify-content: center; cursor: pointer;' id='arrow-" + originalEvent + "' onClick='centerOnEvent(this.id)'><span style='display: inline-block; font-weight: normal; font-size: 10px;'>&gt;</span></div></div>");
    }

    $("#sidebar-list-div")[0].scrollTo(0, 0);

    //add stars event
    $(".stars").on("click", addListItemToFavorites);
}

var addEventOnce = false;

function centerOnEvent(eventItemNumber) {
    var originalEvent = eventItemNumber;
    if (!(sortOrder.length < 1)) {
        eventItemNumber = "arrow-" + sortOrder[eventItemNumber.replace("arrow-", "")];
    }
    $("#circle-marker").remove();
    highlightEvent(originalEvent);
    var lat = sidebarListItems[eventItemNumber.replace("arrow-", "")].lat;
    var lon = sidebarListItems[eventItemNumber.replace("arrow-", "")].lon;

    sidebarView.popup.close();

    var pt = new sidebarPoint({
        latitude: lat,
        longitude: lon
    });

    var scaleValue = 25000;

    // go to the given point
    sidebarView.goTo({
        target: pt,
        scale: scaleValue
    });

    //get middle of screen
    var middleX = Math.floor(window.innerWidth / 2) + 1;
    var middleY = Math.floor(window.innerHeight / 2) + 30;

    $("body").append("<div id='circle-marker' style='position: absolute; top: " + (middleY - 9) + "px; left: " + (middleX - 9) + "px; width: 18px; height: 18px; border-radius: 50%; border: 0px solid #009688; opacity: 0; pointer-events: none; background-color: rgba(0,0,0,0)'></div>");
    setTimeout(function () {
        $("#circle-marker").css({ opacity: "1" });
        $("#" + eventItemNumber).focus();

        if (addEventOnce === false) {
            addEventOnce = true;
            $(".esri-view-surface--inset-outline").on("focus", function () {
                $("#circle-marker").remove();
                $(lastHighlight).css("border-color", "rgb(128,0,128)");

                setTimeout(function () { if ($(".esri-popup--shadow")[0] !== undefined) { hideSidebarList(); } }, 500);
                sidebarView.popup.close();
            });

        }
    }, 500);
}

var lastHighlight = "7";

function highlightEvent(eventItemNumber) {
    if (lastHighlight !== "7") {
        $(lastHighlight).css("border-color", "rgb(128,0,128)");
    }

    lastHighlight = $("#" + eventItemNumber)[0].parentElement;
    $(lastHighlight).css("border-color", "rgb(36, 230, 212)");
}

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
    //database.ref("/events").remove();
    sidebarView.graphics.removeAll();

    userMeetupText = $('#user-search').val();
    console.log('search term: ' + userMeetupText)
    //meetupAPI();
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

	/*database.ref().update({
        usersearch: $("#user-search").val()
    });
    database.ref().update({
        usersearch: ""
    });*/

    //Logic for creating event list sidebar
    sidebarView.popup.close();
    setTimeout(function () { sidebarView.popup.close(); }, 1300);

    if (sidebarListCreated) {
        //set list item count to 0
        sidebarListItemCount = 0;
        sidebarListItems = {};
        console.log("hi");
        //delete Sidebar
        hideSidebarList();
    }
    else {
        sidebarListCreated = true;

        if (window.innerWidth <= 500) {
            var notVisible = "display: none;";
        }
        else {
            var notVisible = "";
        }

        //create sidebar button
        $("body").prepend("<a class='btn' style='" + notVisible + "position: absolute; top: 145px; left: 5px; font-family: \"Boogaloo\"; z-index: 50; opacity: 0; transition: opacity 1s; width: 240px; text-align: center;' href='javascript:createSidebarList()' id='event-list-button'>Show Event List</a>");
        setTimeout(function () { $("#event-list-button").css({ opacity: "1" }); }, 1000);
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

                //allow simultaneous users

                //remove existing key
                database.ref("/user-session-unique").remove();

                //create new unique user key based on time and a random number
                var d = new Date().getTime();
                var myRand = d.toString() + (Math.floor(Math.random() * 10000));

                //validate client
                clientSessionKey = myRand;
                console.log("myRand", clientSessionKey);
                //sync to server
                serverSessionKey = myRand;

                //store newly generated key
                database.ref("/user-session-unique").push(myRand);

                if (result.data.events === undefined || result.data.events.length === 0) {
                    M.toast({html: 'No results, Try a different location or filter parameters.'})
                }

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
            },
            fail: function() {
                M.toast({html: 'No results, Try a different location or filter parameters.'})
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
