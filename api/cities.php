<?php
include_once('./utils.php');

// get libraries
$file = $conf['library_metadata_file'];
$file = str_starts_with($file, '/') ? $file : "../$file";
$libraries = [];
$fh = fopen($file, 'r');
$forbidden_cities = ['Washington', 'Beirut', 'Istanbul', 'Budapest', 'Roma', 'Paris', 'Jerusalem']; // TODO: configure
while (($line = fgetcsv($fh)) !== FALSE) {
  if (!in_array($line[1], $forbidden_cities))
    $libraries[$line[0]] = ['city' => $line[1], 'lat' => $line[2], 'lon' => $line[3]];
  }
fclose($fh);

$res = solr_facet_count_query($conf['library_field'], @$_GET['query'] ?: '*:*');

$facets = [];
foreach ($res as $id => $count) {
  if (preg_match('/^\d+$/', $id)) {
    if (isset($libraries[$id])) {
      $city = $libraries[$id]['city'];
      if (isset($facets[$city])) {
        $facets[$city]['holdings'][] = $count;
        $facets[$city]['libraries'][] = $id;
      } else {
        $facets[$city] = [
          'id' => $id,
          'holdings' => [$count], 'libraries' => [$id], // TODO: better group both
          'lat' => $libraries[$id]['lat'],
          'lon' => $libraries[$id]['lon']
        ];
      }
    } else {
      // echo "library ID $id (with $count book) is not existing\n";
    }
  }
}

$cities = [];
foreach($facets as $name => $city) {
  $city['name'] = $name;
  $cities[$city['id']] = $city;
}

header('Access-Control-Allow-Origin: *');
header('Content-type: application/json');
print json_encode($cities,JSON_PRETTY_PRINT);

