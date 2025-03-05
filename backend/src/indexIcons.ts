import { SearchClient } from "@azure/search-documents";
import * as fs from "fs/promises";
import * as path from "path";
import { LOCAL_REPO_DIR, RAW_REPO_URL_BASE } from "./constants";
import { getImageEmbedding } from "./getImageEmbedding";
import { rasterize } from "./rasterize";

/**
 * Processes and uploads all icons to Azure AI Search
 */
export async function indexIcons(
  client: SearchClient<object>,
  iconPaths: string[]
) {
  console.log(`📂 Processing ${iconPaths.length} icons...`);

  const documents = [];
  for (const iconPath of iconPaths) {
    try {
      const imageBuffer = await rasterize(
        await fs.readFile(path.join(LOCAL_REPO_DIR, iconPath))
      );
      const vector = await getImageEmbedding(imageBuffer);

      const iconName = iconPath.split("/")[1];
      const variant = iconPath.endsWith("_filled.svg") ? "filled" : "outline";

      documents.push({
        id: iconPathToKey(iconPath),
        name: iconName,
        variant,
        url: `${RAW_REPO_URL_BASE}/${iconPath}`,
        vector,
      });

      console.log(`✔ Indexed: ${iconPath}`);
    } catch (error) {
      console.error(
        `❌ Error processing ${iconPath}: ${(error as any).message}`
      );
    }
  }

  await client.uploadDocuments(documents);
  console.log("✅ All icons indexed successfully in Azure AI Search!");
}

// Keys can only contain letters, digits, underscore (_), dash (-), or equal sign (=).
const iconPathToKey = (iconPath: string) =>
  iconPath.replace(/[^a-zA-Z0-9_\-]/g, "_");
