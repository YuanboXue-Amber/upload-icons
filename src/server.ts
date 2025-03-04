import { SearchClient, AzureKeyCredential } from "@azure/search-documents";
import * as express from "express";
import * as multer from "multer";
import * as dotenv from "dotenv";
import axios from "axios";
import {
  AZURE_SEARCH_ENDPOINT,
  AZURE_SEARCH_KEY,
  AZURE_SEARCH_INDEX_NAME,
} from "./envConstants";
import { getImageEmbedding } from "./getImageEmbedding";

dotenv.config();

const app = express();
const upload = multer();

const client = new SearchClient(
  AZURE_SEARCH_ENDPOINT,
  AZURE_SEARCH_INDEX_NAME,
  new AzureKeyCredential(AZURE_SEARCH_KEY)
);

async function fetchImageFromURL(imageUrl: string): Promise<Buffer> {
  try {
    const response = await axios.get(imageUrl, {
      responseType: "arraybuffer",
    });
    return Buffer.from(response.data);
  } catch (error) {
    console.error("Error fetching image from URL:", (error as any).message);
    throw new Error("Failed to download image from URL.");
  }
}

/**
 * Search for similar icons using Azure AI Search vector search
 */
app.post(
  "/api/search",
  upload.single("image"), // Handles file uploads
  async (req, res): Promise<any> => {
    const { imageUrl } = req.body; // Extract image URL from request body

    let imageBuffer: Buffer | null = null;

    try {
      // Case 1: Image uploaded as a file
      if (req.file) {
        imageBuffer = req.file.buffer;
      }
      // Case 2: Image provided via URL
      else if (imageUrl) {
        imageBuffer = await fetchImageFromURL(imageUrl);
      } else {
        return res
          .status(400)
          .json({ error: "No image file or image URL provided." });
      }

      const queryVector = await getImageEmbedding(imageBuffer);

      // Perform vector search in Azure AI Search
      const searchResults = await client.search("", {
        vectorSearchOptions: {
          queries: [
            { kind: "vector", fields: ["vector"], vector: queryVector },
          ],
        },
      });

      // Format and return results
      const topMatches = [];
      for await (const result of searchResults.results) {
        const document = result.document as { name: string; variant: string };
        topMatches.push({
          name: document.name,
          variant: document.variant,
        });
      }

      res.json(topMatches);
    } catch (error) {
      console.error("Search error:", error);
      res.status(500).json({ error: "Image processing failed." });
    }
  }
);

app.listen(3000, () =>
  console.log("🚀 Server running on http://localhost:3000")
);
