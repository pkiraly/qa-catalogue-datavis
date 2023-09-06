<?php

$conf = parse_ini_file("configuration.cnf", false, INI_SCANNER_TYPED);

$query = isset($_GET['query']) && !empty($_GET['query']) ? $_GET['query'] : '';
if (preg_match('/^\d+(,\d+)*$/', $query)) {
  $ids = explode(',', $query);

  $lines = file($conf['library_names_file']);

  $libraries = [];
  foreach ($lines as $line) {
    if (preg_match('/^(\d+): (.*)$/', $line, $match)) {
      if (in_array($match[1], $ids)) {
    	$libraries[$match[1]] = $match[2];
      }
    }
  }

  header('Access-Control-Allow-Origin: *');
  $out = fopen('php://output', 'w');
  fputcsv($out, array('id', 'name'));
  foreach($libraries as $id => $name) {
    fputcsv($out, array($id, $name));
  }
  fclose($out);
}
