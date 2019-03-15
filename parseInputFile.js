#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const XLSX = require("xlsx");

const parseInputFile = () => {
  const { INPUT_FILE: inputFile } = process.env;

  const readStream = fs.createReadStream(path.resolve(`./files/${inputFile}`));
  const writeStream = fs.createWriteStream(path.resolve("./files/jobs.ndjson"));

  const buffers = [];

  readStream.on("data", data => {
    buffers.push(data);
  });

  readStream.on("error", error => {
    return console.error(error);
  });

  readStream.on("end", () => {
    const buffer = Buffer.concat(buffers);
    const workbook = XLSX.read(buffer);
    const sheets = workbook.SheetNames;

    sheets.map(sheet => {
      const ws = workbook.Sheets[sheet];
      const rows = XLSX.utils.sheet_to_json(ws);

      rows.forEach(row => {
        const data = `${JSON.stringify(row)}\n`;
        writeStream.write(data);
      });
    });

    console.log("Done.");
  });
};

parseInputFile();
