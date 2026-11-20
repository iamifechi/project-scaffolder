import * as vscode from "vscode";
import * as assert from "assert";
import * as sinon from "sinon";
import { stubVSCodeUI } from "../helpers/commandTestDoubles";
import { ITemplateService } from "../../services/interface/templateService";

import { IFileService } from "../../services/interface/fileService";

import { IPreferenceService } from "../../services/interface/preferenceService";

import { projectTemplates } from "../../templates/projectTemplates";
import { registerCreateProjectCommand } from "../../commands/createProjectCommand";

suite("CreateProjectCommand Test Suite", () => {
  let ui: ReturnType<typeof stubVSCodeUI>;
  let commandDisposable: vscode.Disposable | undefined;
  let templateService: ITemplateService;
  let fileService: IFileService;
  let preferenceService: IPreferenceService;
  const commandID = "project-scaffolder.testCreateProject";

  setup(() => {
    ui = stubVSCodeUI();
    createFakeServices();
    registerCommand();
  });

  teardown(() => {
    commandDisposable?.dispose();
    commandDisposable = undefined;
    ui.sandbox.restore();
  });

  function createFakeServices() {
    templateService = {
      getTemplates: sinon.stub().returns(projectTemplates),
      getTemplateById: sinon.stub().callsFake((id: string) => {
        return projectTemplates.find((template) => template.id === id);
      }),
    };

    fileService = {
      createProject: sinon.stub().resolves("/projects/my-project"),
    };

    preferenceService = {
      getLastSelectedTemplate: sinon.stub().returns(undefined),
      setLastSelectedTemplate: sinon.stub().resolves(),
    };
  }

  function registerCommand() {
    commandDisposable = registerCreateProjectCommand(
      templateService,
      fileService,
      preferenceService,
      commandID,
    );
  }

  test("Should exit when the user cancels template selection", async () => {
    ui.showQuickPick.resolves(undefined);

    await vscode.commands.executeCommand(commandID);

    sinon.assert.calledOnce(ui.showQuickPick);

    sinon.assert.notCalled(ui.showInputBox);
    sinon.assert.notCalled(ui.showOpenDialog);

    sinon.assert.notCalled(
      preferenceService.setLastSelectedTemplate as sinon.SinonStub,
    );

    sinon.assert.notCalled(fileService.createProject as sinon.SinonStub);
  });

  test("Should place the previously selected template first", async () => {
    const previousTemplate = projectTemplates[1];
    const originalOrder = projectTemplates.map((template) => template.id);

    (preferenceService.getLastSelectedTemplate as sinon.SinonStub).returns(
      previousTemplate.id,
    );

    ui.showQuickPick.resolves(undefined);

    await vscode.commands.executeCommand(commandID);

    const displayedTemplates = ui.showQuickPick.firstCall
      .args[0] as unknown as { id: string }[];

    assert.strictEqual(displayedTemplates[0].id, previousTemplate.id);

    assert.deepStrictEqual(
      projectTemplates.map((template) => template.id),
      originalOrder,
    );
  });

  test("Should save the selected template before requesting project details", async () => {
    const selectedTemplate = projectTemplates[0];

    ui.showQuickPick.resolves(selectedTemplate);
    ui.showInputBox.resolves(undefined);

    await vscode.commands.executeCommand(commandID);

    sinon.assert.calledOnceWithExactly(
      preferenceService.setLastSelectedTemplate as sinon.SinonStub,
      selectedTemplate.id,
    );

    sinon.assert.calledOnce(ui.showInputBox);

    sinon.assert.notCalled(ui.showOpenDialog);

    sinon.assert.notCalled(fileService.createProject as sinon.SinonStub);
  });

  test("Should preserve the selected template when folder selection is cancelled", async () => {
    const selectedTemplate = projectTemplates[0];

    ui.showQuickPick.resolves(selectedTemplate);
    ui.showInputBox.resolves("test-project");
    ui.showOpenDialog.resolves(undefined);

    await vscode.commands.executeCommand(commandID);

    sinon.assert.calledOnceWithExactly(
      preferenceService.setLastSelectedTemplate as sinon.SinonStub,
      selectedTemplate.id,
    );

    sinon.assert.calledOnce(ui.showInputBox);

    sinon.assert.calledOnce(ui.showOpenDialog);

    sinon.assert.notCalled(fileService.createProject as sinon.SinonStub);
  });

  test("Should validate project names correctly", async () => {
    ui.showQuickPick.resolves(projectTemplates[0]);
    ui.showInputBox.resolves(undefined);

    await vscode.commands.executeCommand(commandID);

    const inputOptions = ui.showInputBox.firstCall.args[0];

    assert.strictEqual(
      inputOptions?.validateInput?.(" "),
      "Project name cannot be empty",
    );

    assert.strictEqual(
      inputOptions?.validateInput?.("my project"),
      "Use only letters, numbers, hyphens and underscores",
    );

    assert.strictEqual(
      inputOptions.validateInput?.("my-project_123"),
      undefined,
    );
  });

  test("Should create a project with the selected template, name and location", async () => {
    const selectedTemplate = projectTemplates[0];
    const projectName = "my-awesome-project";
    const parentPath = "/projects";

    ui.showQuickPick.resolves(selectedTemplate);
    ui.showInputBox.resolves(projectName);
    ui.showOpenDialog.resolves([vscode.Uri.file(parentPath)]);

    await vscode.commands.executeCommand(commandID);

    sinon.assert.calledOnceWithExactly(
      fileService.createProject as sinon.SinonStub,
      parentPath,
      projectName,
      selectedTemplate.id,
    );

    sinon.assert.calledOnceWithExactly(
      preferenceService.setLastSelectedTemplate as sinon.SinonStub,
      selectedTemplate.id,
    );

    sinon.assert.calledWith(
      ui.showInformationMessage,
      sinon.match(/Project created successfully/),
    );
  });

  test("Should display an error when project creation fails", async () => {
    const selectedTemplate = projectTemplates[0];

    ui.showQuickPick.resolves(selectedTemplate);
    ui.showInputBox.resolves("my-project");
    ui.showOpenDialog.resolves([vscode.Uri.file("/projects")]);

    (fileService.createProject as sinon.SinonStub).rejects(
      new Error("Project directory already exists."),
    );

    await vscode.commands.executeCommand(commandID);

    sinon.assert.calledOnce(fileService.createProject as sinon.SinonStub);

    sinon.assert.calledWith(
      ui.showErrorMessage,
      sinon.match(/Project directory already exists/),
    );
  });
  test("Should fail gracefully when selected template cannot be found", async () => {
    const selectedTemplate = projectTemplates[0];

    ui.showQuickPick.resolves(selectedTemplate);

    (templateService.getTemplateById as sinon.SinonStub).returns(undefined);

    await vscode.commands.executeCommand(
      commandID,
    );

    sinon.assert.calledOnce(ui.showQuickPick);

    sinon.assert.calledOnceWithExactly(
      templateService.getTemplateById as sinon.SinonStub,
      selectedTemplate.id,
    );

    sinon.assert.calledWith(
      ui.showErrorMessage,
      "The selected template could not be found.",
    );

    sinon.assert.notCalled(
      preferenceService.setLastSelectedTemplate as sinon.SinonStub,
    );

    sinon.assert.notCalled(ui.showInputBox);

    sinon.assert.notCalled(fileService.createProject as sinon.SinonStub);
  });
});
