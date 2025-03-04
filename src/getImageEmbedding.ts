import axios from "axios";
import { AZURE_VISION_ENDPOINT, AZURE_VISION_KEY } from "./envConstants";

/**
 * Calls Azure AI Vision to extract a feature vector for an image
 */
export async function getImageEmbedding(
  imageBuffer: Buffer
): Promise<number[]> {
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
    return response.data.vector;
  } catch (error) {
    console.error(
      "Azure Vision API Error:",
      (error as any).response?.data || (error as any).message
    );
    throw new Error("Failed to process image.");
  }
}
