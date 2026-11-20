import * as assert from "assert";
import * as vscode from "vscode";

import { PreferenceService } from "../../services/preferenceService";
import { createMockMemento } from "../helpers/mockMemento";
import { ProjectTemplateId } from "../../templates/projectTemplates";

suite("PreferenceService Test Suite", () => {
  test("Should return workspace preference when available", () => {
    const workspaceValue = ProjectTemplateId.TypeScript;
    const globalStateValue = ProjectTemplateId.JavaScript;

    const context = {
      workspaceState: createMockMemento({
        lastSelectedTemplate: workspaceValue,
      }),
      globalState: createMockMemento({
        lastSelectedTemplate: globalStateValue,
      }),
    } as unknown as vscode.ExtensionContext;

    const service = new PreferenceService(context);

    assert.strictEqual(service.getLastSelectedTemplate(), workspaceValue);
  });

  test("Should fall back to global preference", () => {
    const context = {
      workspaceState: createMockMemento(),
      globalState: createMockMemento({
        lastSelectedTemplate: ProjectTemplateId.React,
      }),
    } as unknown as vscode.ExtensionContext;

    const service = new PreferenceService(context);

    assert.strictEqual(service.getLastSelectedTemplate(), ProjectTemplateId.React);
  });

  test("Should return undefined when no preference exists", () => {
    const context = {
      workspaceState: createMockMemento(),
      globalState: createMockMemento(),
    } as unknown as vscode.ExtensionContext;

    const service = new PreferenceService(context);

    assert.strictEqual(service.getLastSelectedTemplate(), undefined);
  });

  test("Should save preference to both workspace and global state", async () => {
    const workspaceState = createMockMemento();
    const globalState = createMockMemento();

    const context = {
      workspaceState,
      globalState,
    } as unknown as vscode.ExtensionContext;

    const service = new PreferenceService(context);

    await service.setLastSelectedTemplate(ProjectTemplateId.TypeScript);

    assert.strictEqual(
      workspaceState.get("lastSelectedTemplate"),
      ProjectTemplateId.TypeScript,
    );

    assert.strictEqual(globalState.get("lastSelectedTemplate"), ProjectTemplateId.TypeScript);
  });
});
