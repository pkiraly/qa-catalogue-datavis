# QA Catalogue Data Visualisations

> Additional data visualization interfaces for library catalogues

This web applications provides multiple views of data from library catalogues analysed by [QA catalogue](https://github.com/pkiraly/qa-catalogue). It can be used with or independent from the default frontend [QA Catalogue Web](https://github.com/pkiraly/qa-catalogue-web) and also relies on the same solr index created by QA Catalogue. The application also serves as a demo how to make use of QA Catalogue results in additional ways.

## Installation

Install this software into a web server with PHP enabled (Apache or Nginx with PHP-FPM).

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

## Functionality

The web application provides a search form and renders search results in two ways:

1. a map displaying the settlements where the libraries holdings of the records founded. The use can click on a settlement and the information will be displayed on the number of holdings and the relevant libraries (multiple copies of the same record in one libraries are counted as one holding). The user can follow link to QA catalogue to find the books in that library, or to [lobid organisations](https://lobid.org/organisations), to find information about the library

2. a barchart timeline displaying the publication year and amount of publicatiion in that year based on the records founded. If the user clicks on a bar, s/he is redirected to the QA catalogue hit list filtered by the year.

## API

The application internally provides a HTTP API for queries:

### api/libraries.php

Get a JSON object with library identifiers (optionally filtered with query parameter `ids`) mapped to library names.

### api/years.php

Get a JSON Object with years mapped to number of holdings for a given `query`.

## Contributing

QA Catalogue Datavis is managed in a public git repository at <https://github.com/pkiraly/qa-catalogue-datavis>. Contributions are welcome!

## License

GNU General Public License

