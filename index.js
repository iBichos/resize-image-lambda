const sharp = require('sharp');
const aws = require('aws-sdk');

const s3 = new aws.S3({
  region: 'us-east-1',
});


exports.handler = async (event, context) => {
  if (event.Records[0].eventName === "ObjectRemove:Delete") {
    return;
  }

  const bucket = event.Records[0].s3.bucket.name;
  const key = event.Records[0].s3.object.key;


  let response = await s3.getObject({ Bucket: bucket, Key: key }).promise();
  let image = await sharp(response.Body);

  const metadata = await image.metadata();
  if (metadata.width != 350 && metadata.height != 350) {
    const resizedImage = await image.resize({ width: 350, height: 350 }).toBuffer();

    await s3.putObject({
      Bucket: bucket,
      Key: key,
      ACL: 'public-read',
      Body: resizedImage
    }).promise();

    return;
  } else {
    return;
  }

};
