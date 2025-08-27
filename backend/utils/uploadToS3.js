import s3 from "../config/s3.js";
import fs from "fs";

export const uploadFile = async (filePath, keyName) => {
  const fileContent = fs.readFileSync(filePath);
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: keyName,
    Body: fileContent,
    ACL: "public-read",
    ContentType: "application/pdf",
  };
  const data = await s3.upload(params).promise();
  fs.unlink(filePath, () => {});
  return data.Location;
};
