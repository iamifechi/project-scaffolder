import * as fs from "node:fs/promises";
import * as path from "node:path";

export async function safeCleanup(
  parentDirectory: string,
  createdDirectory: string,
): Promise<void> {
  const parent = path.resolve(parentDirectory);
  const target = path.resolve(createdDirectory);

  if (target === parent) {
    throw new Error("Cannot delete the parent directory.");
  }

  const relativePath = path.relative(parent, target);

  if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
    throw new Error("Cleanup target is outside the permitted directory.");
  }

  const stats = await fs.lstat(target);

  if (stats.isSymbolicLink() || !stats.isDirectory()) {
    throw new Error("Cleanup target must be a real directory.");
  }

  await fs.rm(target, {
    recursive: true,
    force: false,
  });
}
