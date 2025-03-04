import * as fs from "fs/promises";
import * as msRest from "@azure/ms-rest-js";
import { TrainingAPIClient } from "@azure/cognitiveservices-customvision-training";
import * as sharp from "sharp";
import * as dotenv from "dotenv";
import path = require("path");
import { LOCAL_REPO_DIR } from "./constants";

// Load environment variables from .env
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

export async function uploadIconSvg(
  iconPath: string // e.g. assets/Add Circle/SVG/ic_fluent_add_circle_20_filled.svg
): Promise<void> {
  const iconName = iconPath.split("/")[1];
  const variant = iconPath.endsWith("_filled.svg") ? "filled" : "outline";

  const svgData = await fs.readFile(path.join(LOCAL_REPO_DIR, iconPath));

  // Convert to PNG in-memory
  const pngBuffer = await sharp(svgData)
    .resize(128, 128, {
      fit: "contain",
    })
    .flatten({ background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .png()
    .toBuffer();

  // Create or find a tag representing the iconName, variant, etc.
  const tagName = `${iconName}-${variant}`;
  const tagId = await getOrCreateTag(tagName);

  // Upload to Custom Vision
  const uploadResult = await trainer.createImagesFromData(
    projectId,
    pngBuffer,
    {
      tagIds: [tagId],
    }
  );

  if (!uploadResult.isBatchSuccessful) {
    console.error(
      `Failed to upload: ${iconName} [${variant}]`,
      `status: ${uploadResult.images?.[0].status}`
    );
  } else {
    console.log(`Uploaded: ${iconName} [${variant}]`);
  }
}

async function getOrCreateTag(name: string): Promise<string> {
  const existing = await trainer.getTags(projectId);
  const found = existing.find((t) => t.name === name);
  if (found && found.id) {
    return found.id;
  }
  const created = await trainer.createTag(projectId, name);
  return created.id!;
}
