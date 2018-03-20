<?php 
ini_set ("expect.timeout", 30);
set_time_limit(30);
if(isset($_GET['url']) && $_GET['url'] != ''){
    $decode='UTF-8';
    if(isset($_GET['de']) && $_GET['de'] != ''){
        $decode=$_GET['de'];
    }
    $encode='BIG5';
    if(isset($_GET['en']) && $_GET['en'] != ''){
        $encode=$_GET['en'];
    }
    
    $fp = file_get_contents($_GET['url']);
    echo iconv($decode,$encode, $fp);
}else{ 
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="content-type" content="application/xhtml+xml; charset=utf-8" />
<meta name="author" content="jax">
<meta name="email" content="weskerjax@gmail.com">
<meta name="website" content="http://jax-work-archive.blogspot.com/">
<title>Demo JavaScript Speed</title>
</head>
<body>
<form id="form1" name="form1" method="get" action="" style="width:28em;margin:5% auto;text-align:center;">
<fieldset><legend>code</legend>
<p>
<label>decode：<input type="text" name="de" size="12" value="UTF-8" /></label> - To -  
<label>encode：<input type="text" name="en" size="12" value="BIG5" /></label><br>
<label>URL:<input type="text" name="url" size="48" /></label>
</p>
<p><input type="submit"/></p>
</fieldset>
</form></body>
</html><?php } ?>
