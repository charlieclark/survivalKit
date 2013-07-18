<?php

$url = "jizzify.db.8301646.hostedresource.com";
$dbName = "jizzify";
$password = "C4c4c4c4!";


$con = mysql_connect( $url , $dbName ,$password );


if(!$con)
{
    die("could not connect" . mysql_error() );
}
else
{
    echo("hello");
}

?>