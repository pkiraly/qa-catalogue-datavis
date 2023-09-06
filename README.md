# k10plus-datavis
Data visualisations for K10plus union catalogue

It renders the search results in two ways: 

1. a map displaying the settlements where the libraries holding copies of the records founded. The use can click on a settlement and the information will be displayed on the number of copies and the relevant libraries. The user can follow link to QA catalogue to find the books in that library, or to Lobid, to find information about the library

2. a barchart timeline displaying the publication year and amount of publicatiion in that year based on the records founded. If the user clicks on a bar, s/he is redirected to the QA catalogue hit list filtered by the year.

## Installation

1. download the repository, and move to a directory where a web server (we tested it with Apache HTTP server) can access it. Make sure that your web server can execute PHP scripts.

2. Copy the configuration template

```bash
cp configuration.cnf.template configuration.cnf
```

3. edit configuration.cnf file

- `catalogue_name`: the name of the catalogue to display in the user interface (e.g. K10plus)
- `catalogue_url`: the URL of the catalogue. A link, that might point to a description, an OPAC, organisational website (e.g. https://opac.k10plus.de/)
- `qa_catalogue_base_url`: the URL of a running instance of QA catalogue
- `qa_catalogue_solr_url`: the URL of the Solr belonging to the QA catalogue. It should not be exposed to the internet, it will be accessed by the PHP scripts, not the browser (e.g. http://localhost:8983/solr/LIBRARY_NAME/)
- `year_field`: a Solr field, conveying publication year (e.g. 011x40a_ss)
- `library_field`: a Solr field conveying the holding library identifier (e.g. 001x400_ss)
- `library_names_file`: a file in which each line contains library identifiers and library names in the format: "^\d+: \s+$"
- `library_metadata_file`: a CSV file containing location metadata about the libraries as "ID,city,latitude,longitude"

