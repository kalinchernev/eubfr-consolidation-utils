#!/usr/bin/env node

// Get environment variables from .env configuration file.
require("dotenv").config();

const fs = require("fs");
const path = require("path");
const { promisify } = require("util");

const AWS = require("aws-sdk");
const awscred = require("awscred");
const connectionClass = require("http-aws-es");
const elasticsearch = require("elasticsearch");
const split2 = require("split2");
const through2Batch = require("through2-batch");

const getUserCredentials = promisify(awscred.load);

const SaveStream = require("./lib/SaveStream");

/**
 * Push records/projects to a given Elasticsearch index.
 */
const pushRecords = async () => {
  const { ES_REMOTE_ENDPOINT, INDEX: index, TYPE: type } = process.env;

  try {
    // Get user's AWS credentials and region
    const credentials = await getUserCredentials();

    const { region } = credentials;
    const { accessKeyId, secretAccessKey } = credentials.credentials;

    // Elasticsearch client configuration
    const options = {
      host: ES_REMOTE_ENDPOINT,
      index,
      connectionClass,
      apiVersion: "6.3",
      requestTimeout: 300000,
      awsConfig: new AWS.Config({
        accessKeyId,
        secretAccessKey,
        region
      })
    };

    const client = elasticsearch.Client(options);

    const saveStream = new SaveStream({
      objectMode: true,
      client,
      index,
      type
    });

    // We'll read results continuously in order to save memory.
    const fileRead = fs.createReadStream(path.resolve("./files/jobs.ndjson"));

    return new Promise((resolve, reject) => {
      fileRead
        .pipe(split2(JSON.parse))
        .on("error", e => reject(e))
        .pipe(
          through2Batch.obj({ batchSize: 100 }, (batch, _, cb) => {
            saveStream.write(batch, cb);
          })
        )
        .on("error", e => reject(e))
        .pipe(saveStream)
        .on("finish", () => {
          console.log("Done.");
          resolve();
        });
    });
  } catch (e) {
    return console.error(e);
  }
};

pushRecords();
