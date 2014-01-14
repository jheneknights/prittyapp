<?php

//525238024 - over75notes
//630312882 - 75bibles
//634369301 - leahorihime
//623496265 - tmfnation

require("../controllers/twitteroauth.php");
require_once('../controllers/config.php');
require_once(MYSQL);


if($_GET['id']) {

    $id = $_GET['id'];
	
    $s = "SELECT * FROM archive WHERE id='$id'";
    $q = mysqli_query ($dbc, $s) or trigger_error("Query: $s \n<br/>MySQL Error: " . mysqli_error($dbc));
    $get = mysqli_fetch_array($q, MYSQLI_ASSOC);

    if(mysqli_num_rows($q) >= 1) {

        $q = "select * from statuscron where userid='219248574'";
        $use =  mysqli_query ($dbc, $q) or trigger_error("Query: $q\n<br/>MySQL Error: " . mysqli_error($dbc));
        $keys = mysqli_fetch_array($use, MYSQLI_ASSOC);

        $token = $keys['token'];
        $secret = $keys['secret'];

        $tweetmessage = format($get['message'], 0);

        //connection instance, with two new parameters we got in twitter_login.php
        $connection = new TwitterOAuth(KEY, SECRET, $token, $secret);
        $user = $connection->get('account/verify_credentials');

        $update = $connection->post('statuses/update', array( 'status' =>$tweetmessage)); //tweet out

        if($update) {
            $jsonresponse = array('success'=>1, 'username'=>$user->screen_name, 'msg'=>'Status Sweetly Updated!!');
        }else{
            $jsonresponse = array('success'=>0, 'error'=>1,'msg'=>'Oops!! Something Went Wrong!');
        }

    }

    echo json_encode($jsonresponse);

}

?>