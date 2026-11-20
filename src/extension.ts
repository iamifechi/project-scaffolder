// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { TemplateService } from "./services/templateService";
import { registerCreateProjectCommand } from "./commands/createProjectCommand";
import { FileService } from "./services/fileService";
import { PreferenceService } from "./services/preferenceService";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  const templateService = new TemplateService();
  const fileService = new FileService();
  const preferenceService = new PreferenceService(context);

  const helloCommand = vscode.commands.registerCommand(
    "project-scaffolder.helloWorld",
    () => {
      console.log("[Project Scaffolder] Hello World command executed");
      vscode.window.showInformationMessage("Hello World from JS Scaffolder!");
    },
  );

  // New Create Project command
  const createProjectCommand = registerCreateProjectCommand(
    templateService,
    fileService,
    preferenceService
  );

  context.subscriptions.push(helloCommand, createProjectCommand);
}

// This method is called when your extension is deactivated
export function deactivate() {
  console.log("[Project Scaffolder] Extension deactivated");
}
