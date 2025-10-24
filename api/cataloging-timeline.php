<?php
include_once('./utils.php');

if (!@$conf['cataloging_date_field']) {
  send_json(['message' => 'cataloging_date_field not configured!'], 500);
}

$query = @$_GET['query'] ?: '*:*';
$precision = @$_GET['precision'] ?: 'year';

$limit = 10000;
$offset = 0;
$continue = false;
$years = [];
do {
  error_log('$query: ' . $query);
  $result = solr_facet_count_query($conf['cataloging_date_field'], $query, $offset, $limit);
  $continue = processResult($result);
  $offset += $limit;
} while ($continue);

ksort($years);
if (isset($years[0]))
  unset($years[0]);

send_json($years);

function processResult($result) {
  global $years, $conf, $precision;

  $continue = count(get_object_vars($result)) > 0;
  if ($continue) {
    foreach ($result as $value => $count) {
      // transform PICA+ field value to date
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
