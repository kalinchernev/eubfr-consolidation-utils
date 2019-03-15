# EUBFR Consolidation Utilities

- Parses an input Excel file into a `.ndjson` one.
- Reads `.ndjson` file and pours the data into Elasticsearch index

## Project files

Input/output files are stored in `files` directory. For instance, `duplicates.xlsx` contains the input, whereas the `jobs.ndjson` will be the output.

This folder is empty by default and contents should not be committed.

### Parsing Excel file

When the input is provided in an Excel file, you can parse it with the following command:

```sh
$ INPUT_FILE=duplicates.xlsx node parseInputFile.js
```

Where the `duplicates.xlsx` is placed in the `files` directory.

The result will be stored in `/files/jobs.ndjson`.
