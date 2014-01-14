<?php
/**
 * @Author - Eugene Mutai
 * @Twitter - Jheneknights
 *
 * Date: 10/11/12
 * Time: 8:35 PM
 *
 * Description: Fetch stories that match the requested search parameter
 * Community Watch - GG
 * Copyright (C) 2012, @Email - eugenemutai@gmail.com
 *
 * @Version - 1.0 -- DEPRECIATED
 * @Version - 2.0 //no fulltext boolean search
 *
 */

include_once("./need/config.php");
//include_once(MYSQL);

$lmt = 0;
if($_REQUEST['term']) {

	/* NEW - REGEXP MYSQL SEARCH
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
	 *
	 */

	//build the regexp MYSQL search query param
	//JUST COPY AND PASTE IF YOU DONT UNDERSTAND ANYTHING HERE

	$query = strtolower(trim(stripcslashes($_REQUEST['term']))); //decapitalise all words

	//THE REGEXP QUERY GENERATING PART
	if(preg_match('/(\")([\w\s]+)(\")+/', $query, $match)) { //match for enquoted words
		$q = str_replace(array('"', '\''), array("", ""), $match[0]); //build query
		$s = "REGEXP '".$q."'";
		//echo "matched -- ";
	}else{ //if no match was found build an AND/OR query
		$q = explode(' ', $query);
		if(count($q) > 1) { //can replace REGEXP with LIKE
			$s = "REGEXP '".join("' OR story REGEXP '", array_values($q))."'";
			//$s = "LIKE '%".join("%' OR story LIKE '%", array_values($q))."%'"; u can also use LIKE
		}else{
			$s = "REGEXP '".$query."'";
			//$s = "LIKE '%".$query."%'";
		}
	}

	//NOW CREATE THE QUERY $s -- has the specified query
	$qs = "select id,ucase(title) as title,story,ucase(story_location_city) as story_location_city,
        concat('http://www.globalgiving.org/stories/',id) as url,
        concat_ws(' ',title,story,story_location_city,story_location_country,story_location_neighborhood,
        organization_name,revised_organization_name ) as stuff
        from input_form where story ".$s." order by id asc";

	//echo $qs;

	/*
	 * DEPRECIATED - FULLTEXT BOOLEAN SEARCH
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


	$q = mysqli_query ($dbc, $qs) or trigger_error("Query: $s \n<br/>MySQL Error: " . mysqli_error($dbc));
	$rows = mysqli_num_rows($q);

	if($rows != 0) {
		while($x = mysqli_fetch_array($q, MYSQL_ASSOC)) {
			if($lmt <= 15) {
				$results[] = array(
					"id"=>$x['id'],
					"title"=>ucwords(strtolower($x['title'])),
					"location"=>ucwords(strtolower($x['story_location_city'])),
					"url"=>$x['url'],
					"story"=>$x['story']
				);
				$lmt++;
			}
		}
		$jsonresponse = array("success"=>1, "total"=>$rows, "results"=>$results);
	}else{
		$jsonresponse = array("success"=>0, "message"=>"Oops! This is embarrasing! No stories were able to be matched
		 with your search request.", "term"=>$query);
	}

	//give back the results now - JSON Formatted, It's brother knows what to do
	echo json_encode($jsonresponse);

}

?>
