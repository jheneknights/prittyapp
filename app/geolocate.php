<?php
/**
 * Created by Eugene Mutai
 * Date: 2/22/13
 * Time: 3:33 PM
 * Description: Send back Results from google maps
 */

if(isset($_REQUEST['latlng'])) {

	$geo = file_get_contents('http://maps.google.com/maps/api/geocode/json?latlng='.htmlentities(htmlspecialchars(strip_tags($_REQUEST['latlng']))).'&sensor='.$_REQUEST['sensor']);
	echo $geo;

}

//http://maps.google.com/maps/api/geocode/json?latlng=-1.292,36.821&sensor=true
?>
