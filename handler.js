"use strict";

const Bucket = require("./utils/Bucket");
const Dynamo = require("./utils/Dynamo");

const extractMetadata = async (event) => {
  Dynamo.createImageMetadataOnDB(event.Records[0].s3.object);
};

const getMetadata = async (event) => {
  const imageMetadata = await Dynamo.getImageOnDB(
    event.pathParameters.s3objectkey
  );
  return {
    statusCode: 200,
    body: JSON.stringify({ ...imageMetadata }),
  };
};

const downloadImage = async (event) => {
  const imageUrl = await Bucket.getImageUrl(
    "uploads/" + event.pathParameters.s3objectkey
  );

  return {
    statusCode: 302,
    headers: {
      Location: imageUrl,
    },
  };
};

const getInfo = async () => {
  return {
    statusCode: 200,
    body: JSON.stringify(await Dynamo.getDBInfo()),
  };
};

module.exports = { extractMetadata, getMetadata, downloadImage, getInfo };
