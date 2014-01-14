<?php
/**
 * @Author - Eugene Mutai
 * @Twitter - Jheneknights
 *
 * Date: 10/11/12
 * Use Date: 13/03/13
 * Time: 7:35 PM
 *
 * Past Description: Fetch stories that match the requested search parameter, Commmunity Watch - GG
 * @Description - Fetch statuses from the DATABASE without BOOLEAN SEARCH
 * Copyright (C) 2012, @Email - eugenemutai@gmail.com
 *
 * @Version - 4.0 //no fulltext boolean search - takes alot more parameter requests than before
 *
 */

header('Content-type: application/json; charset=utf-8');
function clean($message) {
	$msg = trim(stripslashes($message));
	$pattern = array('.','/','  ','~','-','#','@','!','&','*','"','?','\\', ',','_', '1/2', '1/2:', '\'',')','(', ':', ';', ',');
	$replace = array('','','','','','','','','','','','','','','','','','','','','','','');
	$string = str_replace($pattern, $replace, $msg);
	return $string;
}

include_once('../need/config.php');
require_once(MYSQL);

//NOW GET KEYWORD TO AID IN SEARCH
require_once('../need/extractkeywords.php');

$lmt = 0;
if($_REQUEST['q']) {

	$query = strtolower(trim(stripcslashes($_REQUEST['q']))); //decapitalise all words

	//CLEAN ANY ADDED CRAP BY THE USER
	$ptn = array('.','/','  ','~','-','#','@','!','&','*','"','?','\\', ',','_', '\'');
	$rplc = array(' ',' ', ' ', ' ', ' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ', '');
	$query = str_replace($ptn, $rplc, $query);

	$string = $query;

	//REPLACEMENT ARRAY TO BUILD THE QUERY
	$pattern = array('or', 'and not', 'not', 'and');
	$replace = array('OR message REGEXP', 'AND message NOT REGEXP', 'AND message NOT REGEXP', 'AND message REGEXP');

	/* NEW, BETA - REGEXP MYSQL SEARCH
	 *
	 * NO fulltext
	 * NO boolean mode
	 * NO database modifications required
	 * NO breaking - in searches or script
	 * @param - eg.  "give hope" - for search phrase ||| give hope - for and/or | where both or either exist in the
	 * database
	 *
	 *
	 * @Params COVERED:
	 *
	 * mother father -- it searches for mothers OR fathers by default [x]
	 * "sick mother" will only find stories with that exact phrase [x]
	 * mother and daughter will find stories containing both/all words. [x]
	 * mother and daughter or son [x]
	 * mother and daughter not/and not son [x]
	 * mother and not/not father [x]
	 * "aids patient" or hiv [x]
	 * "aids patient" and hiv [x]
	 * "aids patient" and not/not hiv [x]
	 *
	 * AND - AND story REGEXP/LIKE 'word'
	 * OR - OR story REGEXP/LIKE 'word'
	 * NOT/AND NOT - AND NOT story REGEXP 'word'
	 *
	 */

	$c = '';
	if(preg_match('/(\")([\w\s]+)(\")(\s)?(and|or|and not|not)(\s)?(\")([\w\s]+)(\")(\s)?+/', $query, $m)) {
		foreach($m as $match) {
			$a[] = $match;
		}
		$filter = 'REGEXP '.str_replace($pattern, $replace, $query);
		$s = str_replace('"', '\'', $query);
	}else{
		if(preg_match_all('/(\")([\w\s]+)(\")+/', $query, $m)) { //match for "give hope" or more of such like
			foreach($m as $match) {
				$a[] = explode($match[0], $query);
			} //remove it from the main syntax incase there is an additional parameter eg. "give hope" and not love
			foreach($a[0] as $b) {
				if($b != ''){
					$c = $c.' '.$b;
				}
			} //get the other part, build it
			$d = explode(' ', $c);
			foreach($d as $e) { //remove and|and not|not|or
				if($e != '' and $e != 'or' and $e != 'and' and $e != 'not') {
					$y[] = $e;
					$z[] = '\''.$e.'\''; //build the replacements to be able to make out a clean syntax in the end
				}
			}
			//var_dump($y);
		}else{ //if the first part eg. "give hope"....did not match
			if(preg_match('/(and|or|and not|not)(([\w.-]+)?)/', $query)) { //match for eg. mother and father and not love
				$e = explode(' ', $query);
				foreach($e as $f) { //split em and loop thru to remove and|or|not
					if($f != '' and $f != 'or' and $f != 'and' and $f != 'not') {
						$y[] = $f;
						$z[] = '\''.$f.'\''; //build the replacements to be able to make out a clean syntax in the end
					}
				}
			}else{ //if did not have and|or|not eg. give hope, red cross, sick mother
				$e = explode(' ', $query);
				foreach($e as $f) { //just split it and build the  replacements to be able to make out a clean syntax in the end
					$y[] = $f;
					$z[] = '\''.$f.'\'';
				}
				$query = join(' and ', array_values($e)); //rephrase the query to eg. give and hope, red and cross,
				//sick and mother
			}
			//var_dump($y);
		}
	}

	//build the regexp MYSQL search query param

	$filter = 'REGEXP '.str_replace($pattern, $replace, $query);
	//echo "<hr />";  //for debugging

	//THE REGEXP QUERY GENERATING PART
	if(preg_match('/(\")([\w\s]+)(\")+/', $filter, $match)) { //match for enquoted words
		$q = str_replace(array('"', '\''), array("", ""), $match[0]); //build query
		$s = "REGEXP '".$q."'";
		if($query != $match[0]) {
			$s = str_replace($match[0], $s, $filter);
		}
		//echo "matched -- ";
	}else{
		$s = $filter;
	}


	/*
	 * DROPPED THIS - @version 2.0's, not required anymore since it's built in
	 *
     * else{ //if no match was found build an AND/OR query
			$q = explode(' ', $query);
			if(count($q) > 1) { //can replace REGEXP with LIKE
				$s = "REGEXP '".join("' OR story REGEXP '", array_values($q))."'";
				//$s = "LIKE '%".join("%' OR story LIKE '%", array_values($q))."%'"; u can also use LIKE
			}else{
				$s = "REGEXP '".$query."'";
				//$s = "LIKE '%".$query."%'";
			}
		}
	 *
	 */

	$s = str_replace('REGEXP REGEXP', 'REGEXP', $s); //a lil bug that repeats the REGEXP
	if(isset($y)) { //now clean the syntax for mySQL eg hope --> 'hope'
		$s = str_replace($y, $z, $s);
	}else{
		$s = str_replace('"', '\'', $s); //do nothing to if there is no syntax cleaning
	}

	//echo $s;
	//echo "<hr />";

	//NOW CREATE THE  - $s -- has the specified query
	if(isset($_REQUEST['last'])) {
		$last =  $_REQUEST['last'];
		$qs = "select * from ".DATABASE." where message ".$s." and id > '$last' order by id asc limit 30";
	}else{
		$qs = "select * from ".DATABASE." where message ".$s." order by id asc limit 30";
	}



	/*
	 * DEPRECIATED - FULLTEXT BOOLEAN SEARCH, @version - 1.0
	 *
	$qry = explode(' ', $query);
	$search = '+'.implode(' +', array_values($qry)); //creating the param - all keywords to exist in results

	$s = "select id,ucase(title) as title,story,ucase(story_location_city) as story_location_city,
        concat('http://www.globalgiving.org/stories/',id) as url,
        concat_ws(' ',title,story,story_location_city,story_location_country,story_location_neighborhood,
        organization_name,revised_organization_name ) as stuff
        from input_form where match(story) AGAINST ('$search' IN BOOLEAN MODE) order by id asc";
	*
	*/

	//PERFORM THE QUERY - AHOYY!! SHIP IS A SAIL NOW, FULL TROTTLE
	$q = mysqli_query ($dbc, $qs) or trigger_error("Query: $qs \n<br/>MySQL Error: " . mysqli_error($dbc));
	$rows = mysqli_num_rows($q);

	$c = "select id from ".DATABASE." where message ".$s;
	$cq = mysqli_query ($dbc, $c) or trigger_error("Query: $c \n<br/>MySQL Error: " . mysqli_error($dbc));
	$total = mysqli_num_rows($cq);

	if($rows != 0) {
		while($x = mysqli_fetch_array($q, MYSQL_ASSOC)) {

			$message = strtolower($x['message']); //MAKE THE MESSAGE LOWERCASE
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
			$results[] = array(
				"id"=>$x['id'],
				"tags"=>ucwords(strtolower($x['tags'])),
				"quoted"=>ucwords(strtolower($x['quoted'])),
				"msg"=>$message
			);
		}
		$jsonarray = array('success'=>1, 'resultset'=>$total, 'strict'=>'correct', 'stuff'=>$results);
	}else{
		if(isset($_REQUEST['last'])) {
			$jsonarray = array("success"=>2, 'strict'=>'all', 'error'=> "That's all there is folks!");
		}else{
			$jsonarray = array("success"=>0, 'strict'=>'all', 'error'=> "Oops! We could not find results that could match your search string <b>\"".$_GET['q']."\"</b>. It's kind of embarassing really!!");
		}
	}

	//give back the results now - JSON Formatted, It's brother knows what to do
	echo json_encode($jsonarray);

}

?>

