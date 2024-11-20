<?php
$post=json_decode($_POST['$trackDetails'],true);
$amt=json_decode($post['details']['tezResponse'], true);

print_r($post);

?>
