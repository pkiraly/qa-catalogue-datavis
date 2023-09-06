<?php

$conf = parse_ini_file("configuration.cnf", false, INI_SCANNER_TYPED);
$userQuery = isset($_GET['query']) && !empty($_GET['query']) ? $_GET['query'] : '*:*';

$url = $conf['qa_catalogue_solr_url'] . 'select?'
     . 'facet.limit=1000&facet.mincount=1&facet=on&fl=id&rows=0&json.nl=map'
     . '&facet.field=' . $conf['year_field'] 
     . '&q=' . urlencode($userQuery);

$json = json_decode(file_get_contents($url));
$facets = [];
foreach ($json->facet_counts->facet_fields->{$conf['year_field']} as $year => $count) {
  if (preg_match('/^\d{4}$/', $year) && (int) $year < 2025) {
    $facets[(int) $year] = $count;
  }
}

ksort($facets);

header('Access-Control-Allow-Origin: *');
$out = fopen('php://output', 'w');
fputcsv($out, array('year', 'count'));
foreach($facets as $year => $count) {
  if (preg_match('/^\d{4}$/', $year)) {
    fputcsv($out, array($year, $count));
  }
}
fclose($out);

function countSort($a, $b) {
  return $b['count'] <=> $a['count'];
}

