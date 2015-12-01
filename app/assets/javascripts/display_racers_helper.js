/**
 * Created by mag94 on 12/1/15.
 */

// use json located in content from html to update coordinates for racers
// Precondition: html page has json with racer information contained in div specified by JSON_DIV_ID
//               selected_racers and racer_markers are of the same length
function plotCoords(html) {
    var JSON_DIV_ID = "div#racers_info";

    // obtain racers information contained in div
    var tmp = jQuery('<div>').html(html);
    var racers_json = JSON.parse( tmp.find(JSON_DIV_ID).html() );
    selected_racers = JSON.parse(localStorage.getItem(key)); // view _header to see how bibs are stored

    // update markers for selected racers on map
    var i;
    for (i = 0; i < selected_racers.length; i++) {
        var bibNo = selected_racers[i];
        var current_racer = racers_json[bibNo];

        var racer_marker = racer_markers[i];
        racer_marker.setLatLng([current_racer.latitude, current_racer.longitude]).update();
        racer_marker.unbindPopup();
        racer_marker.bindPopup("Racer: " + current_racer.bib + ", Time: " + current_racer.time);
        racer_marker.setOpacity(1);
    }

    console.log(localStorage.getItem(key));
}

function isInArray(value, array) {
    return array.indexOf(value) > -1;
}

function displayBib(e) {
    var key = "bibs";

    // initialize array to store bibs if not yet created
    if (localStorage.getItem(key) === null) {
        var bibs = [];
        localStorage.setItem(key, JSON.stringify(bibs));
    }

    var bibNo = Number( document.getElementById("bibNo").value );

    if (bibNo == null || isNaN(bibNo)) {
        alert("Please enter a number.");
        e.preventDefault();
    }

    else if (document.getElementById("bibNo").value == "") {
        // pass, let popup tell user to fill in text box
        alert("Fill in text box ...");
    }

    else {
        // retrieve array of selected bibs
        var storedBibs = JSON.parse(localStorage.getItem(key));

        // store new bibs in array
        if (!isInArray(bibNo, storedBibs)) {
            storedBibs.push(bibNo);
            localStorage.setItem(key, JSON.stringify(storedBibs));
            console.log(localStorage.getItem(key));
            alert("Check console log from browser to view selected bibs.")
        }

        else {
            alert("Athlete has already been added to map.");
        }
    }
    location.reload();
}

