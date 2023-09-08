<?php
$conf = parse_ini_file("../configuration.cnf", false, INI_SCANNER_TYPED);

// str_starts_with was introduced in PHP 8
if (!function_exists('str_starts_with')) {
  function str_starts_with($haystack, $needle) {
    return (string)$needle !== '' && strncmp($haystack, $needle, strlen($needle)) === 0;
  }
}

function solr_facet_count_query($facet, $query) {    
  global $conf;
  $url = $conf['qa_catalogue_solr_url'] . 'select?'
    . 'facet.limit=1000&facet.mincount=1&facet=on&fl=id&rows=0&json.nl=map'
    . "&facet.field=$facet&q=" . urlencode($query);
  $json = json_decode(file_get_contents($url));
  return $json->facet_counts->facet_fields->{$facet};
}
