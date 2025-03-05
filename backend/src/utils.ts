import { IconChange } from "./getSvgFiles";

export const normalizeChanges = (changes: IconChange[]) => {
  const addedOrModified: string[] = [];
  const deleted: string[] = [];

  changes.forEach((c) => {
    if (c.status === "renamed" && c.newFilePath && c.oldFilePath) {
      deleted.push(c.oldFilePath);
      addedOrModified.push(c.newFilePath);
    } else if (c.status === "deleted" && c.oldFilePath) {
      deleted.push(c.oldFilePath);
    } else if (c.newFilePath) {
      addedOrModified.push(c.newFilePath);
    }
  });

  return {
    finalDeletes: deleted,
    finalAddsOrMods: addedOrModified,
  };
};
