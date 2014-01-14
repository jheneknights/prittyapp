<?php

header('Content-type: application/json; charset=utf-8');

/**
 * Created by JetBrains PhpStorm.
 * User: Jhene
 * Time: 3:10 AM
 * Fetch a single status by ID
 */

include_once('../need/config.php');
;

if(isset($_REQUEST['id'])) {

    require_once(MYSQL);

    $s = "SELECT * FROM ".DATABASE." WHERE id='{$_REQUEST['id']}'";
    $q = mysqli_query ($dbc, $s) or trigger_error("Query: $s \n<br/>MySQL Error: " . mysqli_error($dbc));

	if(mysqli_num_rows($q) != 0) {
        $r = mysqli_fetch_array($q, MYSQLI_ASSOC);
        $jsonarray = array('success'=>1, 'strict'=>0);

        $message = format(str_replace('god', 'God', $r['message']), 0);
        //$r['quoted']; $r['tags']; $r['id']; //$r['tuser']

        //BUILD THE JSON FILE
        $jsonarray['stuff'][] = array('id'=>$r['id'],'tags'=>$r['tags'],'quoted'=>$r['quoted'],'msg'=>$message);
    }

    echo json_encode($jsonarray);

}
