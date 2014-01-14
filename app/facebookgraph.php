<?php
/**
 * Created by Eugene Mutai
 * Date: 3/17/13
 * Time: 1:28 AM
 * Description: SREVER-SIDE FACEBOOK MANIPULATION FOR USER
 */

include_once('../need/config.php');
require_once('../need/facebook.php');
require_once('../need/base_facebook.php');

$config = array(
	'appId'=>174435359371643,
	'secret'=>"fc7a65f65a61456b8d8d42eb4ee98823"
);
$param = array('scope'=>'publish_stream, publish_actions');
$facebook = new Facebook($config);

if(isset($_REQUEST['do']) && isset($_REQUEST['access_token'])) {

	$jsonresponse = array();
	$request = trim($_REQUEST['do']);
	$access_token = stripslashes(trim($_REQUEST['access_token']));

	//Set a new access token, by first getting it via means other than the SDK
	$facebook->setAccessToken($access_token);
	$uid = $facebook->getUser();

	if($uid !== 0) {  //if the user is logged in
		// We have a user ID, so probably a logged in user.
		// If not, we'll get an exception, which we handle below.

		//do as per requested by the user
		switch($request) {
			case "credentials":
				try {
					$user_profile = $facebook->api('/me','GET');
					$jsonresponse = array("success"=>1, "user"=>$user_profile, "type"=>"credentials", "message"=>"user credentials request was successful.");
				} catch(FacebookApiException $e) {
					// If the user is logged out, you can have a
					// user ID even though the access token is invalid.
					// In this case, we'll get an exception, so we'll
					// just ask the user to login again here.

					$jsonresponse = errorOccured($config, $param, $e->getType(), $e->getMessage());
				}
				break;
			case "post":
				if(isset($_REQUEST['message'])) { //message should exist
					try {
						$response = $facebook->api('/me/feed', 'POST', array('message' => $_REQUEST['message']));
						if($response['id']) {
							$jsonresponse = array("success"=>1, "type"=>"status update", "message"=>"the status was updated successfully
							.");
						}
					} catch(FacebookApiException $e) {
						// If the user is logged out, you can have a
						// user ID even though the access token is invalid.
						// In this case, we'll get an exception, so we'll
						// just ask the user to login again here.

						$jsonresponse = errorOccured($config, $param, $e->getType(), $e->getMessage());
					}
				}else{
					//no message was given
				}
				break;
			case "login":
				//check if the user is logged in
				break;
			case "logout":
				//if the user wants to log out
				break;
		}//switch case

	}//end of uid
	else{ //user is not logged in
		$jsonresponse = array(
			"success"=>0,
			"type"=>"login",
			"message"=>"User is not logged in.",
			"url"=>$facebook->getLoginUrl($param)
		);
	}

	echo json_encode($jsonresponse); //send back the json response
	exit();
}

function errorOccured($config, $param, $etype, $edesc) {
	$fb = new Facebook($config);
	return array(
		"success"=>0,
		"type"=>"login",
		"message"=>"User is not logged in. Redirect user to Facebook login page",
		"url"=>$fb->getLoginUrl($param),
		"error_type"=>$etype,
		"error_description"=>$edesc
	);
}

