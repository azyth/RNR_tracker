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
        e.preventDefault();
        alert("Please enter a number.");
        return false;
    }

    else if (document.getElementById("bibNo").value.length == 0) {
        // pass, let popup tell user to fill in text box
        e.preventDefault();
        alert("Fill in text box ...");
        return false;
    }

    else {
        // retrieve array of selected bibs
        var storedBibs = JSON.parse(localStorage.getItem(key));

        // store new bibs in array
        if (!isInArray(bibNo, storedBibs)) {

            // check to make sure racer is signed up

            storedBibs.push(bibNo);
            localStorage.setItem(key, JSON.stringify(storedBibs));
            console.log(localStorage.getItem(key));
        }

        else {
            alert("Athlete has already been added to map.");
        }
    }
    location.reload();
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

    localStorage.setItem(key, JSON.stringify(to_keep));
    console.log(localStorage.getItem(key));
}

