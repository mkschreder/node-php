<?php
  header('Content-Type: application/json');
  echo json_encode(array('$_SERVER' => $_SERVER));
?>