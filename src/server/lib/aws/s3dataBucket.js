import { S3Client, GetObjectCommand, PutObjectCommand, ListObjectVersionsCommand } from "@aws-sdk/client-s3";
import JsonFile from '../jsonfile.js';
import path from "path";
import dotenv from 'dotenv';
dotenv.config({override: true});

// --- CONFIG ---
const REGION = process.env.AWS_REGION || "sa-east-1";
const BUCKET = process.env.BUCKET_NAME || "entiendo-data";

const s3 = new S3Client({ region: REGION });

// --- helper: stream to string ---
const streamToString = async (stream) =>
  await new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
  });

// --- read JSON ---
export async function readJson(key, versionId = null) {
  if( process.env?.DB === 'OFFLINE') {
    console.log( 'READING OFFLINE '+ key);
    const name = path.basename(key)
    try {
      const jsonfile = new JsonFile(name);
      jsonfile.open();
      return jsonfile.data;
    } catch(err) {
      console.error( name + ' failed to load');
      return [];
    }
  } else {
    const params = { Bucket: BUCKET, Key: key };
    if (versionId) params.VersionId = versionId;

    const { Body } = await s3.send(new GetObjectCommand(params));
    const text = await streamToString(Body);
    return JSON.parse(text);
  }
}

// --- write JSON ---
export async function writeJson(key, data) {
  if( process.env?.DB === 'OFFLINE') {
    const name = path.basename(key)
    try {
      const jsonfile = new JsonFile(name);
      jsonfile.data = body;
      jsonfile.write();
      return "offline-version";
    } catch(err) {
      console.error( name + ' failed to load');
      return null;
    }
  } else {
    const body = JSON.stringify(data, null, 2);
    const res = await s3.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: body,
        ContentType: "application/json",
      })
    );
    return res.VersionId || null; // will be set if versioning is enabled
  }
}

// --- list versions of an object ---
export async function listVersions(key) {
  const { Versions } = await s3.send(
    new ListObjectVersionsCommand({
      Bucket: BUCKET,
      Prefix: key,
    })
  );
  return (Versions || []).filter((v) => v.Key === key);
}

// Example usage (uncomment to test directly):
// (async () => {
//   const key = "entiendo/data/test.json";
//   await writeJson(key, { hello: "world", ts: Date.now() });
//   console.log(await readJson(key));
//   console.log(await listVersions(key));
// })();