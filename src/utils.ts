import { IconChange } from "./getSvgFiles";
import * as fs from "fs/promises";
import * as path from "path";
import { LOCAL_REPO_DIR } from "./constants";
import * as sharp from "sharp";

export const normalizeChanges = (changes: IconChange[]) => {
  const addedOrModified: string[] = [];
  const deleted: string[] = [];

  changes.forEach((c) => {
    if (c.status === "renamed" && c.newFilePath && c.oldFilePath) {
      deleted.push(c.oldFilePath);
      addedOrModified.push(c.newFilePath);
    } else if (c.status === "deleted" && c.oldFilePath) {
      deleted.push(c.oldFilePath);
    } else if (c.newFilePath) {
      addedOrModified.push(c.newFilePath);
    }
  });

  return {
    finalDeletes: deleted,
    finalAddsOrMods: addedOrModified,
  };
};

export const rasterizeIcon = async (iconPath: string) => {
  const svgData = await fs.readFile(path.join(LOCAL_REPO_DIR, iconPath));

  // Convert SVG → PNG in-memory (white background)
  const pngBuffer = await sharp(svgData)
    .resize(128, 128, {
      fit: "contain",
    })
    .flatten({ background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .toBuffer();

  return pngBuffer;
};
