const AWS = require("aws-sdk");
let s3Options = {};

// Settings to test the application offline
if (process.env.IS_OFFLINE) {
  s3Options = {
    s3ForcePathStyle: true,
    accessKeyId: "S3RVER", // This specific key is required when working offline
    secretAccessKey: "S3RVER",
    endpoint: new AWS.Endpoint("http://localhost:4569"),
  };
}

const s3 = new AWS.S3(s3Options);
const bucket_name = process.env.BUCKET_NAME;

/**
 * Generate the default parameters to retrieve a file.
 * @param {string} id - the name of the file.
 */
function generateParams(id) {
  return (params = {
    Bucket: bucket_name,
    Key: id,
  });
}

const Bucket = {
  /**
   * Return the file if exists from the bucket.
   * @param {string} id - the name of the file.
   */
  async getImage(id) {
    let data = await s3.getObject(generateParams(id)).promise();
    return { Body: data.Body, ContentType: data.ContentType };
  },
  /**
   * Generate a signed URL given the image name to download it.
   * @param {string} id - the name of the file.
   */
  async getImageUrl(id) {
    return await s3.getSignedUrlPromise("getObject", {
      ...generateParams(id),
      Expires: 10,
    });
  },
};

module.exports = Bucket;
