<?php
// str_starts_with was introduced in PHP 8
if (!function_exists('str_starts_with')) {
  function str_starts_with($haystack, $needle) {
    return (string)$needle !== '' && strncmp($haystack, $needle, strlen($needle)) === 0;
  }
}
$conf = parse_ini_file("../configuration.cnf", false, INI_SCANNER_TYPED);
$ids = explode(',',($_GET['ids']) ?: '');

$file = $conf['library_names_file'];
$lines = file(str_starts_with($file, '/') ? $file : "../$file");
$libraries = [];
foreach ($lines as $line) {
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

header('Access-Control-Allow-Origin: *');
header('Content-type: application/json');
print json_encode($libraries,JSON_PRETTY_PRINT);

