<?php

$conf = parse_ini_file("../configuration.cnf", false, INI_SCANNER_TYPED);
$query = @$_GET['query'] ?: '*:*';
$precision = @$_GET['precision'] ?: 'year';

$limit = 10000;
$offset = 0;
$continue = false;
$years = [];
do {
  $url = $conf['qa_catalogue_solr_url'] . 'select?'
    . 'facet.limit=' . $limit . '&facet.offset=' . $offset
    . '&facet.mincount=1&facet=on&fl=id&rows=0&json.nl=map'
    . '&facet.field=' . $conf['cataloging_date_field']
    . '&q=' . urlencode($query);
  $json = json_decode(file_get_contents($url));
  $offset += $limit;
  $continue = processResult($json);
} while ($continue);

ksort($years);
if (isset($years[0]))
  unset($years[0]);

header('Access-Control-Allow-Origin: *');
header('Content-type: application/json');
print json_encode($years,JSON_PRETTY_PRINT);

function processResult($json) {
  global $years, $conf, $precision;

  $continue = count(get_object_vars($json->facet_counts->facet_fields->{$conf['cataloging_date_field']})) > 0;
  if ($continue) {
    foreach ($json->facet_counts->facet_fields->{$conf['cataloging_date_field']} as $value => $count) {
      list($library, $rawdate) = explode(':', $value);
      list($day, $month, $year) = explode('-', $rawdate);
      $year = ((int) $year < 60) ? (int) '20' . $year : (int) '19' . $year;
      if ($precision == 'day') {
        $key = sprintf('%s-%s-%s', $year, $month, $day);
      } else if ($precision == 'month') {
          $key = sprintf('%s-%s', $year, $month);
      } else {
        $key = $year;
      }
      if (!isset($years[$key]))
        $years[$key] = 0;
      $years[$key] += $count;
    }
  }
  return $continue;
}