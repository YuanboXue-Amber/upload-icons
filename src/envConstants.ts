import * as dotenv from "dotenv";

dotenv.config();

export const AZURE_SEARCH_ENDPOINT = process.env.AZURE_SEARCH_ENDPOINT!;
export const AZURE_SEARCH_KEY = process.env.AZURE_SEARCH_KEY!;
export const AZURE_SEARCH_INDEX_NAME = process.env.AZURE_SEARCH_INDEX_NAME!;

export const AZURE_VISION_ENDPOINT = process.env.AZURE_VISION_ENDPOINT!;
export const AZURE_VISION_KEY = process.env.AZURE_VISION_KEY!;
