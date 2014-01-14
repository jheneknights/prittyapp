<?php

header('Content-type: application/json; charset=utf-8');

function clean($message) {
    $msg = trim(stripslashes($message));
    $pattern = array('.','/','  ','~','-','#','@','!','&','*','"','?','\\', ',','_', '1/2', '1/2:', '\'',')','(', ':', ';', ',');
    $replace = array('','','','','','','','','','','','','','','','','','','','','','','');
    $string = str_replace($pattern, $replace, $msg);
    return $string;
}


class decodeJSON{
    public $data;
    function decode($json) {
       $this->data = json_decode($json, data);
       return $this->data;
    }
}


include_once('../need/config.php');
require_once(MYSQL);

//NOW GET KEYWORD TO AID IN SEARCH
require_once('../need/extractkeywords.php');

if(isset($_GET['q']) ) {

	$query = $search = strtolower($_GET['q']); //decapitalise any word

	//CLEAN ANY ADDED CRAP BY THE USER
	 $pattern = array('.','/','  ','~','-','#','@','!','&','*','"','?','\\', ',','_', '\'');
	 $replace = array(' ',' ', ' ', ' ', ' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ', '');
	 $string = str_replace($pattern, $replace, $search);

	$words = extractCommonWords($string);
	$keywords = '+'.implode(' +', array_keys($words));
	$search = $keywords;

	$s = "SELECT * FROM ".DATABASE." WHERE MATCH(keywords) AGAINST ('$search' IN BOOLEAN MODE) ORDER BY id ASC LIMIT 30";

	//NOW FETCH THE RESULTS WITH THE RELEANCE BETTER OF EACH WORD

	$q = mysqli_query ($dbc, $s) or trigger_error("Query: $s \n<br/>MySQL Error: " . mysqli_error($dbc));

	if(mysqli_num_rows($q) != 0) {

        $c = "SELECT * FROM ".DATABASE." WHERE MATCH(keywords) AGAINST ('$search' IN BOOLEAN MODE)";
        $qc = mysqli_query ($dbc, $c) or trigger_error("Query: $c \n<br/>MySQL Error: " . mysqli_error($dbc));

    $jsonarray = array('success'=>1, 'resultset'=>mysqli_num_rows($qc), 'strict'=>'strict');

	//GENERATE THE RESULTS
	while($r = mysqli_fetch_array($q, MYSQLI_ASSOC)) {

		$message = strtolower($r['message']);

		$searchwords = explode(' ', $string);
		foreach($searchwords as $instance) {
			$itcanbe = array(ucwords($instance), strtolower($instance));
			foreach($itcanbe as $chances) {
				$chance = '<b>'.$chances.'</b>'; //make the words in search bold, and redd
				$message = str_replace($chances, $chance, $message);
			}
		}

        $message = format(str_replace('god', 'God', $message), 0);
        //$r['quoted']; $r['tags']; $r['id']; //$r['tuser']

        //BUILD THE JSON FILE
        $jsonarray['stuff'][] = array('id'=>$r['id'],'tags'=>$r['tags'],'quoted'=>$r['quoted'],'msg'=>$message);

	}

	}else{ //IF THE MAIN SEARCH HAD NO RESULTS --> ITS TOO STRICT

	$keywords = '';

	//get the search term
	$search = explode(' ', $string); //split it

	foreach($search as $word) {

		if(!in_array($word, $stopWords) ) {
			$keywords .= '+'.$word.'* '; //check its existence as important word or not
		}

	}//end of 4EACH

	$search = $keywords; //the search string

	//NOW FETCH THE RESULTS WITH THE RELEANCE BETTER OF EACH WORD
	$s = "SELECT * FROM ".DATABASE." WHERE MATCH(keywords) AGAINST ('$search' IN BOOLEAN MODE) ORDER BY id ASC LIMIT 30";
	$q = mysqli_query ($dbc, $s) or trigger_error("Query: $s \n<br/>MySQL Error: " . mysqli_error($dbc));

	if(mysqli_num_rows($q) != 0) {

        $c = "SELECT * FROM ".DATABASE." WHERE MATCH(keywords) AGAINST ('$search' IN BOOLEAN MODE)";
        $qc = mysqli_query ($dbc, $c) or trigger_error("Query: $c \n<br/>MySQL Error: " . mysqli_error($dbc));

		//GENERATE THE RESULTS
	while($r = mysqli_fetch_array($q, MYSQLI_ASSOC)) {

		$message = strtolower($r['message']); //MAKE THE MESSAGE LOWERCASE

		if(count(explode(' ', $string)) > 1) { //if the search string was more than one word

				$searchwords = explode(' ', trim($string));

				foreach($searchwords as $instance) {
					$itcanbe = array(ucwords($instance), strtolower($instance)); //it can be capitalized at the start of the string or just in lowercase in the message
					foreach($itcanbe as $chances) {
						$chance = '<b>'.$chances.'</b>'; //make the words in search bold, and redd
						$message = str_replace($chances, $chance, $message);
					}
				}

		}else{ //IF IT WASNT MORE THAN ONE WORD

			$instance = $string;
			$itcanbe = array(ucwords($instance), strtolower($instance));

			foreach($itcanbe as $chances) {
				$chance = '<b>'.$chances.'</b>'; //make the words in search bold, and green
				$message = str_replace($chances, $chance, $message);
			}

		}


        $message = format(str_replace('god', 'God', $message), 0);
        //$r['quoted']; $r['tags']; $r['id']; //$r['tuser']

        //BUILD THE JSON FILE
        $jsonarray['stuff'][] = array('id'=>$r['id'],'tags'=>$r['tags'],'quoted'=>$r['quoted'],'msg'=>$message);

	}

    }else{ //CRAP!!! CRAP!! THE MAIN STRICT SERACH AND THIS SIMPLIFIED COULD NOT FIND ANYTHING

		$jsonarray = array("success"=>0, 'strict'=>'none', 'error'=>"Oops! We could not find results that could match your search string <b>\"".$_GET['q']."\"</b>. It's Kind of embarassing really!!");

	}//end of IF NO RESULT WAS FOUND

}//end of ELSE (simplified search)

    echo json_encode($jsonarray);
    exit();

}//MAIN CLOSING


?>
