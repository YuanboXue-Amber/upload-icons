import * as fs from "fs";
import * as path from "path";
import simpleGit, { SimpleGit } from "simple-git";
import { LAST_COMMIT_FILE, LOCAL_REPO_DIR, REPO_URL } from "./constants";

export type FileChangeStatus = "added" | "modified" | "deleted" | "renamed";

export interface IconChange {
  status: FileChangeStatus;
  oldFilePath?: string; // For "deleted" or the old side of a rename
  newFilePath?: string; // For "added"/"modified" or the new side of a rename
}

export interface GitChangesResult {
  oldCommit: string | null; // null if first time
  newCommit: string; // current HEAD after pull/clone
  changes: IconChange[]; // list of changed files (could be all if first run)
}

/**
 * Attempt to pull the latest commit from the local repo.
 * Then compare the new HEAD to the "last commit" we stored and return changed SVGs.
 * If no last commit is found, return all SVGs.
 * Updates the "last commit" file with the new HEAD commit.
 */
export async function getSvgFiles(): Promise<GitChangesResult> {
  let git = simpleGit();

  // Read the last commit we processed
  const oldCommit = readLastCommitId();
  console.log(`Last upload commit: ${oldCommit || "none"}`);

  // Clone latest and find the current HEAD commit
  console.log("Cloning fluentui-system-icons repo (shallow) ...");
  fs.rmSync(LOCAL_REPO_DIR, { recursive: true, force: true });
  await git.clone(REPO_URL, LOCAL_REPO_DIR, { "--depth": 1 });
  git = simpleGit(LOCAL_REPO_DIR);

  const currentHead = (await git.raw(["rev-parse", "HEAD"])).trim();
  console.log(`New HEAD commit: ${currentHead}`);

  let changes: IconChange[] = [];

  // If no old commit is found, it's effectively a "first run" => Return all SVGs
  if (!oldCommit) {
    console.log("No previous commit found. Will treat all icons as new.");
    // We'll gather all .svg files in assets/ to treat them as "added."
    const allSvgs = listAllSize20SvgFiles();
    changes = allSvgs.map((svgPath) => ({
      status: "added" as const,
      newFilePath: svgPath,
    }));
  } else if (oldCommit === currentHead) {
    console.log("oldCommit == currentHead => no changes.");
    changes = [];
  } else {
    // If we have an old commit, compare oldCommit..currentHead
    console.log(`Fetching ${oldCommit}`);
    await git.fetch("origin", oldCommit, { "--depth": 1 });
    changes = await detectChangesBetweenCommits(git, oldCommit, currentHead);
  }

  // Save the current HEAD as the new baseline
  saveLastCommitId(currentHead);

  // Return the final results
  return {
    oldCommit,
    newCommit: currentHead,
    changes,
  };
}

function readLastCommitId(): string | null {
  if (!fs.existsSync(LAST_COMMIT_FILE)) {
    return null;
  }
  const content = fs.readFileSync(LAST_COMMIT_FILE, "utf-8").trim();
  return content || null;
}

function saveLastCommitId(commitId: string) {
  fs.writeFileSync(LAST_COMMIT_FILE, commitId, "utf-8");
}

/**
 * Recursively list all SVG files in `assets/` to treat them as "added".
 */
function listAllSize20SvgFiles(): string[] {
  const assetsPath = path.join(LOCAL_REPO_DIR, "assets");
  const results: string[] = [];
  function recurse(dir: string) {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    for (const item of items) {
      const itemPath = path.join(dir, item.name);
      if (item.isDirectory()) {
        recurse(itemPath);
      } else if (
        item.isFile() &&
        item.name.toLowerCase().endsWith(".svg") &&
        item.name.includes("_20_")
      ) {
        const relativePath = path.relative(LOCAL_REPO_DIR, itemPath);
        results.push(relativePath);
      }
    }
  }
  recurse(assetsPath);
  return results;
}

function isSize20IconPath(filePath: string) {
  return (
    path.relative(path.basename(filePath), filePath).includes("_20_") &&
    filePath.endsWith(".svg")
  );
}

/**
 * Compare `fromCommit` to `toCommit` in the `assets/` folder, returning only changes for `.svg` that is size 20.
 */
async function detectChangesBetweenCommits(
  git: SimpleGit,
  fromCommit: string,
  toCommit: string
): Promise<IconChange[]> {
  // 1) Get raw diff from Git
  const diffRaw = await git.raw([
    "diff",
    "--name-status",
    fromCommit,
    toCommit,
    "--",
    "assets/",
  ]);

  /*
    Example lines:
      A       assets/Add Circle/SVG/ic_fluent_add_circle_20_filled.svg
      M       assets/Add Circle/SVG/ic_fluent_add_circle_24_regular.svg  <-- filtered out (not _20_)
      R100    assets/Old Icon/SVG/old_icon_20_regular.svg  assets/New Icon/SVG/new_icon_20_regular.svg
      D       assets/SomeOldIcon/SVG/old_icon_20_filled.svg
      M       assets/AnotherIcon/README.md  <-- filtered out (not .svg)
  */

  const lines = diffRaw.split("\n").filter((line) => line.trim() !== "");
  const changes: IconChange[] = [];

  for (const line of lines) {
    const parts = line.split(/\t/);
    const statusCode = parts[0]; // e.g. "A", "M", "D", or "R100"

    // Handle rename
    if (statusCode.startsWith("R")) {
      const oldPath = parts[1];
      const newPath = parts[2];
      if (!isSize20IconPath(newPath)) {
        continue;
      }

      changes.push({
        status: "renamed",
        oldFilePath: oldPath,
        newFilePath: newPath,
      });
    } else {
      // A, M, or D
      const filePath = parts[1];
      if (!isSize20IconPath(filePath)) {
        continue;
      }

      let status: FileChangeStatus;
      switch (statusCode) {
        case "A":
          status = "added";
          break;
        case "M":
          status = "modified";
          break;
        case "D":
          status = "deleted";
          break;
        default:
          status = "modified"; // fallback
          break;
      }

      if (status === "deleted") {
        changes.push({ status, oldFilePath: filePath });
      } else {
        changes.push({ status, newFilePath: filePath });
      }
    }
  }

  return changes;
}
