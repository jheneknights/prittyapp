<?php
/**
 * Created by Eugene Mutai
 * Date: 3/16/13
 * Time: 3:55 AM
 * Description:
 */

if(isset($_REQUEST['adrequest'])) {

	if($_REQUEST['adrequest'] == 1) {
		$adjson = file_get_contents('http://adfonic.net/ad/4ede737a-01d5-4c84-9cd8-4f5f4f26cce8?s.test=1&t.format=json&r.id=ede737a-01d5-4c84-9cd8-4f5f4f26');
		echo $adjson;
		exit();
	}
}

//http://adfonic.net/ad/4ede737a-01d5-4c84-9cd8-4f5f4f26cce8?s.test=1&t.format=json&r.id=ede737a-01d5-4c84-9cd8-4f5f4f26
?>
