import * as fs from "fs/promises";
import * as msRest from "@azure/ms-rest-js";
import {
  TrainingAPIClient,
  TrainingAPIModels,
} from "@azure/cognitiveservices-customvision-training";
import * as sharp from "sharp";
import * as dotenv from "dotenv";
import * as path from "path";
import { LOCAL_REPO_DIR } from "./constants";

dotenv.config();

const trainingKey = process.env.CUSTOM_VISION_TRAINING_KEY || "";
const endpoint = process.env.CUSTOM_VISION_ENDPOINT || "";
const projectId = process.env.CUSTOM_VISION_PROJECT_ID || "";

if (!trainingKey || !endpoint || !projectId) {
  throw new Error("Missing required environment variables for Custom Vision.");
}

const credentials = new msRest.ApiKeyCredentials({
  inHeader: { "Training-key": trainingKey },
});
const trainer = new TrainingAPIClient(credentials, endpoint);

const tagMap = new Map<string, string>();

export async function initTagsCache() {
  console.log("Fetching existing tags...");
  const existingTags = await trainer.getTags(projectId);
  for (const t of existingTags) {
    if (t.name && t.id) {
      tagMap.set(t.name, t.id);
    }
  }
  console.log(`Initialized tag cache with ${tagMap.size} tags.`);
}

export async function uploadIconsSvg(iconPaths: string[]): Promise<void> {
  const batchSize = 50;
  const pathChunks = chunkArray(iconPaths, batchSize);

  for (const pathsOfChunk of pathChunks) {
    const imagesBatch: TrainingAPIModels.ImageFileCreateEntry[] = [];

    for (const iconPath of pathsOfChunk) {
      const iconName = iconPath.split("/")[1];
      const variant = iconPath.endsWith("_filled.svg") ? "filled" : "outline";

      const svgData = await fs.readFile(path.join(LOCAL_REPO_DIR, iconPath));

      // Convert SVG → PNG in-memory (white background)
      const pngBuffer = await sharp(svgData)
        .resize(128, 128, {
          fit: "contain",
        })
        .flatten({ background: { r: 255, g: 255, b: 255, alpha: 1 } })
        .png()
        .toBuffer();

      const tagName = `${iconName}-${variant}`;
      const tagId = await getOrCreateTagCached(tagName);

      imagesBatch.push({
        name: tagName,
        contents: pngBuffer,
        tagIds: [tagId],
      });
    }

    // Send the entire batch to Custom Vision
    const uploadResult = await trainer.createImagesFromFiles(projectId, {
      images: imagesBatch,
    });

    if (!uploadResult.isBatchSuccessful) {
      const failed = uploadResult.images
        ?.filter((i) => i.status !== "OK" && i.status !== "OKDuplicate")
        .map((i) => ({
          status: i.status,
          image: {
            id: i.image?.id,
            tags: i.image?.tags,
          },
        }));
      if (failed?.length) {
        console.error(
          `${failed.length} images in the batch failed:`,
          JSON.stringify(failed, null, 2)
        );
      } else {
        console.error(
          `Successfully uploaded ${pathsOfChunk.length} icons in this batch, some are duplicates.`
        );
      }
    } else {
      console.log(
        `Successfully uploaded ${pathsOfChunk.length} icons in this batch.`
      );
    }

    // Wait 1 second before processing the next chunk (to avoid rate limits)
    await sleep(1000);
  }
}

async function getOrCreateTagCached(name: string): Promise<string> {
  if (tagMap.has(name)) {
    return tagMap.get(name)!;
  }

  const created = await trainer.createTag(projectId, name);
  const newTagId = created.id!;
  tagMap.set(name, newTagId);

  // Wait 0.5s to avoid hitting the rate limit
  await sleep(500);

  return newTagId;
}

function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const chunks = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
