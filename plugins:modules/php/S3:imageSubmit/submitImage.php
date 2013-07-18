<?php

$file =  $_POST['theImage'];
$file = preg_replace('#^data:image/[^;]+;base64,#', '', $file);
$data = base64_decode($file);
$im = imagecreatefromstring($data);

$fileTempName = tempnam("/tmp", "FOO");
imagejpeg( $im , $fileTempName );




//image size
$imgSize = getimagesize($fileTempName);
$imgSizeW = $imgSize[0];
$imgSizeH = $imgSize[1];


$destW = $_POST["destW"];
$destH = $_POST["destH"];

$w = $_POST["cropWidth"] * $imgSizeW;
$h = $_POST["cropHeight"] * $imgSizeH;
$l = $_POST["cropLeft"] * $imgSizeW;
$t = $_POST["cropTop"] * $imgSizeH;


//image processing
$imgW = $destW;
$imgH = $destH;

//creating empty image
$image_p = imagecreatetruecolor($imgW, $imgH);



//cropping image
imagecopyresampled($image_p, $im, 0, 0, $l, $t, $imgW, $imgH, $w, $h);

//writing image back
imagejpeg( $image_p , $fileTempName );


//creating thumbnail

$jL = $_POST["jizzLink"];

$finalThumb = imagecreatetruecolor(150, 150);

$over = imagecreatefrompng ( $jL );


imagealphablending( $image_p, true );
imagesavealpha( $image_p, true );


$thumb = imagecopy(  $image_p , $over , 0 , 0 , 0 , 0,  $destW , $destH  );

imagecopyresampled($finalThumb, $image_p, 0, 0, 0, 0, 150, 150 , $imgW , $imgH);

$tempThumbName = tempnam("/tmp", "FOO");
imagejpeg( $finalThumb , $tempThumbName );



//S3 stuff
if (!class_exists('S3')) require_once 'S3.php';



// AWS access info
if (!defined('awsAccessKey')) define('awsAccessKey', 'AKIAJDYEYTGKAP5BSXHQ');
if (!defined('awsSecretKey')) define('awsSecretKey', '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');

$bucketName = "jizzify";

$s3 = new S3(awsAccessKey, awsSecretKey);

$uniqueId = uniqid("");

//get image extension

echo $uniqueId;

$s3->putObjectFile($fileTempName, $bucketName , $uniqueId . ".jpg" , S3::ACL_PUBLIC_READ);
$s3->putObjectFile($tempThumbName, $bucketName , "thumb" . $uniqueId . ".jpg" , S3::ACL_PUBLIC_READ);


?>