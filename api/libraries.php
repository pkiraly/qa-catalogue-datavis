<?php

$conf = parse_ini_file("../configuration.cnf", false, INI_SCANNER_TYPED);
$ids = explode(',',($_GET['ids']) ?: '');

$file = $conf['library_names_file'];
$lines = file(str_starts_with($file, '/') ? $file : "../$file");
$libraries = [];
foreach ($lines as $line) {
  if (preg_match('/^(\d+): (.*)$/', $line, $match)) {
    if (empty($ids) || in_array($match[1], $ids)) {
  	  $libraries[$match[1]] = $match[2];
    }
  }
}

header('Access-Control-Allow-Origin: *');
header('Content-type: application/json');
print json_encode($libraries,JSON_PRETTY_PRINT);
