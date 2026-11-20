import * as vscode from "vscode";
import { ITemplateService } from "../services/interface/templateService";
import { IFileService } from "../services/interface/fileService";
import { ProjectTemplateId } from "../templates/projectTemplates";
import { IPreferenceService } from "../services/interface/preferenceService";

export function registerCreateProjectCommand(
  templateService: ITemplateService,
  fileService: IFileService,
  preferenceService: IPreferenceService,
  commandId = "project-scaffolder.createProject",
): vscode.Disposable {
  return vscode.commands.registerCommand(commandId, async () => {
    const templates = templateService.getTemplates();

    const lastSelectedTemplate = preferenceService.getLastSelectedTemplate();

    const orderedTemplates = [...templates].sort((a, b) => {
      return a.id === lastSelectedTemplate
        ? -1
        : b.id === lastSelectedTemplate
          ? 1
          : 0;
    });

    const selectedTemplate = await vscode.window.showQuickPick(
      orderedTemplates,
      {
        title: "Project Scaffolder",
        placeHolder: "Choose a project template",
        matchOnDescription: true,
      },
    );

    if (!selectedTemplate) {
      return;
    }

    const templateId = selectedTemplate.id;

    const supportedTemplates = Object.values(ProjectTemplateId) as string[];

    if (!supportedTemplates.includes(templateId)) {
      throw new Error(`Unsupported template: ${templateId}`);
    }

    const template = templateService.getTemplateById(templateId);

    if (!template) {
      vscode.window.showErrorMessage(
        "The selected template could not be found.",
      );
      return;
    }

    //   Save last selected template to preferences
    await preferenceService.setLastSelectedTemplate(templateId);

    const projectName = await vscode.window.showInputBox({
      title: "Project Details",
      prompt: "Enter your project name",
      placeHolder: "my-awesome-project",
      validateInput: (value) => {
        if (!value.trim()) {
          return "Project name cannot be empty";
        }

        if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
          return "Use only letters, numbers, hyphens and underscores";
        }

        return undefined;
      },
    });

    if (!projectName) {
      return;
    }

    const folders = await vscode.window.showOpenDialog({
      canSelectFiles: false,
      canSelectFolders: true,
      canSelectMany: false,
      openLabel: "Select project location",
    });

    if (!folders || folders.length === 0) {
      return;
    }

    vscode.window.showInformationMessage(
      `Creating ${projectName} using ${template.description}`,
    );

    try {
      const projectPath = await fileService.createProject(
        folders[0].fsPath,
        projectName.trim(),
        templateId,
      );

      vscode.window.showInformationMessage(
        `Project created successfully: ${projectPath}`,
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "An unexpected error occurred.";

      vscode.window.showErrorMessage(`Failed to create project: ${message}`);
    }
  });
}
