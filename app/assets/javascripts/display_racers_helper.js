/**
 * Created by mag94 on 12/1/15.
 */

var selectedBibsKey = "selectedBibs"; // defined in _header.html.erb
var selectedRaceKey = "selectedRace";
var selected_racers = [];
var selected_races = { "raceid": "",
                       "routeid": "",
                       "points": [] };
var racer_markers = []; // array of markers that are displayed on map
var checkboxes = [];

var resetView = true;

function initializeLocalStorage() {
    // initialize array to store bibs if not yet created
    if (localStorage.getItem(selectedBibsKey) === null) {
        var selectedBibs = [];
        localStorage.setItem(selectedBibsKey, JSON.stringify(selectedBibs));
    }

    selected_racers = JSON.parse(localStorage.getItem(selectedBibsKey)); // view _header to see how bibs are stored

    // initialize array to store races if not yet created
    if (localStorage.getItem(selectedRaceKey) === null) {
        var selectedRaces = { "raceid": "",
                              "routeid": "",
                              "points": [] };
        localStorage.setItem(selectedRaceKey, JSON.stringify(selectedRaces));
    }

    selected_races = JSON.parse(localStorage.getItem(selectedRaceKey)); // view _header to see how bibs are stored
}

function initializeMarkers() {
    // initialize markers for selected racers so locations can be updated
    var n;
    for (n = 0; n < selected_racers.length; n++) {
        var marker = L.marker([0, 0], {opacity: 0});
        marker.addTo(map);
        racer_markers.push(marker);
    }
}

function isInArray(value, array) {
    return array.indexOf(value) > -1;
}

// Code for filter UI that allows users to remove and deselect racers
function createFilterUI() {
    // find reference to filter UI and set its title
    var filter = document.getElementById('checkbox-filter');

    // create a filter interface.
    for (var i = 0; i < selected_racers.length; i++) {
        // item will contain input checkbox and label
        var item = document.createElement('div');

        filter.appendChild(item);
        item.id = selected_racers[i];

        // create checkbox and div to contain it
        var checkbox_div = document.createElement('div');
        checkbox_div.className = "container-checkbox-inline";
        item.appendChild(checkbox_div);
        var checkbox = document.createElement('input');
        checkbox_div.appendChild(checkbox);
        checkbox.type = 'checkbox';
        checkbox.id = selected_racers[i]; // bib number is id for box
        checkbox.checked = false;
        checkboxes.push(checkbox);

        // create a label to the right of the checkbox with racer bib number
        var label = document.createElement('div');
        label.className = "container-label-inline";
        item.appendChild(label);
        label.innerHTML = "BibNo: " + selected_racers[i];
        label.setAttribute('for', selected_racers[i]);
    }
}

// function called whenever someone clicks remove button
// function removes racer's marker with checked checkbox
function remove(e) {
    e.preventDefault();

    var to_keep = [];
    var to_delete_filters = []; // array to identify which divs to remove in filter UI
    var to_delete_indices = []; // array to identify which markers to remove from map
    var i;
    // run through each checkbox and record whether it is checked
    // if it is, add id (aka bibNo) to to_keep so racer marker stays on map
    for (i = 0; i < checkboxes.length; i++) {
        if (!checkboxes[i].checked) {
            // keep bib number associated with checkbox
            to_keep.push(Number(checkboxes[i].id));
        }
        else {
            to_delete_filters.push(checkboxes[i].id);
            to_delete_indices.push(i);
        }
    }

    // delete racer from map and checkbox and label from filter UI
    var orig_len = to_delete_filters.length;
    for (i = 0; i < orig_len; i++) {
        // need to delete starting from end of list so indices do not get mixed up
        var index = orig_len - (i + 1);

        // delete marker from map
        var racer_marker = racer_markers[to_delete_indices[index]];
        racer_markers.splice(to_delete_indices[index], 1);
        map.removeLayer(racer_marker);

        // delete checkbox referencing marker from filter
        var checkbox_marker = to_delete_indices[index];
        checkboxes.splice(checkbox_marker, 1);

        // delete div from filter
        var div_marker = document.getElementById(to_delete_filters[index].toString());
        div_marker.remove();
    }

    localStorage.setItem(selectedBibsKey, JSON.stringify(to_keep));
}

function displayRace(routeId) {
    // retrieve json for selected race
    var storedRacesJson = JSON.parse(localStorage.getItem(selectedRaceKey));

    // getting new race, clear storage of selected racers, routeid, and raceid
    if (routeId != storedRacesJson['routeid'] && routeId.length != 0) {
        var selectedBibs = [];
        localStorage.setItem(selectedBibsKey, JSON.stringify(selectedBibs));

        var routeJSON = {
            "route": {
                "routeid": routeId
            }
        };

	console.log(routeJSON);	

        $.ajax({
            type: 'GET',
	    async: false,
            url: '/welcome/route_to_points.json',
            data: routeJSON,
            success: function(data) {
                var coords3D = [];
                var i;
                for (i = 0; i < data.length; i ++) {
                    var lng = data[i].lng;
                    var lat = data[i].lat;
                    var alt = data[i].alt;
                    var coord = [lng, lat, alt];
                    coords3D.push(coord);
                }

                var raceToUpload = document.getElementById('raceToUpload');
                storedRacesJson = { "raceid" : raceToUpload.options[raceToUpload.selectedIndex].text,
                                    "routeid": routeId,
                                    "points": coords3D };
                localStorage.setItem(selectedRaceKey, JSON.stringify(storedRacesJson));
                location.reload();
            }
        });
    }

    else if (routeId.length == 0) {
        // pass, let browser alert user to select valid race
    }

    else {
        //alert("Race has already been added to map.");
    }
}


function displayBib(bibNo) {
    // retrieve array of selected bibs
    var storedBibs = JSON.parse(localStorage.getItem(selectedBibsKey));

    // store new bibs in array
    if (!isInArray(bibNo, storedBibs)) {
        // check to make sure racer is signed up
        storedBibs.push(bibNo);
        localStorage.setItem(selectedBibsKey, JSON.stringify(storedBibs));
        console.log(localStorage.getItem(selectedBibsKey));
        location.reload();
    }
    else {
        alert("Athlete has already been added to map.");
    }
}

function isRacerActive(e, bool_bibNo, idString, activeList) {
    var bibKey = 'bib';
    var len = activeList.length;

    var bibNo;
    var racerJson;
    var i;

    for (i = 0; i < len; i++) {
        racerJson = activeList[i];
        bibNo = racerJson[bibKey];

        if (bool_bibNo[1] == bibNo) {
            //alert("Match bib number for: " + idString);
            displayBib(bibNo);
            reattachEvents(e);
            return;
        }
    }

    alert(idString + " is not yet active.");
}

function displayIfActive(e, arg1, arg2, callback) {
    var storedRacesJson = JSON.parse(localStorage.getItem(selectedRaceKey));
    var raceid = storedRacesJson["raceid"];

    var raceToUpload = document.getElementById('raceToUpload');
    var routeJSON = {
        "route": {
            "routeid": raceid
        }
    };

    if (raceid.length != 0) {
        $.ajax({
            type: 'GET',
            async: false,
	    url: '/welcome/updated_coords.json',
            data: routeJSON,
            success: function (data) {
                console.log(data);
                callback(e, arg1, arg2, data);
            }
        });
    }
}

function isRacerSignedUp(idString, racerList) {
    var idRacer = idString.toLowerCase();
    var fNameKey = 'firstname';
    var lNameKey = 'lastname';
    var bibKey = 'bib';
    var len = racerList.length;

    var result_list = [];

    var fName;
    var lName;
    var bibNo;
    var racerJson;
    var i;

    for (i = 0; i < len; i++) {
        var result = [];
        racerJson = racerList[i];

        fName = ( racerJson[fNameKey] ).toLowerCase();
        lName = ( racerJson[lNameKey] ).toLowerCase();

        // get bib value if it exists
        if ( racerJson[bibKey] != null) {
            bibNo = ( racerJson[bibKey] );
        }
        else {
            bibNo = "";
        }

        // try to match on first name
        if (idRacer == fName) {
            result[0] = true;
            result[1] = bibNo;
            result_list.push(result);
        }

        // try to match on last name
        else if (idRacer == lName) {
            result[0] = true;
            result[1] = bibNo;
            result_list.push(result);
        }

        // try to match on bib value
        else if (idString == bibNo) {
            result[0] = true;
            result[1] = bibNo;
            result_list.push(result);
        }
    }

    return result_list;
}

function lookupRacerBib(e, idString, racerList) {
    var bool_bibNo_list = isRacerSignedUp(idString, racerList);
    var len = bool_bibNo_list.length;

    // found racer(s) given by the identification string
    if (len > 0) {
        var bool_bibNo;
        // found exactly one match
        if (len == 1) {
            bool_bibNo = bool_bibNo_list[0];
            displayIfActive(e, bool_bibNo, idString, isRacerActive);
        }
        // found multiple matches
        else {
            var listOfMatches = "";
            var i;

            for (i = 0; i < len; i++) {
                bool_bibNo = bool_bibNo_list[i];
                listOfMatches = listOfMatches.concat(idString + ", bibNo: " + bool_bibNo[1].toString() + "\n");
            }

            alert("Found multiple matches. Please search for " + idString + " by bibNo.\n\n" + listOfMatches);
        }
    }
    // No matches were found
    else {
        alert(idString + " is not signed up for this race.");
    }
}

function displayRacer(e, arg, callback) {
    $.ajax({
        type: 'GET',
	async: false,
        url: '/racers.json',
        success: function(data) {
            console.log(data);
            callback(e, arg, data);
        }
    });
}


function getRacerInfo(bibNo, racerJsonList) {
    var racerBibKey = 'bib';
    var len = racerJsonList.length;
    var i;

    for (i = 0; i < len; i++) {
        var racerInfo = racerJsonList[i];
        if (racerInfo[racerBibKey] == bibNo) {
            return racerInfo;
        }
    }
}

function clearMap() {
    $.each(map._layers, function (ml) {
        if (map._layers[ml].feature) {
            map.removeLayer(map._layers[ml]);
        }
        else if (map._layers[ml].options) {
            if (map._layers[ml].options.title) {
                if (map._layers[ml].options.title == routeOptionsTitle) {
                    map.removeLayer(map._layers[ml]);
                }
            }
        }
    });
}

function drawRoute(resetView) {
    clearMap();
    var storedRacesJson = JSON.parse(localStorage.getItem(selectedRaceKey));
    var coords3D = storedRacesJson["points"];

    drawNonEditableRoute(map, routeOptions, coords3D);
    var midLat = coords3D[ coords3D.length/2 ][1];
    var midLng = coords3D[ coords3D.length/2 ][0];
    var routeViewPoint = [midLat, midLng];

    if (resetView) {
        map.setView(routeViewPoint, 13);
    }
}

// use json located in content from html to update coordinates for racers
function plotCoords(racers_json) {
    drawRoute(resetView);

    selected_racers = JSON.parse(localStorage.getItem(selectedBibsKey)); // view _header to see how bibs are stored
    console.log("Log2 - Selected Racers: " + selected_racers);
    // update markers for selected racers on map
    var i;
    for (i = 0; i < selected_racers.length; i++) {
        var bibNo = selected_racers[i];
        var current_racer = getRacerInfo(bibNo, racers_json);
        var racer_marker = racer_markers[i];

        console.log("Log3 - Race Information: " + racers_json);

        racer_marker.setLatLng([current_racer.latitude, current_racer.longitude]).update();
        racer_marker.unbindPopup();
        racer_marker.bindPopup("Racer: " + current_racer.bib + ", Time: " + current_racer.time);
        racer_marker.setOpacity(1);
    }
    resetView = false;
}

function updateCoords() {
    var storedRacesJson = JSON.parse(localStorage.getItem(selectedRaceKey));
    var raceid = storedRacesJson["raceid"];

    console.log("Log1 - Displayed Race Information: " + storedRacesJson);

    var routeJSON = {
        "route": {
            "routeid": raceid
        }
    };

    if (raceid.length != 0) {
        // ajax call to get racers info from another page
        $.ajax({
            type: 'GET',
	    async: false,
            url: "welcome/updated_coords.json",
            data: routeJSON,
            success: function(data) {
                // callback handler
                plotCoords(data);
            }
        });
    }
    setTimeout(updateCoords, 7000); // update every 10 seconds
}
