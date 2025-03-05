import axios from "axios";
import { AZURE_VISION_ENDPOINT, AZURE_VISION_KEY } from "./envConstants";

/**
 * Calls Azure AI Vision to extract a feature vector for an image.
 * If the API returns a 429 error (rate limit exceeded), it retries once after a 1-second delay.
 */
export async function getImageEmbedding(
  imageBuffer: Buffer
): Promise<number[]> {
  let attempt = 0;
  const maxRetries = 1;

  while (attempt <= maxRetries) {
    try {
      const response = await axios.post(
        `${AZURE_VISION_ENDPOINT}/computervision/retrieval:vectorizeImage?api-version=2024-02-01&model-version=2023-04-15`,
        imageBuffer,
        {
          headers: {
            "Ocp-Apim-Subscription-Key": AZURE_VISION_KEY,
            "Content-Type": "application/octet-stream",
          },
        }
      );
      return response.data.vector; // Successfully obtained vector, return it
    } catch (error: any) {
      const statusCode = error.response?.status;

      if (statusCode === 429 && attempt < maxRetries) {
        console.warn(
          `⚠️ Received 429 rate limit exceeded. Retrying in 1 second...`
        );
        await sleep(1000); // Wait for 1 second before retrying
        attempt++;
      } else {
        console.error(
          "❌ Azure Vision API Error:",
          error.response?.data || error.message
        );
        throw new Error("Failed to process image.");
      }
    }
  }

  throw new Error("Failed to process image after retry.");
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
