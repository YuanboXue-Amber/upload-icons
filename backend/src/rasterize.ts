import * as sharp from "sharp";

export const rasterize = async (imgBuffer: Buffer<ArrayBufferLike>) => {
  // Convert to PNG in-memory (white background)
  const pngBuffer = await sharp(imgBuffer)
    .resize(128, 128, {
      fit: "contain",
    })
    .flatten({ background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .toBuffer();

  return pngBuffer;
};
