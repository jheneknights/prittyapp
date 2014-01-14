<?php
/**
 * Created by Eugene Mutai
 * Date: 2/22/13
 * Time: 2:15 PM
 * Description:
 */

include_once('../need/config.php');
require_once(MYSQL);

if(isset($_REQUEST['uuid'])) {

	$uuid = $_REQUEST['uuid'];
	$t = "select * from statusshareuser where uuid='$uuid'";

	$q = mysqli_query ($dbc, $t) or trigger_error("Query: $t \n<br/>MySQL Error: " . mysqli_error($dbc));
	$no = mysqli_fetch_row($q);

	if($no < 1) { //the user does not exist and should be added to te database

		$data = array();
		foreach($_REQUEST as $a=>$b) {
			if($b == null) {
				$data[$a] = "";
			}else{
				$data[$a] = htmlspecialchars($b, ENT_QUOTES,'UTF-8', true);
			}
		}

		//var_dump($data); exit;
		$u = "insert into statusshareuser(uuid, platform, model, twid, twname, twimage, token, secret, latitude, longitude, geolocated, views, activated, lastlogin) values('{$data['uuid']}', '{$data['platform']}', '{$data['model']}', '{$data['twid']}', '{$data['twname']}', '{$data['twimage']}', '{$data['token']}', '{$data['secret']}', '{$data['lat']}', '{$data['long']}', '{$data['geolocated']}', 1, now(), now())";

		$q = mysqli_query ($dbc, $u) or trigger_error("Query: $u \n<br/>MySQL Error: " . mysqli_error($dbc));
		if(mysqli_affected_rows($dbc) == 1) {
			$response = array("success"=>1, "verified"=>1, "message"=>"user successfully registered and verified.");
		}else{
			$response = array("success"=>0, "message"=>"an error occured. try again later");
		}

	}else{
		$response = array("success"=>1, "verified"=>2, "message"=>"user is already verified.");
	}
	echo json_encode($response);
}

