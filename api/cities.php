<?php
include_once('../common-functions.php');
$conf = parse_ini_file("../configuration.cnf", false, INI_SCANNER_TYPED);
$query = @$_GET['query'] ?: '*:*';

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

// solr query
$url = $conf['qa_catalogue_solr_url'] . 'select?'
     . 'facet.limit=1000&facet.mincount=1&facet=on&fl=id&rows=0&json.nl=map'
     . '&facet.field=' . $conf['library_field'] 
     . '&q=' . urlencode($query);

$json = json_decode(file_get_contents($url));
$facets = [];
foreach ($json->facet_counts->facet_fields->{$conf['library_field']} as $id => $count) {
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

