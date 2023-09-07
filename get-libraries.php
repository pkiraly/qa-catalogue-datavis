<?php

$conf = parse_ini_file("configuration.cnf", false, INI_SCANNER_TYPED);
$libraries = get_libraries($conf['library_metadata_file']);
$userQuery = isset($_GET['query']) && !empty($_GET['query']) ? $_GET['query'] : '*:*';

$url = $conf['qa_catalogue_solr_url'] . 'select?'
     . 'facet.limit=1000&facet.mincount=1&facet=on&fl=id&rows=0&json.nl=map'
     . '&facet.field=' . $conf['library_field'] 
     . '&q=' . urlencode($userQuery);

$json = json_decode(file_get_contents($url));
$facets = [];
foreach ($json->facet_counts->facet_fields->{$conf['library_field']} as $id => $count) {
  if (preg_match('/^\d+$/', $id)) {
    if (isset($libraries[$id])) {
      $city = $libraries[$id]['city'];
      if (isset($facets[$city])) {
        $facets[$city]['count'] += $count;
        $facets[$city]['libraries'] += 1;
        $facets[$city]['ids'][] = $id;
        $facets[$city]['counts'][] = $count;
      } else {
        $facets[$city] = [
          'id' => $id, 'count' => $count, 'libraries' => 1,
          'ids' => [$id], 'counts' => [$count],
          'lat' => $libraries[$id]['lat'], 'lon' => $libraries[$id]['lon']
        ];
      }
    } else {
      // echo "library ID $id (with $count book) is not existing\n";
    }
  }
}

uasort($facets, 'countSort');

header('Access-Control-Allow-Origin: *');
$out = fopen('php://output', 'w');
fputcsv($out, array('id', 'name', 'count', 'libraries', 'ids', 'counts', 'lat', 'long'));
foreach($facets as $city => $properties) {
  fputcsv($out, array($properties['id'], $city, $properties['count'], $properties['libraries'], 
    implode(',', $properties['ids']),
    implode(',', $properties['counts']),
    $properties['lat'], $properties['lon']));
}
fclose($out);

function get_libraries($library_metadata_file) {
  $libraries = [];
  $fh = fopen($library_metadata_file, 'r');
  $forbidden_cities = ['Washington', 'Beirut', 'Istanbul', 'Budapest', 'Roma', 'Paris', 'Jerusalem'];
  while (($line = fgetcsv($fh)) !== FALSE) {
    if (!in_array($line[1], $forbidden_cities))
      $libraries[$line[0]] = ['city' => $line[1], 'lat' => $line[2], 'lon' => $line[3]];
  }
  fclose($fh);
  return $libraries;
}

function countSort($a, $b) {
  return $b['count'] <=> $a['count'];
}

