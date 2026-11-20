import * as assert from "assert";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";

import { FileService } from "../../services/fileService";
import { ProjectTemplateId } from "../../templates/projectTemplates";
import { safeCleanup } from "../helpers/safeCleanup";

suite("FileService Test Suite", () => {
  let testDirectory: string;
  let fileService: FileService;

  setup(async () => {
    testDirectory = await fs.mkdtemp(
      path.join(os.tmpdir(), "scaffolder-test-"),
    );

    fileService = new FileService();
  });

  teardown(async () => {
      if (testDirectory) {
        await safeCleanup(path.dirname(testDirectory), testDirectory);
      }
  });


  test("Should create a JavaScript project", async () => {
    const projectPath = await fileService.createProject(
      testDirectory,
      "my-project",
      ProjectTemplateId.JavaScript,
    );

    const packageJson = await fs.readFile(
      path.join(projectPath, "package.json"),
      "utf-8",
    );

    const entryFile = await fs.readFile(
      path.join(projectPath, "src", "index.js"),
      "utf-8",
    );

    assert.ok(packageJson);
    assert.ok(entryFile);
    assert.ok(await fs.stat(path.join(projectPath, "README.md")));
  });

  test("Should create a TypeScript project", async () => {
    const projectPath = await fileService.createProject(
      testDirectory,
      "my-typescript-project",
      ProjectTemplateId.TypeScript,
    );

    assert.ok(await fs.stat(path.join(projectPath, "tsconfig.json")));

    assert.ok(await fs.stat(path.join(projectPath, "src", "index.ts")));
  });

  test("Should reject an invalid project name", async () => {
    await assert.rejects(
      fileService.createProject(
        testDirectory,
        "../invalid",
        ProjectTemplateId.JavaScript,
      ),
      /Invalid project name/,
    );
  });

  test("Should reject an unsupported template", async () => {
    await assert.rejects(
      fileService.createProject(
        testDirectory,
        "my-project",
        "unknown-template",
      ),
      /Unsupported project template./,
    );
  });

  test("Should not overwrite an existing directory", async () => {
    const existingPath = path.join(testDirectory, "existing-project");

    await fs.mkdir(existingPath);

    await assert.rejects(
      fileService.createProject(
        testDirectory,
        "existing-project",
        ProjectTemplateId.JavaScript,
      ),
    );
  });

  test("Should remove incomplete project when file generation fails", async () => {
    let writeCount = 0;

    const failingWriteFile = async (
      filePath: string,
      data: string,
    ): Promise<void> => {
      writeCount++;

      if (writeCount === 2) {
        throw new Error("Simulated file write failure.");
      }

      await fs.writeFile(filePath, data);
    };

    const testFileService = new FileService(failingWriteFile);

    const projectPath = path.join(testDirectory, "failed-project");

    await assert.rejects(
      testFileService.createProject(
        testDirectory,
        "failed-project",
        ProjectTemplateId.JavaScript,
      ),
      /Simulated file write failure/,
    );

    assert.strictEqual(writeCount, 2);

    await assert.rejects(fs.access(projectPath));
  });

  test("Should create a React project", async () => {
    const projectPath = await fileService.createProject(
      testDirectory,
      "my-react-project",
      ProjectTemplateId.React,
    );

    const packageJson = JSON.parse(
      await fs.readFile(path.join(projectPath, "package.json"), "utf-8"),
    );

    assert.strictEqual(packageJson.dependencies.react, "^19.0.0");
    assert.strictEqual(packageJson.dependencies["react-dom"], "^19.0.0");

    assert.ok(await fs.stat(path.join(projectPath, "index.html")));

    assert.ok(await fs.stat(path.join(projectPath, "src", "main.jsx")));

    assert.ok(await fs.stat(path.join(projectPath, "README.md")));
  });
});
