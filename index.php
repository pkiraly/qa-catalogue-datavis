<?php

$conf = parse_ini_file("configuration.cnf", false, INI_SCANNER_TYPED);
$userQuery = isset($_GET['query']) && !empty($_GET['query']) ? $_GET['query'] : '';
$type = isset($_GET['type']) && in_array($_GET['type'], ['map', 'timeline']) ? $_GET['type'] : 'map';

?><!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><?= $conf['catalogue_name'] ?> holdings visualisation</title>
  <script src="https://d3js.org/d3.v6.min.js"></script>
  <script src="https://kit.fontawesome.com/2f4e00a49c.js" crossorigin="anonymous"></script>
  <link rel="stylesheet" href="geo.css" />
</head>
<body>
  <header>
    <button id="zoom-in">+</button>
    <button id="zoom-out">-</button>
    <span class="title"><a href="<?= $conf['catalogue_url'] ?>" target="_blank"><?= $conf['catalogue_name'] ?></a> holdings visualisation</span>
    <form style="display: inline;">
      <input type="text" name="query" id="search" value="<?= $userQuery ?>">
      <input type="submit" value="search catalogue!" id="submit">
      <input type="radio" name="type" value="map" id="type-map" <?php if ($type == 'map') { ?>checked="checked"<?php } ?>><label for="type-map">map</label>
      <input type="radio" name="type" value="timeline" id="type-timeline" <?php if ($type == 'timeline') { ?>checked="checked"<?php } ?>><label for="type-timeline">timeline</label>
    </form>
  </header>

  <div id="timeline-container"></div>
  <div id="map-container" style="display: flex; flex-direction: row;">
    <div id="map"></div>

    <div id="info-box" class="row" style="width: 650px;">
      <div id="value-time"></div>
      <div id="city-list" class="row"></div>
      <div id="variants"></div>
    </div>  
  </div>
  <script type="text/javascript">
    let mapVis = {
      mapCreated: false,
      timelineCreated: false,
      qaCatalogueBaseURL: '<?= $conf['qa_catalogue_base_url'] ?>'
    };
  </script>
  <script type="module" src="index.js"></script>
</body>
</html>
