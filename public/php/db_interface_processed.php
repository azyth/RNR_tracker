<?php

require_once('passwordLib.php');

// General notes:
// 3) Once databases are finalized, will need to change "testdb" to whatever our actual db name is
// 4) In all of my db queries, I'm assuming that the rows look "as expected"; add statements to handle weird cases 
// 6) Should save timestamp information somewhere...
// 7) Switch to curly-brace notation for string concatenation
// 9) check that email and email/race combo exist before updating <-- mission-critical
// 11) Make all letters in the email address lower-case before checking it against the db <-- mission-critical
// 12) Be sure that emails are all *stored* in lower-case

// Database notes:
// 1) Need to add a flag variable to the "Racers" table
// 2) Need to split up Location into Lat and Long in the "RaceEvents" table

// Array to store the output parameters
$response = array();

// Parse the recieved JSON data
$parsedInput = json_decode($_POST["params"], true);

// Testing for type = 0:
// $parsedInput = array("type" => 0, "user" => "kmh287@cornell.edu", "pass" => "blablabla", "t" => "2015-11-23'T'14:42:12.63259");
// $parsedInput = array("type" => 0, "user" => "jon@url.com", "pass" => "wrongpw99", "t" => "2015-11-23'T'14:42:12.63259");
// $parsedInput = array("type" => 0, "user" => "jon@url.com", "pass" => "dumbpw1", "t" => "2015-11-23'T'14:42:12.63259");
// $parsedInput = array("type" => 0, "user" => "mario@otherurl.org", "pass" => "smarterpw57", "t" => "2015-11-23'T'14:42:12.63259");

// Testing for type = 1:
// $parsedInput = array("type" => 1, "user" => "fakeuser", "race" => "Turkeyday Race", "t" => "2015-11-23'T'14:42:12.63259");
// $parsedInput = array("type" => 1, "user" => "jon@url.com", "race" => "fakerace", "t" => "2015-11-23'T'14:42:12.63259");
// $parsedInput = array("type" => 1, "user" => "jon@url.com", "race" => "Turkeyday Race", "t" => "2015-11-23'T'14:42:12.63259");
// $parsedInput = array("type" => 1, "user" => "mario@otherurl.org", "race" => "Turkeyday Race", "t" => "2015-11-23'T'14:42:12.63259");

// Testing for type = 2:
// $parsedInput = array("type" => 2, "user" => "fakeuser", "t" => "2015-11-23'T'14:42:12.63259", 
// 	"data" => '{"LocationJSON1":"{\"user\":\"fakeuser\",\"t\":\"2015-11-23\'T\'14:42:12.63259\",\"lat\":17356.9901,\"long\":14544226.314328}"}');
// $parsedInput = array("type" => 2, "user" => "jay@3rdurl.gov", "t" => "2015-11-23'T'14:42:12.63259", 
// 	"data" => '{"LocationJSON1":"{\"user\":\"jay@3rdurl.gov\",\"t\":\"2015-11-23\'T\'14:42:12.63259\",\"lat\":17356.9901,\"long\":14544226.314328}"}');
// $parsedInput = array("type" => 2, "user" => "jon@url.com", "t" => "2015-11-23'T'14:42:12.63259", 
// 	"data" => '{
// 		"LocationJSON1":"{\"user\":\"jon@url.com\",\"t\":\"2015-11-23\'T\'14:42:12.632561\",\"lat\":17356.9904,\"long\":14544226.314335}",
// 		"LocationJSON2":"{\"user\":\"jon@url.com\",\"t\":\"2015-11-23\'T\'14:42:34.74573\",\"lat\":17356.9908,\"long\":14544226.314308}"
// 	}');


// Add single quotes to a string so that it will be accepted by the postgres db
function formatString($unquotedStr){
	return "'" . $unquotedStr . "'";
}

// Reformat the Android timestamp into a postgres timestamp
// Android timestamp format: "yyyy-MM-dd'T'HH:mm:ss.SSSZZ"
// Postgres timestamp format: "'yyyy-MM-dd HH:mm:ss.nnnnnn'"
function formatTimestamp($datatime){
	$timestampArr = explode("'T'", $datatime);
	$timestampStr = implode(" ", $timestampArr);
	return $timestampStr;
	// return "'" . $timestampStr . "'";
}

// Open a connection to the database, and insert the recieved data
$conn = pg_connect("user=postgres dbname=project_development");

if (!$conn) { // If can't connect to the database, terminate the script and return failure
	$response["success"] = False;
	$response["message"] = "Couldn't establish connection with database";
	echo json_encode($response);
	exit;
} 

if (!array_key_exists("type", $parsedInput)){ // "type" parameter not present in input

	$response["success"] = False;
	$response["message"] = "'type' parameter does not exist";
	echo json_encode($response);

} elseif ($parsedInput["type"] == 0){ // Login request

	// $email = formatString($parsedInput["user"]);
	// $password = formatString($parsedInput["pass"]);
	$email = strtolower($parsedInput["user"]);
	$password = $parsedInput["pass"];
	$timestamp = formatTimestamp($parsedInput["t"]); // <-- ignoring this for now

	// $loginQuery = "SELECT password FROM Users WHERE email = " . $email . ";";
	// $loginQuery = "SELECT password FROM Users WHERE email = '" . $email . "';";
	// $queryResult11 = pg_query($loginQuery);
	
	// $loginQuery = pg_prepare("pw_request", "SELECT password FROM Users WHERE email = $1");
	$loginQuery = pg_prepare("pw_request", "SELECT password_digest FROM Users WHERE email = $1");
	$queryResult11 = pg_execute("pw_request", array($email));
	if (!$queryResult11){ // query returned bupkis

		$response["success"] = False;
		$response["message"] = "Query returned null result";
		$response["races"] = json_encode(array());
		echo json_encode($response);

	} else{ // found the user in the database

		$resultRow = pg_fetch_assoc($queryResult11);
		
		//print_r(array_values($resultRow));

		// if (!array_key_exists('password', $resultRow)){ // Email isn't in the database
		if (!array_key_exists('password_digest', $resultRow)){ // Email isn't in the database

			$response["success"] = False;
			$response["message"] = "Racer email not present in the database";
			$response["races"] = json_encode(array());
			echo json_encode($response);

		// } elseif ($resultRow['password'] == $password){ // Password matches, so send the user some data
		// } elseif (password_verify($password, $resultRow['password'])){ // Password matches, so send the user some data
		} elseif (password_verify($password, $resultRow['password_digest'])){ // Password matches, so send the user some data

			// print_r(array_values($resultRow));

			$raceArr = array();
			// $racerQuery = "SELECT raceid FROM Racers WHERE email = " . $email . ";";
			// $racerQuery = "SELECT raceid FROM Racers WHERE email = '" . $email . "';";
			// $queryResult12 = pg_query($racerQuery);
			$racerQuery = pg_prepare("race_request", "SELECT raceid FROM Racers WHERE email = $1");
			$queryResult12 = pg_execute("race_request", array($email));
			while($resultRow = pg_fetch_assoc($queryResult12)){ // Loop over all of the races, collecting 
				array_push($raceArr,$resultRow["raceid"]);
			}
			$response["success"] = True;
			$response["message"] = "Success!";
			//$response["races"] = json_encode($raceArr);
			$response["races"] = $raceArr;
		
			echo json_encode($response);

		} else{ // password doesn't match what's in the db

			$response["success"] = False;
			$response["message"] = "Password does not match";
			$response["races"] = json_encode(array());
			echo json_encode($response);

		}
	}

} elseif ($parsedInput["type"] == 1) { // Race selection <-- CAN POTENTIALLY ELIMINATE THIS ENTIRE SECTION

	// $email = formatString($parsedInput["user"]);
	// $raceid = formatString($parsedInput["race"]);
	// $email = formatString($parsedInput["user"]);
	// $raceid = formatString($parsedInput["race"]);
	$email = strtolower($parsedInput["user"]);
	$raceid = $parsedInput["race"];
	$timestamp = formatTimestamp($parsedInput["t"]); // <-- ignoring this for now

	// Make sure that all of the racer's other 'iscurrent' flags are set to zero
	// $flagQuery1 = "UPDATE Racers SET iscurrent = false WHERE email = " . $email . ";"; # <-- need to check that racer is in the database
	// $queryResult21 = pg_query($flagQuery1);
	$flagQuery1 = pg_prepare("flag_request1", "UPDATE Racers SET iscurrent = false WHERE email = $1");
	$queryResult21 = pg_execute("flag_request1", array($email));
	if (!$queryResult21){ // query returned bupkis # <-- Is this supposed to return anything, though?

		$response["success"] = False;
		$response["message"] = "Couldn't update user's old race statuses";
		echo json_encode($response);

	} else{ // old race statuses updated

		// $flagQuery2 = "UPDATE Racers SET iscurrent = true WHERE email = " . $email . " AND raceid = " . $raceid . ";";
		// $queryResult22 = pg_query($flagQuery2);
		$flagQuery2 = pg_prepare("flag_request2", "UPDATE Racers SET iscurrent = true WHERE email = $1 AND raceid = $2");
		//$queryResult22 = pg_execute("flag_request2", array($email));
		$queryResult22 = pg_execute("flag_request2", array($email,$raceid));

		if (!$queryResult22){ // need to check that the race exists for that racer

			$response["success"] = False;
			$response["message"] = "Couldn't update user's new race status";
			echo json_encode($response);

		} else{

			$response["success"] = True;
			$response["message"] = "Success!";
			echo json_encode($response);

		}
	}

} elseif ($parsedInput["type"] == 2) { // Location upload

	// $email = formatString($parsedInput["user"]);
	$email = $parsedInput["user"];
	$timestamp = formatTimestamp($parsedInput["t"]);
	// $data = json_decode($parsedInput["data"], true); // <-- this results is an array of jsons
	$data = $parsedInput["data"]; // <-- this results is an array of jsons	
	// $latitude = $parsedInput["lat"];
	// $longitude = $parsedInput["long"];

	// Make sure that all of the racer's other 'iscurrent' flags are set to zero
	// $currRaceQuery = "SELECT raceid, bib FROM Racers WHERE email = " . $email . " AND iscurrent = true;";
	// $currRaceResult = pg_query($currRaceQuery);
	$currRaceQuery = pg_prepare("currRace_request", "SELECT raceid, bib FROM Racers WHERE email = $1 AND iscurrent = true");
	$currRaceResult = pg_execute("currRace_request", array($email));
	if (!$currRaceResult){ // query returned bupkis

		$response["success"] = False;
		$response["message"] = "User not currently participating in any races";
		echo json_encode($response);

	} else{

		$resultRow = pg_fetch_assoc($currRaceResult);
		if (!array_key_exists('raceid', $resultRow) || !array_key_exists('bib', $resultRow)){

			$response["success"] = False;
			$response["message"] = "User not currently participating in any races";
			echo json_encode($response);

		} else{ // asume that if raceid is present, other variables will be as well
			// $formattedArr = array();
			// foreach ($data as $loc){
	  // 			// $locJSON = json_decode($loc, true);
			// 	$locJSON = $loc;	
   //  				// $formattedString = "('" . $resultRow["raceid"] . "', " . $resultRow["bib"] . ", " . formatTimestamp($locJSON["t"]) . ", " . $locJSON["lat"] . ", " . $locJSON["long"] . ")"; // <-- NEED TO FORMAT FIRST TWO
			// 		$formattedString = "('" . $resultRow["raceid"] . "', " . $resultRow["bib"] . ", " . formatTimestamp($locJSON["t"]) . ", " . $locJSON["lat"] . ", " . $locJSON["long"] . ")"; // <-- NEED TO FORMAT FIRST TWO
   //  				array_push($formattedArr, $formattedString);
  	// 		}

			// // $locationString = $resultRow["raceid"] . $resultRow["bib"] . $timestamp . $latitude . $longitude; // <-- NEED TO FORMAT FIRST TWO
			// // $locationQuery = "INSERT INTO RaceEvents (raceid, bib, time, latitude, longitude) VALUES (" . $locationString . ");";
			// $locationString = implode(", ", $formattedArr);
			// $locationQuery = "INSERT INTO RaceEvents (raceid, bib, time, latitude, longitude) VALUES " . $locationString . ";";
			// $locationResult = pg_query($locationQuery);
			$formattedArr = array();
			// $locationQuery = pg_prepare("location_request", "INSERT INTO RaceEvents (raceid, bib, time, latitude, longitude) VALUES ($1, $2, $3, $4, $5)");
			$locationQuery = pg_prepare("location_request", "INSERT INTO Race_Events (raceid, bib, time, latitude, longitude, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, now(), now())");
			foreach ($data as $loc){
				$locationResult = pg_execute("location_request", array($resultRow["raceid"], $resultRow["bib"], formatTimestamp($loc["t"]), $loc["lat"], $loc["long"]));
  			}

			if (!$locationResult){  // query returned bupkis # <-- Is this supposed to return anything, though?

				$response["success"] = False;
				$response["message"] = "Couldn't update user's location";
				echo json_encode($response);

			} else{

				$response["success"] = True;
				$response["message"] = "Success!";
				echo json_encode($response);

			}

		}

	}

	
} else{

	$response["success"] = False;
	$response["message"] = "Invalid value for 'type' parameter";
	echo json_encode($response);

}

pg_close($conn); // Close the connection

?>
