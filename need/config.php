<?php // CONFIGURATION FILE

define('LIVE', false); // (if) FALSE: all errors are sent to the browser

//root folder of the domain
define('BASE_URL','http://app.prittynote.com/');

//CHOOSE DATABASE - archive(all ccrap out there) or biblic(inspiration only)
if(isset($_COOKIE['smstable']) ) {
	define('DATABASE', $_COOKIE['smstable']);
}else{
	define('DATABASE', 'archive');
}

//SITE NECESSITIES
define('SITENAME', 'prittynote_'); //sitename image prefix

define('ADMIN', '+254723001575');
define('PASSWORD', 'wild1s75');
define('EMAIL', 'error@prittynote.com'); //define admin email address here!!

$adminno = '+254723001575';

// LOCATION of mySQL connection script
define('MYSQL', '../need/dbconn.php'); //define path of mysql connection script

date_default_timezone_set('Africa/Nairobi');

// FUNCTION TO TAKE CARE OF REDIRECTIONS
function twendeHapa($url)
{ 
echo '<script type="text/javascript">
			<!--
			window.location = "'.$url.'"
			//–>
		 </script>';
}


// --------------------------- PAGINATION ------------------------- //

$display = 24;
$no_blog = 5;
$range = 5;


//*****************  ERROR MANAGEMENT ********************//

// Create the error handler:

function my_error_handler ($e_number, $e_message, $e_file, $e_line, $e_vars) {
	
// Build the error message.
$message = "<br /><br /><p>An error occurred in script '$e_file' on line $e_line: $e_message \n <br />";

// Add the date and time:
$message .= "Date/Time: " . date('n-j-Y
H:i:s') . "\n<br />";

// Append $e_vars to the $message:
$message .= "<pre>" . print_r ($e_vars,1) . "</pre>\n</p>";

if (!LIVE) { 	// Development (print the error).

	 	echo '<div id="Error">'.$message.'</div><br />';

} else { 	// Don't show the error:

// Send an email to the admin:

mail(EMAIL, 'Site Error!', $message, 'From: jhenetic@gmail.com');

// Only print an error message if the error isn't a notice:

if ($e_number != E_NOTICE) {
	
	echo '<div id="Error">A system error occurred. We apologize for the inconvenience.</div><br />';
		
		}
	} // End of !LIVE IF.
	
} // End of my_error_handler() definition.

// Use my error handler.
set_error_handler ('my_error_handler');

// ************ END OF ERROR MANAGEMENT **************//


$stopWords= array("a", "a's", "according", "accordingly", "actually", "after", "afterwards", "again", "against", "ain't", "all", "allow", "allows", "almost", "alone", "along", "already", "also", "although", "always", "am", "among", "amongst", "an", "and", "another", "any", "anybody", "anyhow", "anyone", "anything", "anyway", "anyways", "anywhere", "appropriate", "are", "aren't", "around", "as", "aside", "asking", "associated", "at", "available", "away", "awfully", "b", "be", "became", "because", "become", "becomes", "becoming", "been", "before", "beforehand", "behind", "being", "below", "beside", "besides", "best", "better", "between", "beyond", "both", "brief", "but", "by", "c", "c'mon", "c's", "came", "can", "can't", "cannot", "cant", "cause", "causes", "certain", "certainly", "changes", "clearly", "co", "com", "come", "comes", "concerning", "consequently", "consider", "considering", "contain", "containing", "contains", "corresponding", "could", "couldn't", "course", "currently", "d", "definitely", "described", "despite", "did", "didn't", "different", "do", "does", "doesn't", "doing", "don't", "done", "down", "downwards", "during", "e", "each", "edu", "eg", "either", "else", "elsewhere", "enough", "entirely", "especially", "et", "etc", "even", "ever", "every", "ex", "exactly", "example", "except", "f", "far", "few", "for", "former", "formerly", "from", "further", "furthermore", "g", "get", "gets", "getting", "go", "goes", "going", "gone", "got", "gotten", "h", "had", "hadn't", "happens", "hardly", "has", "hasn't", "have", "haven't", "having", "he", "he's", "hello", "hence", "her", "here", "here's", "hereafter", "hereby", "herein", "hereupon", "hers", "herself", "hi", "him", "himself", "his", "hither", "hopefully", "how", "howbeit", "however", "i", "i'd", "i'll", "i'm", "i've", "ie", "if", "in", "inasmuch", "inc", "indeed", "indicate", "indicated", "indicates", "inner", "insofar", "instead", "into", "inward", "is", "isn't", "it", "it'd", "it'll", "it's", "its", "itself", "j", "just", "k", "keeps", "kept", "knows", "known", "l", "lately", "later", "latter", "latterly", "least", "less", "lest", "let", "let's", "likely", "look", "looking", "looks", "ltd", "m", "mainly", "many", "may", "maybe", "me", "mean", "meanwhile", "merely", "might", "more", "moreover", "most", "mostly", "much", "must", "my", "myself", "n", "name", "namely", "nd", "near", "nearly", "necessary", "neither", "never", "nevertheless", "next", "no", "nobody", "non", "none", "noone", "nor", "normally", "not", "nothing", "novel", "now", "nowhere", "o", "obviously", "of", "off", "often", "oh", "ok", "okay", "on", "once", "ones", "only", "onto", "or", "other", "others", "otherwise", "ought", "our", "ours", "ourselves", "out", "outside", "over", "overall", "own", "p", "particular", "particularly", "per", "perhaps", "placed", "please", "plus", "presumably", "probably", "q", "que", "qv", "r", "rather", "rd", "re", "really", "reasonably", "regarding", "regardless", "regards", "relatively", "respectively", "s", "same", "saw", "say", "saying", "says","secondly", "see", "seeing", "seem", "seemed", "seeming", "seems", "seen", "self", "selves", "sensible", "sent", "seriously", "several", "shall", "she", "should", "shouldn't", "since", "so", "some", "somebody", "somehow", "something", "sometimes", "somewhat", "specified", "specify", "specifying", "still", "sub", "such", "sup", "sure", "t", "t's", "take", "tell", "tends", "th", "than", "thanx", "that", "that's", "thats", "the", "their", "theirs", "them", "themselves", "then", "thence", "there", "there's", "thereafter", "thereby", "therefore", "therein", "theres", "thereupon", "these", "they", "they'd", "they'll", "they're", "they've", "think", "this", "thorough", "thoroughly", "those", "though", "through", "throughout", "thru", "thus", "to", "too", "took", "toward", "towards", "tries", "u", "un", "under", "unfortunately", "unless", "unlikely", "until", "unto", "up", "upon", "us", "use", "used", "useful", "uses", "using", "usually", "v", "various", "very", "via", "viz", "vs", "w", "want", "wants", "was", "wasn't", "way", "we", "we'd", "we'll", "we're", "we've", "well", "went", "were", "weren't", "what", "what's", "whatever", "when", "whence", "whenever", "where", "where's", "whereafter", "whereas", "whereby", "wherein", "whereupon", "wherever", "whether", "which", "while", "whither", "who", "who's", "whoever", "whole", "whom", "whose", "why", "willing", "won't", "would", "wouldn't", "x", "y", "yes", "yet", "you", "you'd", "you'll", "you're", "you've", "your", "yours", "yourself", "yourselves", "z", "zero", "retweet", "text", "tweet", "offto", "surely", "retweetable", "pg", "retweeting", "RT", "wanna", "shit", "omg", "takes", "gotta", "ya'll", "youre", "youll","wasnt", "back", "dont", "werent" , "youve", "uve");


function format($text, $encode) {
	
	if($encode == 0) {
		$formatted = htmlspecialchars_decode($text, ENT_QUOTES);
	}else{
		$formatted = htmlspecialchars($text, ENT_QUOTES, 'UTF-8', true);
	}
		
	return $formatted;
}

function html($text) {
	$text = html_entity_decode($text, ENT_QUOTES, 'UTF-8');
	return $text;	
}
       
?>
