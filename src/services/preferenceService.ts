import * as vscode from "vscode";
import type { ProjectTemplateId } from "../templates/projectTemplates";
import type { IPreferenceService } from "./interface/preferenceService";

export class PreferenceService implements IPreferenceService {
  private readonly workspaceKey = "lastSelectedTemplate";
  private readonly globalKey = "lastSelectedTemplate";

  constructor(private readonly context: vscode.ExtensionContext) {}

  getLastSelectedTemplate(): string | ProjectTemplateId | undefined {
    const workspaceTemplate = this.context.workspaceState.get<string>(
      this.workspaceKey,
    );

    if (workspaceTemplate) {
      return workspaceTemplate;
    }

    return this.context.globalState.get<string>(this.globalKey);
  }

  async setLastSelectedTemplate(templateId: string): Promise<void> {
    await Promise.all([
      this.context.workspaceState.update(this.workspaceKey, templateId),
      this.context.globalState.update(this.globalKey, templateId),
    ]);
  }
}
