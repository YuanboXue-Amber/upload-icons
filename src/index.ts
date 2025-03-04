// src/index.ts
import { getSvgFiles, IconChange } from "./getSvgFiles";
import { uploadIconSvg } from "./customVision"; // your Custom Vision code

async function main() {
  console.log("===== Starting Icon Sync to Custom Vision =====");

  // 1. Get the changes from Git
  const { oldCommit, newCommit, changes } = await getSvgFiles();

  if (changes.length === 0) {
    console.log("No changes found. Exiting.");
    return;
  }

  console.log(
    `Found ${changes.length} changes (oldCommit = ${oldCommit}, newCommit = ${newCommit}).`
  );

  const { finalDeletes, finalAddsOrMods } = normalizeChanges(changes);

  // 2. Upload newly added/modified icons
  for (const c of finalAddsOrMods) {
    if (c.newFilePath) {
      console.log(`Uploading ${c.newFilePath}`);
      await uploadIconSvg(c.newFilePath);
    }
  }

  // Removed or renamed old versions
  if (finalDeletes.length > 0) {
    // TODO: Implement deletion in Custom Vision
    console.log(
      "These icons were removed or renamed. Consider removing them in Custom Vision if desired:\n" +
        finalDeletes.map((c) => ` - ${c.oldFilePath}`).join("\n")
    );
  }

  console.log("===== Icon Sync Complete =====");
}

const normalizeChanges = (changes: IconChange[]) => {
  const addedOrModified: IconChange[] = [];
  const deleted: IconChange[] = [];

  changes.forEach((c) => {
    if (c.status === "renamed") {
      deleted.push({ status: "deleted", oldFilePath: c.oldFilePath });
      addedOrModified.push({ status: "added", newFilePath: c.newFilePath });
    } else if (c.status === "deleted") {
      deleted.push(c);
    } else {
      addedOrModified.push(c);
    }
  });

  return {
    finalDeletes: deleted,
    finalAddsOrMods: addedOrModified,
  };
};

main().catch((err) => {
  console.error("Error in main:", err);
  process.exit(1);
});
