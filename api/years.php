<?php

$conf = parse_ini_file("../configuration.cnf", false, INI_SCANNER_TYPED);
$query = @$_GET['query'] ?: '*:*';

$url = $conf['qa_catalogue_solr_url'] . 'select?'
     . 'facet.limit=1000&facet.mincount=1&facet=on&fl=id&rows=0&json.nl=map'
     . '&facet.field=' . $conf['year_field'] 
     . '&q=' . urlencode($query);

$json = json_decode(file_get_contents($url));

$years = [];
foreach ($json->facet_counts->facet_fields->{$conf['year_field']} as $year => $count) {
  if (preg_match('/^\d{4}$/', $year) && (int) $year < 2025) { // TODO: make configurable
    $years[(int) $year] = $count;
  }
}
ksort($years);

header('Access-Control-Allow-Origin: *');
header('Content-type: application/json');
print json_encode($years,JSON_PRETTY_PRINT);
