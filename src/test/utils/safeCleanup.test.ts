import * as assert from "assert";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";

import { safeCleanup } from "../../utils/helpers";
import { safeCleanup as testSafeCleanup } from "../helpers/safeCleanup";

suite("Production SafeCleanup Test Suite", () => {
  let testDirectory: string;

  setup(async () => {
    testDirectory = await fs.mkdtemp(
      path.join(os.tmpdir(), "safe-cleanup-test-"),
    );
  });

  teardown(async () => {
    await testSafeCleanup(path.dirname(testDirectory), testDirectory);
  });

  test("Should remove a child directory", async () => {
    const targetDirectory = path.join(testDirectory, "project");

    await fs.mkdir(targetDirectory);
    await fs.writeFile(
      path.join(targetDirectory, "README.md"),
      "# Test project",
    );

    await safeCleanup(testDirectory, targetDirectory);

    await assert.rejects(fs.access(targetDirectory));
  });

  test("Should reject attempts to remove the parent directory", async () => {
    await assert.rejects(
      safeCleanup(testDirectory, testDirectory),
      /Cannot delete the parent directory/,
    );

    assert.ok(await fs.stat(testDirectory));
  });

  test("Should reject a directory outside the permitted parent", async () => {
    const outsideDirectory = await fs.mkdtemp(
      path.join(os.tmpdir(), "outside-cleanup-test-"),
    );

    try {
      await assert.rejects(
        safeCleanup(testDirectory, outsideDirectory),
        /outside the permitted directory/,
      );

      assert.ok(await fs.stat(outsideDirectory));
    } finally {
      await testSafeCleanup(path.dirname(outsideDirectory), outsideDirectory);
    }
  });

  test("Should reject a symbolic link", async () => {
    const realDirectory = path.join(testDirectory, "real-project");

    const symbolicLink = path.join(testDirectory, "project-link");

    await fs.mkdir(realDirectory);

    await fs.symlink(realDirectory, symbolicLink, "dir");

    await assert.rejects(
      safeCleanup(testDirectory, symbolicLink),
      /real directory/,
    );

    // The symbolic link and its target must remain untouched.
    assert.ok((await fs.lstat(symbolicLink)).isSymbolicLink());
    assert.ok(await fs.stat(realDirectory));
  });

  test("Should reject a nonexistent directory", async () => {
    const missingDirectory = path.join(testDirectory, "does-not-exist");

    await assert.rejects(safeCleanup(testDirectory, missingDirectory));
  });
});
