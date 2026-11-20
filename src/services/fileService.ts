import * as fs from "fs/promises";
import * as path from "path";
import type { IFileService } from "./interface/fileService";
import { ProjectTemplateId } from "../templates/projectTemplates";
import { safeCleanup } from "../utils/helpers";

type WriteFile = (filePath: string, data: string) => Promise<void>;

export class FileService implements IFileService {
  constructor(
    private readonly writeFile: WriteFile = (filePath, data) =>
      fs.writeFile(filePath, data),
  ) {}

  async createProject(
    parentPath: string,
    projectName: string,
    templateId: string,
  ): Promise<string> {
    if (!/^[a-zA-Z0-9_-]+$/.test(projectName)) {
      throw new Error("Invalid project name.");
    }

    const supportedTemplates: string[] = Object.values(ProjectTemplateId);

    if (!supportedTemplates.includes(templateId)) {
      throw new Error("Unsupported project template.");
    }

    const projectPath = path.join(parentPath, projectName);

    // Create the project directory.
    // This fails if the directory already exists.
    await fs.mkdir(projectPath);

    try {
      await fs.mkdir(path.join(projectPath, "src"));

      if (templateId === ProjectTemplateId.JavaScript) {
        await this.writeFile(
          path.join(projectPath, "package.json"),
          JSON.stringify(
            {
              name: projectName,
              version: "1.0.0",
              main: "src/index.js",
            },
            null,
            2,
          ),
        );

        await this.writeFile(
          path.join(projectPath, "src", "index.js"),
          "console.log('Hello from my new project!');\n",
        );
      }

      if (templateId === ProjectTemplateId.TypeScript) {
        await this.writeFile(
          path.join(projectPath, "package.json"),
          JSON.stringify(
            {
              name: projectName,
              version: "1.0.0",
              main: "dist/index.js",
            },
            null,
            2,
          ),
        );

        await this.writeFile(
          path.join(projectPath, "src", "index.ts"),
          "console.log('Hello from my new TypeScript project!');\n",
        );

        await this.writeFile(
          path.join(projectPath, "tsconfig.json"),
          JSON.stringify(
            {
              compilerOptions: {
                target: "ES2022",
                module: "CommonJS",
                outDir: "dist",
                rootDir: "src",
                strict: true,
              },
            },
            null,
            2,
          ),
        );
      }

      if (templateId === ProjectTemplateId.React) {
        await this.writeFile(
          path.join(projectPath, "package.json"),
          JSON.stringify(
            {
              name: projectName,
              version: "1.0.0",
              scripts: {
                dev: "vite",
              },
              dependencies: {
                react: "^19.0.0",
                "react-dom": "^19.0.0",
              },
              devDependencies: {
                vite: "^6.0.0",
              },
            },
            null,
            2,
          ),
        );

        await this.writeFile(
          path.join(projectPath, "index.html"),
          '<div id="root"></div>\n<script type="module" src="/src/main.jsx"></script>\n',
        );

        await this.writeFile(
          path.join(projectPath, "src", "main.jsx"),
          "import React from 'react';\nimport { createRoot } from 'react-dom/client';\n\ncreateRoot(document.getElementById('root')).render(<h1>Hello React!</h1>);\n",
        );
      }

      await this.writeFile(
        path.join(projectPath, "README.md"),
        `# ${projectName}\n\nGenerated with Project Scaffolder.\n`,
      );
      return projectPath;
    } catch (error) {
      // Remove the incomplete project directory.
      try {
        await safeCleanup(parentPath, projectPath);
      } catch (cleanupError) {
        throw new AggregateError(
          [error, cleanupError],
          "Project generation failed, and cleanup was unsuccessful.",
        );
      }
      throw error;
    }
  }
}
