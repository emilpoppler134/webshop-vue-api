import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { S3_BUCKET_NAME, S3_REGION, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY } from '../config.js';

import type { Readable } from 'stream';
import type { Request, Response } from 'express';

const client = new S3Client({
  region: S3_REGION,
  credentials: {
    accessKeyId: S3_ACCESS_KEY_ID,
    secretAccessKey: S3_SECRET_ACCESS_KEY
  }
});

async function getDocument(path: string) {
  try {
    const command = new GetObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: path,
    });

    const document = await client.send(command);
    
    if (document) {
      let stream = document.Body as Readable;

      return new Promise((resolve, reject) => {
        const chunks: any = []

        if (stream !== undefined) {
          stream.on('data', chunk => chunks.push(chunk))
          stream.once('end', () => resolve(Buffer.concat(chunks)))
          stream.once('error', reject)
        }
      });
    }
  } catch {
    return null;
  }
}

async function find(req: Request, res: Response) {
  const key = req.params.key;

  let document = await getDocument(key);

  if (document === null) {
    res.json({status: "ERROR", data: "Error fetching file"});
    return;
  }

  res.write(document);
  res.end();
}

export default { find }