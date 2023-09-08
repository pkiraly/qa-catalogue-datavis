<?php
include_once('./utils.php');

$years = [];
$facets = solr_facet_count_query($conf['year_field'], @$_GET['query'] ?: '*:*');
foreach ($facets as $year => $count) {
  if (preg_match('/^\d{4}$/', $year) && (int) $year < 2025) { // TODO: make configurable
    $years[(int) $year] = $count;
  }
}
ksort($years);
if (isset($years[0]))
  unset($years[0]);

header('Access-Control-Allow-Origin: *');
header('Content-type: application/json');
print json_encode($years,JSON_PRETTY_PRINT);
