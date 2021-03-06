/**
 * Created by mag94 on 11/28/15.
 */

var editMode = false;
var importedFile = false;

var className = "BASE_POINTS";
var routeOptionsTitle = "ROUTE_OPTIONS";
var routeOptions = {
    title: routeOptionsTitle,
    style: { color:'red' }
};

var startPoint = [42.447724, -76.478072];

function featureSkeleton() {
    return {
        "type": "FeatureCollection",
        "features": [ {
            "type": "Feature",
            "properties": {},
            "geometry": {
                "type": "LineString",
                "coordinates": [
                    [ -74.3613,  41.669898,  604.254761 ],
                    [ -74.244591,  41.734018,  434.72702 ]
                ]
            }
        } ]
    }
}

function getNonEditableRoutePoints(map, routeOptionsTitle, remove) {
    var points = [];
    $.each(map._layers, function(ml) {
        if (map._layers[ml].feature) {
            points.push(this.toGeoJSON());
            if (remove) {
                map.removeLayer(map._layers[ml]);
            }
        }
        else if (map._layers[ml].options) {
            if (map._layers[ml].options.title) {
                if (map._layers[ml].options.title == routeOptionsTitle && remove) {
                    map.removeLayer(map._layers[ml]);
                }
            }
        }
    });

    return points;
}

function getEditableRoutePoints(map, className) {
    this.coords3D = [];
    var self = this;
    $.each(map._layers, function(ml) {
        if (map._layers[ml].options) {
            var opt = map._layers[ml].options;
            if (opt.className == className) {
                self.coords3D = [];  // get coords

                var coords2D = map._layers[ml]._latlngs;
                var numCoords = coords2D.length;   // store lng in x
                // store lat in y, this will allow us to reedit and resave

                var i;
                for (i = 0; i < numCoords; i++) {
                    var lng = coords2D[i].lng;
                    var lat = coords2D[i].lat;
                    var alt = -1.0;
                    var coord = [lng, lat, alt];
                    self.coords3D.push(coord);
                }
                map.removeLayer(map._layers[ml]);
            }
        }
    });
    return this.coords3D;
}

function enableRouteEditing(map, className, routeOptionsTitle) {
    var removeOldRoute = true;
    var routePoints = getNonEditableRoutePoints(map, routeOptionsTitle, removeOldRoute);
    //alert('before edit');   // will need to check what type of route it is, i.e Linestring, Multilinestring...

    var coords2D = [];
    var coords3D = routePoints[0].geometry.coordinates;
    var numCoords = coords3D.length;
    var i;
    //var lim = Math.min(100, numCoords);
    for (i = 0; i < numCoords; i++) {
        var x = (coords3D[i])[1];
        var y = (coords3D[i])[0];
        var coord = [x, y];
        coords2D.push(coord);
    }
    var line = L.polyline(coords2D, {
        className: className
    }).addTo(map);
    line.enableEdit();
    //line.on('dblclick', L.DomEvent.stop).on('dblclick', line.toggleEdit);
    //alert('after edit');
}

function disableRouteEditing(routeID, map, className, routeOptions, routeOptionsTitle, editMode) {
    var ROUTE_ID = routeID;
    if (editMode) {
        saveRouteFromMap(map, className, routeOptions, ROUTE_ID);
    }
    else {
        saveRouteFromPoints(map, routeOptionsTitle, ROUTE_ID);
    }
}

function uploadBatch(i, numCoords, coords3D, ROUTE_ID) {
    var batchCount = 0;
    var batchSize = 75;
    var json;
    var value;
    var values = [];
    for (i; i < numCoords; i++) {
        var lng = (coords3D[i])[0];
        var lat = (coords3D[i])[1];  
        // ***************** CODE FOR SAVING ROUTE TO DB ***************** //

        value = {
            routeid: ROUTE_ID,
            pointid: i,
            lng: lng,
            lat: lat
        };
        values.push(value);
        batchCount++;
        if (batchCount == batchSize) {
            json = {
                "points": values
            };
            $.ajax({
                type: 'POST',
                async: false,
                url: '/points/new_multiple',
                data: json,
                success: function() {
                    console.log("Uploaded bath!");
                    update_progress_bar(i, numCoords);
                    setTimeout(function() {
                        uploadBatch(i + 1, numCoords, coords3D, ROUTE_ID);
                    }, 50);
                }
            });   //values = [];
            //batchCount = 0;

            break;
        }
        else if (i == (numCoords - 1)) {
            json = {
                "points": values
            };
            $.ajax({
                type: 'POST',
                async: false,
                url: '/points/new_multiple',
                data: json,
                success: function() {
                    console.log("Uploaded last batch!");
                }
            });   //values = [];
            //batchCount = 0;

            update_progress_bar(i, numCoords);

            window.location.href = "http://ec2-52-91-63-121.compute-1.amazonaws.com/admin/new_race_route.html";
            alert("Successfully uploaded new race!");
        }  
        // ***************************** END ***************************** //
    }
}

function saveRouteFromPoints(map, routeOptionsTitle, ROUTE_ID) {
    var removeOldRoute = false;
    var routePoints = getNonEditableRoutePoints(map, routeOptionsTitle, removeOldRoute);
    var coords3D = routePoints[0].geometry.coordinates;
    var numCoords = coords3D.length;   // store lng in x
    // store lat in y, this will allow us to reedit and resave
    // maybe put in a third element for altitude

    var i = 0; 
    uploadBatch(i, numCoords, coords3D, ROUTE_ID);  
}

function saveRouteFromMap(map, className, routeOptions, ROUTE_ID) {
    var coords3D = getEditableRoutePoints(map, className);
    var numCoords = coords3D.length;   // store lng in x
    // store lat in y, this will allow us to reedit and resave
    // maybe put in a third element for altitude

    var i = 0;
    uploadBatch(i, numCoords, coords3D, ROUTE_ID);
    //drawNonEditableRoute(map, routeOptions, coords3D);
}

function update_progress_bar(i, numCoords) {
    var progress_bar_ui = document.getElementById("progress-bar-ui");
    var percentComplete = Math.round(i * 100 / (numCoords - 1));
    progress_bar_ui.setAttribute("aria-valuenow", percentComplete.toString());
    progress_bar_ui.style.width = percentComplete.toString() + "%";
    progress_bar_ui.innerHTML = percentComplete.toString() + "%";
}

function drawNonEditableRoute(map, routeOptions, coords) {
    // use skeleton
    var route = featureSkeleton();
    route.features[0].geometry.coordinates = coords;
    var newRoute = L.geoJson(route, routeOptions);
    newRoute.addTo(map);
}

function editRoute() {
    editMode = true;
    enableRouteEditing(map, className, routeOptionsTitle);
}

// exporting the race and route associated with it
function exportRace(raceID, routeID, exportingRoute) {
    var raceJSON = {
        "race": {
            "raceid": raceID,
            "routeid": routeID
        }
    };
    $.ajax({
        type: 'POST',
        async: false,
        url: '/races',
        data: raceJSON,
        success: function() {
            if (!exportingRoute) {
                update_progress_bar(1, 2);
                window.location.href = "http://ec2-52-91-63-121.compute-1.amazonaws.com/admin/new_race_route.html";
                alert("Successfully uploaded new race!");
            }
        }
    });
}

// exporting the route and all of the points associated with it
function exportRoute(routeID) {
    var routeJSON = {
        "route": {
            "routeid": routeID
        }
    };
    $.ajax({
        type: 'POST',
        async: false,
        url: '/routes',
        data: routeJSON,
        success: function() {
            console.log("Success!");
        }
    });

    disableRouteEditing(routeID, map, className, routeOptions, routeOptionsTitle, editMode);
}
