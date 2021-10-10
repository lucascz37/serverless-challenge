const AWS = require("aws-sdk");
const imageSize = require("image-size");
const bucket = require("./Bucket");

const TableName = process.env.DYNAMODB_TABLE;

let dynamoOptions = {};

if (process.env.IS_OFFLINE) {
  dynamoOptions = {
    region: "localhost",
    endpoint: "http://localhost:8000",
    accessKeyId: "DEFAULT_ACCESS_KEY",
    secretAccessKey: "DEFAULT_SECRET",
  };
}

const dynamoDb = new AWS.DynamoDB.DocumentClient(dynamoOptions);

const Dynamo = {
  async createImageMetadataOnDB(s3Object) {
    const key = decodeURIComponent(s3Object.key.replace(/\+/g, " "));
    const object = await bucket.getImage(key);
    const { width, height } = imageSize(object.Body);

    const data = {
      TableName,
      Item: {
        s3objectkey: key.split("/")[1],
        width,
        height,
        contentType: object.ContentType,
        size: s3Object.size,
      },
    };

    await dynamoDb.put(data).promise();
  },
  async getImageOnDB(name) {
    const params = {
      TableName,
      Key: { s3objectkey: name },
    };

    const data = await dynamoDb.get(params).promise();

    return data.Item;
  },
  async getDBInfo() {
    const imageTypes = { "image/jpg": 0, "image/jpeg": 0, "image/png": 0 };

    const data = await dynamoDb.scan({ TableName }).promise();

    let biggestImage = { name: "", size: -1 };
    let smallestImage = { name: "", size: -1 };

    if (data.Count !== 0) {
      biggestImage.name = data.Items[0].s3objectkey;
      smallestImage.name = data.Items[0].s3objectkey;

      biggestImage.size = data.Items[0].size;
      smallestImage.size = data.Items[0].size;

      imageTypes[data.Items[0].contentType] += 1;

      data.Items.slice(1).forEach((imageMetadata) => {
        if (imageMetadata.size > biggestImage.size) {
          biggestImage.name = imageMetadata.s3objectkey;
          biggestImage.size = imageMetadata.size;
        } else if (imageMetadata.size < smallestImage.size) {
          smallestImage.name = imageMetadata.s3objectkey;
          smallestImage.size = imageMetadata.size;
        }

        imageTypes[imageMetadata.contentType] += 1;
      });
    } else {
      return { message: "no images" };
    }

    return { biggestImage, smallestImage, imageTypes };
  },
};

module.exports = Dynamo;
