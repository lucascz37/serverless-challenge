const AWS = require("aws-sdk");
let s3Options = {};

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

function generateParams(id) {
  return (params = {
    Bucket: bucket_name,
    Key: id,
  });
}

const Bucket = {
  async getImage(id) {
    let data = await s3.getObject(generateParams(id)).promise();
    return { Body: data.Body, ContentType: data.ContentType };
  },
  async getImageUrl(id) {
    return await s3.getSignedUrlPromise("getObject", {
      ...generateParams(id),
      Expires: 10,
    });
  },
};

module.exports = Bucket;
