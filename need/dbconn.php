<?php //DATABASE CONNECTION SCRIPT

// Connection to the database

define('DB_HOST', 'localhost'); //host

define('DB_USER', 'prittyno_jhene'); //database username

define('DB_PASSWORD', 'wild1s75'); //password

define('DB_NAME', 'prittyno_app'); //database name

// Make the connection:

$dbc = mysqli_connect (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME);

if (!$dbc) {

trigger_error ('Could not connect to MySQL: ' . mysqli_connect_error() );

}

?>
