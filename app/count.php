<?php

include_once('../need/config.php');
require_once(MYSQL);

$t = "SELECT COUNT(id) FROM ".DATABASE;
	$q = mysqli_query ($dbc, $t) or trigger_error("Query: $t \n<br/>MySQL Error: " . mysqli_error($dbc));
	$no = mysqli_fetch_row($q);	
	$num = $no[0];
	
	$total = array('total'=>$num);

echo json_encode($total);
	
?>
