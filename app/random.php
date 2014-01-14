<?php

header('Content-type: application/json; charset=utf-8');

/**
 * Created by JetBrains PhpStorm.
 * User: Owner
 * Date: 8/3/12
 * Time: 9:31 PM
 *  GET #30 RANDOM STUFF FROM THE DATABASE EVERY REFRESH
 */

include_once('../need/config.php');
require_once(MYSQL);

//GET THE TOTAL NUMBER OF THE COLLECTION
$t = "SELECT COUNT(id) FROM ".DATABASE;
$q = mysqli_query ($dbc, $t) or trigger_error("Query: $t \n<br/>MySQL Error: " . mysqli_error($dbc));
$no = mysqli_fetch_row($q);
$num = $no[0];

for($x=0;$x<30;$x++) {
    $rand[] = rand(1,$num); //random ids against the TOTAL
}

$ids = join(',', array_values($rand));

//GET THE ID OF THE LAST CURRENT IMAGE
$i = "SELECT * FROM ".DATABASE." WHERE id IN ($ids) ORDER BY likes DESC";
$q = mysqli_query ($dbc, $i) or trigger_error("Query: $i \n<br/>MySQL Error: " . mysqli_error($dbc));


	if(mysqli_num_rows($q) != 0) {

        $jsonarray = array('success'=>1, 'resultset'=>mysqli_num_rows($q), 'strict'=>'random');

        while($r = mysqli_fetch_array($q, MYSQLI_ASSOC) ) {

            $message = format(str_replace('god', 'God', $r['message']), 0);
            //$r['quoted']; $r['tags']; $r['id']; //$r['tuser']

            //BUILD THE JSON FILE
            $jsonarray['stuff'][] = array('id'=>$r['id'],'tags'=>$r['tags'],'quoted'=>$r['quoted'],'msg'=>$message);

        }

        echo json_encode($jsonarray);
        exit();
    }

?>
