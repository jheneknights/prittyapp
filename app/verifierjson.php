<?php
/**
 * Created by Eugene Mutai
 * Date: 2/24/13
 * Time: 5:48 PM
 * Description: Store App User data in JSON FORM
 */

include_once('../need/config.php');
require_once(MYSQL);

if(isset($_REQUEST['verified'])) {

	$verified = $_REQUEST['verified'];

	if( $_REQUEST['twname']) {
		$username = strtolower(stripslashes(trim($_REQUEST['twname'])));
	}else{
		$username = sha1(trim($_REQUEST['uuid']));
	}

	if($verified == 0) {
		$filename = '../appdata/'.$username.'.json';
		if(file_exists($filename)) {
			$response = array("success"=>1, "verified"=> true, "existed"=> true);
			echo json_encode($response);
		}else{
			$userdata = json_encode($_REQUEST);
			$fp = fopen($filename, 'w');
			fwrite($fp, $userdata);
			fclose($fp);

			$response = array("success"=>1, "verified"=> true, "existed"=> false);
			echo json_encode($response);
		}
	}else{
		$response = array("success"=>1, "verified"=> true, "existed"=> false);
		echo json_encode($response);
	}

}
