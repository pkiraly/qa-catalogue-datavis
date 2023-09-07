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
/*
if ($ids) {
}

  header('Access-Control-Allow-Origin: *');
  $out = fopen('php://output', 'w');
  fputcsv($out, array('id', 'name'));
  foreach($libraries as $id => $name) {
    fputcsv($out, array($id, $name));
  }
  fclose($out);
}*/

header('Access-Control-Allow-Origin: *');
header('Content-type: application/json');
print json_encode($libraries,JSON_PRETTY_PRINT);
