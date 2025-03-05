import { NextRequest, NextResponse } from "next/server";
import { SearchClient, AzureKeyCredential } from "@azure/search-documents";
import axios from "axios";
import sharp from "sharp";

const AZURE_SEARCH_ENDPOINT = process.env.AZURE_SEARCH_ENDPOINT!;
const AZURE_SEARCH_KEY = process.env.AZURE_SEARCH_KEY!;
const AZURE_SEARCH_INDEX_NAME = process.env.AZURE_SEARCH_INDEX_NAME!;

const AZURE_VISION_ENDPOINT = process.env.AZURE_VISION_ENDPOINT!;
const AZURE_VISION_KEY = process.env.AZURE_VISION_KEY!;

export async function POST(req: NextRequest) {
  try {
    const imageBuffer = await getImage(req);
    const rasterizedImage = await rasterize(imageBuffer);
    const queryVector = await getImageEmbedding(rasterizedImage);

    const client = new SearchClient(
      AZURE_SEARCH_ENDPOINT,
      AZURE_SEARCH_INDEX_NAME,
      new AzureKeyCredential(AZURE_SEARCH_KEY)
    );

    const searchResults = await client.search("", {
      vectorSearchOptions: {
        queries: [{ kind: "vector", fields: ["vector"], vector: queryVector }],
      },
    });

    const topMatches = [];
    for await (const result of searchResults.results) {
      const document = result.document as {
        id: string;
        name: string;
        url: string;
        variant: string;
      };
      topMatches.push({
        id: document.id,
        name: document.name,
        url: document.url,
        variant: document.variant,
      });
    }

    return NextResponse.json(topMatches);
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Image processing failed." },
      { status: 500 }
    );
  }
}

async function getImage(req: NextRequest): Promise<Buffer> {
  const formData = await req.formData();
  const file = formData.get("image") as File;
  const imageUrl = formData.get("imageUrl") as string;

  if (file) {
    return Buffer.from(await file.arrayBuffer());
  } else if (imageUrl) {
    const response = await fetch(imageUrl);
    return Buffer.from(await response.arrayBuffer());
  } else {
    throw new Error("No image file or image URL provided.");
  }
}

async function rasterize(imgBuffer: Buffer<ArrayBufferLike>) {
  // Convert to PNG in-memory (white background)
  const pngBuffer = await sharp(imgBuffer)
    .resize(128, 128, {
      fit: "contain",
    })
    .flatten({ background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .toBuffer();

  return pngBuffer;
}

async function getImageEmbedding(imageBuffer: Buffer): Promise<number[]> {
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
    console.error(error);
    throw new Error("Failed to process image.");
  }
}
