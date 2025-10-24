<?php

if (file_exists("configuration.cnf")) {
  $conf = parse_ini_file("configuration.cnf", false, INI_SCANNER_TYPED);
} else {
  die("Missing configuration.cnf!");
}

$query = @$_GET['query'] ?: '';
$type = in_array(@$_GET['type'], ['map', 'timeline', 'publication-timeline', 'cataloging-timeline']) ? $_GET['type'] : 'map';

?><!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><?= @$conf['catalogue_name'] ?> holdings visualisation</title>
  <link rel="shortcut icon" type="image/x-icon" href="./favicon.ico">
  <!-- script src="https://d3js.org/d3.v7.min.js"></script -->
  <script src="lib/d3.v7.min.js"></script>
  <!-- script src="https://kit.fontawesome.com/2f4e00a49c.js" crossorigin="anonymous"></script -->
  <script src="lib/2f4e00a49c.js" crossorigin="anonymous"></script>
  <!-- link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.1/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-4bw+/aepP/YC94hEpVNVgiZdgIC5+VKNBQNGCHeKRQN+PtmoHDEXuppvnDJzQIu9" crossorigin="anonymous" -->
  <!-- script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.1/dist/js/bootstrap.bundle.min.js" integrity="sha384-HwwvtgBNo3bZJJLYd8oVXjrBZt8cqVSpeBNS5n7C8IVInixGAoxmnlMuBnhbgrkm" crossorigin="anonymous"></script -->
  <link href="lib/bootstrap.min.css" rel="stylesheet" integrity="sha384-4bw+/aepP/YC94hEpVNVgiZdgIC5+VKNBQNGCHeKRQN+PtmoHDEXuppvnDJzQIu9" crossorigin="anonymous">
  <script src="lib/bootstrap.bundle.min.js" integrity="sha384-HwwvtgBNo3bZJJLYd8oVXjrBZt8cqVSpeBNS5n7C8IVInixGAoxmnlMuBnhbgrkm" crossorigin="anonymous"></script>
  <link rel="stylesheet" href="layout.css" />
</head>
<body>
  <header>
    <h1>
      <a href="<?= @$conf['catalogue_url'] ?>" target="_blank"><?= @$conf['catalogue_name'] ?></a>
      Visualisation
    </h1>
    <form style="display: inline;">
      <input type="text" name="query" id="search" value="<?= htmlencode($query) ?>">
      <input type="hidden" name="type" value="<?= $type ?>">
      <input type="submit" value="search" id="submit">
      <?php if(@$conf['qa_catalogue_base_url']) { ?>
      <a href="<?= $conf['qa_catalogue_base_url'] ?>" target="_blank">QA Catalogue</a>
      <?php } ?>
      <a href="https://github.com/pkiraly/qa-catalogue-datavis#readme" title="About this software" target="_blank"><i class="fa fa-info-circle" aria-hidden="true"></i></a>
    </form>
  </header>

  <ul class="nav nav-tabs">
    <li class="nav-item">
      <a class="nav-link <?php if ($type == 'map') { ?>active<?php } ?>" aria-current="page" href="?query=<?= urlencode($query) ?>&type=map">Holdings map</a>
    </li>
    <li class="nav-item">
       <a class="nav-link <?php if ($type == 'publication-timeline') { ?>active<?php } ?>" href="?query=<?= urlencode($query) ?>&type=publication-timeline">Publication timeline</a>
    </li>
    <li class="nav-item">
      <a class="nav-link <?php if ($type == 'cataloging-timeline') { ?>active<?php } ?>" href="?query=<?= urlencode($query) ?>&type=cataloging-timeline">Cataloging timeline</a>
    </li>
  </ul>

  <div id="map-container" style="display: flex; flex-direction: row;">
    <div id="map"></div>
    <div id="zoom-icons">
      <button id="zoom-in">+</button>
      <button id="zoom-out">-</button>
    </div>

    <div id="info-box" class="row" style="width: 650px;">
      <div id="value-time"></div>
      <div id="city-list" class="row"></div>
      <div id="variants"></div>
    </div>  
  </div>

  <div id="publication-timeline-container">
    <div id="chart"></div>
    <div id="overview"></div>
  </div>

  <div id="cataloging-timeline-container">
    <div id="chart"></div>
    <div id="overview"></div>
  </div>

  <script type="text/javascript">
    let mapVis = {
      mapCreated: false,
      timelineCreated: false,
      publicationTimelineCreated: false,
      catalogingTimelineCreated: false,
      qaCatalogueBaseURL: '<?= $conf['qa_catalogue_base_url'] ?>',
      libraryField: '<?= $conf['library_field'] ?>',
      yearField: '<?= $conf['year_field'] ?>',
      catalogingDateField: '<?= $conf['cataloging_date_field'] ?>',
      query: '<?= $query ?>',
      selectedType: '<?= $type ?>',
    }
  </script>
  <script type="module" src="js/common.js"></script>
  <?php if ($type == 'map') { ?>
    <script type="module" src="js/map.js"></script>
  <?php } else if (in_array($type, ['publication-timeline', 'cataloging-timeline'])) { ?>
    <script type="module" src="js/zoom.js"></script>
  <?php } ?>
  <script type="module" src="index.js"></script>
</body>
<?php if (isset($conf['footer'])) include($conf['footer']); ?>
</html>
