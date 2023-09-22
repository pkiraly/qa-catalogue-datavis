<?php
include_once('./utils.php');

$ids = explode(',',@$_GET['ids'] ?: '');

$file = $conf['library_names_file'];
$file = str_starts_with($file, '/') ? $file : "../$file";
$libraries = [];
foreach (file($file) as $line) {
  if (preg_match('/^(\d+): (.*)$/', $line, $match)) {
    if (empty($ids) || in_array($match[1], $ids)) {
      $id = $match[1];
      $name = $match[2];
      if (preg_match('/^(.*) \[((DE|CH)-[^\]]+)\]/', $name, $code_match)) {
        $libraries[$id] = ['name' => $code_match[1], 'isil' => str_replace('.', '', $code_match[2])];
      } else {
        $libraries[$id] = ['name' => $name];
      }
    }
  }
}

send_json($libraries);
