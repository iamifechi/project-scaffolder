import * as fs from "node:fs/promises";
import * as path from "node:path";

export async function safeCleanup(
  parentDirectory: string,
  targetDirectory: string,
): Promise<void> {
  const parent = path.resolve(parentDirectory);
  const target = path.resolve(targetDirectory);

  // Never delete the parent itself.
  if (target === parent) {
    throw new Error("Cannot delete the parent directory");
  }

  // Ensure target is a child of the permitted parent.
  const relativePath = path.relative(parent, target);

  if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
    throw new Error("Target is outside the permitted directory");
  }

  await fs.rm(target, {
    recursive: true,
    force: false,
  });
}
