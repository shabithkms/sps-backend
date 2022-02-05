const S3 = require("aws-sdk/clients/s3");
const fs = require("fs");

const bucketName = process.env.S3_BUCKET_NAME;
const region = process.env.S3_BUCKET_REGION;
const accessKeyId = process.env.S3_ACCESS_KEYID;
const secretAccessKey = process.env.S3_SECRET;

// Creating an instance of s3
const s3 = new S3({
  region,
  accessKeyId,
  secretAccessKey,
});

// Upload a file to s3
function uploadFile(file) {
  console.log(file);
  const fileStream = fs.createReadStream(file.path);
  const uploadParams = {
    Bucket: bucketName,
    Body: fileStream,
    Key: file.filename,
  };
  return s3.upload(uploadParams).promise();
}

exports.uploadFile = uploadFile;
// Download a file from s3
function getFileStream(fileKey) {
  const downloadParams = {
    Key: fileKey,
    Bucket: bucketName,
  };

  return s3.getObject(downloadParams).createReadStream();
}
exports.getFileStream = getFileStream;
