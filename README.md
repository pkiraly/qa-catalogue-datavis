# QA Catalogue Data Visualisations

> Additional data visualization interfaces for library catalogues

This web applications provides multiple views of data from library catalogues analysed by [QA catalogue]. It can be used with or independent from the default frontend [QA Catalogue Web](https://github.com/pkiraly/qa-catalogue-web) and also relies on the same solr index created by QA Catalogue. The application also serves as a demo how to make use of QA Catalogue results in additional ways.

[QA catalogue]: https://github.com/pkiraly/qa-catalogue

## Table of Contents

- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
  - [Visualisations](#visualisations)
  - [Search](#search)
  - [API](#api)
- [Contributing](#contributing)
- [License](#license)

## Installation

Install this software into a web server with PHP enabled (Apache or Nginx with PHP-FPM).

The application requires a running Solr index build with [QA Catalogue].

## Configuration

Copy and fill out the configuration template

```bash
cp configuration.cnf.template configuration.cnf
```

Configuration parameters:

- `catalogue_name` (optional): name of the catalogue to display in the user interface (e.g. K10plus)
- `catalogue_url` (optional): homepage URL of the catalogue (link to OPAC, description or organisational website, e.g. <https://opac.k10plus.de/>)
- `qa_catalogue_base_url` (optional): URL of a running instance of [QA catalogue web](https://github.com/pkiraly/qa-catalogue-web) to link to
- `qa_catalogue_solr_url` (required): URL of Solr collection of QA catalogue. It should not be exposed to the internet, it will be accessed by the PHP scripts, not the browser (e.g. http://localhost:8983/solr/LIBRARY_NAME/)
- `year_field` (required): Solr field, conveying publication year (e.g. `011x40a_ss`)
- `library_field` (required): Solr field conveying the holding library identifier (e.g. `001x400_ss`)
- `library_names_file` (required): file where each line contains library identifiers and library names in the format: `^\d+: \s+$`
- `library_metadata_file` (required): CSV file containing location metadata about the libraries as "ID,city,latitude,longitude"
- `cataloging_date_field` (optional): Solr field with cataloging data in the form `^.*:[0-9][0-9]-[0-9][0-9]-[0-9][0-9]` (e.g. `001A0_ss`)
- `footer` (optional): PHP file to be included as footer

## Usage

The web application provides a search form and renders search results in multiple visualisations.

### Visualisations

**holdings map**: a map displaying the settlements where the libraries holdings of the records founded. The use can click on a settlement and the information will be displayed on the number of holdings and the relevant libraries (multiple copies of the same record in one libraries are counted as one holding). The user can follow link to QA catalogue to find the books in that library, or to [lobid organisations](https://lobid.org/organisations), to find information about the library

**publication timeline**: a barchart timeline displaying the publication year and amount of publication in that year based on the records founded. If the user clicks on a bar, s/he is redirected to the QA catalogue hit list filtered by the year.

**cataloging timeline**: a barchart timeline displaying the date when a publication was catalogued.

More visualisations can be added on request, please let us known your ideas!

### Search

By default (empty search) all records are included. earch syntax is Solr query syntax as used in [QA Catalogue] (see [this discussion](https://github.com/pkiraly/qa-catalogue/issues/266) for some details).

### API

The application internally provides a HTTP API for queries. The return format is not fully settled yet.

#### api/libraries.php

Get a JSON object with library identifiers (optionally filtered with query parameter `ids`) mapped name and ISIL of the library.

#### api/publication-timeline.php

Get a JSON object with years of publication mapped to number of holdings for a given `query`.

#### api/cities.php

Get a JSON object with city ids mapped to name, coordinates, number of holdings and list of library ids for a given `query`.

#### api/cataloging-timeline.php

Get a JSON object with dates of cataloging mapped to number of records for a given `query`. Optional parameter `precision` can be used to filter by `year` (default), `month` or `day`.

## Contributing

QA Catalogue Datavis is managed in a public git repository at <https://github.com/pkiraly/qa-catalogue-datavis>. Contributions are welcome!

## License

GNU General Public License

