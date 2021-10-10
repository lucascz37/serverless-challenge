"use strict";

const Bucket = require("./utils/Bucket");
const Dynamo = require("./utils/Dynamo");

const extractMetadata = async (event) => {
  Dynamo.createImageMetadataOnDB(event.Records[0].s3.object);
};

/**
 * Return the image metadata stored in the dynamoDB.
 * @param {Object} event - event received from gateway.
 */
const getMetadata = async (event) => {
  const imageMetadata = await Dynamo.getImageOnDB(
    event.pathParameters.s3objectkey
  );
  return {
    statusCode: 200,
    body: JSON.stringify({ ...imageMetadata }),
  };
};
/**
 * Generates a signed url if a file is present on the bucket and redirects to the it.
 * @param {Object} event - event received from gateway.
 */
const downloadImage = async (event) => {
  const imageUrl = await Bucket.getImageUrl(
    "uploads/" + event.pathParameters.s3objectkey // concatenating with "uploads/" to get the full path
  );

  return {
    statusCode: 302,
    headers: {
      Location: imageUrl,
    },
  };
};

/**
 * Return dynamoDB info about the images on the GET requisition.
 */
const getInfo = async () => {
  return {
    statusCode: 200,
    body: JSON.stringify(await Dynamo.getDBInfo()),
  };
};

module.exports = { extractMetadata, getMetadata, downloadImage, getInfo };
