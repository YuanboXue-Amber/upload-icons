import * as path from "path";

export const REPO_URL =
  "https://github.com/yuanboxue-amber/fluentui-system-icons.git"; // TODO: Update this URL to the microsoft repo.

// Store the repo under temp/fluentui-system-icons.
export const LOCAL_REPO_DIR = path.join(
  __dirname,
  "..",
  "temp",
  "fluentui-system-icons"
);

// Store the last commit of icon repo that was processed.
export const LAST_COMMIT_FILE = path.join(__dirname, "..", "last_commit");
