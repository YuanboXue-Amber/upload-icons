import { getSvgFiles } from "./getSvgFiles";
import { indexIcons } from "./indexIcons";
import { createIndex } from "./createIndex";
import { AzureKeyCredential, SearchClient } from "@azure/search-documents";
import {
  AZURE_SEARCH_ENDPOINT,
  AZURE_SEARCH_INDEX_NAME,
  AZURE_SEARCH_KEY,
} from "./envConstants";
import { normalizeChanges } from "./utils";

async function main() {
  console.log("===== Starting Icon Sync =====");

  await createIndex();

  // Get the changes from Git
  const { oldCommit, newCommit, changes } = await getSvgFiles();

  if (changes.length === 0) {
    console.log("No changes found. Exiting.");
    return;
  }
  console.log(
    `Found ${changes.length} changes (oldCommit = ${oldCommit}, newCommit = ${newCommit}).`
  );

  const { finalDeletes, finalAddsOrMods } = normalizeChanges(changes);
  // Debug code:
  // const finalAddsOrMods = [
  //   "assets/Access Time/SVG/ic_fluent_access_time_20_filled.svg",
  //   "assets/Checkmark Circle/SVG/ic_fluent_checkmark_circle_20_regular.svg",
  // ];

  const client = new SearchClient(
    AZURE_SEARCH_ENDPOINT,
    AZURE_SEARCH_INDEX_NAME,
    new AzureKeyCredential(AZURE_SEARCH_KEY)
  );
  const chunkSize = 500;
  for (let i = 0; i < finalAddsOrMods.length; i += chunkSize) {
    const chunk = finalAddsOrMods.slice(i, i + chunkSize);
    await indexIcons(client, chunk);
  }

  // // Removed or renamed old versions
  // if (finalDeletes.length > 0) {
  //   // TODO: Implement deletion
  // }

  console.log("===== Icon Sync Complete =====");
}

main().catch((err) => {
  console.error("Error in main:", err);
  process.exit(1);
});
