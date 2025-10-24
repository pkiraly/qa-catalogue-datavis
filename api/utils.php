<?php

// load configuration
$conf = parse_ini_file("../configuration.cnf", false, INI_SCANNER_TYPED);

// don't die on error but return HTTP error response
set_exception_handler(function($exception){
  send_json([
    "message" => $exception->getMessage(),
    "stack" => $exception->getTraceAsString(),
  ], 500);
});

set_error_handler(function($level, $error, $file, $line) {
    error_log("$level: $error");
 throw new ErrorException($error, 0, $level, $file, $line);
}, E_ALL^E_WARNING^E_NOTICE);


function solr_facet_count_query($facet, $query, $offset=0, $limit=1000) {    
  global $conf;
  $url = $conf['qa_catalogue_solr_url'] . 'select?'
    . "facet.limit=$limit&facet.offset=$offset"
    . '&facet.mincount=1&facet=on&fl=id&rows=0&json.nl=map'
    . "&facet.field=$facet&q=" . urlencode($query);
  error_log('url: ' . $url);
  $error = null;
  try {
    $response = json_decode(file_get_contents($url))->facet_counts->facet_fields->{$facet};
    if ($response) return $response;
  } catch(Exception $e) {
    $error = $e;
  }
  throw new Exception("$url failed", 0, $error);
}

function send_json($json, $code=200) {
  http_response_code($code);
  header('Access-Control-Allow-Origin: *');
  header('Content-type: application/json');
  $json = json_encode($json,JSON_PRETTY_PRINT|JSON_UNESCAPED_SLASHES);
  print preg_replace('/^(  +?)\\1(?=[^ ])/m', '$1', $json); // prettier
  exit;
}

// support PHP<8 without str_starts_with
if (!function_exists('str_starts_with')) {
  function str_starts_with($haystack, $needle) {
    return (string)$needle !== '' && strncmp($haystack, $needle, strlen($needle)) === 0;
  }
}

